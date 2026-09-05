"use client";

import clsx from "clsx";
import { useState } from "react";

import type { BehaviouralQuestion } from "@/lib/api/api_contracts";
import { CANNED_TRANSCRIPTS } from "@/lib/speech/canned_transcript.const";
import type { TranscriptSourceKind } from "@/lib/speech/transcript_source.type";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";

/**
 * Pick a question, pick an input source, start.
 *
 * The canned replay is a first-class option rather than a hidden debug flag —
 * it is the demo's insurance policy, and something you might have to reach for
 * on stage should not be three clicks deep.
 */
export function QuestionPicker({
  questions,
  onStart,
}: {
  questions: BehaviouralQuestion[];
  onStart: (
    question: BehaviouralQuestion,
    source_kind: TranscriptSourceKind,
    canned_script?: string,
  ) => void;
}) {
  // Not seeded from `questions[0]` — the list arrives after first render, so a
  // seeded initial value would stay null forever. The fallback is derived.
  const [selected_question_id, setSelectedQuestionId] = useState<string | null>(
    null,
  );
  const [source_kind, setSourceKind] =
    useState<TranscriptSourceKind>("MICROPHONE");
  const [canned_key, setCannedKey] = useState<string>(
    CANNED_TRANSCRIPTS[0]?.key ?? "",
  );

  const selected_question =
    questions.find(
      (question) => question.question_id === selected_question_id,
    ) ??
    questions[0] ??
    null;

  const selected_canned = CANNED_TRANSCRIPTS.find(
    (transcript) => transcript.key === canned_key,
  );

  const handleStart = (): void => {
    if (!selected_question) return;

    onStart(
      selected_question,
      source_kind,
      source_kind === "CANNED_REPLAY" ? selected_canned?.script : undefined,
    );
  };

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-5 px-6 py-8 lg:grid-cols-[1fr_360px]">
      <Card className="min-w-0">
        <CardHeader
          title="Pick a question"
          hint="Twenty-five behavioural questions, each with hand-written notes on what the interviewer is actually testing."
        />
        <ul className="max-h-[520px] divide-y divide-line overflow-y-auto">
          {questions.map((question) => {
            const is_selected =
              question.question_id === selected_question?.question_id;

            return (
              <li key={question.question_id}>
                <button
                  onClick={() => setSelectedQuestionId(question.question_id)}
                  className={clsx(
                    "flex w-full items-start gap-3 px-5 py-3.5 text-left transition-colors",
                    is_selected ? "bg-accent-soft" : "hover:bg-surface-sunken",
                  )}
                >
                  <span
                    aria-hidden
                    className={clsx(
                      "mt-1.5 size-1.5 shrink-0 rounded-full",
                      is_selected ? "bg-accent" : "bg-line-strong",
                    )}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-ink">
                      {question.question_text}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-ink-faint">
                      {question.category.replace(/_/g, " ").toLowerCase()} ·
                      target {question.target_seconds}s
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </Card>

      <div className="space-y-5">
        {selected_question ? (
          <Card>
            <CardHeader title="What they are testing" />
            <div className="space-y-4 px-5 py-4">
              <p className="text-sm leading-relaxed text-ink-muted">
                {selected_question.interviewer_intent}
              </p>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                  What lands
                </p>
                <ul className="mt-1.5 space-y-1">
                  {selected_question.what_lands.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-xs text-ink-muted"
                    >
                      <span aria-hidden className="mt-0.5 text-accent">
                        ·
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {selected_question.intercultural_note ? (
                <div className="rounded-lg border border-accent/30 bg-accent-soft p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-accent">
                    If you did not grow up interviewing here
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-ink">
                    {selected_question.intercultural_note}
                  </p>
                </div>
              ) : null}
            </div>
          </Card>
        ) : null}

        <Card>
          <CardHeader title="Input" />
          <div className="space-y-3 px-5 py-4">
            <div
              role="radiogroup"
              aria-label="Transcript source"
              className="grid grid-cols-2 gap-2"
            >
              {(
                [
                  { value: "MICROPHONE", label: "Microphone" },
                  { value: "CANNED_REPLAY", label: "Canned replay" },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  role="radio"
                  aria-checked={source_kind === option.value}
                  onClick={() => setSourceKind(option.value)}
                  className={clsx(
                    "rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                    source_kind === option.value
                      ? "border-accent bg-accent-soft text-ink"
                      : "border-line text-ink-muted hover:border-line-strong",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {source_kind === "CANNED_REPLAY" ? (
              <div className="space-y-2">
                <select
                  value={canned_key}
                  onChange={(event) => setCannedKey(event.target.value)}
                  className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-xs text-ink"
                >
                  {CANNED_TRANSCRIPTS.map((transcript) => (
                    <option key={transcript.key} value={transcript.key}>
                      {transcript.label}
                    </option>
                  ))}
                </select>
                {selected_canned ? (
                  <p className="text-[11px] leading-relaxed text-ink-faint">
                    {selected_canned.description}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="text-[11px] leading-relaxed text-ink-faint">
                Uses the browser Web Speech API. It gives no reliable word
                timings, so pause coaching is suppressed rather than guessed —
                switch to canned replay to see it.
              </p>
            )}

            <Button
              size="large"
              className="w-full"
              onClick={handleStart}
              disabled={!selected_question}
            >
              Start answering
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
