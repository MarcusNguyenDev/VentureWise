"use client";

import { useState } from "react";

import type { VisaStatus } from "@/lib/api/api_contracts";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";

const VISA_STATUS_OPTIONS: { value: VisaStatus; label: string }[] = [
  { value: "F1_BEFORE_OPT", label: "F-1, studying — OPT not started" },
  { value: "F1_ON_CPT", label: "F-1, working on CPT" },
  { value: "F1_ON_OPT", label: "F-1, on post-completion OPT" },
  { value: "F1_ON_STEM_OPT", label: "F-1, on the STEM extension" },
  { value: "J1_ACADEMIC_TRAINING", label: "J-1, academic training" },
  { value: "H1B_HELD", label: "I already hold an H-1B" },
  { value: "PERMANENT_WORK_AUTHORISATION", label: "Citizen or permanent resident" },
];

/** Statuses whose timeline is anchored on a date the candidate has to supply. */
const DATED_STATUSES: VisaStatus[] = [
  "F1_BEFORE_OPT",
  "F1_ON_CPT",
  "F1_ON_OPT",
  "F1_ON_STEM_OPT",
  "J1_ACADEMIC_TRAINING",
];

export interface StatusFormValues {
  visa_status: VisaStatus;
  opt_start_date?: string;
  graduation_date?: string;
  is_stem_designated: boolean;
  employer_name?: string;
}

export function StatusForm({
  onSubmit,
  is_submitting,
}: {
  onSubmit: (values: StatusFormValues) => void;
  is_submitting: boolean;
}) {
  const [visa_status, setVisaStatus] = useState<VisaStatus>("F1_BEFORE_OPT");
  const [opt_start_date, setOptStartDate] = useState("");
  const [graduation_date, setGraduationDate] = useState("");
  const [is_stem_designated, setIsStemDesignated] = useState(true);
  const [employer_name, setEmployerName] = useState("");

  const needs_a_date = DATED_STATUSES.includes(visa_status);
  const has_required_date =
    !needs_a_date || opt_start_date.length > 0 || graduation_date.length > 0;

  return (
    <Card>
      <CardHeader
        title="Your status, once"
        hint="Entered here, never stored against an account. The arithmetic below is the part people get wrong live in the room."
      />

      <div className="space-y-4 px-5 py-5">
        <label className="block">
          <span className="text-xs font-medium text-ink">Current status</span>
          <select
            value={visa_status}
            onChange={(event) => setVisaStatus(event.target.value as VisaStatus)}
            className="mt-1.5 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
          >
            {VISA_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {needs_a_date ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="block text-xs font-medium text-ink">
                OPT start date
              </span>
              <input
                type="date"
                value={opt_start_date}
                onChange={(event) => setOptStartDate(event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
              />
              <span className="mt-1 block text-[11px] text-ink-faint">
                If you already have one.
              </span>
            </label>

            <label className="block">
              <span className="block text-xs font-medium text-ink">
                Graduation date
              </span>
              <input
                type="date"
                value={graduation_date}
                onChange={(event) => setGraduationDate(event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
              />
              <span className="mt-1 block text-[11px] text-ink-faint">
                Used when OPT has no date yet.
              </span>
            </label>
          </div>
        ) : null}

        <label className="flex items-start gap-2.5">
          <input
            type="checkbox"
            checked={is_stem_designated}
            onChange={(event) => setIsStemDesignated(event.target.checked)}
            className="mt-0.5 size-4 accent-[var(--accent)]"
          />
          <span className="text-xs leading-relaxed text-ink">
            My degree is STEM-designated
            <span className="block text-ink-faint">
              Adds the 24-month extension, but only where the employer is
              enrolled in E-Verify.
            </span>
          </span>
        </label>

        <label className="block max-w-xs">
          <span className="text-xs font-medium text-ink">
            Employer you are interviewing with
          </span>
          <input
            value={employer_name}
            onChange={(event) => setEmployerName(event.target.value)}
            placeholder="Stripe"
            className="mt-1.5 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
          />
        </label>

        <Button
          size="large"
          disabled={!has_required_date || is_submitting}
          onClick={() =>
            onSubmit({
              visa_status,
              opt_start_date: opt_start_date || undefined,
              graduation_date: graduation_date || undefined,
              is_stem_designated,
              employer_name: employer_name.trim() || undefined,
            })
          }
        >
          {is_submitting ? "Working it out…" : "Build my answer"}
        </Button>
      </div>
    </Card>
  );
}
