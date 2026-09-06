/**
 * Turns MediaPipe face landmarks into a small set of OBSERVABLE signals.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT THIS DELIBERATELY DOES NOT DO
 *
 * It does not classify emotion. Inferring emotional state from facial
 * expression is scientifically contested, and a product whose entire thesis is
 * "we do not penalise you for being different" has no business guessing at
 * feelings from a webcam.
 *
 * It also does not score gaze DIRECTION. Sustained eye contact is a culturally
 * specific norm: across much of Asia, and in many other traditions, reducing
 * eye contact with someone senior is courtesy rather than evasion. Scoring it
 * would punish exactly the behaviour this product exists to help somebody
 * navigate. Direction is reported as information with coaching attached; only
 * gaze STEADINESS feeds any reading, because a settled gaze reads as composed
 * everywhere and a darting one does not.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** The blendshape names MediaPipe emits that this module reads. */
const GAZE_BLENDSHAPES = {
  look_in_left: 'eyeLookInLeft',
  look_out_left: 'eyeLookOutLeft',
  look_in_right: 'eyeLookInRight',
  look_out_right: 'eyeLookOutRight',
  look_up_left: 'eyeLookUpLeft',
  look_up_right: 'eyeLookUpRight',
  look_down_left: 'eyeLookDownLeft',
  look_down_right: 'eyeLookDownRight',
  blink_left: 'eyeBlinkLeft',
  blink_right: 'eyeBlinkRight',
} as const;

export interface BlendshapeScore {
  categoryName: string;
  score: number;
}

/** One sampled frame. Cheap to hold; a rolling window of these is kept. */
export interface PresenceFrame {
  timestamp_ms: number;
  /** Horizontal gaze, -1 (hard left) to 1 (hard right). */
  gaze_x: number;
  /** Vertical gaze, -1 (down) to 1 (up). */
  gaze_y: number;
  /** Head rotation in radians. Sign convention is arbitrary but consistent. */
  head_yaw: number;
  head_pitch: number;
  /** True on the frame a blink completes. */
  is_blinking: boolean;
}

function readBlendshape(
  blendshapes: BlendshapeScore[],
  name: string,
): number {
  return blendshapes.find((shape) => shape.categoryName === name)?.score ?? 0;
}

/**
 * Head rotation from the 4x4 facial transformation matrix (column-major).
 *
 * This is an approximation and only ever used for magnitude and variance, not
 * as a reported angle, so the exact Euler convention does not matter.
 */
function extractHeadRotation(matrix_data: Float32Array | number[]): {
  yaw: number;
  pitch: number;
} {
  const at = (row: number, column: number): number =>
    matrix_data[column * 4 + row] ?? 0;

  const clamp = (value: number): number => Math.min(Math.max(value, -1), 1);

  return {
    yaw: Math.atan2(at(0, 2), at(2, 2)),
    pitch: Math.asin(clamp(-at(1, 2))),
  };
}

/** Above this on both eyes, the eyes are closed. */
const BLINK_THRESHOLD = 0.5;

export function buildPresenceFrame(
  blendshapes: BlendshapeScore[],
  matrix_data: Float32Array | number[] | null,
  timestamp_ms: number,
): PresenceFrame {
  const look_left =
    (readBlendshape(blendshapes, GAZE_BLENDSHAPES.look_out_left) +
      readBlendshape(blendshapes, GAZE_BLENDSHAPES.look_in_right)) /
    2;
  const look_right =
    (readBlendshape(blendshapes, GAZE_BLENDSHAPES.look_in_left) +
      readBlendshape(blendshapes, GAZE_BLENDSHAPES.look_out_right)) /
    2;
  const look_up =
    (readBlendshape(blendshapes, GAZE_BLENDSHAPES.look_up_left) +
      readBlendshape(blendshapes, GAZE_BLENDSHAPES.look_up_right)) /
    2;
  const look_down =
    (readBlendshape(blendshapes, GAZE_BLENDSHAPES.look_down_left) +
      readBlendshape(blendshapes, GAZE_BLENDSHAPES.look_down_right)) /
    2;

  const blink_score =
    (readBlendshape(blendshapes, GAZE_BLENDSHAPES.blink_left) +
      readBlendshape(blendshapes, GAZE_BLENDSHAPES.blink_right)) /
    2;

  const rotation = matrix_data
    ? extractHeadRotation(matrix_data)
    : { yaw: 0, pitch: 0 };

  return {
    timestamp_ms,
    gaze_x: look_right - look_left,
    gaze_y: look_up - look_down,
    head_yaw: rotation.yaw,
    head_pitch: rotation.pitch,
    is_blinking: blink_score > BLINK_THRESHOLD,
  };
}

