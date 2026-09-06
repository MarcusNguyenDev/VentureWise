import { MetricVerdict } from "../fast_loop/metric_verdict.enum";
import type { SpeechAudioSnapshot } from "./speech_audio_analyser";

/**
 * Turns the raw audio events into the two delivery metrics that the transcript
 * could not supply.
 *
 * Pace is recomputed here too. Words divided by wall-clock time counts thinking
 * silence as slow speech; words divided by time actually spent speaking is the
 * number that describes how fast somebody talks, and it is only available once
 * silence is measured.
 */

/** A pause this long mid-answer is long enough for a listener to notice. */
const LONG_PAUSE_MS = 1200;

export interface AudioDeliveryMetrics {
  /** Silences over 350ms. */
  pause_count: number;
  long_pause_count: number;
  longest_pause_ms: number;
  pause_verdict: MetricVerdict;

  /** "um"/"uh" detected acoustically, not from the transcript. */
  filled_pause_count: number;
  filled_pauses_per_minute: number;
  filler_verdict: MetricVerdict;

  /** Words per minute of speech, excluding silence. */
  articulation_rate_wpm: number;
  /** Share of the answer spent actually speaking. */
  speaking_ratio: number;

  is_measurable: boolean;
}

/** Graded harshly, in line with the rest of the mock. */
function classifyFilledPauseRate(per_minute: number): MetricVerdict {
  if (per_minute <= 2) return MetricVerdict.GOOD;
  if (per_minute <= 5) return MetricVerdict.WATCH;
  return MetricVerdict.POOR;
}

function classifyPauses(long_pause_count: number): MetricVerdict {
  if (long_pause_count <= 1) return MetricVerdict.GOOD;
  if (long_pause_count <= 3) return MetricVerdict.WATCH;
  return MetricVerdict.POOR;
}

export function buildAudioDeliveryMetrics(
  snapshot: SpeechAudioSnapshot | null,
  word_count: number,
): AudioDeliveryMetrics {
  const EMPTY: AudioDeliveryMetrics = {
    pause_count: 0,
    long_pause_count: 0,
    longest_pause_ms: 0,
    pause_verdict: MetricVerdict.WATCH,
    filled_pause_count: 0,
    filled_pauses_per_minute: 0,
    filler_verdict: MetricVerdict.WATCH,
    articulation_rate_wpm: 0,
    speaking_ratio: 0,
    is_measurable: false,
  };

  // A few seconds of speech before any of this means anything.
  const MINIMUM_SPEAKING_MS = 4000;
  if (
    !snapshot?.is_calibrated ||
    snapshot.speaking_ms < MINIMUM_SPEAKING_MS
  ) {
    return EMPTY;
  }

  const long_pauses = snapshot.pauses.filter(
    (pause) => pause.duration_ms >= LONG_PAUSE_MS,
  );

  const speaking_minutes = snapshot.speaking_ms / 60_000;
  const elapsed_minutes = Math.max(snapshot.elapsed_ms / 60_000, 1 / 60);

  const filled_pauses_per_minute = Number(
    (snapshot.filled_pauses.length / elapsed_minutes).toFixed(1),
  );

  return {
    pause_count: snapshot.pauses.length,
    long_pause_count: long_pauses.length,
    longest_pause_ms: snapshot.pauses.reduce(
      (longest, pause) => Math.max(longest, pause.duration_ms),
      0,
    ),
    pause_verdict: classifyPauses(long_pauses.length),
    filled_pause_count: snapshot.filled_pauses.length,
    filled_pauses_per_minute,
    filler_verdict: classifyFilledPauseRate(filled_pauses_per_minute),
    articulation_rate_wpm: Math.round(word_count / Math.max(speaking_minutes, 0.05)),
    speaking_ratio: Number(
      (snapshot.speaking_ms / Math.max(snapshot.elapsed_ms, 1)).toFixed(2),
    ),
    is_measurable: true,
  };
}
