"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  FaceLandmarkerClient,
  VISION_FALLBACK_INTERVAL_MS,
} from "./face_landmarker.client";
import {
  MicroExpressionDetector,
  readExpressiveScores,
  type ExpressionActivitySummary,
} from "./micro_expression.util";
import {
  buildPresenceFrame,
  summarisePresence,
  type BlendshapeScore,
  type PresenceFrame,
  type PresenceSummary,
} from "./presence_signals.util";
import {
  cancelVideoFrame,
  requestVideoFrame,
  supportsVideoFrameCallback,
} from "./video_frame_callback.type";

/**
 * Owns the webcam stream and the face-tracking loop.
 *
 * Everything here is optional by design: the practice screen has to work with
 * the camera off, denied, or unsupported. A missing camera degrades the
 * composure reading and nothing else.
 */

export type CameraState =
  | "OFF"
  | "REQUESTING"
  | "LOADING_MODEL"
  | "TRACKING"
  | "DENIED"
  | "UNAVAILABLE";

/** Only the last ~20 seconds of frames matter for a live reading. */
const ROLLING_WINDOW_MS = 20_000;

/** How often the summaries are pushed into React state. ~4 Hz is plenty. */
const PUBLISH_INTERVAL_MS = 250;

export function useCameraPresence() {
  const [camera_state, setCameraState] = useState<CameraState>("OFF");
  const [presence, setPresence] = useState<PresenceSummary | null>(null);
  const [expression_activity, setExpressionActivity] =
    useState<ExpressionActivitySummary | null>(null);
  const [error_message, setErrorMessage] = useState<string | null>(null);

  const video_ref = useRef<HTMLVideoElement | null>(null);
  const stream_ref = useRef<MediaStream | null>(null);
  const landmarker_ref = useRef<FaceLandmarkerClient | null>(null);
  const frames_ref = useRef<PresenceFrame[]>([]);
  /**
   * Untrimmed, unlike `frames_ref`. The live rail wants the last twenty
   * seconds; the review wants the whole answer, and those are different
   * questions.
   */
  const answer_frames_ref = useRef<PresenceFrame[]>([]);
  const answer_missing_face_count_ref = useRef(0);
  const missing_face_count_ref = useRef(0);
  const loop_timer_ref = useRef<ReturnType<typeof setInterval> | null>(null);
  const frame_callback_ref = useRef<number | null>(null);
  const detector_ref = useRef(new MicroExpressionDetector());
  /**
   * The summary is recomputed at a few hertz rather than on every frame:
   * inference runs at 30fps now, and pushing React state that often would
   * re-render the whole rail for no visible benefit.
   */
  const last_publish_ms_ref = useRef(0);

  const stopCamera = useCallback(() => {
    if (loop_timer_ref.current !== null) {
      clearInterval(loop_timer_ref.current);
      loop_timer_ref.current = null;
    }

    if (frame_callback_ref.current !== null && video_ref.current) {
      cancelVideoFrame(video_ref.current, frame_callback_ref.current);
      frame_callback_ref.current = null;
    }

    stream_ref.current?.getTracks().forEach((track) => track.stop());
    stream_ref.current = null;

    landmarker_ref.current?.close();
    landmarker_ref.current = null;

    if (video_ref.current) video_ref.current.srcObject = null;

    frames_ref.current = [];
    missing_face_count_ref.current = 0;
    detector_ref.current.reset();

    setCameraState("OFF");
    setPresence(null);
    setExpressionActivity(null);
  }, []);

  // Releasing the camera on unmount matters more than usual here: a webcam
  // light left on after the user navigates away is alarming.
  useEffect(() => stopCamera, [stopCamera]);

  const stopLoop = useCallback(() => {
    if (loop_timer_ref.current !== null) {
      clearInterval(loop_timer_ref.current);
      loop_timer_ref.current = null;
    }
    if (frame_callback_ref.current !== null && video_ref.current) {
      cancelVideoFrame(video_ref.current, frame_callback_ref.current);
      frame_callback_ref.current = null;
    }
  }, []);

  const runVisionLoop = useCallback(() => {
    const video_element = video_ref.current;
    const landmarker = landmarker_ref.current;
    if (!video_element || !landmarker?.is_loaded) return;
    if (video_element.readyState < 2) return;

    const result = landmarker.detect(video_element, performance.now());

    if (!result) {
      // Every frame failing means the environment cannot run inference —
      // almost always a missing WebGL context. Stop burning CPU on it and say
      // so, rather than leaving an empty meter with no explanation.
      if (landmarker.has_given_up) {
        stopLoop();
        setPresence(null);
        setExpressionActivity(null);
        setErrorMessage(
          "Face tracking cannot run in this browser — it needs WebGL, which is unavailable here. The mirror still works and composure falls back to filler density.",
        );
      }

      return;
    }

    const blendshapes = result.faceBlendshapes?.[0]?.categories as
      | BlendshapeScore[]
      | undefined;

    const now_ms = performance.now();

    if (!blendshapes || blendshapes.length === 0) {
      missing_face_count_ref.current += 1;
      answer_missing_face_count_ref.current += 1;
    } else {
      const frame = buildPresenceFrame(
        blendshapes,
        result.facialTransformationMatrixes?.[0]?.data ?? null,
        now_ms,
      );

      answer_frames_ref.current.push(frame);
      frames_ref.current.push(frame);

      // Fed every frame, deliberately: a 40 ms movement exists in one or two
      // frames and skipping any of them loses it entirely.
      detector_ref.current.observe({
        timestamp_ms: now_ms,
        scores: readExpressiveScores(blendshapes),
      });
    }

    const window_starts_at = now_ms - ROLLING_WINDOW_MS;
    frames_ref.current = frames_ref.current.filter(
      (frame) => frame.timestamp_ms >= window_starts_at,
    );

    // Detection runs at frame rate; publishing to React does not need to.
    if (now_ms - last_publish_ms_ref.current < PUBLISH_INTERVAL_MS) return;
    last_publish_ms_ref.current = now_ms;

    setPresence(
      summarisePresence(frames_ref.current, missing_face_count_ref.current),
    );
    setExpressionActivity(detector_ref.current.summarise(now_ms));
  }, [stopLoop]);

  /**
   * Drives inference from decoded video frames where the browser supports it,
   * so a sample exists for every frame of pixel data and none is processed
   * twice. The timer fallback runs at a fixed rate that has no relationship to
   * the camera's, which is why it is the fallback and not the default.
   */
  const startLoop = useCallback(() => {
    const video_element = video_ref.current;
    if (!video_element) return;

    if (!supportsVideoFrameCallback(video_element)) {
      loop_timer_ref.current = setInterval(
        runVisionLoop,
        VISION_FALLBACK_INTERVAL_MS,
      );
      return;
    }

    const onFrame = (): void => {
      runVisionLoop();

      const element = video_ref.current;
      if (!element) return;

      frame_callback_ref.current = requestVideoFrame(element, onFrame);
    };

    frame_callback_ref.current = requestVideoFrame(video_element, onFrame);
  }, [runVisionLoop]);

  const startCamera = useCallback(async () => {
    setErrorMessage(null);

    if (typeof navigator === "undefined" || !navigator.mediaDevices) {
      setCameraState("UNAVAILABLE");
      setErrorMessage("This browser cannot open a camera.");
      return;
    }

    setCameraState("REQUESTING");

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false,
      });
    } catch (error) {
      const is_denial =
        error instanceof DOMException &&
        (error.name === "NotAllowedError" || error.name === "SecurityError");

      setCameraState(is_denial ? "DENIED" : "UNAVAILABLE");
      setErrorMessage(
        is_denial
          ? "Camera permission was declined. Everything else still works — the composure reading just falls back to filler density."
          : "No camera available. Everything else still works.",
      );
      return;
    }

    stream_ref.current = stream;
    if (video_ref.current) {
      video_ref.current.srcObject = stream;
      await video_ref.current.play().catch(() => undefined);
    }

    setCameraState("LOADING_MODEL");

    try {
      const landmarker = new FaceLandmarkerClient();
      await landmarker.load();
      landmarker_ref.current = landmarker;
    } catch {
      // The self-view is worth keeping even with no tracking — seeing yourself
      // is most of the value, and the reading is the optional part.
      setCameraState("TRACKING");
      setErrorMessage(
        "Face tracking could not start, so there is no composure reading. The mirror still works.",
      );
      return;
    }

    setCameraState("TRACKING");
    startLoop();
  }, [startLoop]);

  const resetWindow = useCallback(() => {
    frames_ref.current = [];
    answer_frames_ref.current = [];
    missing_face_count_ref.current = 0;
    answer_missing_face_count_ref.current = 0;
    detector_ref.current.reset();
    last_publish_ms_ref.current = 0;
    setPresence(null);
    setExpressionActivity(null);
  }, []);

  /**
   * The whole-answer reading, taken when the candidate stops.
   *
   * Returns derived numbers only. No frame, landmark or image ever leaves this
   * hook — that property is the reason the camera is acceptable at all, and it
   * is enforced here rather than trusted to callers.
   */
  const captureAnswerSummary = useCallback((): {
    presence: PresenceSummary;
    expression_activity: ExpressionActivitySummary;
  } | null => {
    if (answer_frames_ref.current.length === 0) return null;

    return {
      presence: summarisePresence(
        answer_frames_ref.current,
        answer_missing_face_count_ref.current,
      ),
      expression_activity: detector_ref.current.summariseWholeAnswer(),
    };
  }, []);

  return {
    video_ref,
    camera_state,
    presence,
    expression_activity,
    error_message,
    startCamera,
    stopCamera,
    resetWindow,
    captureAnswerSummary,
  };
}
