import type { SponsorshipBriefing } from "@/lib/api/api_contracts";
import { Card, CardHeader } from "@/components/ui/card";

/**
 * The timeline arithmetic and the assembled answer.
 *
 * When the cited sponsorship status has not been verified against a primary
 * source, that is said loudly — the candidate is about to repeat this to a
 * recruiter who works at that company and will know.
 */
export function BriefingCard({ briefing }: { briefing: SponsorshipBriefing }) {
  const { timeline, answer } = briefing;

  return (
    <Card>
      <CardHeader
        title="The work-rights question"
        hint="Do you have full working rights in Australia, or would you need sponsorship?"
      />

      <div className="space-y-5 px-5 py-5">
        <div className="rounded-lg border border-line bg-surface-sunken p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
            Your timeline
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink">
            {timeline.summary_line}
          </p>

          {timeline.is_capped_to_part_time && timeline.hours_per_fortnight_cap ? (
            <p className="mt-2 text-xs text-ink-muted">
              Right now you are capped at{" "}
              <span className="font-medium text-ink">
                {timeline.hours_per_fortnight_cap} hours a fortnight
              </span>{" "}
              while your course is in session, and unlimited during scheduled
              breaks. Say the cap before they ask — it reads as organised.
            </p>
          ) : null}

          {timeline.next_sponsorship_pathway ? (
            <p className="mt-2 text-xs text-ink-muted">
              Next step if it goes well:{" "}
              <span className="font-medium text-ink">
                {timeline.next_sponsorship_pathway}
              </span>
              .
            </p>
          ) : null}

          {timeline.regional_extension_months ? (
            <p className="mt-2 text-xs text-ink-muted">
              Regional study may support a second Temporary Graduate visa of
              about{" "}
              <span className="font-medium text-ink">
                {timeline.regional_extension_months} months
              </span>
              . Separate application, not automatic.
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
              That is over the twenty-second target. Cut the sponsorship-pathway
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
              The sponsorship status for {answer.cited_employer.employer_name} in
              this build is unverified sample data. Check the Home Affairs list
              of approved and accredited sponsors before you put it in a real
              interview — the recruiter works there and will know.
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
