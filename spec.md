# Sponsor Ready

**A behavioural interview coach for international students.**

Every interview-prep tool on the market coaches a domestic candidate. An international
student walks into the same room carrying three extra problems — a self-promotion norm
they were raised against, a delivery scored by tools calibrated on native speakers, and
a sponsorship question no product will rehearse with them. That gap is the product.

- **Format:** 48-hour hackathon build
- **Live spec:** https://claude.ai/code/artifact/afb1a1ea-0880-4da3-800e-75605221798e
- **Disclaimer to ship in the UI:** _Not immigration advice — confirm with your DSO._

---

## Part 1 — The field

The category has split cleanly in two. One half grades **what you say** (Big Interview's
16-dimension rubric, CleverPrep's role-specific answer packs). The other half grades
**how you say it** (Yoodli's filler-word and pace analytics, which reviewers consistently
praise for delivery and flag as blind to content). Nobody has joined them, and nobody at
all has touched the third column.

| Tool                                                | Content coaching | Delivery coaching | Feedback while speaking | Intercultural layer | Sponsorship rehearsal | Price               |
| --------------------------------------------------- | :--------------: | :---------------: | :---------------------: | :-----------------: | :-------------------: | ------------------- |
| **Big Interview** — curriculum + question bank      |        ●         |         ◐         |            ○            |          ○          |           ○           | $79/mo              |
| **Yoodli** — speech analytics                       |        ○         |         ●         |            ◐            |          ○          |           ○           | Free tier + paid    |
| **Final Round AI** — interview copilot              |        ●         |         ◐         |            ◐            |          ○          |           ○           | Subscription        |
| **CleverPrep** — per-interview answer pack          |        ●         |         ○         |            ○            |          ○          |           ○           | Per pack            |
| **Huru** — mobile mock interviews                   |        ◐         |         ◐         |            ○            |          ○          |           ○           | Freemium            |
| **Interstride** — intl. student career platform     |        ○         |         ○         |            ○            |          ◐          |           ◐           | University-licensed |
| **FrogHire / MigrateMate** — sponsorship job boards |        ○         |         ○         |            ○            |          ○          |           ◐           | Freemium            |
| **Sponsor Ready** — this build                      |        ●         |         ●         |            ●            |          ●          |           ●           | —                   |

`●` core capability · `◐` partial / adjacent · `○` absent

---

## Part 2 — The wedge

Three gaps a general-purpose coach structurally cannot close.

### Gap 01 — The pronoun problem

Career-services research is blunt about it: candidates from collectivist cultures are
taught that claiming individual credit is rude, and US interviewers read _"we redesigned
the pipeline"_ as **no evidence you did anything**. Advisors describe the shift from "we"
to "I" as the single hardest adjustment.

Every tool tells students to use STAR. None of them measures whether the Action section
actually contains a first-person verb.

### Gap 02 — Accent-penalising scoring

Delivery scorers were tuned on native speakers. A candidate with L2 prosody gets marked
down for pausing to retrieve a word — which is a fluency artefact, not a competence
signal. Yoodli's own reviewers note eye-contact scoring is its least reliable metric.

Nobody has shipped a scorer that says out loud: _we grade clarity, not accent._

### Gap 03 — The sponsorship question

_"Will you now or in the future require sponsorship?"_ is the one question that ends
interviews, and the entire internet's answer is a university blog post saying "answer
honestly and confidently." No product rehearses it.

It is also the highest-anxiety, most-rehearsable 30 seconds in the whole process — a
perfect drill.

---

## Part 3 — The demo moment

The single frame the whole pitch rests on: the candidate is mid-answer, and the right
rail is moving. A snapshot at 0:47 of an answer to _"Tell me about a time you disagreed
with a teammate."_

**Live transcript — 0:47**

> So in my final year project, **[we]** had a team of five and **[we]** were building a
> load forecasting model for the campus grid. _~I was kind of responsible for~_ the data
> pipeline, and **[we]** disagreed about whether to drop the sensor outliers.
> _~Maybe I could say that~_ **[we]** discussed it for a while and then **[we]**▍

**Right rail**

```
I / We ratio      1 : 6      ██▁▁▁▁▁▁▁▁▁▁▁▁    ← red
Pace              142 wpm    ████████▁▁▁▁▁▁    ← ok
Hedges            2          ████▁▁▁▁▁▁▁▁▁▁    ← red

Situation   ██████████  0:22   done
Task        ██████████  0:11   done
Action      ████▁▁▁▁▁▁  0:14   live
Result      ▁▁▁▁▁▁▁▁▁▁   —

NUDGE  Six "we"s, no "I" yet. Say what YOU decided next
       — then land a number.
```

---

## Part 4 — Features

Six things no competitor ships, ranked by demo value.

### F-01 · The I/We meter — SIGNATURE

A live counter of first-person versus collective attribution, computed on the partial
transcript with zero model calls. Every "we" lights up in the transcript as it is spoken.
At answer end, the app produces the same story rewritten in first person, with a
side-by-side diff so the student sees exactly which verbs they gave away.

**Why it wins:** it turns an abstract cultural note from a career-services PDF into a
number that moves while you talk. Cheapest thing on this list to build, most impossible
to un-see in a demo.

|               |                                                                                     |
| ------------- | ----------------------------------------------------------------------------------- |
| **Build**     | ~2 hours. Pronoun tokeniser + a verb-attachment check. No API call in the hot path. |
| **Demo beat** | Meter swings 1:6 → 4:1 between take one and take two.                               |
| **Moat**      | Not technical — nobody else has framed the problem this way.                        |

### F-02 · Sponsorship drill — SIGNATURE

A 30-second timed rehearsal of the one question that ends interviews. The student enters
their real status once — F-1, CPT, OPT start date, STEM eligibility — and the app
assembles a factual, confident answer with the timeline arithmetic already done, then
makes them say it out loud until it is under 20 seconds and free of apology language.

> **Field 19a** · _Will you now or in the future require sponsorship to work in the
> United States?_
>
> "Yes, eventually. I'm on F-1 with **12 months of OPT starting June 2027**, and my
> degree is STEM-designated, so I'm **authorised to work for three years** with no action
> from you. I'd want us to look at H-1B in year two — and I know **your team filed 34
> petitions last year**, so I'm not asking for something new."

**Why it wins:** it converts the student's biggest fear into their most polished 20
seconds. Judges who have never had a visa immediately understand the stakes.

|           |                                                                                             |
| --------- | ------------------------------------------------------------------------------------------- |
| **Build** | ~3 hours. Status form → date maths → templated answer → a scored read-aloud.                |
| **Data**  | Public H-1B disclosure filings + E-Verify list, keyed on the employer from the job posting. |
| **Care**  | Ship a visible "not immigration advice — confirm with your DSO" line. Non-negotiable.       |

### F-03 · Subtext decoder — DIFFERENTIATOR

After each answer, a short panel explaining what the interviewer was actually testing —
"tell me about yourself" is a 90-second pitch, not a biography; "greatest weakness" is a
self-awareness probe, not a confession. It also flags the reverse direction: idioms,
institution names and course codes the student used that a US interviewer will not decode
("my final year project", "sem 7", "fresher").

**Why it wins:** this is the tacit knowledge domestic candidates absorb from parents and
roommates. Making it explicit is the whole thesis of the product in one panel.

|             |                                                                                              |
| ----------- | -------------------------------------------------------------------------------------------- |
| **Build**   | ~2 hours. One prompt over the transcript, structured output, cached question-intent library. |
| **Content** | Hand-write intents for the top 25 behavioural questions. Quality beats coverage here.        |

### F-04 · Story bank in your first language — DIFFERENTIATOR

The cold-start problem is real: students cannot retrieve stories under pressure in a
second language. So let them dump the memory messily — in Mandarin, Hindi, Vietnamese or
Portuguese, or as a voice note. The app extracts it into STAR, keeps the specifics,
translates only the delivery, and then drills recall: flash a question, ask which of your
seven stories answers it, in four seconds.

**Why it wins:** no competitor accepts non-English input anywhere. It removes the "I have
nothing to talk about" wall that kills first sessions.

|                    |                                                                                                |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| **Build**          | ~3 hours. Multilingual extraction into a fixed schema; the drill is a card UI over that table. |
| **Retention hook** | The story bank is the account. It is why they come back next week.                             |

### F-05 · Accent-fair delivery score — POSITIONING

Score the four things that genuinely change how an answer lands — pace, pause placement,
filler density, and whether sentences resolve — and publish, in the UI, the list of things
you deliberately do not score: accent, pronunciation, vocabulary sophistication,
"confidence" inferred from voice. Where a pause is a word-retrieval pause rather than a
structural one, coach the fix ("bridge with 'the way I approached it was —' instead of
stopping").

**Why it wins:** it is a marketing position as much as a feature, and it is the honest
one. Everyone else's rubric quietly penalises being foreign.

|           |                                                                                        |
| --------- | -------------------------------------------------------------------------------------- |
| **Build** | ~2 hours given word timings from the ASR stream.                                       |
| **Needs** | An ASR with word-level timestamps. Browser Web Speech will not give you reliable ones. |

### F-06 · Panel simulation from the posting — CORE LOOP

Resume plus job posting in, a three-round interview process out — recruiter screen, hiring
manager, peer panel — each with a different persona, a different tolerance for rambling,
and questions derived from the actual requirements the resume does _not_ cover. The
recruiter round opens with logistics and work authorisation, because in the real world it
does.

**Why it wins:** it is table stakes rather than a differentiator — CleverPrep does
per-interview packs. What makes it yours is that the recruiter persona asks about
sponsorship and the gap analysis knows which of your stories are transferable across a
culture boundary.

|             |                                                                                           |
| ----------- | ----------------------------------------------------------------------------------------- |
| **Build**   | ~4 hours. Resume + JD → structured plan → per-round system prompts.                       |
| **Warning** | Easy to overspend here. It is the least surprising part of the demo — budget accordingly. |

---

## Part 5 — Architecture

**How to make "real time" actually real time.**

The mistake that kills this demo is putting a language model in the sub-second path. It
cannot keep up with speech, and a nudge that lands four seconds late is worse than no
nudge. Split the feedback into **three loops running at different clock speeds** —
everything that must feel instant is plain string work in the browser, and the model only
handles what genuinely needs judgement.

| Loop     | Budget     | Runs                                                                      | Does                                                                                                                                                |
| -------- | ---------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Fast** | `< 120 ms` | Browser, no network, on every interim ASR result                          | I/We ratio + live "we" highlighting · rolling pace over a trailing 15 s window · filler and hedge lexicon match · pause detection from word timings |
| **Mid**  | `~ 800 ms` | Every 6–8 s of speech, `claude-haiku-4-5`, tight structured-output schema | Which STAR stage and for how long · has a quantified result appeared yet · at most **one** nudge string, or null                                    |
| **Slow** | on stop    | After the answer, `claude-opus-5`                                         | First-person rewrite with word-level diff · subtext decode and idiom flags · the same answer at 30 s / 90 s / 2 min                                 |

### Pipeline

```
[ Streaming ASR ] → [ Transcript buffer ] → [ Cached prefix ] → [ Single nudge slot ]
```

- **Input — streaming ASR.** Word-level timestamps required for F-05. Web Speech API is
  free and zero-infra but gives poor timings — fine for the demo, name the upgrade path
  (Deepgram / AssemblyAI streaming).
- **Fan-out — transcript buffer.** One append-only store; all three loops read from it.
  Never re-derive state per loop.
- **Context — cached prefix.** Resume + job posting + story bank sit in a cached prompt
  prefix, so mid-loop calls send only the new speech.
- **Output — single nudge slot.** One nudge on screen at a time, minimum 4 s dwell.
  Competing nudges are how this feels broken.

### Cost per 5-minute session

| Line      | Cost        | Basis                                                      |
| --------- | ----------- | ---------------------------------------------------------- |
| Fast loop | **$0.00**   | Runs entirely in the browser                               |
| Mid loop  | **$0.04**   | ~40 Haiku 4.5 calls, mostly cache reads ($1 / $5 per MTok) |
| Slow loop | **$0.29**   | 6 full critiques on Opus 5 ($5 / $25 per MTok)             |
| **Total** | **≈ $0.33** | Against a $79/mo incumbent. Say this number out loud.      |

---

## Part 6 — The 48-hour plan

Build the thing you demo **first**. Every hour after H+40 is polish, not features.

### Hard milestones

| Mark     | Must be true                                   | If it isn't                                                 |
| -------- | ---------------------------------------------- | ----------------------------------------------------------- |
| **H+06** | Mic → live transcript on screen                | Stop. Cut ASR to a canned transcript replay and keep going. |
| **H+12** | I/We meter moving live (F-01)                  | Drop F-04 and F-05 from scope now, not later.               |
| **H+20** | First-person rewrite diff rendering            | Ship the meter without the rewrite; it still demos.         |
| **H+28** | Sponsorship drill end-to-end (F-02)            | Hard-code one student profile. Nobody will know.            |
| **H+34** | Resume + JD → three-round plan (F-06)          | Pre-generate one plan as a fixture and load it.             |
| **H+40** | **FEATURE FREEZE**                             | No exceptions. Bugs and demo polish only.                   |
| **H+42** | Full demo run-through #1                       | —                                                           |
| **H+44** | Run-through #2, **recorded as a backup video** | This is your insurance against venue wifi.                  |

### Hour-by-hour

**Day 1 — 0:00 to 24:00**

| Hours | Work                                                                                             | Owner |
| ----- | ------------------------------------------------------------------------------------------------ | ----- |
| 0–2   | Repo, deploy target, API keys, shared types. Decide the ASR now and don't revisit.               | All   |
| 2–6   | **Critical path:** streaming ASR → append-only transcript buffer → text on screen.               | Dev A |
| 2–6   | UI shell: transcript pane + right rail, both themes, no logic.                                   | Dev B |
| 6–12  | **F-01 fast loop.** Pronoun tokeniser, WPM window, hedge lexicon. Pure JS, no network.           | Dev A |
| 6–12  | Hand-write the 25 behavioural questions + intent notes (F-03 content).                           | Dev C |
| 12–16 | **Mid loop.** Haiku 4.5 STAR-stage tracker, structured output, single nudge slot with 4 s dwell. | Dev A |
| 12–18 | **F-02 sponsorship drill.** Status form → date maths → templated answer → 30 s timer.            | Dev B |
| 16–20 | **Slow loop.** First-person rewrite + word-level diff view.                                      | Dev A |
| 18–22 | Pull H-1B filing counts + E-Verify list for ~20 well-known employers into a static JSON.         | Dev C |
| 20–24 | **Sleep in shifts.** Somebody sleeps. Two people at hour 30 with no sleep ship nothing.          | —     |

**Day 2 — 24:00 to 48:00**

| Hours  | Work                                                                                                                          | Owner     |
| ------ | ----------------------------------------------------------------------------------------------------------------------------- | --------- |
| 24–30  | **F-06.** Resume + JD → structured three-round plan → per-round system prompts.                                               | Dev A     |
| 24–30  | **F-03 subtext decoder** panel wired to the question-intent library.                                                          | Dev B     |
| 30–34  | **F-05** accent-fair score _only if_ the ASR gives word timings. Otherwise skip and keep the positioning line in the UI copy. | Dev A     |
| 30–36  | Real content pass: seed a believable resume + a real job posting. No lorem, no "Acme Corp".                                   | Dev C     |
| 34–40  | **F-04 story bank** — _first cut candidate._ Build it only if everything above is green.                                      | Dev B     |
| 36–40  | Error states, empty states, the DSO disclaimer, mobile-width check.                                                           | All       |
| **40** | **FEATURE FREEZE**                                                                                                            | —         |
| 40–42  | Fix only what breaks the demo script. Nothing else.                                                                           | All       |
| 42–44  | Run-through ×2. Record the second one as a backup video.                                                                      | All       |
| 44–46  | Slide-free pitch rehearsal. Time it. Cut to 90 s.                                                                             | Presenter |
| 46–48  | Buffer. Sleep. Do not start anything.                                                                                         | —         |

### Parallelisation notes

- The **transcript buffer is the only hard dependency.** Until it exists, F-01, the mid
  loop and the slow loop are all blocked. Get one person on it alone and don't let anyone
  else touch it.
- F-02 (sponsorship drill) has **zero dependency** on the ASR pipeline. It can be built in
  parallel from hour 2 and is your fallback demo if the audio stack collapses.
- The 25 hand-written questions and the H-1B JSON are pure content work — give them to
  whoever is least comfortable in the codebase.

---

## Part 7 — The pitch

Ninety seconds, in order.

| Mark     | Beat                                                                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **0:00** | **One line, no slide.** "Every interview coach on the market was built for someone who grew up here. Watch what happens when the person interviewing isn't." |
| **0:10** | Paste a resume and a real job posting. The three-round plan renders. **Do not narrate it** — it is the least interesting thing you built.                    |
| **0:25** | **Take one.** A teammate answers the disagreement question the way they actually would. The I/We meter sits at 1:6 and goes red. Let the room watch it move. |
| **0:50** | Answer ends. Show the first-person rewrite diff — same story, six verbs reclaimed. This is the emotional beat of the demo.                                   |
| **1:05** | **Take two.** Ten seconds only. Meter climbs to 4:1, STAR bar reaches Result. Cut it off early; the point is made.                                           |
| **1:15** | **The closer.** Fire the sponsorship drill. Timer counts down from 30. The answer lands in 19 seconds with the H-1B filing count in it. Stop talking.        |

---

## Part 8 — What to cut before you start

- **✕ Video and eye-contact scoring.** Yoodli's own users report it as the least reliable
  metric, because it depends on camera angle and lighting. It will fail live on a
  conference-room webcam and it is the one thing that can visibly break on stage.
- **✕ Accounts, auth, and a database.** Session state in memory. If a judge asks, the
  answer is "next sprint," and nobody has ever lost a hackathon over it.
- **✕ A question library.** Big Interview has thousands and it is not why anyone would
  switch. Twenty-five hand-written behavioural questions with hand-written intent notes
  will out-demo a generated thousand.
- **✕ Technical and coding interviews.** Entirely different product, well served by
  interviewing.io. Saying "we don't do that" is a positioning strength, not a weakness.
- **✕ Live in-interview assistance.** Final Round AI's copilot lives here and it is an
  ethics argument you do not want on stage. Practice-only is the cleaner story.

---

## Research sources

1. [Yale SOM — Common networking challenges for international students](https://cdo.som.yale.edu/blog/2025/09/17/common-networking-challenges-for-international-students/) — humility norms vs. US self-promotion
2. [Big Interview — Intercultural fluency in behavioral interviews](https://resources.biginterview.com/behavioral-interviews/intercultural-fluency/) — the "we"→"I" shift; what the incumbent already says
3. [Yoodli review — pros and cons](https://www.finalroundai.com/blog/yoodli-review-pros-cons) and [MakerStack teardown](https://makerstack.co/reviews/yoodli-review/) — delivery-only scope; eye-contact unreliability
4. [Big Interview review](https://www.finalroundai.com/blog/big-interview-review-pros-cons) and [CleverPrep tool survey](https://www.cleverprep.com/blog/best-ai-interview-prep-tools) — pricing, 16-dimension rubric, per-interview packs
5. [Interstride](https://www.interstride.com/blog/how-to-answer-will-you-now-or-in-the-future-require-sponsorship-to-work-in-the-us/) and [CU Boulder Career Services](https://www.colorado.edu/career/how-answer-work-authorization-questions) — the state of the art on the sponsorship question is a blog post
6. [FrogHire](https://www.froghire.ai/international) and [MigrateMate](https://migratemate.co/blog/best-ai-job-search-tools) — sponsorship data exists as a job-board feature, never as coaching
7. [Interstride student platform](https://www.interstride.com/students/) — the closest adjacent product; career content, no practice engine

---

_Sponsor Ready · Build spec · Not immigration advice_
