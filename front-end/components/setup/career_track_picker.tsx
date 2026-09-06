"use client";

import clsx from "clsx";

import { CAREER_TRACKS, type CareerTrack } from "@/lib/practice/career_tracks.const";

/**
 * Pre-built starting points, so a session begins with a question rather than
 * with somebody pasting two documents.
 *
 * Picking a track fills the form rather than bypassing it — the CV and posting
 * stay editable, because a real candidate's own documents are always better
 * input than a sample.
 *
 * Shared between the practice setup and the CV review. The two pages want
 * different versions of the same candidate — practice needs a CV worth
 * practising against, review needs one worth reviewing — so the caller decides
 * which text a track hands over.
 */
export function CareerTrackPicker({
  selected_track_id,
  onSelect,
  heading = "Start from a field",
  note = "Fills the form below — edit anything",
}: {
  selected_track_id: string | null;
  onSelect: (track: CareerTrack) => void;
  heading?: string;
  note?: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-xs font-medium text-ink">{heading}</p>
        <p className="text-[11px] text-ink-faint">{note}</p>
      </div>

      <ul className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {CAREER_TRACKS.map((track) => {
          const is_selected = track.track_id === selected_track_id;

          return (
            <li key={track.track_id}>
              <button
                type="button"
                aria-pressed={is_selected}
                onClick={() => onSelect(track)}
                className={clsx(
                  "flex h-full w-full flex-col items-start gap-1 rounded-lg border px-3 py-2.5 text-left transition-colors",
                  is_selected
                    ? "border-accent bg-accent-soft"
                    : "border-line hover:border-line-strong hover:bg-surface-sunken",
                )}
              >
                <span className="flex items-center gap-2">
                  <span aria-hidden className="text-sm">
                    {track.icon}
                  </span>
                  <span className="text-xs font-medium text-ink">
                    {track.label}
                  </span>
                </span>
                <span className="text-[11px] leading-snug text-ink-faint">
                  {track.summary}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
