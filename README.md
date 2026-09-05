# Sponsor Ready

**A behavioural interview coach for Vietnamese students job-hunting in Australia.**

Every interview-prep tool on the market coaches a domestic candidate. This one
measures the three things a general-purpose coach structurally cannot: whether
you claim your own work instead of crediting the group, whether your delivery is
graded fairly rather than penalised for an accent, and whether you can answer
the work-rights question in under twenty seconds.

Built to [`spec.md`](spec.md), then **localised from the US to Australia** — see
[Market](#market-australia-vietnamese-students) for what that changed.

> **Not migration advice.** In Australia only a MARA-registered migration agent
> or a legal practitioner may give it. Check anything about your visa with one,
> or with your university's international student support team.

---

## Running it

Both services already run in dev containers on the shared `venturewise` network.

```bash
docker compose up -d                       # Mongo + Redis (Mongo is unused, see below)
docker compose -f api/docker-compose.yml up -d
docker compose -f front-end/docker-compose.yml up -d
```

| | |
| --- | --- |
| Front-end | http://localhost:3000 |
| API | http://localhost:3001/api/health |

`GET /api/health` reports which AI provider is bound.

---

## The AI boundary — start here

**Every model-backed capability sits behind one interface**, `AiCoachPort` in
[`api/src/ai_coach/ai_coach.contract.ts`](api/src/ai_coach/ai_coach.contract.ts).
Nothing else in the codebase mentions a model, a prompt, or a vendor.

Today it is bound to `StubAiCoachProvider`, which returns fixtures. **Every
fixture result carries `is_stubbed: true` and the UI badges it "Awaiting AI"**,
so nothing placeholder can be mistaken for real output on stage.

The real implementation is OpenAI. The SDK, the config and the env plumbing are
in place; the five methods are not.

```bash
cp api/.env.example api/.env     # then set OPENAI_API_KEY
```

| Variable                     | Notes                                                     |
| ---------------------------- | --------------------------------------------------------- |
| `AI_COACH_PROVIDER`          | `stub` (default) or `model`.                              |
| `OPENAI_API_KEY`             | Required when `model`. `api/.env` is gitignored.          |
| `OPENAI_MID_LOOP_MODEL`      | Hot path, ~40 calls a session. Small and fast.            |
| `OPENAI_SLOW_LOOP_MODEL`     | Once on stop. Quality over latency.                       |
| `OPENAI_BASE_URL`            | Optional: Azure, a gateway, or a local compatible server. |
| `OPENAI_MID_LOOP_TIMEOUT_MS` | Ceiling on one mid-loop call. Defaults to 2500.           |

Defaults are set to the cheapest configuration that measured out as workable:
`gpt-4.1-nano` on the hot path (~$0.00003/call, ~0.9 s) and `gpt-5.6-luna` for
the 8 slow-loop calls, where the rewrite quality matters and the cost is
fractions of a cent. **That works out at ~$0.0096 per 5-minute session, about
34x under the spec's $0.33 budget.** Beware `gpt-5-nano` — lowest published
rates of any model here, ~17x the real cost, because it spends 1,200+ reasoning
tokens a call. The provider
[README](api/src/ai_coach/providers/README.md) has the full measured table.

To finish it: implement the five methods in
[`model_ai_coach.provider.ts`](api/src/ai_coach/providers/model_ai_coach.provider.ts)
and set `AI_COACH_PROVIDER=model`. That file and its
[README](api/src/ai_coach/providers/README.md) are the whole handoff — read the
README first, because a lot of what looks like it needs a model is already built
deterministically and should not be reimplemented in a prompt.

`GET /api/health` reports `ai_coach_provider` and `is_ai_coach_ready`, and the
API logs an error at boot if `model` is bound with no key — so the one
misconfiguration that looks fine until the first call is caught early.

---

## Three loops at three clock speeds

Part 5 of the spec: never put a model in the sub-second path.

| Loop | Budget | Where | What |
| --- | --- | --- | --- |
| **Fast** | `< 120 ms` | Browser, no network | I/We meter, live highlighting, rolling pace, hedge and filler match |
| **Mid** | `~ 800 ms` | API, every 6-8 s | STAR stage, quantified-result check, at most one nudge |
| **Slow** | on stop | API, once | First-person rewrite + diff, subtext decode, delivery score |

The fast loop lives in [`front-end/lib/fast_loop/`](front-end/lib/fast_loop/) and
is **generated** from the API originals by
[`scripts/sync_fast_loop.sh`](scripts/sync_fast_loop.sh). The same maths has to
run in the browser and on the server, so the API is the source of truth and the
browser copy is regenerated rather than hand-maintained:

```bash
./scripts/sync_fast_loop.sh          # regenerate
./scripts/sync_fast_loop.sh --check  # fail if stale (for CI)
```

---

## Features

| | Feature | State |
| --- | --- | --- |
| **F-01** | I/We meter + first-person rewrite | Meter and diff fully deterministic. Rewrite *text* is mechanical until a model lands. |
| **F-02** | Work-rights drill | **Complete. No AI anywhere in it.** Subclass 485 arithmetic, templated answer, 30 s scored read-aloud. |
| **F-03** | Subtext decoder | 27 hand-written question intents + a Vietnamese/Australian phrase lexicon. Model explains what the lexicon misses. |
| **F-04** | Story bank | CRUD and the 4-second recall drill work. Extraction awaits AI. |
| **F-05** | Accent-fair delivery score | **Complete.** Needs word timings — canned replay has them, Web Speech does not. |
| **F-06** | Panel simulation | Rounds, personas and library questions render. Gap analysis awaits AI. |

### Input sources

Web Speech API for live mic, plus a **canned transcript replay** driving the same
buffer — the H+06 insurance from Part 6. The replay is a first-class option in
the UI, not a debug flag, and it supplies *real word timings*, so F-05's pause
coaching is only fully demonstrable in that mode.

---

## Market: Australia, Vietnamese students

The spec was written for the US. The pivot to Australia was not a find-and-
replace — the underlying immigration system is structurally different, and so
is the cultural layer:

| | United States (spec) | Australia (built) |
| --- | --- | --- |
| Student work rights | Unlimited on-campus, capped off | **Subclass 500** — 48 hours a fortnight in session, unlimited on breaks |
| Post-study work | OPT, 12 months | **Subclass 485** — 18 months to 3 years |
| What extends it | STEM designation | **Qualification level**, plus regional study |
| Employer sponsorship | H-1B, annual cap, March lottery | **Subclass 482** — no cap, no ballot, lodge any time |
| Employer signal | E-Verify enrolment, petition counts | **Approved / accredited sponsor** status |
| Who gives advice | DSO | **MARA-registered migration agent** |

**The Australian answer is structurally stronger**, and the product now says so:
there is no cap, no ballot and no once-a-year filing window, which removes the
objection the recruiter is bracing for. Almost no candidate knows to say it.

The cultural layer is Vietnamese-specific rather than generically
"international". The recurring theme in the 27 hand-written intercultural notes
is that Vietnamese conversational courtesy — deferring credit to the group,
softening claims, minimising your own contribution before it is judged — is read
by Australian interviewers as an absence of evidence rather than as good
manners. The notes describe communication norms, not people, and never say one
norm is better; the point is that the two rooms score the same sentence
differently.

The phrase lexicon
([`untranslated_phrases.const.ts`](api/src/question_library/untranslated_phrases.const.ts))
covers three sources of friction: direct translations from Vietnamese that are
grammatical but carry the wrong meaning, education vocabulary with no Australian
equivalent, and American English absorbed from study materials.

## Decisions worth knowing

- **No Mongo, no Mongoose, no auth, no accounts.** Part 8 cuts all of it.
  Session state lives in Redis for twelve hours through the `cache-manager`
  already wired up. Mongo is still in the root compose file but nothing uses it.
- **The employer sponsorship data is unverified sample data.** Every record in
  [`employer_sponsorship_data.const.ts`](api/src/sponsorship/employer_sponsorship_data.const.ts)
  is `is_verified: false`, the API sets `must_verify_before_use`, and the UI
  shows a red warning. A candidate says this out loud to a recruiter who works
  there, so replace it from the Home Affairs approved-sponsor list before the
  demo.
- **The visa durations need checking too.** The subclass 485 stream names and
  duration table have changed more than once recently. Verify against
  immi.homeaffairs.gov.au before anyone relies on the arithmetic.
- **Nudges have a 4-second minimum dwell**, enforced in `session.service.ts` and
  again in the browser.
- **Only verb-attached pronouns move the I/We meter.** "We were a team of five"
  is scene-setting; "we decided" is giving away credit. Counting both makes the
  meter meaningless.

## Checks

```bash
docker exec venturewise-api-1       sh -c "cd /workspaces/api && npx tsc --noEmit"
docker exec venturewise-front-end-1 sh -c "cd /workspaces/front-end && npx tsc --noEmit && npx eslint ."
./scripts/sync_fast_loop.sh --check
curl -s localhost:3001/api/health
```
