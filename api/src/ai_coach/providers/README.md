# The AI boundary

Everything in VentureWise that needs model judgement goes through one
interface: `AiCoachPort` in [`../ai_coach.contract.ts`](../ai_coach.contract.ts).
Nothing else in the codebase mentions a model, a prompt, or a vendor.

Two implementations are bound by `AI_COACH_PROVIDER`:

| Value            | Class                  | Behaviour                                                     |
| ---------------- | ---------------------- | ------------------------------------------------------------- |
| `stub` (default) | `StubAiCoachProvider`  | Fixtures. Every result carries `is_stubbed: true`.            |
| `model`          | `ModelAiCoachProvider` | OpenAI. Throws `AiProviderNotConfiguredError` until you implement it. |

## Configuration

Everything lives in `api/.env` (gitignored) — copy `api/.env.example` and fill
it in. Compose substitutes from the same file and Nest's `ConfigModule` reads it
at runtime, so one file covers both.

| Variable                     | Purpose                                                   |
| ---------------------------- | --------------------------------------------------------- |
| `OPENAI_API_KEY`             | Required when `AI_COACH_PROVIDER=model`.                  |
| `OPENAI_MID_LOOP_MODEL`      | Hot path. Fires ~40x a session — keep it small and fast.  |
| `OPENAI_SLOW_LOOP_MODEL`     | Runs once on stop. Quality over latency.                  |
| `OPENAI_BASE_URL`            | Optional: Azure, a gateway, or a local compatible server. |
| `OPENAI_MID_LOOP_TIMEOUT_MS` | Hard ceiling on one mid-loop call. Defaults to 2500.      |

Read these through `AiCoachConfig`, not `ConfigService` directly — it carries
the tier split and turns a missing key into one clear error rather than an SDK
stack trace. The `openai` SDK is installed, and `ModelAiCoachProvider` has a
lazy `getClient()` helper. **It must stay lazy:** Nest instantiates this class
even when the stub is bound, so the app has to boot with no key present.

`GET /api/health` reports `ai_coach_provider` and `is_ai_coach_ready`, so a
missing key surfaces before the demo instead of on the first call.

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

| Method                   | Tier                  | Budget   | Notes                                                           |
| ------------------------ | --------------------- | -------- | --------------------------------------------------------------- |
| `trackAnswerProgress`    | `ModelTier.MID_LOOP`  | ~800 ms  | Every 6-8 s of speech. Structured output; pass the timeout.     |
| `critiqueAnswer`         | `ModelTier.SLOW_LOOP` | on stop  | Rewrite text plus 30 s / 90 s / 2 min variants.                 |
| `decodeSubtext`          | `ModelTier.SLOW_LOOP` | on stop  | Runs in parallel with `critiqueAnswer`.                         |
| `extractStoryFromMemory` | `ModelTier.SLOW_LOOP` | off path | Multilingual in, STAR out. Keep the specifics.                  |
| `buildInterviewPlan`     | `ModelTier.SLOW_LOOP` | off path | Resume + posting in, gaps and questions out.                    |

Use structured outputs — a JSON schema on the response format — rather than
parsing prose. Every return type in `ai_coach.contract.ts` is a fixed shape, and
the mid loop has no budget to retry a malformed parse.

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
the job posting and the story bank in a **stable prompt prefix** so each call
sends only the new speech, and so prompt caching can actually hit.

Two things have to be true for it to engage, and neither is automatic:

1. **The prefix must exceed 1024 tokens.** Below that, caching silently does
   not apply. Measured against this repo's sample resume and posting, the
   prompt came to ~850 tokens and `cached_tokens` was **0 on every call**. The
   real system prompt plus the story bank should clear the threshold, but check
   rather than assume.
2. **Anything that varies per call must go after the static block** — the
   elapsed seconds, the growing transcript, a timestamp. Caching keys on an
   exact prefix match, so one varying token near the top voids the whole thing.

Confirm `usage.prompt_tokens_details.cached_tokens` is non-zero on the second
and later calls of a session. With the real system prompt the measured prefix is
~1,094 tokens, which clears the threshold — but only just, so do not trim it
below ~1,100 without re-checking.

## Measured cost and latency

Real numbers from this repo's sample resume and posting, with a proper system
prompt (~1,094 prompt tokens), structured output, from inside the dev container.
**Cost is computed from measured output tokens, not headline rates** — reasoning
tokens bill as output, which inverts the ranking:

| Model           | $/call cached | Output tok | Latency  | Note                                    |
| --------------- | ------------- | ---------- | -------- | --------------------------------------- |
| `gpt-4.1-nano`  | **$0.000030** | 21-33      | ~0.9 s   | **Bound to the mid loop.**              |
| `gpt-4o-mini`   | $0.000087     | 39         | ~0.8 s   |                                         |
| `gpt-5.4-nano`  | $0.000096     | 63         | ~1.7 s   |                                         |
| `gpt-4.1-mini`  | $0.000135     | 31         | ~1.0 s   |                                         |
| `gpt-5.6-luna`  | $0.000139     | 102-138    | ~2-3.5 s | **Bound to the slow loop.**             |
| `gpt-5-nano`    | $0.000518     | **1,285**  | ~11.6 s  | Cheapest rates, dearest in practice.    |
| `gpt-5.6-terra` | $0.001646     | 123        | ~2.6 s   |                                         |

`gpt-5-nano` is the trap: the lowest published rates of anything here, and ~17x
the real cost of `gpt-4.1-nano` because it spends over a thousand reasoning
tokens per call. Always price a candidate from a measured call.

### On STAR-stage accuracy

Every model tested wavered between `TASK` and `ACTION` on the same transcript —
`gpt-4.1-nano` got it right 2 of 4 times, and the pricier models were no better.
The distinction is genuinely ambiguous mid-answer, so **do not solve it by
buying a bigger model.** Pass `estimateStarProgress` from
`speech_analysis/star_stage_estimation.util.ts` in as a prior and have the model
confirm or advance it rather than derive it cold.

### Slow calls are safe now

The browser skips a mid-loop tick while a request is still outstanding (the
in-flight guard in `use_practice_session.ts`). Without it, a model slower than
the 7 s interval would stack requests — several in flight at once, each
returning a nudge computed from a transcript that had moved on. A slow call now
costs one skipped nudge and nothing else, which is why
`OPENAI_MID_LOOP_TIMEOUT_MS` can sit at 8000.

## Where to start

Implement `trackAnswerProgress` first. It is the only method on the hot path, it
is the one with a latency budget, and `estimateStarProgress` in
`speech_analysis/star_stage_estimation.util.ts` already gives you a cheap prior
to hand the model rather than making it work the stage out from scratch.
