import clsx from "clsx";

import type { PronounAttributionSummary } from "@/lib/api/api_contracts";
import { VERDICT_TEXT_CLASS } from "@/components/ui/verdict";
import { MeterBar } from "./meter_bar";

/**
 * F-01, the signature. Reads the fraction of *verb-attached* pronouns that were
 * first person, so scene-setting "we"s do not distort it.
 */
export function IWeMeter({
  attribution,
}: {
  attribution: PronounAttributionSummary;
}) {
  const total_attributed =
    attribution.first_person_count + attribution.collective_count;

  const first_person_fraction =
    total_attributed === 0 ? 0 : attribution.first_person_count / total_attributed;

  return (
    <div>
      <MeterBar
        label="I / We ratio"
        value_label={attribution.ratio_label}
        filled_fraction={first_person_fraction}
        verdict={attribution.verdict}
        is_measurable={total_attributed > 0}
      />

      <div className="mt-2.5 flex items-center gap-4 text-[11px] text-ink-faint">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-2 rounded-full bg-good" />
          <span className={clsx("tabular font-mono", VERDICT_TEXT_CLASS.GOOD)}>
            {attribution.first_person_count}
          </span>
          first-person verbs
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-2 rounded-full bg-poor" />
          <span className={clsx("tabular font-mono", VERDICT_TEXT_CLASS.POOR)}>
            {attribution.collective_count}
          </span>
          collective
        </span>
      </div>
    </div>
  );
}
