# Sponsor Ready

A behavioural interview coach for international students.

Every interview-prep tool on the market coaches a domestic candidate. This one
measures the three things a general-purpose coach structurally cannot: whether
you claim your own work, whether your delivery is graded fairly, and whether you
can answer the sponsorship question in under twenty seconds.

Built to [`spec.md`](spec.md).

> **Not immigration advice.** Confirm anything about your status with your DSO.

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

To wire in a model: implement the five methods in
[`api/src/ai_coach/providers/model_ai_coach.provider.ts`](api/src/ai_coach/providers/model_ai_coach.provider.ts)
and set `AI_COACH_PROVIDER=model`. That file and its
[README](api/src/ai_coach/providers/README.md) are the whole handoff — read the
README first, because a lot of what looks like it needs a model is already built
deterministically and should not be reimplemented in a prompt.

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
| **F-02** | Sponsorship drill | **Complete. No AI anywhere in it.** Date arithmetic, templated answer, 30 s scored read-aloud. |
| **F-03** | Subtext decoder | 25 hand-written question intents + idiom lexicon are real. Model explains what the lexicon misses. |
| **F-04** | Story bank | CRUD and the 4-second recall drill work. Extraction awaits AI. |
| **F-05** | Accent-fair delivery score | **Complete.** Needs word timings — canned replay has them, Web Speech does not. |
| **F-06** | Panel simulation | Rounds, personas and library questions render. Gap analysis awaits AI. |

### Input sources

Web Speech API for live mic, plus a **canned transcript replay** driving the same
buffer — the H+06 insurance from Part 6. The replay is a first-class option in
the UI, not a debug flag, and it supplies *real word timings*, so F-05's pause
coaching is only fully demonstrable in that mode.

---

## Decisions worth knowing

- **No Mongo, no Mongoose, no auth, no accounts.** Part 8 cuts all of it.
  Session state lives in Redis for twelve hours through the `cache-manager`
  already wired up. Mongo is still in the root compose file but nothing uses it.
- **The employer H-1B data is unverified sample data.** Every record in
  [`employer_sponsorship_data.const.ts`](api/src/sponsorship/employer_sponsorship_data.const.ts)
  is `is_verified: false`, the API sets `must_verify_before_use`, and the UI
  shows a red warning. A candidate says this number out loud to a recruiter, so
  replace it from the USCIS H-1B Employer Data Hub before the demo.
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
```
