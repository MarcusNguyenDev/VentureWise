"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { api_client } from "@/lib/api/api_client";
import { AppShell } from "@/components/layout/app_shell";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import type { CareerTrack } from "@/lib/practice/career_tracks.const";
import { CareerTrackPicker } from "@/components/setup/career_track_picker";
import { DocumentField } from "@/components/setup/document_field";

/**
 * The setup screen. Resume and job posting in, a session out.
 *
 * The sample content is one button away because the demo opens here, and
 * pasting two documents on stage is thirty seconds nobody wants to watch.
 */
export default function SetupPage() {
  const router = useRouter();

  const [resume_text, setResumeText] = useState("");
  const [job_posting_text, setJobPostingText] = useState("");
  const [employer_name, setEmployerName] = useState("");
  const [first_language, setFirstLanguage] = useState("");
  const [selected_track_id, setSelectedTrackId] = useState<string | null>(null);
  const [is_starting, setIsStarting] = useState(false);
  const [error_message, setErrorMessage] = useState<string | null>(null);

  const canStart =
    resume_text.trim().length > 0 && job_posting_text.trim().length > 0;

  const loadCareerTrack = (track: CareerTrack): void => {
    setResumeText(track.resume_text);
    setJobPostingText(track.job_posting_text);
    setEmployerName(track.employer_name);
    setSelectedTrackId(track.track_id);
  };

  const startSession = async (): Promise<void> => {
    setIsStarting(true);
    setErrorMessage(null);

    try {
      const session = await api_client.createSession({
        resume_text,
        job_posting_text,
        employer_name: employer_name.trim() || undefined,
        first_language: first_language.trim() || undefined,
      });

      router.push(`/practice/${session.session_id}`);
    } catch (error) {
      setIsStarting(false);
      setErrorMessage(
        error instanceof Error ? error.message : "Could not start a session.",
      );
    }
  };

  return (
    <AppShell navigation_links={[{ href: "/sponsorship", label: "Sponsorship drill" }]}>
      <div className="mx-auto w-full max-w-4xl px-6 py-14">
        <h1 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
          Every interview coach on the market was built for someone who grew up
          in Australia.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-muted">
          VentureWise measures the three things a general-purpose coach
          structurally cannot: whether you claim your own work instead of
          crediting the group, whether your delivery is graded fairly rather
          than penalised for an accent, and whether you can answer the
          work-rights question in under twenty seconds. Written for
          international students — with the notes that only matter if you did
          not grow up interviewing here.
        </p>

        <Card className="mt-10">
          <CardHeader
            title="Start a session"
            hint="Nothing is stored against an account — there are no accounts. Session state lives for twelve hours and then it is gone."
          />

          <div className="space-y-5 px-5 py-5">
            <CareerTrackPicker
              selected_track_id={selected_track_id}
              onSelect={loadCareerTrack}
            />

            <hr className="border-line" />
            <DocumentField
              label="Your CV"
              placeholder="Paste the plain text of your CV, or drop a PDF here."
              value={resume_text}
              onChange={(text) => {
                setResumeText(text);
                setSelectedTrackId(null);
              }}
            />

            <DocumentField
              label="The job posting"
              placeholder="Paste the posting you are actually applying to, or drop a PDF here."
              value={job_posting_text}
              onChange={(text) => {
                setJobPostingText(text);
                setSelectedTrackId(null);
              }}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="block text-xs font-medium text-ink">
                  Employer name
                </span>
                <input
                  value={employer_name}
                  onChange={(event) => setEmployerName(event.target.value)}
                  placeholder="Atlassian"
                  className="mt-1.5 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
                />
                <span className="mt-1 block text-[11px] text-ink-faint">
                  Used to look up sponsorship history.
                </span>
              </label>

              <label className="block">
                <span className="block text-xs font-medium text-ink">
                  First language{" "}
                  <span className="text-ink-faint">— optional</span>
                </span>
                <input
                  value={first_language}
                  onChange={(event) => setFirstLanguage(event.target.value)}
                  placeholder="Vietnamese, Mandarin, Hindi…"
                  className="mt-1.5 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
                />
                <span className="mt-1 block text-[11px] text-ink-faint">
                  Sharpens the coaching. We ask rather than guess it from how
                  you speak.
                </span>
              </label>
            </div>

            {error_message ? (
              <p className="rounded-lg border border-poor/40 bg-poor-soft px-3 py-2 text-xs text-poor">
                {error_message}
              </p>
            ) : null}

            <div className="flex items-center gap-3">
              <Button
                size="large"
                onClick={startSession}
                disabled={!canStart || is_starting}
              >
                {is_starting ? "Starting…" : "Start practising"}
              </Button>
              <span className="text-xs text-ink-faint">
                Or go straight to the{" "}
                <a href="/sponsorship" className="text-accent underline">
                  sponsorship drill
                </a>{" "}
                — it needs no session.
              </span>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
