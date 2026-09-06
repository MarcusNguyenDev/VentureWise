"use client";

import { useState } from "react";

import { api_client } from "@/lib/api/api_client";
import type { ResumeReview } from "@/lib/api/api_contracts";
import type { CareerTrack } from "@/lib/practice/career_tracks.const";
import { AppShell } from "@/components/layout/app_shell";
import { ResumeReviewResult } from "@/components/resume/resume_review_result";
import { CareerTrackPicker } from "@/components/setup/career_track_picker";
import { DocumentField } from "@/components/setup/document_field";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";

/** Enough text to be a CV rather than a fragment. Matches the API's rule. */
const MINIMUM_RESUME_CHARACTERS = 100;

export default function CvReviewPage() {
  const [resume_text, setResumeText] = useState("");
  const [job_posting_text, setJobPostingText] = useState("");
  const [has_embedded_image, setHasEmbeddedImage] = useState(false);
  const [selected_track_id, setSelectedTrackId] = useState<string | null>(null);
  const [review, setReview] = useState<ResumeReview | null>(null);
  const [is_reviewing, setIsReviewing] = useState(false);
  const [error_message, setErrorMessage] = useState<string | null>(null);

  const can_review = resume_text.trim().length >= MINIMUM_RESUME_CHARACTERS;

  /**
   * Loads the first-draft CV rather than the polished one.
   *
   * The polished versions have already had these problems fixed, so reviewing
   * one returns almost nothing. The draft is also the realistic starting
   * point: a photo, a date of birth and an objective statement are not
   * mistakes, they are what a good CV looks like in most of the world.
   */
  const loadCareerTrack = (track: CareerTrack): void => {
    setResumeText(track.first_draft_resume_text);
    setJobPostingText(track.job_posting_text);
    setSelectedTrackId(track.track_id);
    // A pasted sample carries no PDF, so the photo check must not claim one.
    setHasEmbeddedImage(false);
    setReview(null);
  };

  const requestReview = async (): Promise<void> => {
    setIsReviewing(true);
    setErrorMessage(null);

    try {
      setReview(
        await api_client.reviewResume({
          resume_text,
          job_posting_text: job_posting_text.trim() || undefined,
          has_embedded_image,
        }),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not review that CV.",
      );
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <AppShell
      navigation_links={[
        { href: "/", label: "Setup" },
        { href: "/cv-review", label: "CV review" },
        { href: "/sponsorship", label: "Sponsorship drill" },
      ]}
    >
      <div className="mx-auto w-full max-w-4xl px-6 py-10">
        <h1 className="max-w-2xl text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Your CV, read the way an Australian employer reads it.
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">
          Including the conventions nobody tells you about — the ones that are
          standard on a CV in most of the world and quietly cost you the
          shortlist here.
        </p>

        <Card className="mt-8">
          <CardHeader
            title="Your CV"
            hint="Upload the PDF so the photo check can run — it cannot see one in pasted text."
          />
          <div className="space-y-5 px-5 py-5">
            <CareerTrackPicker
              selected_track_id={selected_track_id}
              onSelect={loadCareerTrack}
              heading="Or try a sample"
              note="A realistic first draft, before anyone explained the local conventions"
            />

            <hr className="border-line" />

            <DocumentField
              label="CV"
              placeholder="Paste your CV, or drop the PDF here."
              value={resume_text}
              rows={10}
              onChange={(text) => {
                setResumeText(text);
                setSelectedTrackId(null);
              }}
              onPdfRead={({ has_embedded_image: found }) =>
                setHasEmbeddedImage(found)
              }
            />

            <DocumentField
              label="Job posting"
              hint="Optional. Supplied, the review says what the posting asks for that your CV does not evidence."
              placeholder="Paste the posting, or drop the PDF here."
              value={job_posting_text}
              rows={5}
              onChange={(text) => {
                setJobPostingText(text);
                setSelectedTrackId(null);
              }}
            />

            {error_message ? (
              <p className="rounded-lg border border-poor/40 bg-poor-soft px-3 py-2 text-xs text-poor">
                {error_message}
              </p>
            ) : null}

            <Button
              size="large"
              onClick={() => void requestReview()}
              disabled={!can_review || is_reviewing}
            >
              {is_reviewing ? "Reading it…" : "Review my CV"}
            </Button>
          </div>
        </Card>

        {review ? (
          <div className="mt-6">
            <ResumeReviewResult
              review={review}
              has_job_posting={job_posting_text.trim().length > 0}
            />
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
