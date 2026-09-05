import { StarStage, STAR_STAGE_ORDER } from '../shared/types/star_stage.enum';

/**
 * A cue-word estimate of which STAR stage an answer has reached.
 *
 * This is a heuristic, not a judgement: it looks for the phrases that mark a
 * transition and never moves backwards. `AiCoachPort.trackAnswerProgress` is
 * the real thing; this keeps the STAR bar alive while the model is pending, and
 * gives the model a cheap prior when it arrives.
 */

const STAGE_CUE_PHRASES: Record<StarStage, string[]> = {
  [StarStage.SITUATION]: [
    'in my',
    'at the time',
    'last year',
    'during',
    'when i was',
    'we had a team',
    'the project was',
    'i was working',
    'back in',
    'my final year',
    'the company',
    'the context was',
  ],
  [StarStage.TASK]: [
    'i was responsible',
    'my job was',
    'i had to',
    'the goal was',
    'we needed to',
    'i needed to',
    'my role was',
    'i was asked to',
    'the problem was',
    'the challenge was',
    'it was on me to',
  ],
  [StarStage.ACTION]: [
    'so i',
    'i decided',
    'what i did',
    'i started by',
    'i proposed',
    'i built',
    'i wrote',
    'i ran',
    'i set up',
    'i suggested',
    'i talked to',
    'i pushed for',
    'the way i approached',
    'i took',
    'first i',
    'then i',
    'i went',
  ],
  [StarStage.RESULT]: [
    'as a result',
    'in the end',
    'we ended up',
    'it went from',
    'that meant',
    'the outcome',
    'we shipped',
    'which reduced',
    'which improved',
    'we cut',
    'it dropped',
    'we increased',
    'looking back',
    'what i learned',
    'since then',
  ],
};

/** Numbers with a unit are what make a Result land. */
const QUANTIFIED_RESULT_PATTERN =
  /\b\d+(\.\d+)?\s?(%|percent|x|times|hours?|days?|weeks?|months?|users?|people|ms|milliseconds?|seconds?|minutes?|k|m|thousand|million|dollars?|\$)/i;

const BARE_NUMBER_PATTERN = /\b\d+(\.\d+)?\b/;

export interface StarStageEstimate {
  current_stage: StarStage;
  stage_durations_seconds: Partial<Record<StarStage, number>>;
  has_quantified_result: boolean;
}

function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, ' ')
    .replace(/\s+/g, ' ');
}

/**
 * Finds where in the transcript each stage first showed a cue, then converts
 * those character positions into elapsed seconds proportionally.
 */
export function estimateStarProgress(
  transcript_text: string,
  seconds_elapsed: number,
): StarStageEstimate {
  const normalised_text = normalise(transcript_text);

  const first_cue_position: Partial<Record<StarStage, number>> = {};

  for (const stage of STAR_STAGE_ORDER) {
    const positions = STAGE_CUE_PHRASES[stage]
      .map((phrase) => normalised_text.indexOf(phrase))
      .filter((position) => position !== -1);

    if (positions.length > 0) {
      first_cue_position[stage] = Math.min(...positions);
    }
  }

  // A stage cannot start before the stage that precedes it.
  let earliest_allowed_position = 0;
  const stage_start_positions: Partial<Record<StarStage, number>> = {};

  for (const stage of STAR_STAGE_ORDER) {
    const position = first_cue_position[stage];
    if (position === undefined) continue;

    const clamped_position = Math.max(position, earliest_allowed_position);
    stage_start_positions[stage] = clamped_position;
    earliest_allowed_position = clamped_position;
  }

  const reached_stages = STAR_STAGE_ORDER.filter(
    (stage) => stage_start_positions[stage] !== undefined,
  );

  // Nothing recognisable yet — an answer always opens in Situation.
  if (reached_stages.length === 0) {
    return {
      current_stage: StarStage.SITUATION,
      stage_durations_seconds: { [StarStage.SITUATION]: seconds_elapsed },
      has_quantified_result: false,
    };
  }

  const text_length = Math.max(normalised_text.length, 1);
  const stage_durations_seconds: Partial<Record<StarStage, number>> = {};

  reached_stages.forEach((stage, index) => {
    const start_position = stage_start_positions[stage] ?? 0;
    const next_stage = reached_stages[index + 1];
    const end_position =
      next_stage !== undefined
        ? (stage_start_positions[next_stage] ?? text_length)
        : text_length;

    const share_of_text = (end_position - start_position) / text_length;
    stage_durations_seconds[stage] = Number(
      (share_of_text * seconds_elapsed).toFixed(1),
    );
  });

  const current_stage = reached_stages[reached_stages.length - 1];
  const has_reached_result = current_stage === StarStage.RESULT;

  return {
    current_stage,
    stage_durations_seconds,
    has_quantified_result:
      QUANTIFIED_RESULT_PATTERN.test(transcript_text) ||
      (has_reached_result && BARE_NUMBER_PATTERN.test(transcript_text)),
  };
}
