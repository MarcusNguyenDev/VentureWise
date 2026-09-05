import {
  detectApologyLanguage,
  PhraseMatch,
} from '../speech_analysis/hedge_detection.util';
import { detectHedges } from '../speech_analysis/hedge_detection.util';

/**
 * Scores the read-aloud half of F-02.
 *
 * The target is narrow on purpose: under twenty seconds, a direct answer in the
 * opening, dates present, and no apology. Those four are what separate an
 * answer that closes the topic from one that opens a conversation the candidate
 * does not want to have.
 */

export const SPONSORSHIP_TARGET_SECONDS = 20;

/** How many words in the answer count as "the opening". */
const OPENING_WORD_COUNT = 6;

export interface SponsorshipDrillScore {
  spoken_seconds: number;
  is_within_time: boolean;
  /** "Yes" or "No" landed in the opening rather than being buried. */
  is_direct_opening: boolean;
  /** A month and year appeared, so the answer is specific. */
  has_dates: boolean;
  apology_matches: PhraseMatch[];
  hedge_count: number;
  is_passing: boolean;
  coaching_notes: string[];
}

const DIRECT_OPENING_PATTERN = /^\s*(yes|no)\b/i;
const DATE_PATTERN =
  /\b(january|february|march|april|may|june|july|august|september|october|november|december)\b|\b20\d{2}\b|\b\d+\s+(months?|years?)\b/i;

export function scoreSponsorshipDrill(
  spoken_text: string,
  spoken_seconds: number,
): SponsorshipDrillScore {
  const opening_words = (spoken_text.match(/\S+/g) ?? [])
    .slice(0, OPENING_WORD_COUNT)
    .join(' ');

  const is_within_time = spoken_seconds <= SPONSORSHIP_TARGET_SECONDS;
  const is_direct_opening = DIRECT_OPENING_PATTERN.test(opening_words);
  const has_dates = DATE_PATTERN.test(spoken_text);
  const apology_matches = detectApologyLanguage(spoken_text);
  const { hedge_count } = detectHedges(spoken_text);

  const is_passing =
    is_within_time &&
    is_direct_opening &&
    has_dates &&
    apology_matches.length === 0;

  return {
    spoken_seconds,
    is_within_time,
    is_direct_opening,
    has_dates,
    apology_matches,
    hedge_count,
    is_passing,
    coaching_notes: buildCoachingNotes({
      is_within_time,
      spoken_seconds,
      is_direct_opening,
      has_dates,
      apology_matches,
      hedge_count,
    }),
  };
}

function buildCoachingNotes(input: {
  is_within_time: boolean;
  spoken_seconds: number;
  is_direct_opening: boolean;
  has_dates: boolean;
  apology_matches: PhraseMatch[];
  hedge_count: number;
}): string[] {
  const notes: string[] = [];

  if (!input.is_direct_opening) {
    notes.push(
      'Open with the word "Yes" or "No". Anything before it sounds like you are working up to bad news.',
    );
  }

  if (!input.is_within_time) {
    const overrun = input.spoken_seconds - SPONSORSHIP_TARGET_SECONDS;
    notes.push(
      `${overrun}s over. Cut the H-1B planning sentence first — it is the one they did not ask for.`,
    );
  }

  if (!input.has_dates) {
    notes.push(
      'No dates in it. The dates are what make this sound like a fact rather than a hope.',
    );
  }

  input.apology_matches.slice(0, 3).forEach((match) => {
    notes.push(
      `Drop "${match.phrase}". You are stating a fact about paperwork, not asking a favour.`,
    );
  });

  if (input.hedge_count > 0) {
    notes.push(
      `${input.hedge_count} hedge${input.hedge_count === 1 ? '' : 's'} in twenty seconds. This is the one answer to deliver flat.`,
    );
  }

  if (notes.length === 0) {
    notes.push(
      'That closes the topic. Say it exactly like that and stop talking.',
    );
  }

  return notes;
}
