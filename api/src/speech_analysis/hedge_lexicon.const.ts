/**
 * Phrases that soften a claim until it stops reading as evidence.
 *
 * Kept as ordered word sequences rather than a regex so the matcher can report
 * the exact token span it hit, which is what the transcript highlighter needs.
 *
 * The browser fast loop holds a mirror of this list at
 * `front-end/lib/fast_loop/hedge_lexicon.const.ts`. Change both together.
 */
export const HEDGE_PHRASES: string[] = [
  'i was kind of responsible for',
  'maybe i could say that',
  'i think maybe',
  'i guess',
  'sort of',
  'kind of',
  'a little bit',
  'i was just',
  'just a small',
  'i might have',
  'i sort of',
  'probably',
  'i suppose',
  'if that makes sense',
  'i am not sure but',
  "i'm not sure but",
  'it was nothing special',
  'i only',
  'we just',
  'somewhat',
  'more or less',
  'i would say maybe',
];

/**
 * Apology language specific to the sponsorship answer, where softening reads as
 * a concession rather than politeness.
 */
export const APOLOGY_PHRASES: string[] = [
  'sorry',
  'unfortunately',
  'i know it is a hassle',
  "i know it's a hassle",
  'i hope that is okay',
  "i hope that's okay",
  'if that is a problem',
  "if that's a problem",
  'i understand if',
  'i realise this is',
  'i realize this is',
  'i apologise',
  'i apologize',
  'i am afraid',
  "i'm afraid",
  'a burden',
  'extra work for you',
  'i hate to ask',
];
