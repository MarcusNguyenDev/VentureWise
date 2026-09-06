import type { ExpressionActivitySummary } from "./micro_expression.util";
import type { PresenceSummary } from "./presence_signals.util";

/**
 * Combines what the camera can see with filler density from the transcript
 * into a composure reading.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * READ THIS BEFORE CHANGING IT
 *
 * Graded harshly on purpose. A mock that flatters you teaches nothing, and the
 * real room is less forgiving than any threshold in this file — so the top band
 * is deliberately hard to reach and the middle of the scale is where most
 * honest answers land.
 *
 * It is still kept OUT of the F-05 delivery score. That score publishes a list
 * of things it refuses to grade, and inferred confidence is on it. This sits
 * beside it as a mirror. If it is ever folded in, two lines of
 * `NOT_SCORED_BY_DESIGN` become false and must be deleted, not left there.
 *
 * The inputs are culture-neutral by construction. Gaze STEADINESS is used,
 * never gaze DIRECTION: how much somebody looks at the camera is a cultural
 * norm, and in many traditions reduced eye contact with a senior person is
 * courtesy, not evasion. How settled the gaze is reads the same everywhere.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Five points rather than three, so the middle of the range is legible. */
export enum ComposureBand {
  COMPOSED = "COMPOSED",
  STEADY = "STEADY",
  SLIGHTLY_RESTLESS = "SLIGHTLY_RESTLESS",
  RESTLESS = "RESTLESS",
  VERY_RESTLESS = "VERY_RESTLESS",
}

export const COMPOSURE_BAND_LABEL: Record<ComposureBand, string> = {
  [ComposureBand.COMPOSED]: "Composed",
  [ComposureBand.STEADY]: "Steady",
  [ComposureBand.SLIGHTLY_RESTLESS]: "Slightly restless",
  [ComposureBand.RESTLESS]: "Restless",
  [ComposureBand.VERY_RESTLESS]: "Very restless",
};

/** Ordered best to worst, for rendering a scale. */
export const COMPOSURE_BAND_ORDER: ComposureBand[] = [
  ComposureBand.COMPOSED,
  ComposureBand.STEADY,
  ComposureBand.SLIGHTLY_RESTLESS,
  ComposureBand.RESTLESS,
  ComposureBand.VERY_RESTLESS,
];

export interface ComposureContribution {
  label: string;
  /** 0-1, where 1 is the settled end. */
  value: number;
  /** How much this signal counts toward the score. */
  weight: number;
  detail: string;
}

export interface ComposureEstimate {
  band: ComposureBand;
  /** 0-100. Weighted across whichever signals were available. */
  score: number;
  contributions: ComposureContribution[];
  is_measurable: boolean;
  caveat: string;
}

/**
 * Filler density carries the most weight because it is the only input measured
 * from what was actually said rather than inferred from pixels.
 */
const SIGNAL_WEIGHTS = {
  filler_density: 0.4,
  gaze_steadiness: 0.2,
  head_steadiness: 0.2,
  facial_movement: 0.2,
} as const;

/** Harsher than before: fillers start costing sooner. */
const FILLER_NOISY_AT = 7;

/** Brief upper-face movements per minute at which the face reads as busy. */
const EXPRESSION_ACTIVITY_BUSY_AT = 25;

const CAVEAT =
  "An estimate from a few weak signals, not a measurement. Lighting, glasses, " +
  "a small screen and simply thinking hard all move these numbers, and brief " +
  "facial movements are movements — not evidence of what somebody feels. " +
  "Graded harshly on purpose. It does not feed your delivery score.";

function toFillerSteadiness(fillers_per_hundred_words: number): number {
  return Number(
    Math.max(0, 1 - fillers_per_hundred_words / FILLER_NOISY_AT).toFixed(2),
  );
}

function toExpressionSteadiness(transients_per_minute: number): number {
  return Number(
    Math.max(
      0,
      1 - transients_per_minute / EXPRESSION_ACTIVITY_BUSY_AT,
    ).toFixed(2),
  );
}

export function estimateComposure(
  presence: PresenceSummary | null,
  expression_activity: ExpressionActivitySummary | null,
  fillers_per_hundred_words: number,
  has_enough_speech: boolean,
): ComposureEstimate {
  const contributions: ComposureContribution[] = [];

  if (has_enough_speech) {
    contributions.push({
      label: "Filler density",
      value: toFillerSteadiness(fillers_per_hundred_words),
      weight: SIGNAL_WEIGHTS.filler_density,
      detail: `${fillers_per_hundred_words} per 100 words`,
    });
  }

  if (presence?.is_measurable) {
    contributions.push({
      label: "Gaze steadiness",
      value: presence.gaze_steadiness,
      weight: SIGNAL_WEIGHTS.gaze_steadiness,
      detail: presence.gaze_steadiness > 0.7 ? "settled" : "moving about",
    });
    contributions.push({
      label: "Head steadiness",
      value: presence.head_steadiness,
      weight: SIGNAL_WEIGHTS.head_steadiness,
      detail: presence.head_steadiness > 0.7 ? "still" : "shifting",
    });
  }

  if (expression_activity?.is_measurable) {
    contributions.push({
      label: "Facial movement",
      value: toExpressionSteadiness(expression_activity.transients_per_minute),
      weight: SIGNAL_WEIGHTS.facial_movement,
      detail: `${expression_activity.transients_per_minute}/min`,
    });
  }

  if (contributions.length === 0) {
    return {
      band: ComposureBand.SLIGHTLY_RESTLESS,
      score: 0,
      contributions: [],
      is_measurable: false,
      caveat: CAVEAT,
    };
  }

  const total_weight = contributions.reduce(
    (total, item) => total + item.weight,
    0,
  );
  const weighted_value =
    contributions.reduce((total, item) => total + item.value * item.weight, 0) /
    total_weight;

  const score = Math.round(weighted_value * 100);

  return {
    band: toBand(score),
    score,
    contributions,
    is_measurable: true,
    caveat: CAVEAT,
  };
}

/**
 * Deliberately top-heavy: "Composed" should be something a candidate earns on a
 * genuinely good take, not the default for anyone who sits still.
 */
function toBand(score: number): ComposureBand {
  if (score >= 85) return ComposureBand.COMPOSED;
  if (score >= 70) return ComposureBand.STEADY;
  if (score >= 55) return ComposureBand.SLIGHTLY_RESTLESS;
  if (score >= 35) return ComposureBand.RESTLESS;
  return ComposureBand.VERY_RESTLESS;
}

/**
 * The coaching line for camera presence.
 *
 * Note what this does NOT say: it never tells the candidate their eye contact
 * is too low. It explains that sustained eye contact is an Australian
 * convention, the same way the product explains the "we" to "I" shift — a
 * learnable norm, not a personal failing.
 */
export function buildPresenceCoachingNote(
  presence: PresenceSummary,
): string | null {
  if (!presence.is_measurable) return null;

  if (presence.face_visible_fraction < 0.7) {
    return "You dropped out of frame for a good part of that. Worth checking your camera angle before a real interview — it is the cheapest fix on this page.";
  }

  if (presence.head_steadiness < 0.45) {
    return "A fair bit of movement. Some of that is normal thinking; if it is a swivel chair, plant your feet.";
  }

  if (presence.facing_camera_fraction < 0.5) {
    return "You were turned away from the camera for over half the answer. Australian interviewers read looking-toward as engagement — it is a local convention rather than a rule about respect, and it is worth knowing it is scored differently here than at home. Try putting the interviewer's window directly under your camera.";
  }

  return null;
}
