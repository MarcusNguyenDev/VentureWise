import { TranscriptWord } from './transcript_word.type';

/**
 * Splits silences into the kind that helps and the kind that costs you.
 *
 * F-05's whole position rests on this distinction: a pause taken to land a
 * point is good delivery, and a pause taken to retrieve an English word is a
 * fluency artefact that no rubric should score as low competence. We coach the
 * second one with a bridging phrase instead of marking it down.
 */

export enum PauseKind {
  /** Between clauses or sentences — deliberate, keep it. */
  STRUCTURAL = 'STRUCTURAL',
  /** Mid-clause — the candidate is reaching for a word. */
  WORD_RETRIEVAL = 'WORD_RETRIEVAL',
}

export interface ClassifiedPause {
  kind: PauseKind;
  start_ms: number;
  duration_ms: number;
  /** The word the candidate stalled before, for the coaching line. */
  word_after: string | null;
}

/** Below this a gap is ordinary articulation, not a pause. */
const PAUSE_THRESHOLD_MS = 600;

/** A retrieval pause only becomes worth coaching once it is this long. */
export const COACHABLE_RETRIEVAL_PAUSE_MS = 900;

const CLAUSE_ENDING_PUNCTUATION = /[.!?,;:]$/;

/** A pause after one of these is mid-thought, however long it is. */
const MID_CLAUSE_TRAILING_WORDS = new Set([
  'and', 'but', 'so', 'because', 'which', 'that', 'the', 'a', 'an',
  'to', 'of', 'in', 'on', 'at', 'for', 'with', 'my', 'our', 'their',
  'was', 'were', 'is', 'are', 'we', 'i', 'it', 'they',
]);

export function classifyPauses(words: TranscriptWord[]): ClassifiedPause[] {
  const has_reliable_timings = words.every((word) => word.has_reliable_timing);
  if (!has_reliable_timings || words.length < 2) return [];

  const pauses: ClassifiedPause[] = [];

  for (let index = 1; index < words.length; index += 1) {
    const previous_word = words[index - 1];
    const current_word = words[index];
    const gap_ms = current_word.start_ms - previous_word.end_ms;

    if (gap_ms < PAUSE_THRESHOLD_MS) continue;

    const previous_text = previous_word.text.trim();
    const ends_a_clause = CLAUSE_ENDING_PUNCTUATION.test(previous_text);
    const trails_mid_clause = MID_CLAUSE_TRAILING_WORDS.has(
      previous_text.toLowerCase().replace(/[^a-z']/g, ''),
    );

    const kind =
      ends_a_clause && !trails_mid_clause
        ? PauseKind.STRUCTURAL
        : PauseKind.WORD_RETRIEVAL;

    pauses.push({
      kind,
      start_ms: previous_word.end_ms,
      duration_ms: gap_ms,
      word_after: current_word.text,
    });
  }

  return pauses;
}

/**
 * The bridging phrases we hand a candidate instead of a lower score. Rotated by
 * index so a session does not repeat the same line.
 */
export const BRIDGE_PHRASES: string[] = [
  'the way I approached it was —',
  'what I did there was —',
  'the part I owned was —',
  'where I landed was —',
  'the decision I made was —',
];

export function suggestBridgePhrase(occurrence_index: number): string {
  return BRIDGE_PHRASES[occurrence_index % BRIDGE_PHRASES.length];
}
