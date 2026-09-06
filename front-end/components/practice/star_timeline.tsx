import clsx from "clsx";

import {
  STAR_STAGE_ORDER,
  type StarStage,
  type TrackAnswerProgressResult,
} from "@/lib/api/api_contracts";

const STAGE_LABEL: Record<StarStage, string> = {
  SITUATION: "Situation",
  TASK: "Task",
  ACTION: "Action",
  RESULT: "Result",
};

/** The stage bars from the spec's mock: done, live, or not reached. */
export function StarTimeline({
  progress,
}: {
  progress: TrackAnswerProgressResult | null;
}) {
  const current_stage_index = progress
    ? STAR_STAGE_ORDER.indexOf(progress.current_stage)
    : -1;

  return (
    <div className="space-y-2.5">
      {STAR_STAGE_ORDER.map((stage, stage_index) => {
        const duration_seconds = progress?.stage_durations_seconds?.[stage];
        const is_reached = stage_index <= current_stage_index;
        const is_live = stage_index === current_stage_index;

        return (
          <div key={stage} className="flex items-center gap-3">
            <span
              className={clsx(
                "w-16 shrink-0 text-[11px] font-medium",
                is_reached ? "text-ink" : "text-ink-faint",
              )}
            >
              {STAGE_LABEL[stage]}
            </span>

            <div className="flex flex-1 gap-[3px]">
              {Array.from({ length: 10 }, (_unused, segment_index) => {
                const fill_count = is_live ? 4 : is_reached ? 10 : 0;

                return (
                  <span
                    key={segment_index}
                    className={clsx(
                      "h-1.5 flex-1 rounded-[1px] transition-colors duration-300",
                      segment_index < fill_count
                        ? is_live
                          ? "bg-accent"
                          : "bg-good"
                        : "bg-line",
                    )}
                  />
                );
              })}
            </div>

            <span className="tabular w-10 shrink-0 text-right font-mono text-[11px] text-ink-faint">
              {duration_seconds !== undefined
                ? `${Math.round(duration_seconds)}s`
                : "—"}
            </span>

            <span
              className={clsx(
                "w-9 shrink-0 text-[10px] font-medium uppercase tracking-wide",
                is_live
                  ? "text-accent-strong"
                  : is_reached
                    ? "text-good"
                    : "text-transparent",
              )}
            >
              {is_live ? "live" : is_reached ? "done" : "—"}
            </span>
          </div>
        );
      })}

      {progress ? (
        <p className="pt-1 text-[11px] text-ink-faint">
          Quantified result:{" "}
          <span
            className={clsx(
              "font-medium",
              progress.has_quantified_result ? "text-good" : "text-watch",
            )}
          >
            {progress.has_quantified_result ? "found" : "not yet"}
          </span>
        </p>
      ) : null}
    </div>
  );
}
