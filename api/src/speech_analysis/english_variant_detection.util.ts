/**
 * Detects first-language carry-over patterns in spoken English.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT THIS IS, AND WHAT IT REFUSES TO BE
 *
 * It detects PATTERNS IN THE TEXT. It does not classify the speaker.
 *
 * "Which nationality is this person" is a different question, and one this
 * product should not answer. Inferring someone's origin from how they speak is
 * precisely the inference this whole application exists to argue against, and
 * in anything adjacent to hiring it is legally fraught in Australia. So the
 * output is always "here is a sentence you said, and here is how it will land",
 * never "you are probably from X".
 *
 * Where a language family is mentioned it is as CONTEXT for why the pattern
 * happens — and only ever as a broad grouping the candidate can recognise
 * themselves in or ignore. It is never a verdict, never displayed as a
 * confident guess, and never stored.
 *
 * NONE OF THIS IS SCORED. `NOT_SCORED_BY_DESIGN` promises that grammar typical
 * of a second-language speaker is not graded, and that promise holds: this
 * produces coaching, not marks.
 *
 * ── ACCURACY CEILING ────────────────────────────────────────────────────────
 * Speech recognisers are language-model-smoothed: they insert articles and
 * plural endings the speaker did not say, because a fluent sentence is more
 * probable than a disfluent one. The carry-overs below are therefore
 * UNDER-detected from a live microphone — absence of a pattern means very
 * little. Detections are real; non-detections are not evidence.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export enum CarryoverPattern {
  MISSING_ARTICLE = 'MISSING_ARTICLE',
  UNMARKED_PLURAL = 'UNMARKED_PLURAL',
  UNMARKED_THIRD_PERSON = 'UNMARKED_THIRD_PERSON',
  OMITTED_COPULA = 'OMITTED_COPULA',
  UNMARKED_PAST_TENSE = 'UNMARKED_PAST_TENSE',
  PREPOSITION_TRANSFER = 'PREPOSITION_TRANSFER',
}

export interface DetectedCarryover {
  pattern: CarryoverPattern;
  /** The candidate's own words, so nothing is asserted in the abstract. */
  matched_text: string;
  char_start: number;
  char_end: number;
  suggestion: string;
}

interface PatternDefinition {
  pattern: CarryoverPattern;
  expression: RegExp;
  /** Builds the fix from the match, so advice quotes what was actually said. */
  buildSuggestion: (match: RegExpExecArray) => string;
}

/** Nouns common in interview answers, used to keep the heuristics anchored. */
const COMMON_NOUNS =
  'project|team|report|dashboard|pipeline|model|client|customer|meeting|deadline|manager|system|database|problem|issue|solution|feature|process|company|internship|placement|course|assignment|result|number|test|script|server|ticket';

const COUNTABLE_NOUNS =
  'project|team|report|client|customer|meeting|user|month|year|week|day|person|model|feature|ticket|assignment|course|hour|student|member';

const PATTERN_DEFINITIONS: PatternDefinition[] = [
  {
    // "I built dashboard", "worked on pipeline" — no determiner.
    pattern: CarryoverPattern.MISSING_ARTICLE,
    expression: new RegExp(
      `\\b(built|made|created|wrote|used|designed|owned|ran|joined|led|on|in|for|with)\\s+(${COMMON_NOUNS})\\b`,
      'gi',
    ),
    buildSuggestion: (match) =>
      `"${match[1]} the ${match[2]}" or "${match[1]} a ${match[2]}". Australian English needs the article; many languages do not have one, so it is the single most common thing to drop.`,
  },
  {
    // "three project", "two year" — number without plural marking.
    pattern: CarryoverPattern.UNMARKED_PLURAL,
    expression: new RegExp(
      `\\b(two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|twenty|thirty|forty|fifty|\\d+)\\s+(${COUNTABLE_NOUNS})\\b(?!s)`,
      'gi',
    ),
    buildSuggestion: (match) =>
      `"${match[1]} ${match[2]}s". The number already tells you it is plural, so the ending feels redundant — English marks it twice anyway.`,
  },
  {
    // "the company want", "he need" — no third-person -s.
    pattern: CarryoverPattern.UNMARKED_THIRD_PERSON,
    expression: new RegExp(
      `\\b(he|she|it|the\\s+(?:${COMMON_NOUNS}))\\s+(want|need|have|do|go|make|take|work|use|run|help|come|give|say|know|think|look|seem)\\b`,
      'gi',
    ),
    buildSuggestion: (match) =>
      `"${match[1]} ${match[2]}s". Only the third person takes the ending, which is why it is easy to lose.`,
  },
  {
    // "the data very messy" — no linking verb.
    pattern: CarryoverPattern.OMITTED_COPULA,
    expression: new RegExp(
      `\\b(it|this|that|the\\s+(?:${COMMON_NOUNS}))\\s+(very|really|quite|so|too)\\s+([a-z]+)\\b`,
      'gi',
    ),
    buildSuggestion: (match) =>
      `"${match[1]} was ${match[2]} ${match[3]}" or "${match[1]} is ${match[2]} ${match[3]}". English needs the linking verb even when the meaning is obvious without it.`,
  },
  {
    // "last year I work there" — time word carrying the tense.
    pattern: CarryoverPattern.UNMARKED_PAST_TENSE,
    expression:
      /\b(yesterday|last\s+(?:year|month|week|semester)|in\s+20\d{2})\b[^.!?]{0,24}?\b(go|work|build|make|use|start|finish|join|write|run|take|have|do|help|study)\b/gi,
    buildSuggestion: (match) =>
      `"${match[1]}" already places it in the past, but English marks the verb as well — the past form of "${match[2]}". Doubling it up is the convention, not extra information.`,
  },
  {
    // "discuss about", "explain me" — preposition patterns from the L1.
    pattern: CarryoverPattern.PREPOSITION_TRANSFER,
    expression:
      /\b(discuss\s+about|explain\s+me|explain\s+about|married\s+with|reply\s+me|inform\s+me\s+about\s+that|according\s+to\s+me|in\s+abroad|cope\s+up\s+with|comprise\s+of|emphasise\s+on|emphasize\s+on)\b/gi,
    buildSuggestion: (match) => {
      const FIXES: Record<string, string> = {
        'discuss about': 'discuss it',
        'explain me': 'explain to me',
        'explain about': 'explain',
        'married with': 'married to',
        'reply me': 'reply to me',
        'according to me': 'in my view',
        'in abroad': 'abroad',
        'cope up with': 'cope with',
        'comprise of': 'comprise, or be made up of',
        'emphasise on': 'emphasise',
        'emphasize on': 'emphasise',
      };
      const key = match[1].toLowerCase().replace(/\s+/g, ' ');
      return `"${FIXES[key] ?? match[1]}". The verb takes a different preposition in Australian English.`;
    },
  },
];

