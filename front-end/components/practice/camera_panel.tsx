"use client";

import clsx from "clsx";
import Image from "next/image";

import type { CameraState } from "@/lib/vision/use_camera_presence";
import { Button } from "@/components/ui/button";

/**
 * The interview window: the interviewer on top, you underneath.
 *
 * That order is deliberate. Putting your own tile directly below the camera
 * means glancing at yourself is roughly the same direction as glancing at the
 * lens, which is the arrangement that makes a real video interview read well.
 */
export function CameraPanel({
  video_ref,
  camera_state,
  error_message,
  onStartCamera,
  onStopCamera,
}: {
  video_ref: React.RefObject<HTMLVideoElement | null>;
  camera_state: CameraState;
  error_message: string | null;
  onStartCamera: () => void;
  onStopCamera: () => void;
}) {
  const is_live = camera_state === "TRACKING";
  const is_starting =
    camera_state === "REQUESTING" || camera_state === "LOADING_MODEL";

  return (
    // Hidden below 1280px. The camera column and the right rail together take
    // 600px of fixed width, and the transcript is the thing that must never be
    // squeezed — it is what the candidate is actually reading while they talk.
    <div className="hidden w-[260px] shrink-0 flex-col gap-3 border-r border-line bg-surface px-4 py-5 xl:flex">
      <div className="overflow-hidden rounded-lg border border-line">
        <div className="relative aspect-[4/3] bg-surface-sunken">
          <Image
            src="/interviewer_placeholder.svg"
            alt="Placeholder interviewer"
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        <p className="border-t border-line px-3 py-1.5 text-[11px] text-ink-muted">
          Interviewer{" "}
          <span className="text-ink-faint">· placeholder</span>
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-line">
        <div className="relative aspect-[4/3] bg-surface-sunken">
          <video
            ref={video_ref}
            muted
            playsInline
            className={clsx(
              "size-full object-cover",
              // Mirrored, because an unmirrored self-view is disorienting —
              // every video-call product does this.
              "-scale-x-100",
              is_live ? "opacity-100" : "opacity-0",
            )}
          />

          {!is_live ? (
            <div className="absolute inset-0 flex items-center justify-center px-4">
              <p className="text-center text-[11px] leading-relaxed text-ink-faint">
                {is_starting
                  ? camera_state === "LOADING_MODEL"
                    ? "Loading face tracking…"
                    : "Waiting for camera permission…"
                  : "Camera off"}
              </p>
            </div>
          ) : null}
        </div>
        <p className="border-t border-line px-3 py-1.5 text-[11px] text-ink-muted">
          You
        </p>
      </div>

      {is_live ? (
        <Button tone="secondary" size="small" onClick={onStopCamera}>
          Turn camera off
        </Button>
      ) : (
        <Button
          tone="secondary"
          size="small"
          onClick={onStartCamera}
          disabled={is_starting}
        >
          {is_starting ? "Starting…" : "Turn camera on"}
        </Button>
      )}

      {error_message ? (
        <p className="text-[11px] leading-relaxed text-watch">{error_message}</p>
      ) : null}

      <p className="mt-auto text-[10px] leading-relaxed text-ink-faint">
        Video never leaves your browser. Nothing is recorded, uploaded or sent
        to the API — the face tracking runs locally and only the derived
        numbers are used.
      </p>
    </div>
  );
}
