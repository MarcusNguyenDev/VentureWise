// GENERATED FILE — DO NOT EDIT.
// Regenerate with ./scripts/sync_fast_loop.sh after changing the API original.
// Source: api/src/speech_analysis/hedge_detection.util.ts

import { MetricVerdict } from './metric_verdict.enum';
import { APOLOGY_PHRASES, HEDGE_PHRASES } from './hedge_lexicon.const';

/**
 * Finds softening phrases and reports where they sit, so the transcript can
 * strike them through as they are spoken.
 *
 * Mirrored in `front-end/lib/fast_loop/hedge_detection.util.ts`.
 */

export interface PhraseMatch {
  phrase: string;
  char_start: number;
  char_end: number;
}

export interface HedgeSummary {
  hedge_count: number;
  verdict: MetricVerdict;
  matches: PhraseMatch[];
}

/** Collapses whitespace and strips punctuation, keeping an offset map back. */
function buildSearchableText(text: string): {
  searchable: string;
  offset_map: number[];
} {
  let searchable = '';
  const offset_map: number[] = [];
  let is_previous_char_space = true;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const is_word_character = /[A-Za-z0-9']/.test(character);

    if (is_word_character) {
      searchable += character.toLowerCase();
      offset_map.push(index);
      is_previous_char_space = false;
      continue;
    }

    if (!is_previous_char_space) {
      searchable += ' ';
      offset_map.push(index);
      is_previous_char_space = true;
    }
  }

  return { searchable, offset_map };
}

function findPhrases(text: string, phrases: string[]): PhraseMatch[] {
  const { searchable, offset_map } = buildSearchableText(text);
  const matches: PhraseMatch[] = [];

  for (const phrase of phrases) {
    // Padding both sides forces a whole-word match without a per-phrase regex.
    const padded_searchable = ` ${searchable} `;
    const padded_phrase = ` ${phrase} `;

    let search_from = 0;
    for (;;) {
      const found_at = padded_searchable.indexOf(padded_phrase, search_from);
      if (found_at === -1) break;

      const start_in_searchable = found_at;
      const end_in_searchable = found_at + phrase.length - 1;

      matches.push({
        phrase,
        char_start: offset_map[start_in_searchable] ?? 0,
        char_end: (offset_map[end_in_searchable] ?? 0) + 1,
      });

      search_from = found_at + 1;
    }
  }

  // Longer phrases win, so "i was kind of responsible for" is not also
  // reported as the shorter "kind of" sitting inside it.
  return dropOverlappingMatches(matches);
}

function dropOverlappingMatches(matches: PhraseMatch[]): PhraseMatch[] {
  const by_length_then_position = [...matches].sort(
    (left, right) =>
      right.phrase.length - left.phrase.length ||
      left.char_start - right.char_start,
  );

  const kept: PhraseMatch[] = [];

  for (const candidate of by_length_then_position) {
    const overlaps_a_kept_match = kept.some(
      (existing) =>
        candidate.char_start < existing.char_end &&
        candidate.char_end > existing.char_start,
    );

    if (!overlaps_a_kept_match) kept.push(candidate);
  }

  return kept.sort((left, right) => left.char_start - right.char_start);
}

function classifyHedgeCount(hedge_count: number): MetricVerdict {
  if (hedge_count === 0) return MetricVerdict.GOOD;
  if (hedge_count === 1) return MetricVerdict.WATCH;
  return MetricVerdict.POOR;
}

export function detectHedges(transcript_text: string): HedgeSummary {
  const matches = findPhrases(transcript_text, HEDGE_PHRASES);

  return {
    hedge_count: matches.length,
    verdict: classifyHedgeCount(matches.length),
    matches,
  };
}

/** Used by the sponsorship drill, where apology reads as a concession. */
export function detectApologyLanguage(transcript_text: string): PhraseMatch[] {
  return findPhrases(transcript_text, APOLOGY_PHRASES);
}
