"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { api_client } from "../api/api_client";
import type {
  AnswerReview,
  BehaviouralQuestion,
  TrackAnswerProgressResult,
  TranscriptWord,
} from "../api/api_contracts";
import {
  buildEmptySnapshot,
  runFastLoop,
  type FastLoopSnapshot,
} from "../fast_loop/fast_loop_analyser";
import { CannedTranscriptSource } from "../speech/canned_transcript_source";
import { MicrophoneTranscriptSource } from "../speech/microphone_transcript_source";
import type {
  TranscriptChunkEvent,
  TranscriptSource,
  TranscriptSourceKind,
} from "../speech/transcript_source.type";

/**
 * Drives one answer across all three loops.
 *
 *   Fast  — recomputed here in the browser on every chunk, no network.
 *   Mid   — polled from the API every few seconds while recording.
 *   Slow  — one call on stop, producing the review.
 *
 * The local chunk map is the authority for what is on screen. Chunks are also
 * pushed to the API so the mid and slow loops read the same buffer, but the
 * meter never waits on that round trip.
 */

/** Part 5 of the spec: the mid loop runs every 6-8 seconds of speech. */
const MID_LOOP_INTERVAL_MS = 7000;

/** A nudge stays for at least this long. Enforced server side too. */
const NUDGE_MINIMUM_DWELL_MS = 4000;

export type PracticePhase = "IDLE" | "RECORDING" | "REVIEWING" | "REVIEWED";

export interface PracticeState {
  phase: PracticePhase;
  transcript_text: string;
  words: TranscriptWord[];
  elapsed_ms: number;
  snapshot: FastLoopSnapshot;
  progress: TrackAnswerProgressResult | null;
  nudge_text: string | null;
  review: AnswerReview | null;
  error_message: string | null;
  take_number: number;
}