/* -------------------------------------------------------------------------- */

export interface PresenceSummary {
  /** Fraction of sampled frames in which a face was found at all. */
  face_visible_fraction: number;
  /**
   * Fraction of frames with the head roughly toward the camera. Reported as
   * INFORMATION with coaching, never scored.
   */
  facing_camera_fraction: number;
  /** 0-1. How settled the gaze is. Higher is steadier. Culture-neutral. */
  gaze_steadiness: number;
  /** 0-1. How still the head is. Higher is steadier. */
  head_steadiness: number;
  blinks_per_minute: number;
  /** False until enough frames have been sampled to mean anything. */
  is_measurable: boolean;
}

/** Roughly a head-on orientation, in radians. Generous on purpose. */
const FACING_CAMERA_YAW_LIMIT = 0.45;
const FACING_CAMERA_PITCH_LIMIT = 0.4;

/** Below this many samples the numbers are noise. */
const MINIMUM_FRAMES_FOR_A_READING = 20;

function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;

  const mean =
    values.reduce((total, value) => total + value, 0) / values.length;
  const variance =
    values.reduce((total, value) => total + (value - mean) ** 2, 0) /
    values.length;

  return Math.sqrt(variance);
}

/**
 * Maps a standard deviation to a 0-1 steadiness score, where 0 deviation is
 * perfectly steady and `noisy_at` is the point we stop distinguishing degrees
 * of unsettled.
 */
function toSteadiness(deviation: number, noisy_at: number): number {
  return Number(Math.max(0, 1 - deviation / noisy_at).toFixed(2));
}

/**
 * Tightened deliberately. A mock interview that grades gently teaches nothing —
 * the room these numbers are preparing somebody for is harsher than any
 * threshold here, so the practice one should not be the lenient version.
 */
/** Gaze wander beyond this reads as darting rather than thinking. */
const GAZE_NOISY_AT = 0.24;
/** Radians of head sway beyond which somebody looks restless. */
const HEAD_NOISY_AT = 0.17;

export function summarisePresence(
  frames: PresenceFrame[],
  frames_without_a_face: number,
): PresenceSummary {
  const total_samples = frames.length + frames_without_a_face;

  if (frames.length < MINIMUM_FRAMES_FOR_A_READING) {
    return {
      face_visible_fraction: total_samples === 0 ? 0 : frames.length / total_samples,
      facing_camera_fraction: 0,
      gaze_steadiness: 0,
      head_steadiness: 0,
      blinks_per_minute: 0,
      is_measurable: false,
    };
  }

  const facing_camera_count = frames.filter(
    (frame) =>
      Math.abs(frame.head_yaw) < FACING_CAMERA_YAW_LIMIT &&
      Math.abs(frame.head_pitch) < FACING_CAMERA_PITCH_LIMIT,
  ).length;

  // A blink spans several frames, so only the leading edge is counted.
  let blink_count = 0;
  for (let index = 1; index < frames.length; index += 1) {
    if (frames[index].is_blinking && !frames[index - 1].is_blinking) {
      blink_count += 1;
    }
  }

  const elapsed_ms =
    frames[frames.length - 1].timestamp_ms - frames[0].timestamp_ms;
  const elapsed_minutes = Math.max(elapsed_ms / 60_000, 1 / 60);

  const gaze_deviation =
    (standardDeviation(frames.map((frame) => frame.gaze_x)) +
      standardDeviation(frames.map((frame) => frame.gaze_y))) /
    2;

  const head_deviation =
    (standardDeviation(frames.map((frame) => frame.head_yaw)) +
      standardDeviation(frames.map((frame) => frame.head_pitch))) /
    2;

  return {
    face_visible_fraction: Number(
      (frames.length / Math.max(total_samples, 1)).toFixed(2),
    ),
    facing_camera_fraction: Number(
      (facing_camera_count / frames.length).toFixed(2),
    ),
    gaze_steadiness: toSteadiness(gaze_deviation, GAZE_NOISY_AT),
    head_steadiness: toSteadiness(head_deviation, HEAD_NOISY_AT),
    blinks_per_minute: Math.round(blink_count / elapsed_minutes),
    is_measurable: true,
  };
}
