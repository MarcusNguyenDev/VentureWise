// GENERATED FILE — DO NOT EDIT.
// Regenerate with ./scripts/sync_fast_loop.sh after changing the API original.
// Source: api/src/speech_analysis/speaking_pace.util.ts

import { MetricVerdict } from './metric_verdict.enum';
import { TranscriptWord } from './transcript_word.type';

/**
 * Rolling words-per-minute over a trailing window.
 *
 * A whole-answer average hides the thing that matters — that the candidate
 * sped up when they got nervous — so the meter reports only the recent window.
 *
 * Mirrored in `front-end/lib/fast_loop/speaking_pace.util.ts`.
 */

export const PACE_WINDOW_MS = 15_000;

/** Below this an answer drags; above it an interviewer stops following. */
const COMFORTABLE_PACE_MIN_WPM = 125;
const COMFORTABLE_PACE_MAX_WPM = 160;
const TOLERABLE_PACE_MIN_WPM = 105;
const TOLERABLE_PACE_MAX_WPM = 180;

export interface SpeakingPaceSummary {
  words_per_minute: number;
  verdict: MetricVerdict;
  /** False until there is enough speech for the number to mean anything. */
  is_measurable: boolean;
}

export function classifyPace(words_per_minute: number): MetricVerdict {
  if (
    words_per_minute >= COMFORTABLE_PACE_MIN_WPM &&
    words_per_minute <= COMFORTABLE_PACE_MAX_WPM
  ) {
    return MetricVerdict.GOOD;
  }

  if (
    words_per_minute >= TOLERABLE_PACE_MIN_WPM &&
    words_per_minute <= TOLERABLE_PACE_MAX_WPM
  ) {
    return MetricVerdict.WATCH;
  }

  return MetricVerdict.POOR;
}

export function measureSpeakingPace(
  words: TranscriptWord[],
  now_ms: number,
): SpeakingPaceSummary {
  const MINIMUM_WORDS_FOR_A_READING = 8;
  const window_start_ms = Math.max(now_ms - PACE_WINDOW_MS, 0);

  const words_in_window = words.filter(
    (word) => word.end_ms >= window_start_ms && word.start_ms <= now_ms,
  );

  if (words_in_window.length < MINIMUM_WORDS_FOR_A_READING) {
    return {
      words_per_minute: 0,
      verdict: MetricVerdict.WATCH,
      is_measurable: false,
    };
  }

  const first_word = words_in_window[0];
  const last_word = words_in_window[words_in_window.length - 1];
  const elapsed_ms = Math.max(last_word.end_ms - first_word.start_ms, 1);

  const words_per_minute = Math.round(
    (words_in_window.length / elapsed_ms) * 60_000,
  );

  return {
    words_per_minute,
    verdict: classifyPace(words_per_minute),
    is_measurable: true,
  };
}
