"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  SpeechAudioAnalyser,
  type SpeechAudioSnapshot,
} from "./speech_audio_analyser";

/**
 * Owns a microphone stream purely for measurement.
 *
 * This is a second, separate capture from the one the speech recogniser opens
 * for itself — the Web Speech API manages its own microphone internally and
 * exposes neither the stream nor the audio. Browsers allow more than one
 * consumer of the same device, so the two run side by side: one produces the
 * words, this one produces everything the words lost.
 */

export type AudioAnalysisState =
  | "OFF"
  | "REQUESTING"
  | "LISTENING"
  | "DENIED"
  | "UNAVAILABLE";

/** Republished at a few hertz; the analyser itself samples at 50. */
const PUBLISH_INTERVAL_MS = 250;

export function useSpeechAudio() {
  const [analysis_state, setAnalysisState] =
    useState<AudioAnalysisState>("OFF");
  const [snapshot, setSnapshot] = useState<SpeechAudioSnapshot | null>(null);
  const [error_message, setErrorMessage] = useState<string | null>(null);

  const analyser_ref = useRef(new SpeechAudioAnalyser());
  const stream_ref = useRef<MediaStream | null>(null);
  const publish_timer_ref = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopListening = useCallback(() => {
    if (publish_timer_ref.current !== null) {
      clearInterval(publish_timer_ref.current);
      publish_timer_ref.current = null;
    }

    analyser_ref.current.stop();
    stream_ref.current?.getTracks().forEach((track) => track.stop());
    stream_ref.current = null;

    setAnalysisState("OFF");
  }, []);

  useEffect(() => stopListening, [stopListening]);

  const startListening = useCallback(async () => {
    setErrorMessage(null);

    if (typeof navigator === "undefined" || !navigator.mediaDevices) {
      setAnalysisState("UNAVAILABLE");
      return;
    }

    setAnalysisState("REQUESTING");

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        // Every default here would erase what is being measured: noise
        // suppression removes the low-energy tail of a filled pause, and AGC
        // lifts the noise floor until silence stops looking like silence.
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
    } catch (error) {
      const is_denial =
        error instanceof DOMException && error.name === "NotAllowedError";

      setAnalysisState(is_denial ? "DENIED" : "UNAVAILABLE");
      setErrorMessage(
        "Microphone access for audio analysis was declined. Pace still works; pauses and fillers cannot be measured without it.",
      );
      return;
    }

    stream_ref.current = stream;

    try {
      await analyser_ref.current.start(stream);
    } catch {
      setAnalysisState("UNAVAILABLE");
      setErrorMessage("Audio analysis could not start in this browser.");
      return;
    }

    setAnalysisState("LISTENING");
    publish_timer_ref.current = setInterval(() => {
      setSnapshot(analyser_ref.current.getSnapshot());
    }, PUBLISH_INTERVAL_MS);
  }, []);

  const resetAudioWindow = useCallback(() => {
    analyser_ref.current.reset();
    setSnapshot(null);
  }, []);

  return {
    analysis_state,
    snapshot,
    error_message,
    startListening,
    stopListening,
    resetAudioWindow,
  };
}
