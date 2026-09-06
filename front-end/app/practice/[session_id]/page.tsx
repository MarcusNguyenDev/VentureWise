"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

import { api_client } from "@/lib/api/api_client";
import type { BehaviouralQuestion, InterviewPlan } from "@/lib/api/api_contracts";
import { buildAudioDeliveryMetrics } from "@/lib/audio/audio_delivery_metrics.util";
import { useSpeechAudio } from "@/lib/audio/use_speech_audio";
import { usePracticeSession } from "@/lib/practice/use_practice_session";
import { estimateComposure } from "@/lib/vision/composure_estimate.util";
import { BLENDSHAPE_LABEL } from "@/lib/vision/micro_expression.util";
import { useCameraPresence } from "@/lib/vision/use_camera_presence";
import type { TranscriptSourceKind } from "@/lib/speech/transcript_source.type";
import { AppShell } from "@/components/layout/app_shell";
import { AnswerReviewView } from "@/components/practice/answer_review_view";
import { CameraPanel } from "@/components/practice/camera_panel";
import { InterviewPlanView } from "@/components/practice/interview_plan_view";
import { QuestionPicker } from "@/components/practice/question_picker";
import { RightRail } from "@/components/practice/right_rail";
import { TranscriptPane } from "@/components/practice/transcript_pane";
import { Button } from "@/components/ui/button";

/**
 * The screen the whole pitch rests on.
 *
 * IDLE shows the three-round plan and the question picker. RECORDING is the
 * transcript pane with the right rail moving beside it. REVIEWED is the
 * rewrite diff.
 */
