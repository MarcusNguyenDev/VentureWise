"use client";

import { useState } from "react";

import type { QualificationLevel, VisaStatus } from "@/lib/api/api_contracts";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";

/**
 * Visas are named by subclass number because that is how Australian recruiters
 * and HR systems refer to them — a candidate who says "485" sounds like they
 * understand their own situation, which is most of what this question tests.
 */
const VISA_STATUS_OPTIONS: { value: VisaStatus; label: string }[] = [
  { value: "STUDENT_500_STUDYING", label: "Student visa (500) — still studying" },
  { value: "STUDENT_500_COMPLETED", label: "Student visa (500) — course finished" },
  {
    value: "GRADUATE_485_POST_HIGHER_EDUCATION",
    label: "Temporary Graduate (485) — Post-Higher Education",
  },
  {
    value: "GRADUATE_485_POST_VOCATIONAL",
    label: "Temporary Graduate (485) — Post-Vocational",
  },
  { value: "BRIDGING_VISA", label: "Bridging visa, with work rights" },
  { value: "SKILLS_IN_DEMAND_482", label: "Skills in Demand (482) — already sponsored" },
  { value: "PERMANENT_WORK_RIGHTS", label: "Citizen, PR, or NZ citizen" },
];

/**
 * Australia has no STEM designation. What sets the Temporary Graduate visa
 * length is the level of the qualification, so that is what gets asked.
 */
const QUALIFICATION_OPTIONS: {
  value: QualificationLevel;
  label: string;
  hint: string;
}[] = [
  { value: "VOCATIONAL", label: "VET / diploma", hint: "18 months" },
  { value: "BACHELOR", label: "Bachelor degree", hint: "2 years" },
  { value: "MASTERS_COURSEWORK", label: "Masters (coursework)", hint: "2 years" },
  { value: "MASTERS_RESEARCH", label: "Masters (research)", hint: "3 years" },
  { value: "DOCTORAL", label: "Doctorate", hint: "3 years" },
];

/** Statuses whose timeline is anchored on a date the candidate must supply. */
const DATED_STATUSES: VisaStatus[] = [
  "STUDENT_500_COMPLETED",
  "GRADUATE_485_POST_HIGHER_EDUCATION",
  "GRADUATE_485_POST_VOCATIONAL",
  "BRIDGING_VISA",
];

const STATUSES_NEEDING_QUALIFICATION: VisaStatus[] = [
  "STUDENT_500_STUDYING",
  "STUDENT_500_COMPLETED",
  "GRADUATE_485_POST_HIGHER_EDUCATION",
  "GRADUATE_485_POST_VOCATIONAL",
  "BRIDGING_VISA",
];

export interface StatusFormValues {
  visa_status: VisaStatus;
  qualification_level: QualificationLevel;
  graduate_visa_start_date?: string;
  course_completion_date?: string;
  is_regional_study: boolean;
  employer_name?: string;
}

export function StatusForm({
  onSubmit,
  is_submitting,
}: {
  onSubmit: (values: StatusFormValues) => void;
  is_submitting: boolean;
}) {
  const [visa_status, setVisaStatus] = useState<VisaStatus>(
    "STUDENT_500_STUDYING",
  );
  const [qualification_level, setQualificationLevel] =
    useState<QualificationLevel>("MASTERS_COURSEWORK");
  const [graduate_visa_start_date, setGraduateVisaStartDate] = useState("");
  const [course_completion_date, setCourseCompletionDate] = useState("");
  const [is_regional_study, setIsRegionalStudy] = useState(false);
  const [employer_name, setEmployerName] = useState("");

  const needs_a_date = DATED_STATUSES.includes(visa_status);
  const needs_qualification =
    STATUSES_NEEDING_QUALIFICATION.includes(visa_status);

  const has_required_date =
    !needs_a_date ||
    graduate_visa_start_date.length > 0 ||
    course_completion_date.length > 0;

  return (
    <Card>
      <CardHeader
        title="Your visa, once"
        hint="Entered here, never stored against an account. The arithmetic below is the part people get wrong live in the room."
      />

      <div className="space-y-4 px-5 py-5">
        <label className="block">
          <span className="text-xs font-medium text-ink">Current visa</span>
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

        {needs_qualification ? (
          <label className="block">
            <span className="block text-xs font-medium text-ink">
              What you studied
            </span>
            <select
              value={qualification_level}
              onChange={(event) =>
                setQualificationLevel(event.target.value as QualificationLevel)
              }
              className="mt-1.5 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
            >
              {QUALIFICATION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} — {option.hint} on a 485
                </option>
              ))}
            </select>
            <span className="mt-1 block text-[11px] text-ink-faint">
              Australia has no STEM list. The Temporary Graduate visa length
              comes from the level of your qualification.
            </span>
          </label>
        ) : null}

        {needs_a_date ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="block text-xs font-medium text-ink">
                485 start date
              </span>
              <input
                type="date"
                value={graduate_visa_start_date}
                onChange={(event) =>
                  setGraduateVisaStartDate(event.target.value)
                }
                className="mt-1.5 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
              />
              <span className="mt-1 block text-[11px] text-ink-faint">
                If it has been granted.
              </span>
            </label>

            <label className="block">
              <span className="block text-xs font-medium text-ink">
                Course completion
              </span>
              <input
                type="date"
                value={course_completion_date}
                onChange={(event) => setCourseCompletionDate(event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
              />
              <span className="mt-1 block text-[11px] text-ink-faint">
                Used when the 485 is not granted yet.
              </span>
            </label>
          </div>
        ) : null}

        {needs_qualification ? (
          <label className="flex items-start gap-2.5">
            <input
              type="checkbox"
              checked={is_regional_study}
              onChange={(event) => setIsRegionalStudy(event.target.checked)}
              className="mt-0.5 size-4 accent-[var(--accent)]"
            />
            <span className="text-xs leading-relaxed text-ink">
              I studied at a regional campus
              <span className="block text-ink-faint">
                Regional study can support a second Temporary Graduate visa. It
                is a separate application, not an automatic extension.
              </span>
            </span>
          </label>
        ) : null}

        <label className="block max-w-xs">
          <span className="text-xs font-medium text-ink">
            Employer you are interviewing with
          </span>
          <input
            value={employer_name}
            onChange={(event) => setEmployerName(event.target.value)}
            placeholder="Atlassian"
            className="mt-1.5 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
          />
        </label>

        <Button
          size="large"
          disabled={!has_required_date || is_submitting}
          onClick={() =>
            onSubmit({
              visa_status,
              qualification_level,
              graduate_visa_start_date: graduate_visa_start_date || undefined,
              course_completion_date: course_completion_date || undefined,
              is_regional_study,
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
