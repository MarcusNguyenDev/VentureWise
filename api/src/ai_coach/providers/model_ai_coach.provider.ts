import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

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
  TrackAnswerProgressInput,
  TrackAnswerProgressResult,
} from '../ai_coach.contract';
import { AiProviderNotConfiguredError } from '../../shared/errors/ai_provider_not_configured.error';

/**
 * The real provider, backed by OpenAI. Every method is deliberately
 * unimplemented.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THIS IS THE ONLY FILE THAT NEEDS A MODEL. Nothing else in the codebase knows
 * an AI exists — the rest depends on `AiCoachPort` through the `AI_COACH_PORT`
 * token. Implement the five methods below and set AI_COACH_PROVIDER=model.
 *
 * Config comes from `api/.env`; see `AiCoachConfig` for every setting.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Which loop each method belongs to, from Part 5 of the spec:
 *
 *   trackAnswerProgress   MID loop  · ~800 ms budget · every 6-8 s of speech
 *                         Use `ModelTier.MID_LOOP` and pass
 *                         `config.mid_loop_timeout_ms`. The resume, job posting
 *                         and story bank belong in a cached prompt prefix so
 *                         each call sends only the new speech.
 *
 *   critiqueAnswer        SLOW loop · runs once on stop · `ModelTier.SLOW_LOOP`
 *   decodeSubtext         SLOW loop · runs once on stop · `ModelTier.SLOW_LOOP`
 *   extractStoryFromMemory  Off the hot path entirely (F-04)
 *   buildInterviewPlan      Off the hot path entirely (F-06)
 *
 * Two contracts to honour:
 *   1. Set `is_stubbed: false` on everything you return.
 *   2. `trackAnswerProgress` returns at most ONE nudge, or null. Returning a
 *      nudge while `input.current_nudge_text` is still on screen replaces it —
 *      prefer null unless the new nudge is clearly more urgent.
 */
@Injectable()
export class ModelAiCoachProvider implements AiCoachPort {
  /**
   * Built on first use, never in the constructor: Nest instantiates this class
   * even when AI_COACH_PROVIDER=stub, and booting the whole app must not
   * require a key that the stub does not need.
   */
  private openai_client: OpenAI | null = null;

  constructor(private readonly config: AiCoachConfig) {}

  protected getClient(capability_name: string): OpenAI {
    if (this.openai_client) return this.openai_client;

    this.openai_client = new OpenAI({
      apiKey: this.config.requireApiKey(capability_name),
      baseURL: this.config.base_url,
    });

    return this.openai_client;
  }

  protected getModelName(tier: ModelTier): string {
    return this.config.getModelName(tier);
  }

  async trackAnswerProgress(
    input: TrackAnswerProgressInput,
  ): Promise<TrackAnswerProgressResult> {
    throw new AiProviderNotConfiguredError('trackAnswerProgress');
  }

  async critiqueAnswer(
    input: CritiqueAnswerInput,
  ): Promise<CritiqueAnswerResult> {
    throw new AiProviderNotConfiguredError('critiqueAnswer');
  }

  async decodeSubtext(input: DecodeSubtextInput): Promise<DecodeSubtextResult> {
    throw new AiProviderNotConfiguredError('decodeSubtext');
  }

  async extractStoryFromMemory(
    input: ExtractStoryInput,
  ): Promise<ExtractStoryResult> {
    throw new AiProviderNotConfiguredError('extractStoryFromMemory');
  }

  async buildInterviewPlan(
    input: BuildInterviewPlanInput,
  ): Promise<BuildInterviewPlanResult> {
    throw new AiProviderNotConfiguredError('buildInterviewPlan');
  }
}
