"use client";

import { use, useCallback, useEffect, useState } from "react";

import { api_client } from "@/lib/api/api_client";
import type { BehaviouralQuestion, Story } from "@/lib/api/api_contracts";
import { AppShell } from "@/components/layout/app_shell";
import { RecallDrill } from "@/components/stories/recall_drill";
import { StoryCard } from "@/components/stories/story_card";
import { StoryComposer } from "@/components/stories/story_composer";

/**
 * F-04. The story bank is the account — it is why somebody opens this again
 * next week — even though there are no accounts.
 */
export default function StoryBankPage({
  params,
}: PageProps<"/stories/[session_id]">) {
  const { session_id } = use(params);

  const [stories, setStories] = useState<Story[]>([]);
  const [questions, setQuestions] = useState<BehaviouralQuestion[]>([]);
  const [is_adding, setIsAdding] = useState(false);
  const [error_message, setErrorMessage] = useState<string | null>(null);

  const loadStories = useCallback(async () => {
    try {
      setStories(await api_client.listStories(session_id));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not load your stories.",
      );
    }
  }, [session_id]);

  useEffect(() => {
    void (async () => {
      await loadStories();

      try {
        setQuestions(await api_client.listQuestions());
      } catch {
        // The recall drill needs questions; the story list does not.
      }
    })();
  }, [loadStories]);

  const addStory = async (input: {
    raw_memory_text: string;
    source_language?: string;
  }): Promise<void> => {
    setIsAdding(true);
    setErrorMessage(null);

    try {
      await api_client.addStory(session_id, input);
      await loadStories();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not save that story.",
      );
    } finally {
      setIsAdding(false);
    }
  };

  const deleteStory = async (story_id: string): Promise<void> => {
    try {
      await api_client.deleteStory(session_id, story_id);
      await loadStories();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not delete that story.",
      );
    }
  };

  return (
    <AppShell
      navigation_links={[
        { href: `/practice/${session_id}`, label: "Practice" },
        { href: `/stories/${session_id}`, label: "Story bank" },
        { href: "/sponsorship", label: "Sponsorship drill" },
      ]}
    >
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Story bank
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
          You cannot retrieve a story under pressure in a second language if you
          have never written it down in your first. Dump it messily here; the
          drill teaches you to reach it fast.
        </p>

        {error_message ? (
          <p className="mt-5 rounded-lg border border-poor/40 bg-poor-soft px-3 py-2 text-xs text-poor">
            {error_message}
          </p>
        ) : null}

        <div className="mt-8 grid gap-5 lg:grid-cols-[420px_1fr]">
          <div className="space-y-5">
            <StoryComposer onAdd={addStory} is_adding={is_adding} />
            <RecallDrill
              session_id={session_id}
              questions={questions}
              has_stories={stories.length > 0}
            />
          </div>

          <div className="space-y-4">
            {stories.length === 0 ? (
              <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-line px-6">
                <p className="max-w-xs text-center text-xs leading-relaxed text-ink-faint">
                  Nothing here yet. Seven stories is enough to cover most
                  behavioural interviews.
                </p>
              </div>
            ) : (
              stories.map((story) => (
                <StoryCard
                  key={story.story_id}
                  story={story}
                  onDelete={(story_id) => void deleteStory(story_id)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
