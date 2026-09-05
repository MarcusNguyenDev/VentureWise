import { Injectable } from '@nestjs/common';

import { AiProviderNotConfiguredError } from '../../shared/errors/ai_provider_not_configured.error';
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
 * The real provider. Every method is deliberately unimplemented.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THIS IS THE ONLY FILE THAT NEEDS A MODEL. Nothing else in the codebase knows
 * an AI exists — the rest depends on `AiCoachPort` through the `AI_COACH_PORT`
 * token. Implement the five methods below and set AI_COACH_PROVIDER=model.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Which loop each method belongs to, from Part 5 of the spec:
 *
 *   trackAnswerProgress   MID loop  · ~800 ms budget · every 6-8 s of speech
 *                         Small, fast model. Tight structured output. The
 *                         resume, job posting and story bank belong in a cached
 *                         prompt prefix so each call sends only new speech.
 *
 *   critiqueAnswer        SLOW loop · runs once on stop · quality over latency
 *   decodeSubtext         SLOW loop · runs once on stop
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
