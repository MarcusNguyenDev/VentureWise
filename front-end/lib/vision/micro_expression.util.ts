/**
 * Detects brief facial movements — the transient spikes people mean when they
 * say "micro-expression".
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TWO DESIGN CONSTRAINTS THAT ARE NOT NEGOTIABLE
 *
 * 1. UPPER FACE ONLY. Speech drives the mouth and jaw continuously — jawOpen
 *    and the lip shapes fire on every syllable — so a detector that watched
 *    them would mostly be measuring "is currently talking", which we already
 *    know from the transcript. Brow, eyelid and cheek movement is far less
 *    confounded by articulation, so that is all this reads.
 *
 * 2. THIS NAMES MOVEMENTS, NEVER EMOTIONS. A brow flash is a brow flash. The
 *    claim that brief expressions reliably reveal concealed feeling is heavily
 *    contested, and a webcam sampling at 30fps through video compression is a
 *    poor instrument for it even if it were settled. What is reported is a rate
 *    of brief facial movement, which is a real measurable thing.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { BlendshapeScore } from "./presence_signals.util";

/**
 * Upper-face blendshapes, chosen to be as independent of speech articulation
 * as MediaPipe's set allows.
 */
export const EXPRESSIVE_BLENDSHAPES = [
  "browDownLeft",
  "browDownRight",
  "browInnerUp",
  "browOuterUpLeft",
  "browOuterUpRight",
  "eyeSquintLeft",
  "eyeSquintRight",
  "eyeWideLeft",
  "eyeWideRight",
  "cheekSquintLeft",
  "cheekSquintRight",
  "noseSneerLeft",
  "noseSneerRight",
  "mouthPressLeft",
  "mouthPressRight",
] as const;

export type ExpressiveBlendshape = (typeof EXPRESSIVE_BLENDSHAPES)[number];

/**
 * Micro-expressions are conventionally described as lasting between about a
 * twenty-fifth and a fifth of a second. The upper bound here is deliberately
 * generous — anything longer is a held expression, which is a different thing
 * and is excluded rather than counted.
 */
const MINIMUM_TRANSIENT_MS = 40;
const MAXIMUM_TRANSIENT_MS = 600;

/**
 * How far above its own rolling baseline a blendshape must rise to count as
 * moving. Blendshape scores run 0-1 and MediaPipe's are noisy at rest, so this
 * is set above the noise floor rather than near zero.
 */
const ONSET_THRESHOLD = 0.08;

/** Hysteresis: a movement ends only once it falls well back, not on a wobble. */
const OFFSET_THRESHOLD = 0.04;

/** Baseline is the median over this window, so a spike cannot move it much. */
const BASELINE_WINDOW_MS = 4000;

export interface ExpressionTransient {
  blendshape: ExpressiveBlendshape;
  /** How far above baseline it peaked, 0-1. */
  peak_amplitude: number;
  onset_ms: number;
  duration_ms: number;
}

export interface ExpressionSample {
  timestamp_ms: number;
  scores: Partial<Record<ExpressiveBlendshape, number>>;
}