/** Determiners that mean a "missing article" match is a false positive. */
const DETERMINER_BEFORE =
  /\b(a|an|the|my|our|his|her|their|its|this|that|these|those|any|some|each|every|no)\s+$/i;

export interface EnglishVariantSignals {
  detections: DetectedCarryover[];
  /**
   * Broad grouping, offered as context only, and null unless several distinct
   * patterns agree. Never a nationality, never displayed as a confident guess.
   */
  pattern_family_note: string | null;
  /** Always true for live speech. See the accuracy note at the top. */
  is_under_detected: boolean;
}

const MINIMUM_DISTINCT_PATTERNS_FOR_A_NOTE = 2;

export function detectEnglishVariantSignals(
  transcript_text: string,
): EnglishVariantSignals {
  const detections: DetectedCarryover[] = [];

  for (const definition of PATTERN_DEFINITIONS) {
    const expression = new RegExp(definition.expression.source, 'gi');

    let match: RegExpExecArray | null;
    while ((match = expression.exec(transcript_text)) !== null) {
      // "on the project" is correct English; only a bare noun counts.
      if (definition.pattern === CarryoverPattern.MISSING_ARTICLE) {
        const preceding = transcript_text.slice(
          Math.max(0, match.index - 12),
          match.index,
        );
        if (DETERMINER_BEFORE.test(preceding)) continue;
      }

      detections.push({
        pattern: definition.pattern,
        matched_text: match[0],
        char_start: match.index,
        char_end: match.index + match[0].length,
        suggestion: definition.buildSuggestion(match),
      });
    }
  }

  detections.sort((left, right) => left.char_start - right.char_start);

  return {
    detections,
    pattern_family_note: buildPatternFamilyNote(detections),
    is_under_detected: true,
  };
}

/**
 * A note about the pattern, phrased so a candidate can recognise themselves in
 * it or ignore it. Deliberately lists a spread of unrelated languages so it
 * reads as a grammatical fact rather than a guess about who they are.
 */
function buildPatternFamilyNote(
  detections: DetectedCarryover[],
): string | null {
  const distinct_patterns = new Set(
    detections.map((detection) => detection.pattern),
  );

  if (distinct_patterns.size < MINIMUM_DISTINCT_PATTERNS_FOR_A_NOTE) {
    return null;
  }

  const has_inflection_patterns =
    distinct_patterns.has(CarryoverPattern.MISSING_ARTICLE) ||
    distinct_patterns.has(CarryoverPattern.UNMARKED_PLURAL) ||
    distinct_patterns.has(CarryoverPattern.UNMARKED_THIRD_PERSON) ||
    distinct_patterns.has(CarryoverPattern.UNMARKED_PAST_TENSE);

  if (!has_inflection_patterns) return null;

  return (
    'These are the endings and small words English marks and most other languages do not. ' +
    'Vietnamese, Mandarin, Thai, Korean, Japanese and Russian all leave some of them out, so if ' +
    'you think in one of those this will feel like adding redundant information — which, honestly, ' +
    'it is. English does it anyway. Nobody will think less of you for it, but the endings are ' +
    'cheap to add and they stop a listener re-parsing the sentence.'
  );
}

export const CARRYOVER_PATTERN_LABEL: Record<CarryoverPattern, string> = {
  [CarryoverPattern.MISSING_ARTICLE]: 'Missing "a" or "the"',
  [CarryoverPattern.UNMARKED_PLURAL]: 'Plural not marked',
  [CarryoverPattern.UNMARKED_THIRD_PERSON]: 'Third-person "-s" dropped',
  [CarryoverPattern.OMITTED_COPULA]: 'Missing "is" or "was"',
  [CarryoverPattern.UNMARKED_PAST_TENSE]: 'Past tense not marked on the verb',
  [CarryoverPattern.PREPOSITION_TRANSFER]: 'Different preposition',
};
