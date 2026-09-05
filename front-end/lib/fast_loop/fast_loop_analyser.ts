import type { TranscriptWord } from "../api/api_contracts";
import { detectFillers, type FillerSummary } from "./filler_detection.util";
import { detectHedges, type HedgeSummary } from "./hedge_detection.util";
import { MetricVerdict } from "./metric_verdict.enum";
import {
  analysePronounAttribution,
  type PronounAttributionSummary,
} from "./pronoun_attribution.util";
import {
  measureSpeakingPace,
  type SpeakingPaceSummary,
} from "./speaking_pace.util";

/**
 * The fast loop: everything the right rail needs, computed in the browser with
 * no network call, on every interim ASR result.
 *
 * The budget from Part 5 of the spec is 120 ms. These are string scans over an
 * answer-length transcript, so the real cost is well under that — the point is
 * that nothing here can ever wait on a model.
 */

export interface FastLoopSnapshot {
  pronoun_attribution: PronounAttributionSummary;
  pace: SpeakingPaceSummary;
  hedges: HedgeSummary;
  fillers: FillerSummary;
  /** Milliseconds this snapshot took, shown in the debug strip. */
  computed_in_ms: number;
}

export function runFastLoop(
  transcript_text: string,
  words: TranscriptWord[],
  elapsed_ms: number,
): FastLoopSnapshot {
  const started_at = performance.now();

  const snapshot = {
    pronoun_attribution: analysePronounAttribution(transcript_text),
    pace: measureSpeakingPace(words, elapsed_ms),
    hedges: detectHedges(transcript_text),
    fillers: detectFillers(transcript_text),
  };

  return {
    ...snapshot,
    computed_in_ms: Number((performance.now() - started_at).toFixed(2)),
  };
}

export function buildEmptySnapshot(): FastLoopSnapshot {
  return {
    pronoun_attribution: {
      first_person_count: 0,
      collective_count: 0,
      ratio_label: "—",
      verdict: MetricVerdict.WATCH,
      mentions: [],
    },
    pace: {
      words_per_minute: 0,
      verdict: MetricVerdict.WATCH,
      is_measurable: false,
    },
    hedges: { hedge_count: 0, verdict: MetricVerdict.GOOD, matches: [] },
    fillers: {
      filler_count: 0,
      fillers_per_hundred_words: 0,
      verdict: MetricVerdict.GOOD,
    },
    computed_in_ms: 0,
  };
}
