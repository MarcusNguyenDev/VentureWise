"use client";

import { useState } from "react";

import { api_client } from "@/lib/api/api_client";
import type { SponsorshipBriefing } from "@/lib/api/api_contracts";
import { AppShell } from "@/components/layout/app_shell";
import { BriefingCard } from "@/components/sponsorship/briefing_card";
import { DrillPanel } from "@/components/sponsorship/drill_panel";
import {
  StatusForm,
  type StatusFormValues,
} from "@/components/sponsorship/status_form";

/**
 * F-02, standing on its own route.
 *
 * Zero dependency on the ASR pipeline or on a practice session, which is what
 * makes it the fallback demo if the audio stack collapses on stage.
 */
export default function SponsorshipPage() {
  const [briefing, setBriefing] = useState<SponsorshipBriefing | null>(null);
  const [is_submitting, setIsSubmitting] = useState(false);
  const [error_message, setErrorMessage] = useState<string | null>(null);

  const buildBriefing = async (values: StatusFormValues): Promise<void> => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      setBriefing(await api_client.buildSponsorshipBriefing(values));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not build the answer.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell navigation_links={[{ href: "/", label: "Setup" }]}>
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <h1 className="max-w-2xl text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          The one question that ends interviews.
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">
          Nobody rehearses it, and the whole internet&rsquo;s advice is
          &ldquo;answer honestly and confidently.&rdquo; Here is the answer with
          the arithmetic already done, and thirty seconds to get it under twenty.
        </p>

        {error_message ? (
          <p className="mt-6 rounded-lg border border-poor/40 bg-poor-soft px-3 py-2 text-xs text-poor">
            {error_message}
          </p>
        ) : null}

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <div className="space-y-5">
            <StatusForm onSubmit={buildBriefing} is_submitting={is_submitting} />
            {briefing ? <DrillPanel /> : null}
          </div>

          <div>
            {briefing ? (
              <BriefingCard briefing={briefing} />
            ) : (
              <div className="flex h-full min-h-[240px] items-center justify-center rounded-xl border border-dashed border-line px-6">
                <p className="max-w-xs text-center text-xs leading-relaxed text-ink-faint">
                  Fill in your status and the answer appears here, with the
                  timeline arithmetic done and the filing history for the
                  employer attached.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
