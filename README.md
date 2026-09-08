# VentureWise

**A behavioural interview coach for international students job-hunting in Australia.**

Every interview-prep tool on the market coaches a candidate who already shares
the room's conventions. This one measures the three things they structurally
cannot: whether you claim your own work, whether your delivery is graded fairly
rather than penalised for an accent, and whether you can answer the work-rights
question in under twenty seconds.

---

## Background

An international student and a domestic student can give **the same interview
answer**, and only one of them gets the job — because the interview is scored
against conventions the domestic student absorbed for free and the international
student was never told existed.

This is not a language problem. These candidates are fluent enough to be
studying in English at an Australian university. It is a **convention** problem,
and it shows up in three specific places:

| | The gap | Why it persists |
| --- | --- | --- |
| **Credit attribution** | Across much of the world, deferring credit to the group is good manners. An Australian interviewer hears *"we redesigned the pipeline"* and records **no evidence this candidate did anything.** | Every tool teaches STAR. **None checks whether the Action section contains a first-person verb** — the only part where the difference shows. |
| **Delivery scoring** | Pace, fillers and "confidence" analytics were tuned on native speakers. A second-language speaker pausing to retrieve a word produces a **fluency artefact, not a competence signal**. | The candidate is scored down for something that does not predict job performance, then coached to fix the wrong thing. |
| **Work rights** | *"Would you need sponsorship?"* is fact-based, needs arithmetic under pressure, and hedging is fatal. | The state of the art is a university blog post advising candidates to "answer honestly and confidently." |

Underneath all three sits tacit knowledge that domestic candidates get from
parents and housemates for free, and that has no distribution channel to anyone
else.

*Full problem definition, including who is affected and how success is measured:
[PROBLEM.md](PROBLEM.md).*

---

## The idea

Make the invisible conventions **measurable, while the candidate is still
speaking** — because feedback after the fact is a report, not a correction.

Three constraints follow from the problem and shape everything:

1. **Never classify the speaker.** Detect patterns in text; never infer the
   person. Inferring origin from how somebody speaks is the exact inference this
   product argues against, and in anything adjacent to hiring it is legally
   fraught in Australia. Where origin matters, it is asked, optional and
   self-declared.
2. **Never score what you set out to defend.** If accent, second-language
   grammar or inferred confidence enters any score, the product has reproduced
   the defect it exists to fix. The refusal is **published in the UI**, not just
   honoured in code.
3. **Feedback must feel instant.** Which rules a language model out of the
   sub-second path entirely, and forces the architecture below.

---

## The solution

| | Feature | What makes it different |
| --- | --- | --- |
| **F-01** | **I/We meter** — live first-person vs collective attribution, plus a first-person rewrite with word-level diff | Counts only *verb-attached* pronouns, so "we were a team of five" (scene-setting) does not distort it. Runs in the browser with **no network call**. |
| **F-02** | **Work-rights drill** — subclass 485 arithmetic, a templated answer, a 30-second scored read-aloud | **No AI at all.** Surfaces that Australian sponsorship has no cap and no ballot — the strongest available answer, which almost no candidate knows to give. |
| **F-03** | **Subtext decoder** — what the question tests, and what you said that will not decode | 27 hand-written question intents and a 34-entry phrase lexicon. Curated, not generated. |
| **F-04** | **Story bank** — dump a memory in any language, get STAR back; 4-second recall drill | No competitor accepts non-English input anywhere. |
| **F-05** | **Accent-fair delivery score** | Publishes the list of things it **refuses** to grade. Pauses and fillers are measured from the **audio**, because the recogniser deletes "um" before the text exists. |
| **F-06** | **Panel simulation** — recruiter, hiring manager, peer panel from a real posting | The recruiter round opens on work authorisation, because in the real world it does. |
| **F-07** | **Composure mirror** — camera presence from MediaPipe face landmarks | Reads gaze *steadiness*, never gaze *direction*: eye contact is a cultural norm. Deliberately **kept out of the delivery score**. |
| **F-08** | **CV review** — Australian conventions, bullet rewrites, gap analysis against the posting | Catches the photo, date of birth and objective statement that are standard in most of the world and quietly cost the shortlist here. |

---

## Architecture

**The mistake that kills this product is putting a language model in the
sub-second path.** It cannot keep up with speech, and a nudge that lands four
seconds late is worse than no nudge. So the work is split by **latency budget
rather than by feature**:

| Loop | Budget | Runs | Does |
| --- | --- | --- | --- |
| **Fast** | `< 120 ms` | Browser, no network, every interim result | I/We ratio, live highlighting, rolling pace, hedge matching |
| **Mid** | `~ 1-3 s` | API, every 7 s of speech | STAR stage, quantified-result check, **at most one** nudge |
| **Slow** | on stop | API, once | First-person rewrite + diff, subtext decode, delivery score |

