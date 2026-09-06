"use client";

/**
 * One nudge on screen at a time, minimum four seconds of dwell.
 *
 * The dwell rule is enforced twice — in the practice hook and again server side
 * — because Part 5 of the spec is blunt that competing nudges are what make
 * this feel broken.
 */
export function NudgeSlot({ nudge_text }: { nudge_text: string | null }) {
  return (
    <div className="min-h-[92px]" aria-live="polite">
      {nudge_text ? (
        <div
          key={nudge_text}
          className="nudge-enter rounded-lg border border-accent/40 bg-accent-soft p-4"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-accent-strong">
            Nudge
          </p>
          <p className="mt-1.5 text-sm font-medium leading-snug text-ink">
            {nudge_text}
          </p>
        </div>
      ) : (
        <div className="flex h-full min-h-[92px] items-center justify-center rounded-lg border border-dashed border-line">
          <p className="text-xs text-ink-faint">No nudge — keep going</p>
        </div>
      )}
    </div>
  );
}
