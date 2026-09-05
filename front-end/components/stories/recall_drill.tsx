"use client";

import clsx from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";

import { api_client } from "@/lib/api/api_client";
import type { BehaviouralQuestion, RecallDrillCard } from "@/lib/api/api_contracts";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";

/**
 * The retrieval half of F-04.
 *
 * Having the story bank is not the skill — reaching the right story in four
 * seconds is. The countdown is deliberately short enough to be uncomfortable.
 */

type DrillPhase = "READY" | "RUNNING" | "ANSWERED" | "TIMED_OUT";

export function RecallDrill({
  session_id,
  questions,
  has_stories,
}: {
  session_id: string;
  questions: BehaviouralQuestion[];
  has_stories: boolean;
}) {
  const [card, setCard] = useState<RecallDrillCard | null>(null);
  const [phase, setPhase] = useState<DrillPhase>("READY");
  const [seconds_left, setSecondsLeft] = useState(0);
  const [picked_story_id, setPickedStoryId] = useState<string | null>(null);
  const [error_message, setErrorMessage] = useState<string | null>(null);

  const timer_ref = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timer_ref.current !== null) {
      clearInterval(timer_ref.current);
      timer_ref.current = null;
    }
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const startDrill = async (): Promise<void> => {
    setErrorMessage(null);
    setPickedStoryId(null);

    const question =
      questions[Math.floor(Math.random() * questions.length)] ?? null;
    if (!question) return;

    try {
      const drill_card = await api_client.buildRecallDrill(
        session_id,
        question.question_id,
      );

      setCard(drill_card);
      setSecondsLeft(drill_card.seconds_allowed);
      setPhase("RUNNING");

      clearTimer();
      timer_ref.current = setInterval(() => {
        setSecondsLeft((previous) => {
          if (previous <= 1) {
            clearTimer();
            setPhase("TIMED_OUT");
            return 0;
          }
          return previous - 1;
        });
      }, 1000);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not build a drill card.",
      );
    }
  };

  const pickStory = (story_id: string): void => {
    clearTimer();
    setPickedStoryId(story_id);
    setPhase("ANSWERED");
  };

  const is_correct =
    picked_story_id !== null &&
    (card?.matching_story_ids.includes(picked_story_id) ?? false);

  return (
    <Card>
      <CardHeader
        title="Recall drill"
        hint="Four seconds. Which of your stories answers this?"
        trailing={
          <Button
            tone="secondary"
            size="small"
            onClick={() => void startDrill()}
            disabled={!has_stories || phase === "RUNNING"}
          >
            {card ? "Next card" : "Start"}
          </Button>
        }
      />

      <div className="px-5 py-5">
        {!has_stories ? (
          <p className="text-xs text-ink-faint">
            Add a story or two first — the drill needs something to reach for.
          </p>
        ) : !card ? (
          <p className="text-xs text-ink-faint">
            A question flashes, a countdown starts, and you pick the story. That
            is the whole exercise.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <p className="text-base font-medium leading-snug text-ink">
                {card.question_text}
              </p>
              <span
                className={clsx(
                  "tabular shrink-0 font-mono text-2xl font-semibold",
                  phase === "RUNNING" && seconds_left <= 2
                    ? "text-poor"
                    : "text-ink-faint",
                )}
              >
                {phase === "RUNNING" ? seconds_left : "—"}
              </span>
            </div>

            <ul className="grid gap-2 sm:grid-cols-2">
              {card.story_options.map((option) => {
                const is_a_match = card.matching_story_ids.includes(
                  option.story_id,
                );
                const is_picked = option.story_id === picked_story_id;
                const should_reveal = phase === "ANSWERED" || phase === "TIMED_OUT";

                return (
                  <li key={option.story_id}>
                    <button
                      disabled={phase !== "RUNNING"}
                      onClick={() => pickStory(option.story_id)}
                      className={clsx(
                        "w-full rounded-lg border px-3 py-2.5 text-left text-xs transition-colors",
                        "disabled:cursor-default",
                        should_reveal && is_a_match
                          ? "border-good bg-good-soft text-good"
                          : should_reveal && is_picked
                            ? "border-poor bg-poor-soft text-poor"
                            : "border-line text-ink hover:border-line-strong",
                      )}
                    >
                      {option.title}
                    </button>
                  </li>
                );
              })}
            </ul>

            {phase === "ANSWERED" ? (
              <p
                className={clsx(
                  "text-xs font-medium",
                  is_correct ? "text-good" : "text-poor",
                )}
              >
                {is_correct
                  ? "That is the one. Say it that fast in the room."
                  : "Not the strongest fit — the highlighted story covers this better."}
              </p>
            ) : null}

            {phase === "TIMED_OUT" ? (
              <p className="text-xs font-medium text-watch">
                Out of time. That hesitation is exactly what costs you the
                opening thirty seconds of an answer.
              </p>
            ) : null}

            {card.matching_story_ids.length === 0 &&
            (phase === "ANSWERED" || phase === "TIMED_OUT") ? (
              <p className="text-[11px] text-ink-faint">
                None of your stories is tagged for this question yet. Themes come
                from the extraction step, which is awaiting an AI provider.
              </p>
            ) : null}
          </div>
        )}

        {error_message ? (
          <p className="mt-3 text-xs text-poor">{error_message}</p>
        ) : null}
      </div>
    </Card>
  );
}