Most of the product is **deterministic on purpose**. Credit attribution, the
word-level diff, delivery scoring and the visa arithmetic are all exactly
computable — which is cheaper, faster and more reliable than asking a model, and
leaves the model only the parts that genuinely need judgement.

Every model-backed capability sits behind **one interface** (`AiCoachPort`, six
methods). Nothing else in the codebase mentions a model, a prompt or a vendor,
and a fixture provider stamps `is_stubbed: true` on everything so placeholder
output can never be mistaken for real analysis.

**Measured cost: ~$0.0096 per five-minute session** — about 1/34th of the
original budget, against a $79/month incumbent.

---

## Engineering worth a look

Findings that changed the build, each verified rather than assumed:

- **The transcript cannot see fillers or pauses.** Chrome's recogniser *deletes*
  "um" before the text exists and supplies no word timings, so two of four
  delivery metrics were reading zero regardless of how somebody spoke. Both are
  now measured from the waveform — silence against an adaptive noise floor, and
  filled pauses as voiced sound whose **spectral flux goes flat**. Same
  transcript now scores **49 or 89** depending on delivery; before, both scored
  the same.
- **Sampling rate decided whether a signal existed at all.** Brief facial
  movements last 40-200 ms; at 12 fps a short one falls between samples. Moving
  to video-frame-driven sampling took recall on a 66 ms movement from **83% to
  100%** — measured with randomised onsets, after a first test gave a false
  negative because its period was phase-locked to the old rate.
- **Speech moves the mouth constantly**, so a naive micro-expression detector
  would mostly measure "is talking". It reads **upper face only**, against a
  per-face rolling baseline.
- **Silence scored 100/100.** With no words, filler density is zero and every
  sentence trivially resolves — the score was treating absence of evidence as
  evidence of quality. Now unscorable below 11 words, with ceilings for thin
  answers and partial evidence.
- **A fabricated metric on a CV is a job-losing problem, not a stylistic one.**
  The rewrite prompt forbids inventing numbers; verified by diffing digits
  between original and rewrite — 5/5 rewrites verbatim, **zero invented**.
- **The fast loop is generated, not duplicated.** The same maths must run in the
  browser and on the server, so `scripts/sync_fast_loop.sh` regenerates the
  browser copy from the API originals and `--check` fails CI on drift. It has
  already caught a real desync.

*Full detail and measurements: [docs/ENGINEERING.md](docs/ENGINEERING.md).*

---

## Stack

| | |
| --- | --- |
| **Front-end** | Next.js 16 (App Router, Turbopack), React 19, Tailwind v4, TypeScript |
| **API** | NestJS 10, TypeScript, Redis (session state), structured-output LLM calls |
| **In-browser** | Web Speech API, Web Audio API, MediaPipe Face Landmarker, pdf.js |
| **Infra** | Docker dev containers, GitHub Actions → GHCR → rootless Podman behind nginx |

No accounts, no auth, no database. Session state lives in Redis for twelve hours
and then it is gone — the least data that makes the product work.

---

## Running it

Both services run in dev containers on a shared network.

```bash
docker compose up -d                                # Mongo + Redis
docker compose -f api/docker-compose.yml up -d      # API      → :3001
docker compose -f front-end/docker-compose.yml up -d # Front-end → :3000
```

| | |
| --- | --- |
| App | http://localhost:3000 |
| API health | http://localhost:3001/api/health |

Copy `front-end/.env.example` → `front-end/.env` and `api/.env.example` →
`api/.env`. The API runs on fixtures until `AI_COACH_PROVIDER=model` and an
`OPENAI_API_KEY` are set — every screen still works, clearly badged.

```bash
./scripts/sync_fast_loop.sh --check   # fails if the browser copy has drifted
```

---

## Documentation

| | |
| --- | --- |
| [PROBLEM.md](PROBLEM.md) | Problem definition, who is affected, constraints, success criteria |
| [PRESENTATION.md](PRESENTATION.md) | Pitch and demo brief |
| [docs/ENGINEERING.md](docs/ENGINEERING.md) | Implementation detail and measurements |
| [api/src/ai_coach/providers/README.md](api/src/ai_coach/providers/README.md) | The AI boundary — what crosses it and what does not |

---

> **Not migration advice.** In Australia only a MARA-registered migration agent
> or a legal practitioner may give it. VentureWise coaches *how to say* a fact
> about work rights; it never advises what to do about a visa.
