# VentureWise

**A behavioural interview coach for international students job-hunting in Australia.**

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
| **F-07** | Camera mirror + composure | **Complete, no AI.** MediaPipe face landmarks in-browser. Deliberately **not** part of the delivery score — see below. |
| **F-06** | Panel simulation | Rounds, personas and library questions render. Gap analysis awaits AI. |

### Input sources

Web Speech API for live mic, plus a **canned transcript replay** driving the same
buffer — the H+06 insurance from Part 6. The replay is a first-class option in
the UI, not a debug flag, and it supplies *real word timings*, so F-05's pause
coaching is only fully demonstrable in that mode.

---

## Pauses and fillers are measured from the audio, not the transcript

Two of the four delivery components were reading near zero on the microphone
path regardless of how somebody actually spoke, for two different reasons:

- **Fillers** — Chrome's speech recogniser *deletes* "um" and "uh" before the
  transcript exists. Its language model treats them as noise, which is correct
  for dictation and fatal here.
- **Pauses** — the Web Speech API exposes no word timings at all, so pause
  placement had nothing to work from and was suppressed entirely.

Neither is recoverable from text. Both are plainly present in the audio, so
[`speech_audio_analyser.ts`](front-end/lib/audio/speech_audio_analyser.ts)
opens a **second microphone capture purely for measurement** — the recogniser
manages its own stream internally and exposes neither — and reads the waveform
at 50 Hz:

| Measured | How |
| --- | --- |
| Pauses | RMS energy below an **adaptive noise floor**, learned from the opening frames rather than assumed. Silence over 350 ms is a pause; over 1.2 s is a long one. |
| Filled pauses | Voiced sound whose **spectral flux goes flat**. Articulated speech moves constantly through the spectrum as the mouth changes shape; "ummm" does not — the tongue parks. A steady run of 180-1600 ms is a held vowel. |
| Articulation rate | Words divided by time **actually spent speaking**, so thinking silence no longer reads as talking slowly. |

`echoCancellation`, `noiseSuppression` and `autoGainControl` are all disabled on
that capture — every one of them erases what is being measured. Noise
suppression removes the low-energy tail of a filled pause, and AGC lifts the
floor until silence stops looking like silence.

Where these are present they **replace** the text-derived figures rather than
supplementing them: a real measurement beats a proxy that reads zero by
construction. Effect on the same transcript:

| | Score | Fillers | Long pauses |
| --- | --- | --- | --- |
| No audio (old behaviour) | 85 | 0 /100w | not measurable |
| Clean delivery, measured | 89 | 2.2 /100w | 0 |
| Many "um"s and long pauses | **49** | 24.4 /100w | 6 |

Numbers only cross the network. **No audio is recorded, buffered or sent**, and
the capture is released the moment the answer ends.

## First-language carry-over detection

Detects the grammatical patterns a first language leaves in spoken English —
missing articles, unmarked plurals, dropped third-person `-s`, omitted copula,
tense carried by a time word, transferred prepositions — and quotes them back
with a fix.

**It detects patterns in the text. It does not classify the speaker.** That
distinction is the whole design:

- Inferring somebody's nationality from how they speak is the inference this
  product exists to argue against, and in anything adjacent to hiring it is
  legally fraught in Australia. So output is always "here is a sentence you
  said and how it will land", never "you are probably from X".
- Where a language family is named it is as context for *why* the pattern
  happens, phrased as a broad grouping a candidate can recognise themselves in
  or ignore, and only when several distinct patterns agree.
- **First language is asked, not inferred.** An optional field on the setup
  form feeds the AI prompts, which are explicitly told not to guess it when
  absent. Self-declared beats classified on both accuracy and decency.
- **None of it is scored.** `NOT_SCORED_BY_DESIGN` promises second-language
  grammar is not graded, and this produces coaching only.

### The accuracy ceiling, stated honestly

Speech recognisers are language-model-smoothed: they insert articles and plural
endings the speaker did not say, because a fluent sentence is more probable
than a disfluent one. The carry-overs are therefore **under-detected** from a
live microphone. Detections are real; non-detections are not evidence, and the
UI says so.

