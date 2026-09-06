import type { ResumeReview } from "@/lib/api/api_contracts";
import { Card, CardHeader } from "@/components/ui/card";
import { StubBadge } from "@/components/ui/stub_badge";
import { MissingEvidencePanel } from "./missing_evidence_panel";

/**
 * CV review output.
 *
 * Ordered by what it costs the reader, not by how easy it is to fix.
 * Convention breaches lead because they can remove the CV from consideration
 * before anybody assesses the content — which makes them the most expensive
 * thing on this page and the least likely to already be known.
 */
export function ResumeReviewResult({
  review,
  has_job_posting,
}: {
  review: ResumeReview;
  has_job_posting: boolean;
}) {
  const { conventions, writing, critique } = review;
  const quantified_percent = Math.round(writing.quantified_ratio * 100);

  const tiles = [
    {
      label: "Convention issues",
      value: String(conventions.length),
      is_bad: conventions.length > 0,
    },
    {
      label: "Bullets with a number",
      value: `${quantified_percent}%`,
      is_bad: quantified_percent < 40,
    },
    {
      label: "Duty-style openers",
      value: String(
        writing.duty_openers.reduce(
          (total, finding) => total + finding.occurrences,
          0,
        ),
      ),
      is_bad: writing.duty_openers.length > 0,
    },
    {
      label: "Estimated length",
      value: `${writing.estimated_pages}p`,
      is_bad: writing.estimated_pages <= 1 || writing.estimated_pages >= 4,
    },
  ];

  return (
    <div className="space-y-5">
      {critique.missing_evidence.length > 0 ? (
        <MissingEvidencePanel missing_evidence={critique.missing_evidence} />
      ) : null}

      {!has_job_posting ? (
        <section className="rounded-xl border-2 border-dashed border-line-strong px-5 py-4">
          <p className="text-sm font-semibold text-ink">
            Add the job posting to see what it asks for that your CV does not
            show
          </p>
          <p className="mt-1 text-xs leading-relaxed text-ink-muted">
            It is the most useful thing on this page, and the only part that
            needs the role as well as the CV. Everything below still applies
            without it.
          </p>
        </section>
      ) : null}

      <Card>
        <CardHeader
          title="At a glance"
          trailing={critique.is_stubbed ? <StubBadge /> : undefined}
        />
        <div className="space-y-4 px-5 py-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {tiles.map((tile) => (
              <div
                key={tile.label}
                className="rounded-lg border border-line bg-surface-sunken px-3 py-2.5"
              >
                <p
                  className={`tabular font-mono text-xl font-semibold ${
                    tile.is_bad ? "text-watch" : "text-good"
                  }`}
                >
                  {tile.value}
                </p>
                <p className="mt-0.5 text-[11px] leading-tight text-ink-muted">
                  {tile.label}
                </p>
              </div>
            ))}
          </div>

          <p className="text-sm leading-relaxed text-ink-muted">
            {critique.overall_read}
          </p>
        </div>
      </Card>

      {conventions.length > 0 ? (
        <Card>
          <CardHeader
            title="Australian CV conventions"
            hint="Normal on a CV in much of the world, and costly here. These can remove the document before anybody reads the content."
          />
          <ul className="divide-y divide-line">
            {conventions.map((finding) => (
              <li key={finding.issue} className="px-5 py-4">
                <div className="flex flex-wrap items-baseline gap-2">
                  <p className="text-sm font-semibold text-ink">
                    {finding.headline}
                  </p>
                  {finding.evidence ? (
                    <span className="rounded bg-poor-soft px-1.5 py-0.5 font-mono text-[11px] text-poor">
                      {finding.evidence}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
                  {finding.explanation}
                </p>
                <p className="mt-1.5 text-xs font-medium text-good">
                  {finding.action}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {critique.bullet_rewrites.length > 0 ? (
        <Card>
          <CardHeader
            title="Bullets, rewritten"
            hint="Your lines, reworked. Nothing is invented — where a bullet needs a number it does not have, that is said rather than filled in."
            trailing={critique.is_stubbed ? <StubBadge /> : undefined}
          />
          <ul className="divide-y divide-line">
            {critique.bullet_rewrites.map((rewrite, index) => (
              <li key={index} className="px-5 py-4">
                <p className="text-xs leading-relaxed text-poor line-through decoration-poor/40">
                  {rewrite.original}
                </p>
                <p className="mt-1.5 text-sm font-medium leading-relaxed text-good">
                  {rewrite.rewritten}
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-ink-muted">
                  {rewrite.why}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {review.priorities.length > 0 ? (
        <Card>
          <CardHeader
            title="Everything else, in order of cost"
            hint="Highest cost to the reader first — not easiest to fix first."
          />
          <ol className="divide-y divide-line">
            {review.priorities.map((priority, index) => (
              <li
                key={index}
                className="flex gap-3 px-5 py-3 text-xs leading-relaxed text-ink-muted"
              >
                <span className="tabular shrink-0 font-mono text-ink-faint">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {priority}
              </li>
            ))}
          </ol>
        </Card>
      ) : null}

    </div>
  );
}
