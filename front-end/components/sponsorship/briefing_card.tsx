import type { SponsorshipBriefing } from "@/lib/api/api_contracts";
import { Card, CardHeader } from "@/components/ui/card";

/**
 * The timeline arithmetic and the assembled answer.
 *
 * When the cited filing count has not been verified against a primary source,
 * that is said loudly — the candidate is about to repeat this number to a
 * recruiter who may well know it.
 */
export function BriefingCard({ briefing }: { briefing: SponsorshipBriefing }) {
  const { timeline, answer } = briefing;

  return (
    <Card>
      <CardHeader
        title="Field 19a"
        hint="Will you now or in the future require sponsorship to work in the United States?"
      />

      <div className="space-y-5 px-5 py-5">
        <div className="rounded-lg border border-line bg-surface-sunken p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
            Your timeline
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink">
            {timeline.summary_line}
          </p>

          {timeline.first_h1b_registration_date ? (
            <p className="mt-2 text-xs text-ink-muted">
              First realistic H-1B cap registration:{" "}
              <span className="font-medium text-ink">
                {new Date(timeline.first_h1b_registration_date).toLocaleDateString(
                  "en-US",
                  { month: "long", year: "numeric" },
                )}
              </span>
              , with employment starting{" "}
              {timeline.first_h1b_employment_start_date
                ? new Date(
                    timeline.first_h1b_employment_start_date,
                  ).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })
                : "that October"}
              .
            </p>
          ) : null}
        </div>

        <div>
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
              Say this
            </p>
            <p className="tabular font-mono text-xs text-ink-muted">
              ≈{answer.estimated_spoken_seconds}s spoken
            </p>
          </div>

          <blockquote className="border-l-2 border-accent pl-4">
            {answer.sentences.map((sentence, index) => (
              <p
                key={index}
                className="text-base leading-relaxed text-ink [&+&]:mt-2"
              >
                {sentence}
              </p>
            ))}
          </blockquote>

          {answer.estimated_spoken_seconds > 20 ? (
            <p className="mt-3 rounded-lg border border-watch/40 bg-watch-soft px-3 py-2 text-xs text-watch">
              That is over the twenty-second target. Cut the H-1B planning
              sentence first — it is the one they did not ask for.
            </p>
          ) : null}
        </div>

        {answer.must_verify_before_use && answer.cited_employer ? (
          <div className="rounded-lg border border-poor/40 bg-poor-soft px-3 py-3">
            <p className="text-xs font-semibold text-poor">
              Verify this number before you say it
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-ink">
              The filing count for {answer.cited_employer.employer_name} in this
              build is unverified sample data. Check it against the USCIS H-1B
              Employer Data Hub before you put it in a real interview — a
              recruiter may well know the real figure.
            </p>
          </div>
        ) : null}

        <p className="text-[11px] leading-relaxed text-ink-faint">
          {briefing.disclaimer}
        </p>
      </div>
    </Card>
  );
}
