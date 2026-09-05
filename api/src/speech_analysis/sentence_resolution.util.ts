import { MetricVerdict } from '../shared/types/metric_verdict.enum';

/**
 * Do the candidate's sentences land, or do they trail into the next thought?
 *
 * An answer made of sentences that never resolve is the single most common
 * reason an interviewer stops following, and unlike accent it is entirely
 * within the candidate's control — which is why F-05 scores it.
 */

export interface SentenceResolutionSummary {
  sentence_count: number;
  unresolved_count: number;
  resolution_rate: number;
  verdict: MetricVerdict;
  /** The trailing fragments themselves, for the coaching panel. */
  unresolved_fragments: string[];
}

/** A sentence ending on one of these has not landed. */
const DANGLING_TAIL_WORDS = new Set([
  'and',
  'but',
  'so',
  'because',
  'which',
  'that',
  'or',
  'then',
  'the',
  'a',
  'an',
  'to',
  'of',
  'in',
  'on',
  'at',
  'for',
  'with',
  'like',
  'about',
  'from',
  'as',
  'if',
  'when',
  'while',
  'since',
  'um',
  'uh',
  'yeah',
  'right',
]);

function splitIntoSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);
}

function isUnresolved(sentence: string): boolean {
  const words = sentence.match(/[A-Za-z']+/g) ?? [];
  if (words.length === 0) return false;

  // Too short to be a claim at all — a stranded fragment.
  if (words.length < 3) return true;

  const last_word = words[words.length - 1].toLowerCase();
  return DANGLING_TAIL_WORDS.has(last_word);
}

function classifyResolutionRate(resolution_rate: number): MetricVerdict {
  if (resolution_rate >= 0.85) return MetricVerdict.GOOD;
  if (resolution_rate >= 0.65) return MetricVerdict.WATCH;
  return MetricVerdict.POOR;
}

export function measureSentenceResolution(
  transcript_text: string,
): SentenceResolutionSummary {
  const sentences = splitIntoSentences(transcript_text);

  if (sentences.length === 0) {
    return {
      sentence_count: 0,
      unresolved_count: 0,
      resolution_rate: 1,
      verdict: MetricVerdict.GOOD,
      unresolved_fragments: [],
    };
  }

  const unresolved_fragments = sentences.filter(isUnresolved);
  const resolution_rate = Number(
    (1 - unresolved_fragments.length / sentences.length).toFixed(2),
  );

  return {
    sentence_count: sentences.length,
    unresolved_count: unresolved_fragments.length,
    resolution_rate,
    verdict: classifyResolutionRate(resolution_rate),
    unresolved_fragments,
  };
}
