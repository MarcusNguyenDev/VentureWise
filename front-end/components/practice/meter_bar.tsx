import clsx from "clsx";

import type { MetricVerdict } from "@/lib/api/api_contracts";
import { VERDICT_BAR_CLASS, VERDICT_TEXT_CLASS } from "@/components/ui/verdict";

/** The blocky bar from the spec's right-rail mock, drawn with real elements. */
const SEGMENT_COUNT = 14;

export function MeterBar({
  label,
  value_label,
  filled_fraction,
  verdict,
  is_measurable = true,
  hint,
}: {
  label: string;
  value_label: string;
  /** 0 to 1. */
  filled_fraction: number;
  verdict: MetricVerdict;
  is_measurable?: boolean;
  hint?: string;
}) {
  const filled_segments = is_measurable
    ? Math.round(Math.min(Math.max(filled_fraction, 0), 1) * SEGMENT_COUNT)
    : 0;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs font-medium text-ink-muted">{label}</span>
        <span
          className={clsx(
            "tabular font-mono text-xs font-semibold",
            is_measurable ? VERDICT_TEXT_CLASS[verdict] : "text-ink-faint",
          )}
        >
          {is_measurable ? value_label : "—"}
        </span>
      </div>

      <div
        className="mt-2 flex gap-[3px]"
        role="meter"
        aria-label={label}
        aria-valuenow={filled_segments}
        aria-valuemin={0}
        aria-valuemax={SEGMENT_COUNT}
      >
        {Array.from({ length: SEGMENT_COUNT }, (_unused, index) => (
          <span
            key={index}
            className={clsx(
              "h-2 flex-1 rounded-[1px] transition-colors duration-200",
              index < filled_segments
                ? VERDICT_BAR_CLASS[verdict]
                : "bg-line",
            )}
          />
        ))}
      </div>

      {hint ? (
        <p className="mt-1.5 text-[11px] leading-snug text-ink-faint">{hint}</p>
      ) : null}
    </div>
  );
}
