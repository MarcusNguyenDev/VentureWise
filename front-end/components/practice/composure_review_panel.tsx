import clsx from "clsx";

import type { CameraPresenceReading } from "@/lib/api/api_contracts";
import {
  COMPOSURE_BAND_LABEL,
  COMPOSURE_BAND_ORDER,
  ComposureBand,
} from "@/lib/vision/composure_estimate.util";

/**
 * The whole-answer camera reading, kept after the answer ends.
 *
 * The live rail shows the last twenty seconds; this describes the answer. It
 * is a separate card from Delivery on purpose — that score publishes a list of
 * things it refuses to grade, and inferred confidence is on it.
 */

const BAND_TEXT_CLASS: Record<ComposureBand, string> = {
  [ComposureBand.COMPOSED]: "text-good",
  [ComposureBand.STEADY]: "text-good",
  [ComposureBand.SLIGHTLY_RESTLESS]: "text-watch",
  [ComposureBand.RESTLESS]: "text-poor",
  [ComposureBand.VERY_RESTLESS]: "text-poor",
};

const BAND_BAR_CLASS: Record<ComposureBand, string> = {
  [ComposureBand.COMPOSED]: "bg-good",
  [ComposureBand.STEADY]: "bg-good",
  [ComposureBand.SLIGHTLY_RESTLESS]: "bg-watch",
  [ComposureBand.RESTLESS]: "bg-poor",
  [ComposureBand.VERY_RESTLESS]: "bg-poor",
};

function toBand(value: string): ComposureBand {
  return COMPOSURE_BAND_ORDER.includes(value as ComposureBand)
    ? (value as ComposureBand)
    : ComposureBand.SLIGHTLY_RESTLESS;
}

export function ComposureReviewPanel({
  reading,
}: {
  reading: CameraPresenceReading;
}) {
  const band = toBand(reading.band);

  const rows = [
    {
      label: "Gaze steadiness",
      value: `${Math.round(reading.gaze_steadiness * 100)}%`,
    },
    {
      label: "Head steadiness",
      value: `${Math.round(reading.head_steadiness * 100)}%`,
    },
    {
      label: "Brief facial movements",
      value: `${reading.expression_transients_per_minute}/min`,
    },
    { label: "Blink rate", value: `${reading.blinks_per_minute}/min` },
    {
      label: "In frame",
      value: `${Math.round(reading.face_visible_fraction * 100)}%`,
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_280px]">
      <div>
        <div className="mb-1 flex items-baseline gap-3">
          <span
            className={clsx("text-2xl font-semibold", BAND_TEXT_CLASS[band])}
          >
            {COMPOSURE_BAND_LABEL[band]}
          </span>
          <span className="tabular font-mono text-sm text-ink-muted">
            {reading.score}/100
          </span>
        </div>

        <div className="mb-4 mt-2 flex gap-1">
          {COMPOSURE_BAND_ORDER.map((candidate) => (
            <div key={candidate} className="flex-1">
              <span
                className={clsx(
                  "block h-1.5 rounded-[1px]",
                  candidate === band ? BAND_BAR_CLASS[candidate] : "bg-line",
                )}
              />
              <span
                className={clsx(
                  "mt-1 block text-[9px] leading-tight",
                  candidate === band ? "text-ink-muted" : "text-ink-faint",
                )}
              >
                {COMPOSURE_BAND_LABEL[candidate]}
              </span>
            </div>
          ))}
        </div>

        <dl className="divide-y divide-line border-y border-line">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-4 py-2.5"
            >
              <dt className="text-sm text-ink">{row.label}</dt>
              <dd className="tabular font-mono text-xs text-ink-muted">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>

        {reading.most_active_movements &&
        reading.most_active_movements.length > 0 ? (
          <p className="mt-3 text-xs leading-relaxed text-ink-muted">
            Most frequent brief movement:{" "}
            <span className="text-ink">
              {[...new Set(reading.most_active_movements)]
                .slice(0, 2)
                .join(", ")}
            </span>
            . A movement, not a mood — we do not guess at what you were feeling.
          </p>
        ) : null}
      </div>

      <div className="rounded-lg border border-line bg-surface-sunken p-4">
        <p className="text-xs font-semibold text-ink">How to read this</p>
        <p className="mt-1.5 text-[11px] leading-relaxed text-ink-muted">
          Graded harshly on purpose — the room you are practising for is less
          forgiving than this is, so &ldquo;Composed&rdquo; is meant to be
          earned rather than assumed.
        </p>
        <p className="mt-2 text-[11px] leading-relaxed text-ink-muted">
          Facing the camera{" "}
          <span className="tabular font-mono text-ink">
            {Math.round(reading.facing_camera_fraction * 100)}%
          </span>{" "}
          of the answer. That one is information, not a mark: how much you look
          at someone is a local convention, and an Australian interview reads it
          differently from many other places.
        </p>
        <p className="mt-2 text-[11px] leading-relaxed text-ink-faint">
          Estimated from a few weak signals. Lighting, glasses and thinking hard
          all move these numbers, and it never reaches your delivery score.
        </p>
      </div>
    </div>
  );
}
