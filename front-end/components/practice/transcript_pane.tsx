"use client";

import clsx from "clsx";
import { useEffect, useRef } from "react";

import type { FastLoopSnapshot } from "@/lib/fast_loop/fast_loop_analyser";
import {
  buildTranscriptMarks,
  type TranscriptMarkKind,
} from "@/lib/practice/transcript_marks";

const MARK_CLASS: Record<TranscriptMarkKind, string> = {
  PLAIN: "",
  COLLECTIVE: "mark-collective",
  FIRST_PERSON: "mark-first-person",
  HEDGE: "mark-hedge",
};

export function TranscriptPane({
  transcript_text,
  snapshot,
  is_recording,
  question_text,
}: {
  transcript_text: string;
  snapshot: FastLoopSnapshot;
  is_recording: boolean;
  question_text: string;
}) {
  const scroll_ref = useRef<HTMLDivElement>(null);
  const marks = buildTranscriptMarks(transcript_text, snapshot);

  useEffect(() => {
    const element = scroll_ref.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [transcript_text]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-line px-6 py-4">
        <p className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">
          Question
        </p>
        <p className="mt-1.5 text-base font-medium leading-snug text-ink">
          {question_text}
        </p>
      </div>

      <div ref={scroll_ref} className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        {transcript_text.length === 0 ? (
          <p className="max-w-md text-sm leading-relaxed text-ink-faint">
            {is_recording
              ? "Listening. Start with the situation — where you were and who else was there."
              : "Your answer appears here as you speak it. Collective verbs are marked in red, first-person verbs in green, and hedges are struck through."}
          </p>
        ) : (
          <p className="max-w-3xl text-lg leading-[1.9] tracking-[-0.005em] text-ink">
            {marks.map((mark, index) => (
              <span
                key={index}
                className={MARK_CLASS[mark.kind]}
                title={
                  mark.attached_verb
                    ? `attached to "${mark.attached_verb}"`
                    : undefined
                }
              >
                {mark.text}
              </span>
            ))}
            {is_recording ? (
              <span
                aria-hidden
                className={clsx("caret ml-0.5 inline-block", "text-accent-strong")}
              >
                ▍
              </span>
            ) : null}
          </p>
        )}
      </div>
    </div>
  );
}
