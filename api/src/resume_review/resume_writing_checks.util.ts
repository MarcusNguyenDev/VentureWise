/**
 * CV writing quality that is measurable without judgement.
 *
 * These are not culture-specific — a domestic candidate writes "Responsible
 * for" just as often. They are here because they are cheap to detect exactly,
 * which leaves the model free to spend its attention on the parts that need
 * actual judgement.
 */

/** Openers that describe a job description rather than what the person did. */
const DUTY_OPENERS: string[] = [
  'responsible for',
  'duties included',
  'tasks included',
  'in charge of',
  'involved in',
  'helped with',
  'assisted with',
  'worked on',
  'participated in',
  'took part in',
  'was part of',
  'exposure to',
  'familiar with',
  'knowledge of',
];

/** Claims about yourself that carry no evidence. */
const UNEVIDENCED_CLAIMS: string[] = [
  'team player',
  'hard working',
  'hard-working',
  'detail oriented',
  'detail-oriented',
  'self motivated',
  'self-motivated',
  'go-getter',
  'think outside the box',
  'passionate about',
  'excellent communication skills',
  'strong work ethic',
  'fast learner',
  'quick learner',
  'results driven',
  'results-driven',
  'dynamic professional',
  'proven track record',
  'good communication skill',
];

/** A CV is written in implied first person; the pronouns are redundant. */
const FIRST_PERSON_PATTERN = /(^|[.;:\n]\s*)(I|My|Me)\b/g;

/** Numbers with a unit are what make a bullet land. */
const QUANTIFIED_PATTERN =
  /\b\d+(\.\d+)?\s?(%|percent|x|k\b|m\b|hours?|days?|weeks?|months?|years?|users?|customers?|clients?|people|students?|ms\b|seconds?|minutes?|records?|rows?|tickets?|\$|aud)/i;

export interface PhraseFinding {
  phrase: string;
  occurrences: number;
  /** One real example from the CV, so the advice is never abstract. */
  example: string;
}

export interface ResumeWritingReport {
  duty_openers: PhraseFinding[];
  unevidenced_claims: PhraseFinding[];
  first_person_count: number;
  bullet_count: number;
  quantified_bullet_count: number;
  /** 0-1. The share of bullets carrying a number with a unit. */
  quantified_ratio: number;
  word_count: number;
  /** Rough page estimate, for the Australian length convention. */
  estimated_pages: number;
}

/** Australian CVs run longer than US ones; ~450 words a page is typical. */
const WORDS_PER_PAGE = 450;

function findPhrases(text: string, phrases: string[]): PhraseFinding[] {
  const lower_text = text.toLowerCase();
  const findings: PhraseFinding[] = [];

  for (const phrase of phrases) {
    let occurrences = 0;
    let first_index = -1;
    let search_from = 0;

    for (;;) {
      const found_at = lower_text.indexOf(phrase, search_from);
      if (found_at === -1) break;

      if (first_index === -1) first_index = found_at;
      occurrences += 1;
      search_from = found_at + phrase.length;
    }

    if (occurrences === 0) continue;

    // The surrounding line, so the candidate sees where it actually is.
    const line_start = text.lastIndexOf('\n', first_index) + 1;
    const line_end = text.indexOf('\n', first_index);

    findings.push({
      phrase,
      occurrences,
      example: text
        .slice(line_start, line_end === -1 ? undefined : line_end)
        .trim()
        .slice(0, 120),
    });
  }

  return findings.sort((left, right) => right.occurrences - left.occurrences);
}

/**
 * Lines that read as achievement bullets.
 *
 * PDF extraction usually loses the bullet glyph, so this cannot look for one.
 * A content line is instead anything long enough to be a claim and short
 * enough not to be a paragraph, which is what a CV bullet is.
 */
function extractBulletLines(resume_text: string): string[] {
  const MINIMUM_BULLET_WORDS = 5;
  const MAXIMUM_BULLET_WORDS = 60;

  return resume_text
    .split('\n')
    .map((line) => line.replace(/^[\s•·▪◦\-*–—]+/, '').trim())
    .filter((line) => {
      const word_count = (line.match(/\S+/g) ?? []).length;
      if (word_count < MINIMUM_BULLET_WORDS) return false;
      if (word_count > MAXIMUM_BULLET_WORDS) return false;

      // Section headings are short, capitalised and have no verb.
      if (/^[A-Z\s&]+$/.test(line)) return false;

      return true;
    });
}

export function buildResumeWritingReport(
  resume_text: string,
): ResumeWritingReport {
  const bullets = extractBulletLines(resume_text);
  const quantified = bullets.filter((line) => QUANTIFIED_PATTERN.test(line));
  const word_count = (resume_text.match(/\S+/g) ?? []).length;

  return {
    duty_openers: findPhrases(resume_text, DUTY_OPENERS),
    unevidenced_claims: findPhrases(resume_text, UNEVIDENCED_CLAIMS),
    first_person_count: (resume_text.match(FIRST_PERSON_PATTERN) ?? []).length,
    bullet_count: bullets.length,
    quantified_bullet_count: quantified.length,
    quantified_ratio:
      bullets.length === 0
        ? 0
        : Number((quantified.length / bullets.length).toFixed(2)),
    word_count,
    estimated_pages: Math.max(1, Math.round(word_count / WORDS_PER_PAGE)),
  };
}
