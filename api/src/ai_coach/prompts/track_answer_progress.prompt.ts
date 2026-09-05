import { StarStage } from '../../shared/types/star_stage.enum';
import { TrackAnswerProgressInput } from '../ai_coach.contract';
import {
  COACH_PREAMBLE,
  renderCandidateContext,
} from './candidate_context.prompt';

/**
 * The mid loop: STAR stage, quantified-result check, and at most one nudge.
 *
 * Runs every 6-8 seconds while the candidate is still speaking, so it is the
 * only prompt with a latency budget. It is given the deterministic cue-word
 * estimate as a prior rather than deriving the stage cold — measurement showed
 * every model tested wavering between TASK and ACTION on the same transcript,
 * and a bigger model does not fix that.
 */

export interface TrackAnswerProgressModelOutput {
  current_stage: StarStage;
  has_quantified_result: boolean;
  nudge_text: string | null;
}

export const TRACK_ANSWER_PROGRESS_SCHEMA: Record<string, unknown> = {
  type: 'object',
  additionalProperties: false,
  required: ['current_stage', 'has_quantified_result', 'nudge_text'],
  properties: {
    current_stage: {
      type: 'string',
      enum: ['SITUATION', 'TASK', 'ACTION', 'RESULT'],
      description: 'The latest STAR stage the answer has clearly reached.',
    },
    has_quantified_result: {
      type: 'boolean',
      description:
        'True only if a number with a unit appears as an OUTCOME. Team sizes, dates and durations do not count.',
    },
    nudge_text: {
      type: ['string', 'null'],
      description:
        'At most one coaching line under 18 words, or null. Prefer null.',
    },
  },
};

export function buildTrackAnswerProgressSystemPrompt(
  input: TrackAnswerProgressInput,
): string {
  return `${COACH_PREAMBLE}

You are watching a partial answer as it is being spoken. Return three fields.

1. current_stage — the LATEST stage clearly reached. Never move backwards.
   SITUATION  scene setting: who, where, when. No task named yet.
   TASK       the goal or problem they owned is stated.
   ACTION     they describe doing something: a decision made, a step taken, a
              position argued. "We discussed it and decided" IS an action.
   RESULT     a consequence is stated. A decision is not a result; the effect
              of that decision is.

2. has_quantified_result — true only when a number with a unit appears as an
   outcome, e.g. "error dropped 12%". A team of five is not a result.

3. nudge_text — AT MOST ONE line, or null. Apply in priority order:
   a) Several collective verbs and no first-person ones: tell them to say what
      THEY decided. This outranks everything else.
   b) In ACTION with no quantified result and over 60 seconds elapsed: tell
      them to land a number.
   c) Over 120 seconds: tell them to stop at the result.
   d) Otherwise null.

   Rules for the nudge: under 18 words, imperative, specific to what they just
   said. Never repeat the nudge already on screen — return null instead. A
   nudge the candidate has already acted on is worse than silence.

--- CANDIDATE CONTEXT ---
${renderCandidateContext(input.candidate_context)}`;
}

export function buildTrackAnswerProgressUserMessage(
  input: TrackAnswerProgressInput,
  stage_prior: StarStage,
): string {
  const nudge_line =
    input.current_nudge_text === null
      ? 'Nudge currently on screen: none.'
      : `Nudge currently on screen (do NOT repeat it): "${input.current_nudge_text}"`;

  return `Question: ${input.question_text}

Elapsed: ${input.seconds_elapsed}s
First-person verbs so far: ${input.first_person_count}
Collective verbs so far: ${input.collective_count}
Cue-word stage estimate (a prior, override it if the transcript disagrees): ${stage_prior}
${nudge_line}

Transcript so far:
${input.transcript_text}`;
}
