import {
  CARRYOVER_PATTERN_LABEL,
  type CarryoverPattern,
  type EnglishVariantSignals,
} from "@/lib/api/api_contracts";

/**
 * First-language carry-over patterns, shown as coaching.
 *
 * The tone here matters more than usual. This panel is one careless sentence
 * away from being a list of ways somebody's English is wrong, which is the
 * opposite of what this product is for. So it quotes only the candidate's own
 * words, explains what the listener does with them, and says plainly that none
 * of it is scored.
 */
export function EnglishVariantPanel({
  english_variant,
}: {
  english_variant: EnglishVariantSignals;
}) {
  const { detections, pattern_family_note } = english_variant;

  // Grouped so a pattern that occurred six times reads as one habit worth
  // fixing rather than six separate accusations.
  const grouped = detections.reduce<
    Partial<Record<CarryoverPattern, typeof detections>>
  >((accumulator, detection) => {
    accumulator[detection.pattern] = [
      ...(accumulator[detection.pattern] ?? []),
      detection,
    ];
    return accumulator;
  }, {});

  const groups = Object.entries(grouped) as [
    CarryoverPattern,
    typeof detections,
  ][];

  if (groups.length === 0) {
    return (
      <p className="text-sm leading-relaxed text-ink-muted">
        Nothing flagged. Worth knowing that speech recognition quietly tidies
        grammar as it transcribes — it adds back articles and endings you may
        not have said — so this finding a lot is meaningful and this finding
        nothing is only weak evidence.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <ul className="space-y-4">
        {groups.map(([pattern, items]) => (
          <li key={pattern}>
            <div className="flex items-baseline gap-2">
              <p className="text-xs font-semibold text-ink">
                {CARRYOVER_PATTERN_LABEL[pattern]}
              </p>
              <span className="tabular font-mono text-[10px] text-ink-faint">
                {items.length}×
              </span>
            </div>

            <ul className="mt-1.5 space-y-1.5">
              {items.slice(0, 3).map((detection, index) => (
                <li key={index} className="text-xs leading-relaxed">
                  <span className="rounded bg-surface-sunken px-1.5 py-0.5 font-mono text-[11px] text-ink">
                    &ldquo;{detection.matched_text}&rdquo;
                  </span>
                  <span className="mt-1 block text-ink-muted">
                    {detection.suggestion}
                  </span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      {pattern_family_note ? (
        <p className="rounded-lg border border-line bg-surface-sunken px-3 py-2.5 text-[11px] leading-relaxed text-ink-muted">
          {pattern_family_note}
        </p>
      ) : null}

      <p className="text-[11px] leading-relaxed text-ink-faint">
        None of this is scored — the delivery score refuses to grade
        second-language grammar and still does. It is here because these are
        cheap to fix and they stop a listener re-parsing your sentence, not
        because they are mistakes worth apologising for.
      </p>
    </div>
  );
}