export function readExpressiveScores(
  blendshapes: BlendshapeScore[],
): Partial<Record<ExpressiveBlendshape, number>> {
  const scores: Partial<Record<ExpressiveBlendshape, number>> = {};

  for (const shape of blendshapes) {
    const name = shape.categoryName as ExpressiveBlendshape;
    if (EXPRESSIVE_BLENDSHAPES.includes(name)) scores[name] = shape.score;
  }

  return scores;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

/**
 * Tracks one blendshape and emits a transient each time it rises above its own
 * baseline and comes back down inside the micro-expression window.
 *
 * Per-blendshape baselines matter: a resting brow position varies a lot between
 * people and with glasses, so a shared absolute threshold would fire constantly
 * for some faces and never for others.
 */
class BlendshapeTracker {
  private history: { timestamp_ms: number; score: number }[] = [];
  private onset_ms: number | null = null;
  private peak_score = 0;
  private baseline_at_onset = 0;

  constructor(private readonly blendshape: ExpressiveBlendshape) {}

  observe(
    score: number,
    timestamp_ms: number,
  ): ExpressionTransient | null {
    this.history.push({ timestamp_ms, score });

    const window_starts_at = timestamp_ms - BASELINE_WINDOW_MS;
    this.history = this.history.filter(
      (entry) => entry.timestamp_ms >= window_starts_at,
    );

    // Not enough history to know what this face's resting position is.
    if (this.history.length < 10) return null;

    const baseline = median(this.history.map((entry) => entry.score));

    if (this.onset_ms === null) {
      if (score >= baseline + ONSET_THRESHOLD) {
        this.onset_ms = timestamp_ms;
        this.peak_score = score;
        this.baseline_at_onset = baseline;
      }
      return null;
    }

    this.peak_score = Math.max(this.peak_score, score);

    const has_returned = score < this.baseline_at_onset + OFFSET_THRESHOLD;
    const duration_ms = timestamp_ms - this.onset_ms;

    // Held too long to be a micro-expression. Discard and wait for a return to
    // baseline rather than counting a sustained frown as a flicker.
    if (!has_returned && duration_ms > MAXIMUM_TRANSIENT_MS) {
      this.onset_ms = null;
      this.peak_score = 0;
      return null;
    }

    if (!has_returned) return null;

    const transient: ExpressionTransient | null =
      duration_ms >= MINIMUM_TRANSIENT_MS
        ? {
            blendshape: this.blendshape,
            peak_amplitude: Number(
              (this.peak_score - this.baseline_at_onset).toFixed(3),
            ),
            onset_ms: this.onset_ms,
            duration_ms: Math.round(duration_ms),
          }
        : null;

    this.onset_ms = null;
    this.peak_score = 0;

    return transient;
  }
}

export interface ExpressionActivitySummary {
  /** Brief upper-face movements per minute. */
  transients_per_minute: number;
  /** Which movements fired most, most frequent first. */
  most_active: { blendshape: ExpressiveBlendshape; count: number }[];
  /** False until there is enough history for baselines to settle. */
  is_measurable: boolean;
}

/**
 * Stateful detector across all tracked blendshapes.
 *
 * Held as an instance rather than a pure function because the baselines have to
 * persist between frames — recomputing them from a rolling array on every
 * sample at 30fps would be wasteful and would lose in-flight onsets.
 */
export class MicroExpressionDetector {
  private readonly trackers = new Map<
    ExpressiveBlendshape,
    BlendshapeTracker
  >();
  private transients: ExpressionTransient[] = [];
  private first_sample_ms: number | null = null;
  /** Never trimmed — the review reports the whole answer, not a window. */
  private total_transient_count = 0;
  private total_counts = new Map<ExpressiveBlendshape, number>();
  private last_sample_ms = 0;

  /** Transients older than this stop counting toward the live rate. */
  private static readonly RATE_WINDOW_MS = 20_000;
  /** Baselines need roughly this long to settle before the rate means much. */
  private static readonly WARM_UP_MS = 4000;

  observe(sample: ExpressionSample): void {
    this.first_sample_ms ??= sample.timestamp_ms;

    for (const blendshape of EXPRESSIVE_BLENDSHAPES) {
      const score = sample.scores[blendshape];
      if (score === undefined) continue;

      let tracker = this.trackers.get(blendshape);
      if (!tracker) {
        tracker = new BlendshapeTracker(blendshape);
        this.trackers.set(blendshape, tracker);
      }

      const transient = tracker.observe(score, sample.timestamp_ms);
      if (!transient) continue;

      this.transients.push(transient);
      this.total_transient_count += 1;
      this.total_counts.set(
        transient.blendshape,
        (this.total_counts.get(transient.blendshape) ?? 0) + 1,
      );
    }

    this.last_sample_ms = sample.timestamp_ms;

    const window_starts_at =
      sample.timestamp_ms - MicroExpressionDetector.RATE_WINDOW_MS;
    this.transients = this.transients.filter(
      (item) => item.onset_ms >= window_starts_at,
    );
  }

  summarise(now_ms: number): ExpressionActivitySummary {
    const elapsed_ms = now_ms - (this.first_sample_ms ?? now_ms);

    if (elapsed_ms < MicroExpressionDetector.WARM_UP_MS) {
      return {
        transients_per_minute: 0,
        most_active: [],
        is_measurable: false,
      };
    }

    const counted_window_ms = Math.min(
      elapsed_ms,
      MicroExpressionDetector.RATE_WINDOW_MS,
    );

    const counts = new Map<ExpressiveBlendshape, number>();
    for (const transient of this.transients) {
      counts.set(
        transient.blendshape,
        (counts.get(transient.blendshape) ?? 0) + 1,
      );
    }

    return {
      transients_per_minute: Math.round(
        (this.transients.length / counted_window_ms) * 60_000,
      ),
      most_active: [...counts.entries()]
        .map(([blendshape, count]) => ({ blendshape, count }))
        .sort((left, right) => right.count - left.count)
        .slice(0, 3),
      is_measurable: true,
    };
  }

  /**
   * The whole answer rather than the rolling window, for the review.
   */
  summariseWholeAnswer(): ExpressionActivitySummary {
    const elapsed_ms = this.last_sample_ms - (this.first_sample_ms ?? 0);

    if (elapsed_ms < MicroExpressionDetector.WARM_UP_MS) {
      return {
        transients_per_minute: 0,
        most_active: [],
        is_measurable: false,
      };
    }

    return {
      transients_per_minute: Math.round(
        (this.total_transient_count / elapsed_ms) * 60_000,
      ),
      most_active: [...this.total_counts.entries()]
        .map(([blendshape, count]) => ({ blendshape, count }))
        .sort((left, right) => right.count - left.count)
        .slice(0, 3),
      is_measurable: true,
    };
  }

  reset(): void {
    this.trackers.clear();
    this.transients = [];
    this.first_sample_ms = null;
    this.total_transient_count = 0;
    this.total_counts.clear();
    this.last_sample_ms = 0;
  }
}

/** Plain-English names, so the UI never shows a raw blendshape identifier. */
export const BLENDSHAPE_LABEL: Record<ExpressiveBlendshape, string> = {
  browDownLeft: "brow furrow",
  browDownRight: "brow furrow",
  browInnerUp: "inner brow raise",
  browOuterUpLeft: "brow raise",
  browOuterUpRight: "brow raise",
  eyeSquintLeft: "eye squint",
  eyeSquintRight: "eye squint",
  eyeWideLeft: "eye widen",
  eyeWideRight: "eye widen",
  cheekSquintLeft: "cheek raise",
  cheekSquintRight: "cheek raise",
  noseSneerLeft: "nose wrinkle",
  noseSneerRight: "nose wrinkle",
  mouthPressLeft: "lip press",
  mouthPressRight: "lip press",
};
