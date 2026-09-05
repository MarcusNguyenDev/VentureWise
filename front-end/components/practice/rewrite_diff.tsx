import clsx from "clsx";

import type { DiffSegment } from "@/lib/api/api_contracts";

/**
 * The emotional beat of the demo: the same story with the verbs reclaimed.
 *
 * The diff is computed server side from the two texts, so what renders here is
 * exact rather than a model's description of what it changed.
 */
export function RewriteDiff({
  rewrite_diff,
  reclaimed_verb_count,
}: {
  rewrite_diff: DiffSegment[];
  reclaimed_verb_count: number;
}) {
  return (
    <div>
      <p className="mb-3 text-sm text-ink-muted">
        Same story,{" "}
        <span className="font-semibold text-good">
          {reclaimed_verb_count} verb{reclaimed_verb_count === 1 ? "" : "s"}
        </span>{" "}
        reclaimed.
      </p>

      <p className="max-w-3xl text-base leading-[1.9] text-ink">
        {rewrite_diff.map((segment, index) => (
          <span
            key={index}
            className={clsx(
              segment.operation === "REMOVED" &&
                "bg-poor-soft text-poor line-through decoration-2",
              segment.operation === "ADDED" &&
                "bg-good-soft font-semibold text-good",
            )}
          >
            {segment.text}
          </span>
        ))}
      </p>

      <div className="mt-4 flex items-center gap-4 text-[11px] text-ink-faint">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-2 rounded-sm bg-poor" />
          what you said
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-2 rounded-sm bg-good" />
          what an interviewer needs to hear
        </span>
      </div>
    </div>
  );
}
