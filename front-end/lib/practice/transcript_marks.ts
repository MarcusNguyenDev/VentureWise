import type { FastLoopSnapshot } from "../fast_loop/fast_loop_analyser";

/**
 * Turns the fast-loop snapshot into non-overlapping spans the transcript pane
 * can render directly.
 *
 * Every "we" lights up as it is spoken and every hedge is struck through — that
 * is the thing the spec says is impossible to un-see in a demo, so it has to be
 * exact rather than approximate.
 */

export type TranscriptMarkKind =
  | "PLAIN"
  | "COLLECTIVE"
  | "FIRST_PERSON"
  | "HEDGE";

export interface TranscriptMark {
  kind: TranscriptMarkKind;
  text: string;
  /** The verb a pronoun is attached to, shown on hover. */
  attached_verb?: string | null;
}

interface MarkRange {
  kind: Exclude<TranscriptMarkKind, "PLAIN">;
  char_start: number;
  char_end: number;
  attached_verb?: string | null;
}

export function buildTranscriptMarks(
  transcript_text: string,
  snapshot: FastLoopSnapshot,
): TranscriptMark[] {
  const ranges: MarkRange[] = [];

  // Hedges are added first so they win any overlap with a pronoun inside them —
  // "I was kind of responsible for" should read as one struck-through phrase,
  // not a green "I" sitting inside it.
  for (const match of snapshot.hedges.matches) {
    ranges.push({
      kind: "HEDGE",
      char_start: match.char_start,
      char_end: match.char_end,
    });
  }

  for (const mention of snapshot.pronoun_attribution.mentions) {
    // A pronoun that is not driving a verb is not attributing credit, so it is
    // left unmarked rather than adding noise to the meter's story.
    if (!mention.is_verb_attached) continue;

    ranges.push({
      kind:
        mention.attribution === "COLLECTIVE" ? "COLLECTIVE" : "FIRST_PERSON",
      char_start: mention.char_start,
      char_end: mention.char_end,
      attached_verb: mention.attached_verb,
    });
  }

  const kept_ranges = dropOverlaps(ranges);

  const marks: TranscriptMark[] = [];
  let cursor = 0;

  for (const range of kept_ranges) {
    if (range.char_start > cursor) {
      marks.push({
        kind: "PLAIN",
        text: transcript_text.slice(cursor, range.char_start),
      });
    }

    marks.push({
      kind: range.kind,
      text: transcript_text.slice(range.char_start, range.char_end),
      attached_verb: range.attached_verb,
    });

    cursor = range.char_end;
  }

  if (cursor < transcript_text.length) {
    marks.push({ kind: "PLAIN", text: transcript_text.slice(cursor) });
  }

  return marks;
}

/** Earlier ranges win, which is why hedges are pushed first. */
function dropOverlaps(ranges: MarkRange[]): MarkRange[] {
  const kept: MarkRange[] = [];

  for (const candidate of ranges) {
    const overlaps = kept.some(
      (existing) =>
        candidate.char_start < existing.char_end &&
        candidate.char_end > existing.char_start,
    );

    if (!overlaps) kept.push(candidate);
  }

  return kept.sort((left, right) => left.char_start - right.char_start);
}
