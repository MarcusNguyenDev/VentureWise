// GENERATED FILE — DO NOT EDIT.
// Regenerate with ./scripts/sync_fast_loop.sh after changing the API original.
// Source: api/src/speech_analysis/pronoun_attribution.util.ts

import { MetricVerdict } from './metric_verdict.enum';

/**
 * F-01, the signature metric: who does this answer give credit to?
 *
 * A raw count of "I" against "we" is misleading, because "we were a team of
 * five" is a legitimate scene-setting use. What a US interviewer reads as
 * missing evidence is a *collective pronoun attached to an action* — "we
 * redesigned", "we decided". So every mention is classified, but only
 * verb-attached mentions move the meter.
 *
 * Mirrored in `front-end/lib/fast_loop/pronoun_attribution.util.ts`, which runs
 * the same logic in the browser with no network call. Change both together.
 */

export enum PronounAttribution {
  FIRST_PERSON = 'FIRST_PERSON',
  COLLECTIVE = 'COLLECTIVE',
}

export interface PronounMention {
  token: string;
  attribution: PronounAttribution;
  char_start: number;
  char_end: number;
  /** Only verb-attached mentions count toward the ratio. */
  is_verb_attached: boolean;
  attached_verb: string | null;
}

export interface PronounAttributionSummary {
  first_person_count: number;
  collective_count: number;
  /** Rendered form for the right rail, e.g. "1 : 6". */
  ratio_label: string;
  verdict: MetricVerdict;
  mentions: PronounMention[];
}

const FIRST_PERSON_PRONOUNS = new Set([
  'i',
  'my',
  'me',
  'mine',
  'myself',
]);

const COLLECTIVE_PRONOUNS = new Set([
  'we',
  'our',
  'us',
  'ours',
  'ourselves',
]);

/** Auxiliaries are a reliable verb signal on their own. */
const AUXILIARY_VERBS = new Set([
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'can', 'could', 'shall', 'should', 'may', 'might', 'must',
  'got', 'get', 'gets', 'getting',
]);

/** Adverbs that commonly sit between a pronoun and its verb. */
const INTERVENING_ADVERBS = new Set([
  'also', 'then', 'just', 'actually', 'really', 'basically', 'finally',
  'eventually', 'immediately', 'quickly', 'later', 'still', 'only',
  'therefore', 'obviously', 'personally', 'always', 'never', 'often',
  'usually', 'sometimes', 'already', 'all', 'both', 'kind', 'sort',
  'literally', 'honestly', 'definitely', 'probably', 'certainly',
]);

/** The verbs interview answers are actually built from. */
const COMMON_ACTION_VERBS = new Set([
  'build', 'built', 'make', 'made', 'design', 'designed', 'write', 'wrote',
  'run', 'ran', 'lead', 'led', 'own', 'owned', 'ship', 'shipped',
  'decide', 'decided', 'choose', 'chose', 'pick', 'picked',
  'fix', 'fixed', 'solve', 'solved', 'debug', 'debugged',
  'test', 'tested', 'deploy', 'deployed', 'launch', 'launched',
  'reduce', 'reduced', 'cut', 'improve', 'improved', 'increase', 'increased',
  'agree', 'agreed', 'disagree', 'disagreed', 'discuss', 'discussed',
  'argue', 'argued', 'convince', 'convinced', 'propose', 'proposed',
  'present', 'presented', 'pitch', 'pitched', 'explain', 'explained',
  'find', 'found', 'see', 'saw', 'know', 'knew', 'think', 'thought',
  'take', 'took', 'give', 'gave', 'put', 'set', 'keep', 'kept',
  'start', 'started', 'finish', 'finished', 'complete', 'completed',
  'analyse', 'analysed', 'analyze', 'analyzed', 'measure', 'measured',
  'drop', 'dropped', 'remove', 'removed', 'add', 'added', 'change', 'changed',
  'work', 'worked', 'help', 'helped', 'handle', 'handled', 'manage', 'managed',
  'meet', 'met', 'talk', 'talked', 'speak', 'spoke', 'ask', 'asked',
  'need', 'needed', 'want', 'wanted', 'try', 'tried', 'use', 'used',
  'come', 'came', 'go', 'went', 'bring', 'brought', 'call', 'called',
  'realise', 'realised', 'realize', 'realized', 'notice', 'noticed',
  'suggest', 'suggested', 'recommend', 'recommended', 'decide', 'decided',
]);