export default function PracticePage({
  params,
}: PageProps<"/practice/[session_id]">) {
  const { session_id } = use(params);
  const router = useRouter();

  const { state, startAnswer, stopAnswer, resetToIdle } =
    usePracticeSession(session_id);

  const {
    video_ref,
    camera_state,
    presence,
    expression_activity,
    error_message: camera_error_message,
    startCamera,
    stopCamera,
    resetWindow: resetPresenceWindow,
    captureAnswerSummary,
  } = useCameraPresence();

  const {
    snapshot: audio_snapshot,
    startListening,
    stopListening,
    resetAudioWindow,
  } = useSpeechAudio();

  const [questions, setQuestions] = useState<BehaviouralQuestion[]>([]);
  const [plan, setPlan] = useState<InterviewPlan | null>(null);
  const [active_question, setActiveQuestion] =
    useState<BehaviouralQuestion | null>(null);
  const [load_error, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let is_mounted = true;

    void (async () => {
      try {
        const [loaded_questions, loaded_plan] = await Promise.all([
          api_client.listQuestions(),
          api_client.buildInterviewPlan(session_id),
        ]);

        if (!is_mounted) return;
        setQuestions(loaded_questions);
        setPlan(loaded_plan);
      } catch (error) {
        if (!is_mounted) return;
        setLoadError(
          error instanceof Error ? error.message : "Could not load the session.",
        );
      }
    })();

    return () => {
      is_mounted = false;
    };
  }, [session_id]);

  const MINIMUM_WORDS_FOR_FILLER_DENSITY = 25;

  const word_count = (state.transcript_text.match(/\S+/g) ?? []).length;
  const audio_metrics = buildAudioDeliveryMetrics(audio_snapshot, word_count);

  const composure = estimateComposure(
    presence,
    expression_activity,
    state.snapshot.fillers.fillers_per_hundred_words,
    (state.transcript_text.match(/\S+/g) ?? []).length >=
      MINIMUM_WORDS_FOR_FILLER_DENSITY,
  );

  /**
   * Takes the whole-answer camera reading and hands it to the review.
   *
   * Recomputed here rather than reusing the live estimate: the rail shows the
   * last twenty seconds, and a review of the answer should describe the answer.
   */
  const handleStopAndReview = (): void => {
    const summary = captureAnswerSummary();
    const audio_reading = audio_metrics.is_measurable ? audio_metrics : null;

    // Released as soon as the answer ends. A microphone left open after the
    // candidate has stopped talking is both a live indicator light and a
    // recording nobody asked for.
    stopListening();

    if (!summary) {
      void stopAnswer(undefined, audio_reading);
      return;
    }

    const answer_composure = estimateComposure(
      summary.presence,
      summary.expression_activity,
      state.snapshot.fillers.fillers_per_hundred_words,
      (state.transcript_text.match(/\S+/g) ?? []).length >=
        MINIMUM_WORDS_FOR_FILLER_DENSITY,
    );

    void stopAnswer(
      {
        face_visible_fraction: summary.presence.face_visible_fraction,
        facing_camera_fraction: summary.presence.facing_camera_fraction,
        gaze_steadiness: summary.presence.gaze_steadiness,
        head_steadiness: summary.presence.head_steadiness,
        blinks_per_minute: summary.presence.blinks_per_minute,
        expression_transients_per_minute:
          summary.expression_activity.transients_per_minute,
        most_active_movements: summary.expression_activity.most_active.map(
          (item) => BLENDSHAPE_LABEL[item.blendshape],
        ),
        band: answer_composure.band,
        score: answer_composure.score,
        is_measurable:
          summary.presence.is_measurable ||
          summary.expression_activity.is_measurable,
      },
      audio_reading,
    );
  };

  const handleStart = (
    question: BehaviouralQuestion,
    source_kind: TranscriptSourceKind,
    canned_script?: string,
  ): void => {
    setActiveQuestion(question);
    // Each take gets a fresh window, so take two is not judged on take one.
    resetPresenceWindow();
    resetAudioWindow();

    // Only the microphone path has audio to measure; a canned replay has none.
    if (source_kind === "MICROPHONE") void startListening();

    void startAnswer(question, source_kind, canned_script);
  };

  const navigation_links = [
    { href: `/practice/${session_id}`, label: "Practice" },
    { href: `/stories/${session_id}`, label: "Story bank" },
    { href: "/sponsorship", label: "Sponsorship drill" },
  ];

  if (load_error) {
    return (
      <AppShell navigation_links={navigation_links}>
        <div className="mx-auto w-full max-w-md px-6 py-24 text-center">
          <p className="text-sm font-medium text-poor">{load_error}</p>
          <p className="mt-2 text-xs text-ink-muted">
            The session may have expired. Sessions live for twelve hours.
          </p>
          <Button tone="secondary" size="small" className="mt-5" onClick={() => router.push("/")}>
            Start a new session
          </Button>
        </div>
      </AppShell>
    );
  }

  if (state.phase === "RECORDING" || state.phase === "REVIEWING") {
    return (
      <AppShell navigation_links={navigation_links}>
        <div className="flex min-h-0 flex-1">
          <CameraPanel
            video_ref={video_ref}
            camera_state={camera_state}
            error_message={camera_error_message}
            onStartCamera={() => void startCamera()}
            onStopCamera={stopCamera}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <TranscriptPane
              transcript_text={state.transcript_text}
              snapshot={state.snapshot}
              is_recording={state.phase === "RECORDING"}
              question_text={active_question?.question_text ?? ""}
            />

            <div className="flex items-center gap-4 border-t border-line px-6 py-4">
              <Button
                tone={state.phase === "REVIEWING" ? "secondary" : "danger"}
                onClick={handleStopAndReview}
                disabled={state.phase === "REVIEWING"}
              >
                {state.phase === "REVIEWING" ? "Building review…" : "Stop and review"}
              </Button>

              {state.take_number > 1 ? (
                <span className="text-xs text-ink-faint">
                  Take {state.take_number}
                </span>
              ) : null}

              {state.error_message ? (
                <span className="text-xs text-poor">{state.error_message}</span>
              ) : null}
            </div>
          </div>

          <RightRail
            snapshot={state.snapshot}
            progress={state.progress}
            nudge_text={state.nudge_text}
            elapsed_ms={state.elapsed_ms}
            is_recording={state.phase === "RECORDING"}
            composure={composure}
            presence={presence}
            expression_activity={expression_activity}
            audio_metrics={audio_metrics}
          />
        </div>
      </AppShell>
    );
  }

  // A failed review leaves `review` null. Without this branch the page would
  // fall through to the question picker and silently swallow the reason.
  if (state.phase === "REVIEWED" && !state.review) {
    return (
      <AppShell navigation_links={navigation_links}>
        <div className="mx-auto w-full max-w-md px-6 py-24 text-center">
          <p className="text-sm font-medium text-poor">
            The review could not be built.
          </p>
          <p className="mt-2 text-xs leading-relaxed text-ink-muted">
            {state.error_message ??
              "The API did not return a review for this answer."}
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Button tone="secondary" size="small" onClick={resetToIdle}>
              Back to questions
            </Button>
            <Button
              size="small"
              onClick={() => {
                if (!active_question) return;
                void startAnswer(active_question, "MICROPHONE");
              }}
            >
              Try again
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  if (state.phase === "REVIEWED" && state.review) {
    return (
      <AppShell navigation_links={navigation_links}>
        <AnswerReviewView
          review={state.review}
          onTakeAgain={() => {
            if (!active_question) return;
            void startAnswer(active_question, "MICROPHONE");
          }}
          onPickAnotherQuestion={resetToIdle}
        />
      </AppShell>
    );
  }

  return (
    <AppShell navigation_links={navigation_links}>
      {plan ? <InterviewPlanView plan={plan} /> : null}
      <QuestionPicker questions={questions} onStart={handleStart} />
    </AppShell>
  );
}
