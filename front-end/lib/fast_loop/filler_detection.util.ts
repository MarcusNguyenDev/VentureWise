// GENERATED FILE — DO NOT EDIT.
// Regenerate with ./scripts/sync_fast_loop.sh after changing the API original.
// Source: api/src/speech_analysis/filler_detection.util.ts

import { MetricVerdict } from './metric_verdict.enum';
import {
  CLAUSE_INITIAL_ONLY_FILLERS,
  FILLER_WORDS,
} from './filler_lexicon.const';

/**
 * Filler density per hundred words.
 *
 * Density rather than a raw count, because a long answer is otherwise punished
 * for being long.
 *
 * Mirrored in `front-end/lib/fast_loop/filler_detection.util.ts`.
 */

export interface FillerSummary {
  filler_count: number;
  fillers_per_hundred_words: number;
  verdict: MetricVerdict;
}

const CLAUSE_BOUNDARY_PUNCTUATION = /[.!?,;:]$/;

function classifyFillerDensity(fillers_per_hundred_words: number): MetricVerdict {
  if (fillers_per_hundred_words <= 3) return MetricVerdict.GOOD;
  if (fillers_per_hundred_words <= 6) return MetricVerdict.WATCH;
  return MetricVerdict.POOR;
}

export function detectFillers(transcript_text: string): FillerSummary {
  const raw_words = transcript_text.match(/\S+/g) ?? [];

  if (raw_words.length === 0) {
    return {
      filler_count: 0,
      fillers_per_hundred_words: 0,
      verdict: MetricVerdict.GOOD,
    };
  }

  let filler_count = 0;

  raw_words.forEach((raw_word, index) => {
    const word = raw_word.toLowerCase().replace(/[^a-z']/g, '');
    if (!FILLER_WORDS.includes(word)) return;

    if (CLAUSE_INITIAL_ONLY_FILLERS.includes(word)) {
      const previous_word = raw_words[index - 1];
      const is_clause_initial =
        index === 0 || CLAUSE_BOUNDARY_PUNCTUATION.test(previous_word);

      if (!is_clause_initial) return;
    }

    filler_count += 1;
  });

  const fillers_per_hundred_words = Number(
    ((filler_count / raw_words.length) * 100).toFixed(1),
  );

  return {
    filler_count,
    fillers_per_hundred_words,
    verdict: classifyFillerDensity(fillers_per_hundred_words),
  };
}