export function usePracticeSession(session_id: string) {
  const [state, setState] = useState<PracticeState>({
    phase: "IDLE",
    transcript_text: "",
    words: [],
    elapsed_ms: 0,
    snapshot: buildEmptySnapshot(),
    progress: null,
    nudge_text: null,
    review: null,
    error_message: null,
    take_number: 0,
  });

  const chunks_ref = useRef<Map<number, TranscriptChunkEvent>>(new Map());
  const source_ref = useRef<TranscriptSource | null>(null);
  const attempt_id_ref = useRef<string | null>(null);
  const started_at_ref = useRef<number>(0);
  const nudge_shown_at_ref = useRef<number>(0);
  const mid_loop_timer_ref = useRef<ReturnType<typeof setInterval> | null>(null);
  const tick_timer_ref = useRef<ReturnType<typeof setInterval> | null>(null);

  const readBuffer = useCallback(() => {
    const ordered_chunks = [...chunks_ref.current.values()].sort(
      (left, right) => left.chunk_index - right.chunk_index,
    );

    return {
      transcript_text: ordered_chunks
        .map((chunk) => chunk.text.trim())
        .filter((text) => text.length > 0)
        .join(" "),
      words: ordered_chunks.flatMap((chunk) => chunk.words),
    };
  }, []);

  const stopTimers = useCallback(() => {
    if (mid_loop_timer_ref.current !== null) {
      clearInterval(mid_loop_timer_ref.current);
      mid_loop_timer_ref.current = null;
    }
    if (tick_timer_ref.current !== null) {
      clearInterval(tick_timer_ref.current);
      tick_timer_ref.current = null;
    }
  }, []);

  useEffect(() => stopTimers, [stopTimers]);

  /** The fast loop. Runs on every chunk, synchronously, with no network. */
  const applyChunk = useCallback(
    (chunk: TranscriptChunkEvent) => {
      const existing = chunks_ref.current.get(chunk.chunk_index);

      // A chunk already marked final is never revised.
      if (existing?.is_final) return;
      chunks_ref.current.set(chunk.chunk_index, chunk);

      const { transcript_text, words } = readBuffer();
      const elapsed_ms = Date.now() - started_at_ref.current;

      setState((previous) => ({
        ...previous,
        transcript_text,
        words,
        elapsed_ms,
        snapshot: runFastLoop(transcript_text, words, elapsed_ms),
      }));

      const attempt_id = attempt_id_ref.current;
      if (!attempt_id) return;

      // Fire and forget: the mid and slow loops need this, the meter does not.
      void api_client
        .appendTranscriptChunk(session_id, attempt_id, {
          chunk_index: chunk.chunk_index,
          text: chunk.text,
          words: chunk.words,
          is_final: chunk.is_final,
        })
        .catch(() => {
          // A dropped chunk degrades the mid loop, not the thing on screen.
        });
    },
    [readBuffer, session_id],
  );

  /** The mid loop. */
  const runMidLoop = useCallback(async () => {
    const attempt_id = attempt_id_ref.current;
    if (!attempt_id) return;

    try {
      const answer_progress = await api_client.trackProgress(
        session_id,
        attempt_id,
      );

      setState((previous) => {
        const proposed_nudge = answer_progress.active_nudge_text;
        const has_dwelled =
          Date.now() - nudge_shown_at_ref.current >= NUDGE_MINIMUM_DWELL_MS;

        const should_replace_nudge =
          proposed_nudge !== null &&
          proposed_nudge !== previous.nudge_text &&
          (previous.nudge_text === null || has_dwelled);

        if (should_replace_nudge) nudge_shown_at_ref.current = Date.now();

        return {
          ...previous,
          progress: answer_progress.progress,
          nudge_text: should_replace_nudge ? proposed_nudge : previous.nudge_text,
        };
      });
    } catch {
      // The mid loop is advisory. Losing a tick must not stop the recording.
    }
  }, [session_id]);

  const startAnswer = useCallback(
    async (question: BehaviouralQuestion, source_kind: TranscriptSourceKind, canned_script?: string) => {
      chunks_ref.current = new Map();
      started_at_ref.current = Date.now();
      nudge_shown_at_ref.current = 0;

      setState({
        phase: "RECORDING",
        transcript_text: "",
        words: [],
        elapsed_ms: 0,
        snapshot: buildEmptySnapshot(),
        progress: null,
        nudge_text: null,
        review: null,
        error_message: null,
        take_number: 0,
      });

      try {
        const attempt = await api_client.startAttempt(
          session_id,
          question.question_id,
        );

        attempt_id_ref.current = attempt.attempt_id;
        setState((previous) => ({ ...previous, take_number: attempt.take_number }));
      } catch (error) {
        setState((previous) => ({
          ...previous,
          phase: "IDLE",
          error_message:
            error instanceof Error ? error.message : "Could not start the answer.",
        }));
        return;
      }

      const source =
        source_kind === "CANNED_REPLAY" && canned_script
          ? new CannedTranscriptSource(canned_script)
          : new MicrophoneTranscriptSource();

      source_ref.current = source;

      source.start({
        onChunk: applyChunk,
        onError: (message) =>
          setState((previous) => ({ ...previous, error_message: message })),
        onEnd: () => {
          // The replay finishing is the answer finishing; a mic ending is not.
          if (source_kind === "CANNED_REPLAY") void stopAnswer();
        },
      });

      tick_timer_ref.current = setInterval(() => {
        setState((previous) =>
          previous.phase === "RECORDING"
            ? { ...previous, elapsed_ms: Date.now() - started_at_ref.current }
            : previous,
        );
      }, 250);

      mid_loop_timer_ref.current = setInterval(
        () => void runMidLoop(),
        MID_LOOP_INTERVAL_MS,
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [applyChunk, runMidLoop, session_id],
  );

  /** The slow loop. */
  const stopAnswer = useCallback(async () => {
    stopTimers();
    source_ref.current?.stop();
    source_ref.current = null;

    const attempt_id = attempt_id_ref.current;
    if (!attempt_id) return;

    setState((previous) => ({ ...previous, phase: "REVIEWING", nudge_text: null }));

    try {
      const review = await api_client.completeAttempt(session_id, attempt_id);
      setState((previous) => ({ ...previous, phase: "REVIEWED", review }));
    } catch (error) {
      setState((previous) => ({
        ...previous,
        phase: "REVIEWED",
        error_message:
          error instanceof Error ? error.message : "Could not build the review.",
      }));
    }
  }, [session_id, stopTimers]);

  const resetToIdle = useCallback(() => {
    attempt_id_ref.current = null;
    chunks_ref.current = new Map();

    setState({
      phase: "IDLE",
      transcript_text: "",
      words: [],
      elapsed_ms: 0,
      snapshot: buildEmptySnapshot(),
      progress: null,
      nudge_text: null,
      review: null,
      error_message: null,
      take_number: 0,
    });
  }, []);

  return { state, startAnswer, stopAnswer, resetToIdle };
}
