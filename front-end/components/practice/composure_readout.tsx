import clsx from "clsx";

import {
  COMPOSURE_BAND_LABEL,
  COMPOSURE_BAND_ORDER,
  ComposureBand,
  type ComposureEstimate,
} from "@/lib/vision/composure_estimate.util";
import {
  BLENDSHAPE_LABEL,
  type ExpressionActivitySummary,
} from "@/lib/vision/micro_expression.util";
import type { PresenceSummary } from "@/lib/vision/presence_signals.util";

/**
 * The camera reading, shown as a mirror rather than a mark.
 *
 * It sits visually apart from the metered signals above it and says plainly
 * that it does not feed the delivery score, because the product publishes a
 * list of things it refuses to grade and inferred confidence is on it.
 */

const BAND_CLASS: Record<ComposureBand, string> = {
  [ComposureBand.COMPOSED]: "text-good",
  [ComposureBand.STEADY]: "text-good",
  [ComposureBand.SLIGHTLY_RESTLESS]: "text-watch",
  [ComposureBand.RESTLESS]: "text-poor",
  [ComposureBand.VERY_RESTLESS]: "text-poor",
};

export function ComposureReadout({
  composure,
  presence,
  expression_activity,
}: {
  composure: ComposureEstimate;
  presence: PresenceSummary | null;
  expression_activity: ExpressionActivitySummary | null;
}) {
  // De-duplicated: the left and right variants of a movement are the same
  // thing to a reader, and "brow furrow, brow furrow" looks like a bug.
  const movement_labels = [
    ...new Set(
      (expression_activity?.most_active ?? []).map(
        (item) => BLENDSHAPE_LABEL[item.blendshape],
      ),
    ),
  ].slice(0, 2);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">
          Composure
        </span>
        <span className="text-[10px] text-ink-faint">not scored</span>
      </div>

      {!composure.is_measurable ? (
        <p className="mt-2 text-[11px] leading-relaxed text-ink-faint">
          Turn the camera on, or keep talking — this needs one of the two.
        </p>
      ) : (
        <>
          <p className="mt-1.5 flex items-baseline gap-2">
            <span
              className={clsx(
                "text-lg font-semibold",
                BAND_CLASS[composure.band],
              )}
            >
              {COMPOSURE_BAND_LABEL[composure.band]}
            </span>
            <span className="tabular font-mono text-xs text-ink-faint">
              {composure.score}/100
            </span>
          </p>

          <div
            className="mt-2 flex gap-[3px]"
            role="meter"
            aria-label="Composure"
            aria-valuenow={composure.score}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            {COMPOSURE_BAND_ORDER.map((band, index) => {
              const position = COMPOSURE_BAND_ORDER.indexOf(composure.band);

              return (
                <span
                  key={band}
                  title={COMPOSURE_BAND_LABEL[band]}
                  className={clsx(
                    "h-1.5 flex-1 rounded-[1px] transition-colors",
                    index === position
                      ? BAND_CLASS[band].replace("text-", "bg-")
                      : "bg-line",
                  )}
                />
              );
            })}
          </div>

          <ul className="mt-2 space-y-1.5">
            {composure.contributions.map((contribution) => (
              <li
                key={contribution.label}
                className="flex items-center justify-between gap-3 text-[11px]"
              >
                <span className="text-ink-muted">{contribution.label}</span>
                <span className="tabular font-mono text-ink-faint">
                  {contribution.detail}
                </span>
              </li>
            ))}
          </ul>

          {movement_labels.length > 0 ? (
            <p className="mt-2.5 text-[11px] text-ink-faint">
              Most frequent brief movement:{" "}
              <span className="text-ink-muted">
                {movement_labels.join(", ")}
              </span>
              . A movement, not a mood — we do not guess at what you were
              feeling.
            </p>
          ) : null}

          {presence?.is_measurable ? (
            <p className="mt-2.5 text-[11px] text-ink-faint">
              Facing the camera{" "}
              <span className="tabular font-mono text-ink-muted">
                {Math.round(presence.facing_camera_fraction * 100)}%
              </span>{" "}
              of the time. Information, not a score — how much you look at
              someone is a local convention, and Australian interviews read it
              differently from many other places.
            </p>
          ) : null}
        </>
      )}

      <p className="mt-2.5 text-[10px] leading-relaxed text-ink-faint">
        {composure.caveat}
      </p>
    </div>
  );
}
