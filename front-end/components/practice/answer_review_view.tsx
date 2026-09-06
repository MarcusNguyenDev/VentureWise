"use client";

import type { AnswerReview } from "@/lib/api/api_contracts";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { StubBadge } from "@/components/ui/stub_badge";
import { ComposureReviewPanel } from "./composure_review_panel";
import { DeliveryPanel } from "./delivery_panel";
import { EnglishVariantPanel } from "./english_variant_panel";
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
            {review.duration_seconds}s · I/We {pronoun_attribution.ratio_label} ·{" "}
            {review.delivery.is_scorable
              ? `delivery ${review.delivery.overall_score}/100`
              : "delivery not scored"}
            {review.camera_presence?.is_measurable
              ? ` · composure ${review.camera_presence.score}/100`
              : ""}
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

      {review.english_variant.detections.length > 0 ? (
        <Card>
          <CardHeader
            title="Carry-overs from your first language"
            hint="Patterns in what you said, quoted back. Coaching only — never part of any score."
          />
          <div className="px-5 py-5">
            <EnglishVariantPanel english_variant={review.english_variant} />
          </div>
        </Card>
      ) : null}

      {review.camera_presence?.is_measurable ? (
        <Card>
          <CardHeader
            title="Composure"
            hint="From the camera, across the whole answer. Kept out of the delivery score by design."
          />
          <div className="px-5 py-5">
            <ComposureReviewPanel reading={review.camera_presence} />
          </div>
        </Card>
      ) : null}

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
