import type {
  FaceLandmarker,
  FaceLandmarkerResult,
} from "@mediapipe/tasks-vision";

/**
 * Wraps MediaPipe's FaceLandmarker.
 *
 * The WASM runtime and the 3.7 MB model are served from `public/mediapipe/`
 * rather than a CDN. Part 6 of the spec is paranoid about venue wifi for good
 * reason, and a demo that needs to reach Google's storage bucket mid-pitch is
 * one more thing that can fail on stage.
 *
 * The library itself is imported dynamically inside `load()`, not at module
 * scope: it is a large browser-only bundle, this page is server-rendered, and
 * nobody who never switches the camera on should pay to download it.
 */

const WASM_DIRECTORY = "/mediapipe/wasm";
const MODEL_PATH = "/mediapipe/face_landmarker.task";

/**
 * Fallback sampling interval, used only where `requestVideoFrameCallback` is
 * unavailable and the loop has to run on a timer instead.
 *
 * This was 80 ms (12 fps) when the reading was only aggregate gaze and head
 * steadiness. Brief expressions last roughly 40-200 ms, so at 12 fps a short
 * one could fall entirely between two samples — it is not a matter of being
 * imprecise, it would simply be invisible. Sampling now tracks the video frame
 * rate, typically 30 fps.
 */
export const VISION_FALLBACK_INTERVAL_MS = 33;

/**
 * After this many detections in a row have thrown, something is wrong with the
 * environment rather than with one frame — most often no WebGL context, which
 * makes every single call fail identically and forever.
 */
const CONSECUTIVE_FAILURES_BEFORE_GIVING_UP = 15;

export class FaceLandmarkerClient {
  private landmarker: FaceLandmarker | null = null;
  private last_video_time_ms = -1;
  private consecutive_failure_count = 0;
  private last_failure_message: string | null = null;

  async load(): Promise<void> {
    if (this.landmarker) return;

    const { FaceLandmarker, FilesetResolver } = await import(
      "@mediapipe/tasks-vision"
    );

    const vision_fileset = await FilesetResolver.forVisionTasks(WASM_DIRECTORY);

    this.landmarker = await FaceLandmarker.createFromOptions(vision_fileset, {
      baseOptions: {
        modelAssetPath: MODEL_PATH,
        // Falls back to CPU on its own where WebGL is unavailable.
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numFaces: 1,
      outputFaceBlendshapes: true,
      outputFacialTransformationMatrixes: true,
      // Detection stays strict so we do not track a coat stand, but tracking
      // is deliberately loosened: a dropped frame in the middle of a 150 ms
      // brow movement loses the whole event, and re-acquiring the face costs
      // far more than occasionally tracking one frame too long.
      minFaceDetectionConfidence: 0.5,
      minFacePresenceConfidence: 0.4,
      minTrackingConfidence: 0.3,
    });
  }

  get is_loaded(): boolean {
    return this.landmarker !== null;
  }

  /**
   * Returns null when the video has not advanced since the last call, since
   * MediaPipe rejects a repeated timestamp. Driven by
   * `requestVideoFrameCallback` this almost never fires; it still matters on
   * the timer fallback, where the interval and the frame rate are unrelated.
   */
  detect(
    video_element: HTMLVideoElement,
    timestamp_ms: number,
  ): FaceLandmarkerResult | null {
    if (!this.landmarker) return null;
    if (video_element.currentTime === this.last_video_time_ms) return null;

    this.last_video_time_ms = video_element.currentTime;

    try {
      const result = this.landmarker.detectForVideo(video_element, timestamp_ms);
      this.consecutive_failure_count = 0;
      return result;
    } catch (error) {
      // A transient decode failure should drop one sample, not end the session.
      // A permanent one — no WebGL, typically — throws on every frame forever,
      // and silently showing an empty meter is worse than saying so.
      this.consecutive_failure_count += 1;
      this.last_failure_message =
        error instanceof Error ? error.message : String(error);
      return null;
    }
  }

  /** True once failures look environmental rather than incidental. */
  get has_given_up(): boolean {
    return (
      this.consecutive_failure_count >= CONSECUTIVE_FAILURES_BEFORE_GIVING_UP
    );
  }

  get failure_message(): string | null {
    return this.last_failure_message;
  }

  close(): void {
    this.landmarker?.close();
    this.landmarker = null;
    this.last_video_time_ms = -1;
  }
}
