"use client";

import type { AnswerReview } from "@/lib/api/api_contracts";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { StubBadge } from "@/components/ui/stub_badge";
import { DeliveryPanel } from "./delivery_panel";
import { RewriteDiff } from "./rewrite_diff";
import { SubtextPanel } from "./subtext_panel";

export function AnswerReviewView({
  review,
  onTakeAgain,
  onPickAnotherQuestion,
}: {
  review: AnswerReview;
  onTakeAgain: () => void;
  onPickAnotherQuestion: () => void;
}) {
  const { pronoun_attribution } = review;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">
            Answer review
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-ink">
            {review.question_text}
          </h1>
          <p className="mt-1 text-xs text-ink-muted">
            {review.duration_seconds}s · I/We {pronoun_attribution.ratio_label} ·
            delivery {review.delivery.overall_score}/100
          </p>
        </div>

        <div className="flex gap-2">
          <Button tone="secondary" size="small" onClick={onPickAnotherQuestion}>
            Another question
          </Button>
          <Button size="small" onClick={onTakeAgain}>
            Take two
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader
          title="First-person rewrite"
          hint="Every collective verb that gave away credit, swapped back."
          trailing={review.critique.is_stubbed ? <StubBadge /> : undefined}
        />
        <div className="px-5 py-5">
          <RewriteDiff
            rewrite_diff={review.rewrite_diff}
            reclaimed_verb_count={review.reclaimed_verb_count}
          />
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Subtext"
          hint="What the question was for, and what you said that will not decode."
        />
        <div className="px-5 py-5">
          <SubtextPanel review={review} />
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Delivery"
          hint="Four things that change how an answer lands — and the list we refuse to score."
        />
        <div className="px-5 py-5">
          <DeliveryPanel delivery={review.delivery} />
        </div>
      </Card>

      {review.critique.length_variants.length > 0 ? (
        <Card>
          <CardHeader
            title="The same answer, three lengths"
            hint="Interviews cut you off at different points. Have all three ready."
            trailing={review.critique.is_stubbed ? <StubBadge /> : undefined}
          />
          <div className="divide-y divide-line">
            {review.critique.length_variants.map((variant) => (
              <div key={variant.target_seconds} className="px-5 py-4">
                <p className="tabular mb-1.5 font-mono text-[11px] font-semibold text-accent">
                  {variant.target_seconds}s
                </p>
                <p className="text-sm leading-relaxed text-ink-muted">
                  {variant.answer_text}
                </p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
