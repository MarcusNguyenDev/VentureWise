import type { AnswerReview } from "@/lib/api/api_contracts";
import { StubBadge } from "@/components/ui/stub_badge";

/**
 * F-03. What the interviewer was actually testing, plus the phrases the
 * candidate used that a US interviewer will not decode.
 *
 * The intent line comes from the hand-written question library when there is
 * one, so this panel says something real even with no model wired in.
 */
export function SubtextPanel({ review }: { review: AnswerReview }) {
  const { subtext, untranslated_phrases } = review;

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <p className="text-xs font-semibold text-ink">
            What they were actually testing
          </p>
          {subtext.is_stubbed ? <StubBadge /> : null}
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-ink-muted">
          {subtext.interviewer_intent}
        </p>

        {subtext.what_lands.length > 0 ? (
          <ul className="mt-3 space-y-1.5">
            {subtext.what_lands.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm text-ink-muted"
              >
                <span aria-hidden className="mt-1 text-accent">
                  ·
                </span>
                {item}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {untranslated_phrases.length > 0 ? (
        <div className="border-t border-line pt-5">
          <p className="text-xs font-semibold text-ink">
            Phrases that did not travel
          </p>
          <p className="mt-1 text-[11px] text-ink-muted">
            Nothing wrong with these — they just will not decode for a US
            interviewer.
          </p>

          <ul className="mt-3 space-y-3">
            {untranslated_phrases.map((phrase, index) => (
              <li key={`${phrase.phrase}-${index}`}>
                <p className="text-sm text-ink">
                  <span className="mark-untranslated font-medium">
                    {phrase.phrase}
                  </span>
                  <span aria-hidden className="mx-2 text-ink-faint">
                    →
                  </span>
                  <span className="font-medium text-good">
                    {phrase.suggested_replacement}
                  </span>
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-ink-muted">
                  {phrase.why_it_does_not_travel}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
