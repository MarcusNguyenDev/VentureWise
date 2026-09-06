import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

import { estimateStarProgress } from '../../speech_analysis/star_stage_estimation.util';
import { AiCoachConfig, ModelTier } from '../ai_coach.config';
import {
  AiCoachPort,
  BuildInterviewPlanInput,
  BuildInterviewPlanResult,
  CritiqueAnswerInput,
  CritiqueAnswerResult,
  DecodeSubtextInput,
  DecodeSubtextResult,
  ExtractStoryInput,
  ExtractStoryResult,
  ReviewResumeInput,
  ReviewResumeResult,
  TrackAnswerProgressInput,
  TrackAnswerProgressResult,
} from '../ai_coach.contract';
import {
  requestStructuredCompletion,
  StructuredCompletionError,
} from '../openai/structured_completion.client';
import {
  BUILD_INTERVIEW_PLAN_SCHEMA,
  BUILD_INTERVIEW_PLAN_SYSTEM_PROMPT,
  BuildInterviewPlanModelOutput,
  buildInterviewPlanUserMessage,
} from '../prompts/build_interview_plan.prompt';
import {
  buildCritiqueAnswerSystemPrompt,
  buildCritiqueAnswerUserMessage,
  CRITIQUE_ANSWER_SCHEMA,
  CritiqueAnswerModelOutput,
} from '../prompts/critique_answer.prompt';
import {
  buildDecodeSubtextSystemPrompt,
  buildDecodeSubtextUserMessage,
  DECODE_SUBTEXT_SCHEMA,
  DecodeSubtextModelOutput,
} from '../prompts/decode_subtext.prompt';
import {
  buildExtractStoryUserMessage,
  EXTRACT_STORY_SCHEMA,
  EXTRACT_STORY_SYSTEM_PROMPT,
  ExtractStoryModelOutput,
} from '../prompts/extract_story.prompt';
import {
  buildReviewResumeSystemPrompt,
  buildReviewResumeUserMessage,
  REVIEW_RESUME_SCHEMA,
  ReviewResumeModelOutput,
} from '../prompts/review_resume.prompt';
import {
  buildTrackAnswerProgressSystemPrompt,
  buildTrackAnswerProgressUserMessage,
  TRACK_ANSWER_PROGRESS_SCHEMA,
  TrackAnswerProgressModelOutput,
} from '../prompts/track_answer_progress.prompt';
import {
  STAR_STAGE_ORDER,
  StarStage,
} from '../../shared/types/star_stage.enum';

/** The slow loop can afford a retry; the mid loop cannot. */
const MID_LOOP_MAX_RETRIES = 0;
const SLOW_LOOP_MAX_RETRIES = 1;

/** Off the speaking path entirely, so it can take as long as it needs. */
const OFF_PATH_TIMEOUT_MS = 60_000;
const SLOW_LOOP_TIMEOUT_MS = 45_000;

/**
 * The OpenAI-backed implementation of `AiCoachPort`.
 *
 * Prompts and schemas live in `../prompts/`, one file per capability; the
 * request mechanics live in `../openai/`. What is left here is the part that is
 * genuinely this provider's job: choosing the model tier, deciding what happens
 * when a call fails, and reconciling model output with the deterministic
 * analysis the rest of the app already computed.
 */
@Injectable()
export class ModelAiCoachProvider implements AiCoachPort {
  private readonly logger = new Logger(ModelAiCoachProvider.name);

  /**
   * Built on first use, never in the constructor: Nest instantiates this class
   * even when AI_COACH_PROVIDER=stub, and booting must not require a key the
   * stub does not need.
   */
  private openai_client: OpenAI | null = null;

  constructor(private readonly config: AiCoachConfig) {}

  private getClient(capability_name: string): OpenAI {
    if (this.openai_client) return this.openai_client;

    this.openai_client = new OpenAI({
      apiKey: this.config.requireApiKey(capability_name),
      baseURL: this.config.base_url,
    });

    return this.openai_client;
  }

  /* ---------------------------------------------------------------- mid loop */

