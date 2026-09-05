/**
 * Word-level diff between the spoken answer and its first-person rewrite.
 *
 * Computed here rather than asked of the model: a diff is deterministic, and a
 * model asked to emit diff markup gets it subtly wrong in ways that are hard to
 * spot on stage.
 */

export enum DiffOperation {
  EQUAL = 'EQUAL',
  REMOVED = 'REMOVED',
  ADDED = 'ADDED',
}

export interface DiffSegment {
  operation: DiffOperation;
  text: string;
}

/** Keeps whitespace attached to its word so the diff can be re-joined exactly. */
function splitIntoWords(text: string): string[] {
  return text.match(/\S+\s*/g) ?? [];
}

function normaliseForComparison(word: string): string {
  return word
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:]+$/, '');
}

/**
 * Standard longest-common-subsequence diff. Answers run to a few hundred words,
 * so the quadratic table is comfortably cheap.
 */
export function diffAnswerRewrite(
  original_text: string,
  rewritten_text: string,
): DiffSegment[] {
  const original_words = splitIntoWords(original_text);
  const rewritten_words = splitIntoWords(rewritten_text);

  const row_count = original_words.length;
  const column_count = rewritten_words.length;

  const lcs_lengths: number[][] = Array.from({ length: row_count + 1 }, () =>
    new Array<number>(column_count + 1).fill(0),
  );

  for (let row = row_count - 1; row >= 0; row -= 1) {
    for (let column = column_count - 1; column >= 0; column -= 1) {
      const is_same_word =
        normaliseForComparison(original_words[row]) ===
        normaliseForComparison(rewritten_words[column]);

      lcs_lengths[row][column] = is_same_word
        ? lcs_lengths[row + 1][column + 1] + 1
        : Math.max(lcs_lengths[row + 1][column], lcs_lengths[row][column + 1]);
    }
  }

  const segments: DiffSegment[] = [];
  let row = 0;
  let column = 0;

  const pushSegment = (operation: DiffOperation, text: string): void => {
    const previous_segment = segments[segments.length - 1];

    if (previous_segment && previous_segment.operation === operation) {
      previous_segment.text += text;
      return;
    }

    segments.push({ operation, text });
  };

  while (row < row_count && column < column_count) {
    const is_same_word =
      normaliseForComparison(original_words[row]) ===
      normaliseForComparison(rewritten_words[column]);

    if (is_same_word) {
      pushSegment(DiffOperation.EQUAL, original_words[row]);
      row += 1;
      column += 1;
      continue;
    }

    if (lcs_lengths[row + 1][column] >= lcs_lengths[row][column + 1]) {
      pushSegment(DiffOperation.REMOVED, original_words[row]);
      row += 1;
      continue;
    }

    pushSegment(DiffOperation.ADDED, rewritten_words[column]);
    column += 1;
  }

  while (row < row_count) {
    pushSegment(DiffOperation.REMOVED, original_words[row]);
    row += 1;
  }

  while (column < column_count) {
    pushSegment(DiffOperation.ADDED, rewritten_words[column]);
    column += 1;
  }

  return segments;
}

/** How many verbs the rewrite reclaimed — the number quoted in the demo. */
export function countReclaimedVerbs(segments: DiffSegment[]): number {
  return segments.filter(
    (segment) =>
      segment.operation === DiffOperation.ADDED &&
      /\b(I|my|me|mine|myself)\b/i.test(segment.text),
  ).length;
}