Verified against three transcripts: a fluent answer produced **0 false
positives** (`"The company wants"` and `"built a dashboard"` correctly skipped
via a determiner guard), a carry-over-heavy answer produced 7 correct
detections, and a mixed-but-clean answer produced 0.

Accent detection from *audio* is deliberately not attempted — the Web Speech
API exposes no acoustic features, and an L1-from-audio classifier is the exact
thing F-05 refuses to be.

## The camera: a mirror, not a mark

The practice screen shows a placeholder interviewer with your own video beneath
it, and derives a **composure** reading from MediaPipe face landmarks plus
filler density from the transcript.

Three deliberate constraints, because this feature cuts against the product's
own position and spec Part 8 cut video scoring outright:

1. **It never enters the delivery score.** F-05 publishes a list of things it
   refuses to grade, and inferred confidence is on it. The reading sits beside
   that score, labelled *not scored*. If it is ever folded in, two lines of
   `NOT_SCORED_BY_DESIGN` become false and must be deleted rather than left
   there.
2. **No emotion classification.** Inferring emotional state from a face is
   scientifically contested. What is derived instead is observable: gaze
   steadiness, head steadiness, face-visible fraction, blink rate, and the rate
   of brief upper-face movements. The UI names movements — "brow furrow", "lip
   press" — never moods.
3. **Gaze *steadiness*, never gaze *direction*.** How much somebody looks at
   the camera is a cultural norm — Vietnamese deference norms involve reducing
   eye contact with a senior person, and scoring it would punish exactly the
   behaviour this product exists to help somebody navigate. Facing-camera
   percentage is shown as information with coaching attached, the same way the
   "we" to "I" shift is taught: a learnable local convention, not a failing.

The reading is a 0-100 score and a **five-point band**, logged into the answer
review as well as shown live:

| Band | Score |
| --- | --- |
| Composed | 85-100 |
| Steady | 70-84 |
| Slightly restless | 55-69 |
| Restless | 35-54 |
| Very restless | 0-34 |

**Graded harshly on purpose.** A mock that flatters you teaches nothing, and the
real room is less forgiving than any threshold in the file, so "Composed" is
meant to be earned. Calibrated against synthetic profiles:

| Profile | Score | Band |
| --- | --- | --- |
| near-perfect take | 94 | Composed |
| good take | 79 | Steady |
| ordinary nervous take | 47 | Restless |
| visibly rattled | 15 | Very restless |

Signals are weighted, not averaged: filler density carries 0.4 because it is the
only input measured from what was actually said rather than inferred from
pixels; gaze steadiness, head steadiness and facial movement carry 0.2 each.

It ships with a caveat that lighting, glasses and simply thinking hard all move
the numbers.

**In the review**, the whole-answer reading is kept as its own card — never
merged into Delivery — with the component breakdown, the most frequent brief
movement, and facing-camera percentage shown as information rather than a mark.
The live rail shows the last twenty seconds; the review describes the answer.
Only derived numbers cross the network: the `CameraPresenceDto` carries
fractions and rates, never a frame, landmark or image.

**Video never leaves the browser.** The wasm runtime and the 3.7 MB model are
served from `public/mediapipe/` rather than a CDN — venue-wifi insurance, per
the spec's own paranoia — and only derived numbers are used. Nothing is
recorded or uploaded. The library is imported dynamically so nobody who leaves
the camera off pays to download it.

The interviewer tile is an abstract silhouette
([`interviewer_placeholder.svg`](front-end/public/interviewer_placeholder.svg)),
not a stock photo or a generated face: putting an invented person on screen and
calling them your interviewer is a small dishonesty the product does not need.

### Tuning for brief expressions

Brief facial movements last roughly 40-200 ms, which sets the sampling floor.
The loop now runs off `requestVideoFrameCallback` — one inference per decoded
video frame, typically 30 fps — instead of an 80 ms timer, with a 33 ms timer
only as fallback. Measured against a synthetic 66 ms movement with randomised
onsets, over 20 trials:

| Sampling | Recall on a 66 ms movement |
| --- | --- |
| 80 ms (the old rate) | 83% |
| 33 ms / video-frame driven | 100% |

Onset threshold sits at 0.08 above a per-face rolling baseline — lowered from
0.12 to catch smaller movements, and verified to still produce **zero** false
positives on a resting face with sensor noise.

Detection is a per-blendshape rolling **median baseline** with onset/offset
hysteresis, not variance — variance averages transients away, which is the
opposite of what is wanted here. Anything held longer than 600 ms is discarded
rather than counted, because a sustained expression is a different thing.

Two constraints shape which blendshapes are read:

- **Upper face only.** Speech drives the mouth and jaw on every syllable, so a
  detector watching them would largely be measuring "is currently talking" —
  something the transcript already knows. Brow, eyelid, cheek and nose movement
  is far less confounded by articulation.
- **Per-face baselines.** Resting brow position varies enormously between
  people and with glasses, so a shared absolute threshold would fire constantly
  for some faces and never for others.

Tracking confidence is deliberately loosened (`minTrackingConfidence: 0.3`)
while detection confidence stays strict: dropping a frame mid-movement loses
the whole event, and re-acquiring a face costs far more than occasionally
tracking one frame too long.

Verified against synthetic signals: resting-with-noise and sub-threshold wobble
both yield 0/min, a 5-second held expression yields 0/min, and 66 ms spikes are
caught.

Face tracking needs WebGL. Where it is unavailable every frame throws, so the
loop detects that, stops, and says so rather than showing a permanently empty
meter.

## CV review

`/cv-review` reads a CV the way an Australian employer does. It is the §3.4
"outbound" problem from [`PROBLEM.md`](PROBLEM.md) applied to the document
rather than the answer.

**Most of it is deterministic.** Convention breaches, weak openers, unevidenced
claims and the quantification ratio are all exactly computable, which is
cheaper and more reliable than asking a model to notice them — and leaves the
model spending its attention on the one thing it is better at.

### The conventions layer

The differentiated part. These are standard on a CV across much of Europe and
Asia and are quietly expensive in Australia:

| Detected | Why it costs |
| --- | --- |
| **Photo** | Hands the employer age, gender and ethnicity before shortlisting — information they may later have to prove they did not act on. Many organisations discard or redact photo CVs on policy. |
| Date of birth | Same, for age. |
| Marital status, gender | Protected-attribute information the employer would rather not have. |
| Nationality | Answers a question nobody asked; leaves work rights — the one they did ask — unanswered. |
| Full street address | Convention here is suburb and state. |
| "References available on request" | Assumed, so it says nothing. |
| Objective statement | Describes what you want where the reader decides whether to continue. |
| CGPA / percentage / "First Class" | Australian readers use WAM out of 100 or GPA out of 7. An 8.1/10 looks worse than it is. |

The photo check runs **at PDF parse time** by inspecting the operator list for
image ops — extraction discards images, so it cannot be recovered from the text
afterwards. It only fires on an uploaded PDF, never on pasted text.

### The model's half

Bullet rewrites and gap analysis against the posting. Two hard constraints in
the prompt, both verified: **originals are copied verbatim** so the candidate
can find the line in their own document, and **nothing is invented** — a
fabricated metric on a CV is a job-losing problem, not a stylistic one. Where a
bullet needs a number it does not have, the model says so instead of filling it
in.

Verified against a CV written to non-Australian conventions: 7 convention
breaches caught, 5 duty openers, 6 unevidenced claims, 0 of 11 bullets
quantified — and 5 of 5 rewrites verbatim with **zero invented numbers**.

Per §7, findings describe the document. Nothing infers where the candidate is
from, and no norm is described as better — only as scored differently here.

### Samples

The same six career tracks seed this page, but with a **first-draft** version of
each CV rather than the polished one. Two reasons, and the second matters more:

1. The polished CVs have already had these problems fixed, so reviewing one
   returns almost nothing and demonstrates nothing.
2. The draft is the honest starting point for the person this is built for. A
   photo, a date of birth and an objective statement are not mistakes — they are
   what a good CV looks like in most of the world, which is exactly why this
   feature has to exist.

