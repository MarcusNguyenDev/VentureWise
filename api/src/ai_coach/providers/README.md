# The AI boundary

Everything in Sponsor Ready that needs model judgement goes through one
interface: `AiCoachPort` in [`../ai_coach.contract.ts`](../ai_coach.contract.ts).
Nothing else in the codebase mentions a model, a prompt, or a vendor.

Two implementations are bound by `AI_COACH_PROVIDER`:

| Value            | Class                  | Behaviour                                                     |
| ---------------- | ---------------------- | ------------------------------------------------------------- |
| `stub` (default) | `StubAiCoachProvider`  | Fixtures. Every result carries `is_stubbed: true`.            |
| `model`          | `ModelAiCoachProvider` | Throws `AiProviderNotConfiguredError` until you implement it. |

## What is already done, and is not your problem

A lot of what looks like it needs a model does not, and it is already built and
tested. Do not reimplement any of this in a prompt:

- **The I/We meter (F-01)** — `speech_analysis/pronoun_attribution.util.ts`.
  Pronoun tokeniser plus a verb-attachment check, running in the browser with
  no network call.
- **The word-level diff** — `speech_analysis/answer_diff.util.ts`. You return
  rewrite *text*; the diff is computed from it. Never ask a model for diff
  markup.
- **Delivery scoring (F-05)** — `speech_analysis/delivery_score.service.ts`.
  Pace, pause classification, filler density, sentence resolution.
- **The sponsorship answer (F-02)** — `sponsorship/`. Entirely date arithmetic
  and a template. No model is involved anywhere in this feature.
- **Question intents (F-03)** — `question_library/behavioural_questions.const.ts`.
  Twenty-five hand-written entries, passed to you as `known_question_intent`.
- **Untranslated phrase detection** — `question_library/untranslated_phrases.const.ts`.
  The lexicon finds them; you explain the ones it misses.
- **The three-round structure (F-06)** — `panel_simulation/round_personas.const.ts`.
  You supply gap analysis and posting-specific questions, not the scaffolding.

## The five methods

| Method                   | Loop  | Budget    | Notes                                                      |
| ------------------------ | ----- | --------- | ---------------------------------------------------------- |
| `trackAnswerProgress`    | Mid   | ~800 ms   | Every 6-8 s of speech. Small fast model, structured output. |
| `critiqueAnswer`         | Slow  | on stop   | Rewrite text plus 30 s / 90 s / 2 min variants.             |
| `decodeSubtext`          | Slow  | on stop   | Runs in parallel with `critiqueAnswer`.                     |
| `extractStoryFromMemory` | —     | off path  | Multilingual in, STAR out. Keep the specifics.              |
| `buildInterviewPlan`     | —     | off path  | Resume + posting in, gaps and questions out.                |

## Two contracts to honour

1. **Set `is_stubbed: false`** on everything you return. The UI badges anything
   still flagged, and a fixture that quietly renders as real output on stage is
   the worst failure mode this design has.

2. **`trackAnswerProgress` returns at most one nudge, or `null`.** A nudge that
   replaces one still on screen is worse than no nudge — Part 5 of the spec is
   blunt that competing nudges are what make this feel broken. `input.current_nudge_text`
   tells you what is already showing; prefer `null` unless yours is clearly more
   urgent. A four-second minimum dwell is enforced in `session.service.ts` and
   again in the browser, but do not lean on it.

## Prompt-caching shape

The mid loop fires roughly forty times in a five-minute session. Put the resume,
the job posting and the story bank in a **cached prompt prefix** so each call
sends only the new speech. Part 5's cost table assumes this — without it the mid
loop costs several times the budgeted $0.04.

## Where to start

Implement `trackAnswerProgress` first. It is the only method on the hot path, it
is the one with a latency budget, and `estimateStarProgress` in
`speech_analysis/star_stage_estimation.util.ts` already gives you a cheap prior
to hand the model rather than making it work the stage out from scratch.
