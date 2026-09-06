import clsx from "clsx";

import type { DeliveryScoreResult } from "@/lib/api/api_contracts";
import { VERDICT_LABEL, VERDICT_TEXT_CLASS } from "@/components/ui/verdict";

/**
 * F-05. The list of things deliberately not scored is rendered as prominently
 * as the score itself — that is the position, not a footnote.
 */
export function DeliveryPanel({ delivery }: { delivery: DeliveryScoreResult }) {
  const scored_rows = [
    {
      label: "Pace",
      value: `${delivery.pace.words_per_minute} wpm`,
      verdict: delivery.pace.verdict,
      is_measurable: delivery.pace.is_measurable,
    },
    {
      label: "Pause placement",
      value: `${delivery.pause_placement.word_retrieval_count} retrieval pauses`,
      verdict: delivery.pause_placement.verdict,
      is_measurable: delivery.pause_placement.is_measurable,
    },
    {
      label: "Filler density",
      value: `${delivery.fillers.fillers_per_hundred_words} per 100 words`,
      verdict: delivery.fillers.verdict,
      is_measurable: true,
    },
    {
      label: "Sentences that land",
      value: `${Math.round(delivery.sentence_resolution.resolution_rate * 100)}%`,
      verdict: delivery.sentence_resolution.verdict,
      is_measurable: true,
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_280px]">
      <div>
        {delivery.is_scorable ? (
          <div className="mb-4 flex items-baseline gap-3">
            <span className="tabular font-mono text-3xl font-semibold text-ink">
              {delivery.overall_score}
            </span>
            <span className="text-xs text-ink-muted">out of 100</span>
          </div>
        ) : (
          <div className="mb-4 rounded-lg border border-line bg-surface-sunken px-3 py-2.5">
            <p className="text-sm font-semibold text-ink">No score</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">
              {delivery.not_scorable_reason}
            </p>
          </div>
        )}

        <dl
          className={clsx(
            "divide-y divide-line border-y border-line",
            !delivery.is_scorable && "opacity-40",
          )}
        >
          {scored_rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-4 py-2.5"
            >
              <dt className="text-sm text-ink">{row.label}</dt>
              <dd className="flex items-center gap-3">
                <span
                  className={clsx(
                    "tabular font-mono text-xs",
                    row.is_measurable ? "text-ink-muted" : "text-ink-faint",
                  )}
                >
                  {row.is_measurable ? row.value : "no word timings"}
                </span>
                <span
                  className={clsx(
                    "w-10 text-right text-[10px] font-semibold uppercase tracking-wide",
                    row.is_measurable
                      ? VERDICT_TEXT_CLASS[row.verdict]
                      : "text-ink-faint",
                  )}
                >
                  {row.is_measurable ? VERDICT_LABEL[row.verdict] : "—"}
                </span>
              </dd>
            </div>
          ))}
        </dl>

        {delivery.coaching_notes.length > 0 ? (
          <ul className="mt-5 space-y-3">
            {delivery.coaching_notes.map((note, index) => (
              <li key={index} className="border-l-2 border-line-strong pl-3">
                <p className="text-xs font-medium text-ink">{note.about}</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                  {note.suggestion}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="rounded-lg border border-line bg-surface-sunken p-4">
        <p className="text-xs font-semibold text-ink">
          What we deliberately do not score
        </p>
        <p className="mt-1.5 text-[11px] leading-relaxed text-ink-muted">
          We grade clarity, not accent. Everything below is excluded on purpose,
          not because we could not measure it — the camera reading is shown
          during practice as a mirror and never reaches this score.
        </p>
        <ul className="mt-3 space-y-1.5">
          {delivery.not_scored_by_design.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-[11px] text-ink-muted"
            >
              <span aria-hidden className="mt-px text-ink-faint">
                ✕
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