Every draft produces real findings: 4-6 convention breaches, 5-7 duty-style
openers, 3-7 unevidenced claims, and 0% quantified bullets across all six.

## CV and posting upload

Both document fields accept a **PDF** — click to choose, or drag one onto the
box — alongside pasting text.

**Extraction runs entirely in the browser** (`pdfjs-dist`, worker served from
`public/pdfjs/`). The file is never uploaded; only the text the candidate can
see and edit in the textarea is ever sent anywhere. A CV is the most personal
document this product touches, so it follows the same rule as the camera.

The extracted text lands **in the textarea rather than being held invisibly**.
PDF extraction is never perfect on a heavily designed CV, and silently sending
a mangled version to the model degrades every downstream result with no way to
tell.

### Layout reconstruction

A PDF has no lines and no paragraphs — it has glyphs at coordinates. Joining
them in document order interleaves a two-column CV and welds every date to the
job title after it. So
[`pdf_text_extraction.client.ts`](front-end/lib/documents/pdf_text_extraction.client.ts)
groups items back into lines by vertical position, orders each line by
horizontal position, inserts spaces from the glyph gap, and starts a paragraph
where the vertical gap exceeds 1.9 line heights — a threshold tuned against a
real CV, because at 1.6 every bullet got its own blank line.

Handled explicitly: password-protected files, non-PDFs, files over 10 MB, and
**scans with no text layer** — which are detected by character count and told
plainly that OCR is not something this does, rather than returning an empty
CV.

## Career tracks

The setup screen starts from a **pre-built field** rather than an empty
textarea — pasting two documents is thirty seconds of dead air at the top of a
session, and on stage it is thirty seconds of watching someone paste.

| Track | Sample role |
| --- | --- |
| Accounting & Finance | Graduate accountant, Big Four, CA pathway |
| Business & Management | Graduate business analyst, bank transformation |
| Software Engineering | Graduate backend engineer, product company |
| Data & Analytics | Graduate data engineer, warehouse platform |
| E-commerce & Marketing | Digital marketing coordinator, online retail |
| Cybersecurity | Graduate security analyst, SOC |

Accounting and business lead the list because they are far and away the largest
fields international students in Australia graduate into — not software.

Each track in
[`career_tracks.const.ts`](front-end/lib/practice/career_tracks.const.ts) has a
plausible CV for an international student in Australia and a posting written the
way Australian graduate ads actually read, with prior roles at real employers
from the candidate's home market (FPT, VNG, JD.com, HDFC Bank, Shopee). Every
posting leaves requirements the CV does not cover, so the gap analysis has
something real to find. Picking a track fills the form rather than bypassing it — the fields stay
editable, because a candidate's own documents are always better input. Each
track carries two versions of its CV: the polished one for practice, and a
first draft for the CV review to have something worth reviewing.

## Market: international students in Australia

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

The cultural layer is **specific without being about one country**. The
recurring theme in the 27 hand-written intercultural notes is that
conversational courtesy in much of the world — deferring credit to the group,
softening claims, minimising your own contribution before it is judged — is read
by Australian interviewers as an absence of evidence rather than as good
manners. The notes describe communication norms, not people, and never say one
norm is better; the point is that the two rooms score the same sentence
differently.

Where a note names a specific tradition it is as a concrete example rather than
an assumption about the reader. A coach that knows nothing about where you are
from is the generic tool this product exists to replace, so the specifics stay —
they are just not assumed. The AI prompts are explicit that no country of origin
should be inferred unless the CV or transcript says.

The phrase lexicon
([`untranslated_phrases.const.ts`](api/src/question_library/untranslated_phrases.const.ts),
34 entries) covers four sources of friction: modesty and softening carried over
from a first language, education vocabulary with no Australian equivalent
(South and South-East Asian systems especially), American English absorbed from
study materials, and units and currencies an Australian interviewer cannot
convert in their head.

Sample candidates across the career tracks come from a spread of origins —
Indian, Chinese, Vietnamese, Nepali — because six CVs from one country would
quietly contradict the positioning. The story bank accepts any first language,
with detection as the default.

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
