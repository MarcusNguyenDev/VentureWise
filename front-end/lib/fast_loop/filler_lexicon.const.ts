// GENERATED FILE — DO NOT EDIT.
// Regenerate with ./scripts/sync_fast_loop.sh after changing the API original.
// Source: api/src/speech_analysis/filler_lexicon.const.ts

/**
 * Single-token fillers counted for the delivery score.
 *
 * Deliberately excludes disfluencies that are word-retrieval artefacts rather
 * than habits (F-05: we grade clarity, not accent), so a candidate is never
 * marked down for reaching for an English word.
 *
 * Mirrored in `front-end/lib/fast_loop/filler_lexicon.const.ts`.
 */
export const FILLER_WORDS: string[] = [
  'um',
  'uh',
  'erm',
  'ah',
  'like',
  'basically',
  'actually',
  'literally',
  'honestly',
  'right',
  'yeah',
  'okay',
  'so',
];

/**
 * Fillers only counted when they open a clause; "so" and "right" are ordinary
 * words mid-sentence and counting them everywhere produces a useless number.
 */
export const CLAUSE_INITIAL_ONLY_FILLERS: string[] = [
  'so',
  'right',
  'okay',
  'yeah',
  'actually',
  'basically',
];
