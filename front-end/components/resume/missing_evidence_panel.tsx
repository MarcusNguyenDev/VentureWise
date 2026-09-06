import type { MissingEvidence } from "@/lib/api/api_contracts";

/**
 * The gap between the posting and the CV.
 *
 * Deliberately the first thing on the page and the only section given hero
 * treatment. Everything else in the review makes an existing CV read better;
 * this is the only part that says what is missing — which is the thing that
 * decides whether the application goes anywhere, and the only part a candidate
 * cannot work out for themselves by re-reading their own document.
 */
export function MissingEvidencePanel({
  missing_evidence,
}: {
  missing_evidence: MissingEvidence[];
}) {
  return (
    <section className="overflow-hidden rounded-xl border-2 border-accent bg-surface">
      <header className="border-b border-accent/30 bg-accent-soft px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold tracking-tight text-ink">
            What this posting asks for that your CV does not show
          </h2>
          <span className="tabular shrink-0 rounded-full bg-accent px-2.5 py-1 font-mono text-xs font-bold text-accent-ink">
            {missing_evidence.length}
          </span>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
          Start here. Everything below makes the CV you have read better — this
          is what it is missing, ordered by what it costs you.
        </p>
      </header>

      <ol className="divide-y divide-line">
        {missing_evidence.map((gap, index) => (
          <li key={gap.requirement} className="flex gap-4 px-5 py-4">
            <span
              aria-hidden
              className="tabular mt-0.5 shrink-0 font-mono text-sm font-semibold text-accent"
            >
              {String(index + 1).padStart(2, "0")}
            </span>

            <div className="min-w-0">
              <p className="text-sm font-semibold leading-snug text-ink">
                {gap.requirement}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                {gap.why_missing}
              </p>
              <p className="mt-1.5 flex gap-1.5 text-xs leading-relaxed text-good">
                <span aria-hidden className="shrink-0">
                  →
                </span>
                {gap.what_would_fix_it}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
