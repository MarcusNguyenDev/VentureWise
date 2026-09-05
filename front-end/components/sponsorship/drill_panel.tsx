"use client";

import clsx from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";

import { api_client } from "@/lib/api/api_client";
import type { SponsorshipDrillScore } from "@/lib/api/api_contracts";
import { MicrophoneTranscriptSource } from "@/lib/speech/microphone_transcript_source";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";

/**
 * The closer: a thirty-second countdown, said out loud, scored against the
 * twenty-second target.
 *
 * There is a typed fallback because this is the one screen that has to work
 * when the microphone does not — Part 6 makes the sponsorship drill the backup
 * demo if the audio stack collapses.
 */

const COUNTDOWN_SECONDS = 30;

export function DrillPanel() {
  const [seconds_left, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [is_running, setIsRunning] = useState(false);
  const [spoken_text, setSpokenText] = useState("");
  const [score, setScore] = useState<SponsorshipDrillScore | null>(null);
  const [error_message, setErrorMessage] = useState<string | null>(null);

  const source_ref = useRef<MicrophoneTranscriptSource | null>(null);
  const started_at_ref = useRef(0);
  const timer_ref = useRef<ReturnType<typeof setInterval> | null>(null);
  const chunks_ref = useRef<Map<number, string>>(new Map());

  const clearTimer = useCallback(() => {
    if (timer_ref.current !== null) {
      clearInterval(timer_ref.current);
      timer_ref.current = null;
    }
  }, []);

  const finish = useCallback(async () => {
    clearTimer();
    source_ref.current?.stop();
    source_ref.current = null;
    setIsRunning(false);

    const elapsed_seconds = Math.round(
      (Date.now() - started_at_ref.current) / 1000,
    );

    const said = [...chunks_ref.current.entries()]
      .sort(([left], [right]) => left - right)
      .map(([, text]) => text.trim())
      .join(" ")
      .trim();

    const final_text = said.length > 0 ? said : spoken_text;
    if (final_text.trim().length === 0) return;

    setSpokenText(final_text);

    try {
      setScore(
        await api_client.scoreSponsorshipDrill({
          spoken_text: final_text,
          spoken_seconds: Math.max(elapsed_seconds, 1),
        }),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not score the drill.",
      );
    }
  }, [clearTimer, spoken_text]);

  useEffect(() => clearTimer, [clearTimer]);

  const start = (): void => {
    chunks_ref.current = new Map();
    started_at_ref.current = Date.now();
    setSecondsLeft(COUNTDOWN_SECONDS);
    setScore(null);
    setErrorMessage(null);
    setSpokenText("");
    setIsRunning(true);

    const source = new MicrophoneTranscriptSource();
    source_ref.current = source;

    source.start({
      onChunk: (chunk) => {
        chunks_ref.current.set(chunk.chunk_index, chunk.text);
        setSpokenText(
          [...chunks_ref.current.entries()]
            .sort(([left], [right]) => left - right)
            .map(([, text]) => text.trim())
            .join(" "),
        );
      },
      onError: (message) => setErrorMessage(message),
      onEnd: () => undefined,
    });

    timer_ref.current = setInterval(() => {
      setSecondsLeft((previous) => {
        if (previous <= 1) {
          void finish();
          return 0;
        }
        return previous - 1;
      });
    }, 1000);
  };

  const elapsed_fraction = (COUNTDOWN_SECONDS - seconds_left) / COUNTDOWN_SECONDS;

  return (
    <Card>
      <CardHeader
        title="Say it out loud"
        hint="Thirty seconds on the clock. The target is under twenty, with no apology in it."
      />

      <div className="space-y-4 px-5 py-5">
        <div className="flex items-center gap-5">
          <div className="relative flex size-20 shrink-0 items-center justify-center">
            <svg viewBox="0 0 44 44" className="absolute size-20 -rotate-90">
              <circle
                cx="22"
                cy="22"
                r="19"
                fill="none"
                strokeWidth="3"
                className="stroke-[var(--border)]"
              />
              <circle
                cx="22"
                cy="22"
                r="19"
                fill="none"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 19}
                strokeDashoffset={2 * Math.PI * 19 * elapsed_fraction}
                className={clsx(
                  "transition-[stroke-dashoffset] duration-1000 ease-linear",
                  seconds_left <= 10 ? "stroke-[var(--verdict-poor)]" : "stroke-[var(--accent)]",
                )}
              />
            </svg>
            <span className="tabular font-mono text-xl font-semibold text-ink">
              {seconds_left}
            </span>
          </div>

          <div className="flex-1">
            <Button
              tone={is_running ? "danger" : "primary"}
              onClick={() => (is_running ? void finish() : start())}
            >
              {is_running ? "Done" : score ? "Try again" : "Start the drill"}
            </Button>
            {error_message ? (
              <p className="mt-2 text-xs text-poor">{error_message}</p>
            ) : null}
          </div>
        </div>

        <label className="block">
          <span className="text-xs font-medium text-ink">
            What you said
            <span className="text-ink-faint">
              {" "}
              — type it if the mic is not cooperating
            </span>
          </span>
          <textarea
            value={spoken_text}
            onChange={(event) => setSpokenText(event.target.value)}
            rows={4}
            placeholder="Yes, eventually. I'm on F-1 with…"
            className="mt-1.5 w-full resize-y rounded-lg border border-line bg-surface px-3 py-2.5 text-sm leading-relaxed text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
          />
        </label>

        {!is_running && spoken_text.trim().length > 0 && !score ? (
          <Button tone="secondary" size="small" onClick={() => void finish()}>
            Score what I typed
          </Button>
        ) : null}

        {score ? <DrillScoreView score={score} /> : null}
      </div>
    </Card>
  );
}

function DrillScoreView({ score }: { score: SponsorshipDrillScore }) {
  const checks = [
    { label: "Under 20 seconds", passed: score.is_within_time, detail: `${score.spoken_seconds}s` },
    { label: "Opened with yes or no", passed: score.is_direct_opening },
    { label: "Dates in it", passed: score.has_dates },
    { label: "No apology", passed: score.apology_matches.length === 0 },
  ];

  return (
    <div
      className={clsx(
        "rounded-lg border p-4",
        score.is_passing
          ? "border-good/40 bg-good-soft"
          : "border-line bg-surface-sunken",
      )}
    >
      <p
        className={clsx(
          "text-sm font-semibold",
          score.is_passing ? "text-good" : "text-ink",
        )}
      >
        {score.is_passing ? "That closes the topic." : "Not there yet."}
      </p>

      <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
        {checks.map((check) => (
          <li
            key={check.label}
            className="flex items-center gap-2 text-xs text-ink-muted"
          >
            <span
              aria-hidden
              className={clsx(
                "font-mono",
                check.passed ? "text-good" : "text-poor",
              )}
            >
              {check.passed ? "✓" : "✕"}
            </span>
            {check.label}
            {check.detail ? (
              <span className="tabular font-mono text-ink-faint">
                {check.detail}
              </span>
            ) : null}
          </li>
        ))}
      </ul>

      <ul className="mt-4 space-y-2 border-t border-line pt-3">
        {score.coaching_notes.map((note, index) => (
          <li key={index} className="text-xs leading-relaxed text-ink-muted">
            {note}
          </li>
        ))}
      </ul>
    </div>
  );
}