  async trackAnswerProgress(
    input: TrackAnswerProgressInput,
  ): Promise<TrackAnswerProgressResult> {
    // Computed regardless, because it is both the model's prior and the
    // fallback if the call does not come back in time.
    const star_estimate = estimateStarProgress(
      input.transcript_text,
      input.seconds_elapsed,
    );

    try {
      const output =
        await requestStructuredCompletion<TrackAnswerProgressModelOutput>({
          client: this.getClient('trackAnswerProgress'),
          model: this.config.getModelName(ModelTier.MID_LOOP),
          system_prompt: buildTrackAnswerProgressSystemPrompt(input),
          user_message: buildTrackAnswerProgressUserMessage(
            input,
            star_estimate.current_stage,
          ),
          schema_name: 'answer_progress',
          json_schema: TRACK_ANSWER_PROGRESS_SCHEMA,
          timeout_ms: this.config.mid_loop_timeout_ms,
          max_retries: MID_LOOP_MAX_RETRIES,
        });

      return {
        is_stubbed: false,
        current_stage: output.current_stage,
        stage_durations_seconds: this.reconcileStageDurations(
          star_estimate.stage_durations_seconds,
          output.current_stage,
          input.seconds_elapsed,
        ),
        has_quantified_result: output.has_quantified_result,
        nudge_text: this.rejectRepeatedNudge(
          output.nudge_text,
          input.current_nudge_text,
        ),
      };
    } catch (error) {
      // The mid loop is advisory. A late or failed nudge must never break a
      // recording, so this degrades to the deterministic estimate rather than
      // throwing — flagged `is_stubbed` so the UI stays honest about it.
      this.logger.warn(
        `trackAnswerProgress fell back to the cue-word estimate: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      return {
        is_stubbed: true,
        current_stage: star_estimate.current_stage,
        stage_durations_seconds: star_estimate.stage_durations_seconds,
        has_quantified_result: star_estimate.has_quantified_result,
        nudge_text: null,
      };
    }
  }

  /**
   * The model returns a stage; the durations come from the cue-word estimator,
   * which is the only thing that knows *when* each stage started. Where the
   * model is further along than the estimator, the reached stages are filled in
   * so the STAR bar never shows a gap.
   */
  private reconcileStageDurations(
    estimated_durations: Partial<Record<StarStage, number>>,
    model_stage: StarStage,
    seconds_elapsed: number,
  ): Partial<Record<StarStage, number>> {
    const reconciled = { ...estimated_durations };
    const model_stage_index = STAR_STAGE_ORDER.indexOf(model_stage);

    const unrecorded_stages = STAR_STAGE_ORDER.slice(
      0,
      model_stage_index + 1,
    ).filter((stage) => reconciled[stage] === undefined);

    if (unrecorded_stages.length === 0) return reconciled;

    const already_accounted = Object.values(reconciled).reduce(
      (total, seconds) => total + (seconds ?? 0),
      0,
    );
    const share =
      Math.max(seconds_elapsed - already_accounted, 0) /
      unrecorded_stages.length;

    unrecorded_stages.forEach((stage) => {
      reconciled[stage] = Number(share.toFixed(1));
    });

    return reconciled;
  }

  /**
   * Second line of defence on the single-nudge rule. The prompt already says
   * not to repeat what is on screen; this makes it structural.
   */
  private rejectRepeatedNudge(
    proposed_nudge: string | null,
    current_nudge: string | null,
  ): string | null {
    if (proposed_nudge === null) return null;
    if (current_nudge === null) return proposed_nudge;

    const normalise = (text: string) =>
      text
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, '')
        .trim();

    return normalise(proposed_nudge) === normalise(current_nudge)
      ? null
      : proposed_nudge;
  }

  /* --------------------------------------------------------------- slow loop */

  async critiqueAnswer(
    input: CritiqueAnswerInput,
  ): Promise<CritiqueAnswerResult> {
    const output = await requestStructuredCompletion<CritiqueAnswerModelOutput>(
      {
        client: this.getClient('critiqueAnswer'),
        model: this.config.getModelName(ModelTier.SLOW_LOOP),
        system_prompt: buildCritiqueAnswerSystemPrompt(input),
        user_message: buildCritiqueAnswerUserMessage(input),
        schema_name: 'answer_critique',
        json_schema: CRITIQUE_ANSWER_SCHEMA,
        timeout_ms: SLOW_LOOP_TIMEOUT_MS,
        max_retries: SLOW_LOOP_MAX_RETRIES,
      },
    );

    return {
      is_stubbed: false,
      first_person_rewrite: output.first_person_rewrite,
      length_variants: [
        { target_seconds: 30, answer_text: output.answer_30_seconds },
        { target_seconds: 90, answer_text: output.answer_90_seconds },
        { target_seconds: 120, answer_text: output.answer_120_seconds },
      ],
      strengths: output.strengths,
      fixes: output.fixes,
    };
  }

  async decodeSubtext(input: DecodeSubtextInput): Promise<DecodeSubtextResult> {
    const output = await requestStructuredCompletion<DecodeSubtextModelOutput>({
      client: this.getClient('decodeSubtext'),
      model: this.config.getModelName(ModelTier.SLOW_LOOP),
      system_prompt: buildDecodeSubtextSystemPrompt(input),
      user_message: buildDecodeSubtextUserMessage(input),
      schema_name: 'subtext_decode',
      json_schema: DECODE_SUBTEXT_SCHEMA,
      timeout_ms: SLOW_LOOP_TIMEOUT_MS,
      max_retries: SLOW_LOOP_MAX_RETRIES,
    });

    return {
      is_stubbed: false,
      interviewer_intent: output.interviewer_intent,
      what_lands: output.what_lands,
      untranslated_phrases: output.untranslated_phrases,
    };
  }

  /* ---------------------------------------------------------------- off path */

  async extractStoryFromMemory(
    input: ExtractStoryInput,
  ): Promise<ExtractStoryResult> {
    const output = await requestStructuredCompletion<ExtractStoryModelOutput>({
      client: this.getClient('extractStoryFromMemory'),
      model: this.config.getModelName(ModelTier.SLOW_LOOP),
      system_prompt: EXTRACT_STORY_SYSTEM_PROMPT,
      user_message: buildExtractStoryUserMessage(input),
      schema_name: 'extracted_story',
      json_schema: EXTRACT_STORY_SCHEMA,
      timeout_ms: OFF_PATH_TIMEOUT_MS,
      max_retries: SLOW_LOOP_MAX_RETRIES,
    });

    return { is_stubbed: false, ...output };
  }

  async buildInterviewPlan(
    input: BuildInterviewPlanInput,
  ): Promise<BuildInterviewPlanResult> {
    const output =
      await requestStructuredCompletion<BuildInterviewPlanModelOutput>({
        client: this.getClient('buildInterviewPlan'),
        model: this.config.getModelName(ModelTier.SLOW_LOOP),
        system_prompt: BUILD_INTERVIEW_PLAN_SYSTEM_PROMPT,
        user_message: buildInterviewPlanUserMessage(input),
        schema_name: 'interview_plan',
        json_schema: BUILD_INTERVIEW_PLAN_SCHEMA,
        timeout_ms: OFF_PATH_TIMEOUT_MS,
        max_retries: SLOW_LOOP_MAX_RETRIES,
      });

    return {
      is_stubbed: false,
      coverage_gaps: output.coverage_gaps,
      rounds: output.rounds,
    };
  }

  async reviewResume(input: ReviewResumeInput): Promise<ReviewResumeResult> {
    const output = await requestStructuredCompletion<ReviewResumeModelOutput>({
      client: this.getClient('reviewResume'),
      model: this.config.getModelName(ModelTier.SLOW_LOOP),
      system_prompt: buildReviewResumeSystemPrompt(input),
      user_message: buildReviewResumeUserMessage(input),
      schema_name: 'resume_review',
      json_schema: REVIEW_RESUME_SCHEMA,
      timeout_ms: OFF_PATH_TIMEOUT_MS,
      max_retries: SLOW_LOOP_MAX_RETRIES,
    });

    return { is_stubbed: false, ...output };
  }
}

export { StructuredCompletionError };
