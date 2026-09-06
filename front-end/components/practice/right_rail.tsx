import type { FastLoopSnapshot } from "@/lib/fast_loop/fast_loop_analyser";
import type { TrackAnswerProgressResult } from "@/lib/api/api_contracts";
import type { ComposureEstimate } from "@/lib/vision/composure_estimate.util";
import type { ExpressionActivitySummary } from "@/lib/vision/micro_expression.util";
import type { PresenceSummary } from "@/lib/vision/presence_signals.util";
import { ComposureReadout } from "./composure_readout";
import { IWeMeter } from "./i_we_meter";
import { MeterBar } from "./meter_bar";
import { NudgeSlot } from "./nudge_slot";
import { StarTimeline } from "./star_timeline";

/** Pace is scored against a comfortable band, not a maximum. */
const PACE_DISPLAY_CEILING_WPM = 200;

export function RightRail({
  snapshot,
  progress,
  nudge_text,
  elapsed_ms,
  is_recording,
  composure,
  presence,
  expression_activity,
}: {
  snapshot: FastLoopSnapshot;
  progress: TrackAnswerProgressResult | null;
  nudge_text: string | null;
  elapsed_ms: number;
  is_recording: boolean;
  composure: ComposureEstimate;
  presence: PresenceSummary | null;
  expression_activity: ExpressionActivitySummary | null;
}) {
  const elapsed_seconds = Math.floor(elapsed_ms / 1000);

  return (
    <aside className="flex w-[340px] shrink-0 flex-col gap-6 overflow-y-auto border-l border-line bg-surface px-5 py-5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">
          Live
        </span>
        <span className="tabular font-mono text-sm font-semibold text-ink">
          {String(Math.floor(elapsed_seconds / 60)).padStart(1, "0")}:
          {String(elapsed_seconds % 60).padStart(2, "0")}
        </span>
      </div>

      <div className="space-y-5">
        <IWeMeter attribution={snapshot.pronoun_attribution} />

        <MeterBar
          label="Pace"
          value_label={`${snapshot.pace.words_per_minute} wpm`}
          filled_fraction={snapshot.pace.words_per_minute / PACE_DISPLAY_CEILING_WPM}
          verdict={snapshot.pace.verdict}
          is_measurable={snapshot.pace.is_measurable}
          hint={snapshot.pace.is_measurable ? undefined : "Not enough speech yet"}
        />

        <MeterBar
          label="Hedges"
          value_label={String(snapshot.hedges.hedge_count)}
          filled_fraction={snapshot.hedges.hedge_count / 5}
          verdict={snapshot.hedges.verdict}
        />

        <MeterBar
          label="Fillers"
          value_label={`${snapshot.fillers.fillers_per_hundred_words}/100w`}
          filled_fraction={snapshot.fillers.fillers_per_hundred_words / 12}
          verdict={snapshot.fillers.verdict}
        />
      </div>

      <div className="border-t border-line pt-5">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-ink-faint">
          STAR
        </p>
        <StarTimeline progress={progress} />
      </div>

      <div className="border-t border-line pt-5">
        <ComposureReadout
          composure={composure}
          presence={presence}
          expression_activity={expression_activity}
        />
      </div>

      <div className="border-t border-line pt-5">
        <NudgeSlot nudge_text={nudge_text} />
      </div>

      {is_recording ? (
        <p className="mt-auto pt-4 text-[10px] leading-relaxed text-ink-faint">
          Meters above ran locally in {snapshot.computed_in_ms} ms with no
          network call. The STAR bar and the nudge come from the mid loop every
          7 s.
        </p>
      ) : null}
    </aside>
  );
}
