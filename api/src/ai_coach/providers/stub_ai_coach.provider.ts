import { Injectable } from '@nestjs/common';

import { rewriteInFirstPerson } from '../../speech_analysis/first_person_rewrite.util';
import { analysePronounAttribution } from '../../speech_analysis/pronoun_attribution.util';
import { estimateStarProgress } from '../../speech_analysis/star_stage_estimation.util';
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
  TrackAnswerProgressInput,
  TrackAnswerProgressResult,
} from '../ai_coach.contract';

/**
 * Fixture provider — the app runs end to end with no model wired in.
 *
 * Where a deterministic answer genuinely exists (STAR cue words, a mechanical
 * pronoun swap, the hand-written question intent) this returns the real thing.
 * Where actual judgement is required it returns an obvious placeholder. Either
 * way every result carries `is_stubbed: true` and the UI labels it, so nobody
 * mistakes a fixture for a model on stage.
 *
 * Replace by setting AI_COACH_PROVIDER=model once ModelAiCoachProvider is done.
 */
@Injectable()
export class StubAiCoachProvider implements AiCoachPort {
  async trackAnswerProgress(
    input: TrackAnswerProgressInput,
  ): Promise<TrackAnswerProgressResult> {
    const star_progress = estimateStarProgress(
      input.transcript_text,
      input.seconds_elapsed,
    );

    return {
      is_stubbed: true,
      current_stage: star_progress.current_stage,
      stage_durations_seconds: star_progress.stage_durations_seconds,
      has_quantified_result: star_progress.has_quantified_result,
      nudge_text: this.chooseNudge(input, star_progress.has_quantified_result),
    };
  }

  /**
   * One nudge or none, in priority order. The spec is explicit that competing
   * nudges are what makes this feel broken.
   */
  private chooseNudge(
    input: TrackAnswerProgressInput,
    has_quantified_result: boolean,
  ): string | null {
    const { first_person_count, collective_count, seconds_elapsed } = input;

    if (collective_count >= 3 && first_person_count === 0) {
      return `${collective_count} "we"s, no "I" yet. Say what YOU decided next — then land a number.`;
    }

    if (collective_count >= 4 && collective_count > first_person_count * 2) {
      return 'Still mostly "we". Name the call that was yours alone.';
    }

    if (seconds_elapsed > 100 && !has_quantified_result) {
      return 'Land it. One sentence of result, with a number in it.';
    }

    if (seconds_elapsed > 150) {
      return 'You are over two minutes. Stop at the result.';
    }

    return null;
  }

  async critiqueAnswer(
    input: CritiqueAnswerInput,
  ): Promise<CritiqueAnswerResult> {
    const attribution = analysePronounAttribution(input.transcript_text);

    return {
      is_stubbed: true,
      first_person_rewrite: rewriteInFirstPerson(input.transcript_text),
      length_variants: [
        {
          target_seconds: 30,
          answer_text: PENDING_MODEL_TEXT('a 30-second version'),
        },
        {
          target_seconds: 90,
          answer_text: PENDING_MODEL_TEXT('a 90-second version'),
        },
        {
          target_seconds: 120,
          answer_text: PENDING_MODEL_TEXT('a two-minute version'),
        },
      ],
      strengths: [
        attribution.first_person_count > 0
          ? `You claimed ${attribution.first_person_count} action${attribution.first_person_count === 1 ? '' : 's'} in first person.`
          : 'You told a complete story without stalling.',
      ],
      fixes:
        attribution.collective_count > attribution.first_person_count
          ? [
              `${attribution.collective_count} actions were attributed to the team. The rewrite above reclaims them mechanically — a model will do it without breaking the ones that genuinely were shared.`,
            ]
          : [PENDING_MODEL_TEXT('specific fixes')],
    };
  }

  async decodeSubtext(input: DecodeSubtextInput): Promise<DecodeSubtextResult> {
    return {
      is_stubbed: true,
      // The hand-written library entry is real content, not a fixture.
      interviewer_intent:
        input.known_question_intent ??
        PENDING_MODEL_TEXT('the intent behind this question'),
      what_lands: input.known_question_intent
        ? []
        : [PENDING_MODEL_TEXT('what a strong answer contains')],
      untranslated_phrases: input.flagged_phrases.map((phrase) => ({
        phrase,
        why_it_does_not_travel: PENDING_MODEL_TEXT('an explanation'),
        suggested_replacement: PENDING_MODEL_TEXT('a replacement'),
      })),
    };
  }

  async extractStoryFromMemory(
    input: ExtractStoryInput,
  ): Promise<ExtractStoryResult> {
    // Extracting STAR from a messy memory in any language is the one thing here
    // with no deterministic fallback worth pretending about.
    return {
      is_stubbed: true,
      title: 'Untitled story',
      detected_language: input.source_language ?? 'unknown',
      situation: input.raw_memory_text.trim(),
      task: PENDING_MODEL_TEXT('the Task'),
      action: PENDING_MODEL_TEXT('the Action'),
      result: PENDING_MODEL_TEXT('the Result'),
      themes: [],
    };
  }

  async buildInterviewPlan(
    _input: BuildInterviewPlanInput,
  ): Promise<BuildInterviewPlanResult> {
    return {
      is_stubbed: true,
      coverage_gaps: [
        PENDING_MODEL_TEXT('gaps between the resume and posting'),
      ],
      rounds: [],
    };
  }
}

/** Uniform placeholder copy, so the UI can spot and style it consistently. */
function PENDING_MODEL_TEXT(what: string): string {
  return `[Awaiting AI provider — ${what} will be generated here.]`;
}
