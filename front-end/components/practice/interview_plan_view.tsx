import clsx from "clsx";

import type { InterviewPlan } from "@/lib/api/api_contracts";
import { Card, CardHeader } from "@/components/ui/card";
import { StubBadge } from "@/components/ui/stub_badge";

/**
 * F-06. Three rounds, three personas, and the recruiter opening on work
 * authorisation because that is what actually happens.
 *
 * The spec is clear this is the least interesting thing in the demo, so it
 * renders compactly and does not ask for narration.
 */
export function InterviewPlanView({ plan }: { plan: InterviewPlan }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 pt-8">
      <Card>
        <CardHeader
          title={
            plan.employer_name
              ? `Your three rounds at ${plan.employer_name}`
              : "Your three rounds"
          }
          hint="Built from the posting. Each round has a different persona and a different tolerance for rambling."
          trailing={plan.is_stubbed ? <StubBadge label="Gaps pending AI" /> : undefined}
        />

        <div className="grid divide-y divide-line md:grid-cols-3 md:divide-x md:divide-y-0">
          {plan.rounds.map((round) => (
            <div key={round.round} className="p-5">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-sm font-semibold text-ink">{round.title}</h3>
                <span className="tabular font-mono text-[10px] text-ink-faint">
                  {round.rambling_tolerance_seconds}s
                </span>
              </div>

              <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                {round.interviewer_role}
              </p>

              <p className="mt-2 text-[11px] leading-relaxed text-ink-faint">
                <span className="font-medium text-ink-muted">Deciding:</span>{" "}
                {round.what_they_are_deciding}
              </p>

              <ul className="mt-3 space-y-1.5 border-t border-line pt-3">
                {round.questions.map((question, index) => (
                  <li
                    key={`${question.question_text}-${index}`}
                    className="flex items-start gap-2"
                  >
                    <span
                      aria-hidden
                      className={clsx(
                        "mt-1.5 size-1 shrink-0 rounded-full",
                        question.is_from_library ? "bg-line-strong" : "bg-accent",
                      )}
                    />
                    <span className="text-xs leading-snug text-ink-muted">
                      {question.question_text}
                      {question.targets_requirement ? (
                        <span className="mt-0.5 block text-[10px] text-accent-strong">
                          probes: {question.targets_requirement}
                        </span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {plan.coverage_gaps.length > 0 ? (
          <div className="border-t border-line px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
              Requirements your resume does not evidence
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {plan.coverage_gaps.map((gap) => (
                <li
                  key={gap}
                  className="rounded-full border border-line bg-surface-sunken px-2.5 py-1 text-[11px] text-ink-muted"
                >
                  {gap}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