interface Token {
  text: string;
  lower: string;
  char_start: number;
  char_end: number;
}

/** Splits on word characters and apostrophes, keeping character offsets. */
function tokeniseWithOffsets(text: string): Token[] {
  const tokens: Token[] = [];
  const word_pattern = /[A-Za-zÀ-ɏ']+/g;

  let match: RegExpExecArray | null;
  while ((match = word_pattern.exec(text)) !== null) {
    tokens.push({
      text: match[0],
      lower: match[0].toLowerCase(),
      char_start: match.index,
      char_end: match.index + match[0].length,
    });
  }

  return tokens;
}

function looksLikeVerb(token_lower: string): boolean {
  if (AUXILIARY_VERBS.has(token_lower)) return true;
  if (COMMON_ACTION_VERBS.has(token_lower)) return true;

  // Morphology is a weak signal on its own, so it only applies to longer words
  // where "-ed" and "-ing" are unlikely to be a noun ending.
  if (token_lower.length > 4 && token_lower.endsWith('ed')) return true;
  if (token_lower.length > 5 && token_lower.endsWith('ing')) return true;

  return false;
}

/**
 * Looks forward from a pronoun for the verb it governs, stepping over adverbs.
 */
function findAttachedVerb(tokens: Token[], pronoun_index: number): string | null {
  const MAX_LOOKAHEAD = 3;

  for (let offset = 1; offset <= MAX_LOOKAHEAD; offset += 1) {
    const candidate = tokens[pronoun_index + offset];
    if (!candidate) return null;

    if (INTERVENING_ADVERBS.has(candidate.lower)) continue;
    if (looksLikeVerb(candidate.lower)) return candidate.text;

    // A non-adverb, non-verb token means the pronoun is possessive or an
    // object ("our pipeline", "told us"), not an actor.
    return null;
  }

  return null;
}

function classifyRatio(
  first_person_count: number,
  collective_count: number,
): MetricVerdict {
  // Nothing attributed yet is not a failure, it is an empty meter.
  if (first_person_count === 0 && collective_count === 0) {
    return MetricVerdict.WATCH;
  }
  if (first_person_count === 0) return MetricVerdict.POOR;

  const ratio = first_person_count / Math.max(collective_count, 1);
  if (ratio >= 1.5) return MetricVerdict.GOOD;
  if (ratio >= 0.75) return MetricVerdict.WATCH;
  return MetricVerdict.POOR;
}

/** Renders "1 : 6" style labels, reduced by the greatest common divisor. */
function formatRatioLabel(
  first_person_count: number,
  collective_count: number,
): string {
  if (first_person_count === 0 && collective_count === 0) return '—';

  const greatestCommonDivisor = (a: number, b: number): number =>
    b === 0 ? a : greatestCommonDivisor(b, a % b);

  const divisor = Math.max(
    greatestCommonDivisor(first_person_count, collective_count),
    1,
  );

  return `${first_person_count / divisor} : ${collective_count / divisor}`;
}

export function analysePronounAttribution(
  transcript_text: string,
): PronounAttributionSummary {
  const tokens = tokeniseWithOffsets(transcript_text);
  const mentions: PronounMention[] = [];

  let first_person_count = 0;
  let collective_count = 0;

  tokens.forEach((token, index) => {
    const is_first_person = FIRST_PERSON_PRONOUNS.has(token.lower);
    const is_collective = COLLECTIVE_PRONOUNS.has(token.lower);
    if (!is_first_person && !is_collective) return;

    const attached_verb = findAttachedVerb(tokens, index);
    const is_verb_attached = attached_verb !== null;

    if (is_verb_attached && is_first_person) first_person_count += 1;
    if (is_verb_attached && is_collective) collective_count += 1;

    mentions.push({
      token: token.text,
      attribution: is_first_person
        ? PronounAttribution.FIRST_PERSON
        : PronounAttribution.COLLECTIVE,
      char_start: token.char_start,
      char_end: token.char_end,
      is_verb_attached,
      attached_verb,
    });
  });

  return {
    first_person_count,
    collective_count,
    ratio_label: formatRatioLabel(first_person_count, collective_count),
    verdict: classifyRatio(first_person_count, collective_count),
    mentions,
  };
}
