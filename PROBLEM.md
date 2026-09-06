# VentureWise — Problem Definition

*A statement of the problem, before any solution. It defines who is affected, what specifically goes wrong, why it persists, and how we would know it had been solved. The build is described in [`PRESENTATION.md`](PRESENTATION.md); the original spec is [`spec.md`](spec.md).*

---

## 1. Problem statement

> **Graduate hiring in Australia is gated by a one-way video interview — record your answer to a prompt, alone, to a lens, usually once. It is the format in which an international student's disadvantages are most expensive and least recoverable, and it is the only stage of the process that offers no way to practise and no feedback when you fail.**

The candidate records into a void. Nobody is on the other side to ask a follow-up, read hesitation, or give the answer a second chance. The recording is reviewed later — often skimmed, often at speed, sometimes by a scoring model — and the rejection arrives with no explanation.

**This is not a problem of access to employment.** See §2. It is a problem of *preparation for a format that cannot be practised.*

---

## 2. What the research changed

Two findings that overturn the framing this document originally carried. Both are recorded here rather than quietly edited out, because the first one invalidates the easiest and most common pitch in this category.

### 2.1 Employment rates are the same

**International and domestic graduates in Australia reach comparable employment rates.** The disparity narrative — *"they are qualified and they are not getting hired"* — is not supported, and any pitch resting on it is wrong.

What this does and does not establish:

| It rules out | It does not address |
| --- | --- |
| A hiring-outcome gap as the problem | What the *effort* to reach parity costs — applications sent, rounds failed, months spent |
| Discrimination in outcomes as the pitch | Whether the role matches the qualification |
| "They can't get hired" as the premise | Whether candidates experience the process as fair, legible or practisable |

**The honest reframing:** the problem is on the **demand side, not the outcome side.** Students want to prepare, are trying to prepare, and cannot — because the format that gates them offers no practice partner and no feedback. That is a real and fundable problem, and it does not require anyone to be losing jobs.

> **Sourcing note.** Pin this to a citation before it is said on stage — Graduate Outcomes Survey, and state *which* measure, because full-time versus any employment, and the four-month versus three-year horizon, are materially different numbers. Being precise here is the credibility of the whole document: this is the finding that most invites a challenge from a judge, and it is also the finding that makes the pitch defensible rather than lazy.

### 2.2 The gate is a one-way video interview

Graduate hiring at the scale international students apply into — the Big Four, the banks, large graduate programs — routes candidates through an **asynchronous recorded video interview** before any human conversation. Typical shape: a written or spoken prompt, a short preparation window measured in seconds, a capped answer time, and one take or very few.

This was absent from the original spec, which modelled a live three-round process. **It is the single most important fact in this document**, because it changes the severity of every problem in §5 and the entire feasibility of practising for them.

### 2.3 Candidates expect to prepare delivery, posture and fluency

Users are explicit about what they want to rehearse: **confident and fluent answers, posture, presence on camera.** This is a demand fact, and it sits in real tension with a design principle this product holds (§9.2). The tension is a decision to be made, not a contradiction to be hidden.

---

## 3. Who has this problem

**An international student in Australia, final year or inside the post-study work window, applying to graduate programs.**

| Attribute | Why it matters to the problem |
| --- | --- |
| Fluent but non-native English | Fluent enough that language teaching is irrelevant; non-native enough that delivery scoring calibrated on native speakers penalises them |
| Raised in a communication culture with different credit-claiming norms | The highest-cost difference, and the one they are least aware of |
| Holds a temporary visa (subclass 500 or 485) | Adds an entire topic — often a knockout form field — that domestic candidates never face |
| No social network inside the local professional culture | This is the actual delivery mechanism for interview conventions, and they do not have it |
| Facing a one-way video gate | Removes every recovery mechanism a live conversation provides |

**Weighted toward Accounting & Finance and Business & Management** — far and away the largest fields international students in Australia graduate into, not software. This is not incidental: **those are precisely the employers who screen at scale with one-way video.** The dominant field and the dominant format reinforce each other.

**Not the user:** technical and coding interview candidates (a different product), and anyone seeking migration advice (a regulated activity — §9.4).

---

## 4. The format is the problem multiplier

Everything in §5 is a known disadvantage. The one-way format is what makes each one unrecoverable.

| Live interview | One-way recorded |
| --- | --- |
| Interviewer hears "we" and asks *"what was your part?"* | The answer stands as recorded. **There is no rescue.** |
| You read the room and course-correct mid-answer | No reaction to read. You are talking to a lens. |
| A pause is absorbed by a human who waits | A pause is dead air on a recording being skimmed |
| Rapport carries a weak answer | Nothing carries anything. The artefact is all there is. |
| You can ask what they meant by the question | The prompt is all you get |
| Sponsorship comes up in conversation, with context | Often a checkbox, or 30 seconds to camera with no read on the reaction |
| A mock interview with a friend is realistic practice | **A friend cannot simulate an empty room and a countdown** |

Four properties make this format uniquely hostile to the user in §3:

1. **No recovery.** A live interviewer who wants to hire you will help you. The recording will not.
2. **No feedback, ever.** Candidates are rejected without knowing whether it was the content, the delivery, the framing or the visa field. **There is no learning signal in the entire loop** — which means candidates repeat the same failure across dozens of applications.
3. **Self-review is not available.** The candidate cannot see what the reviewer sees. Watching your own recording tells you how it felt, not how it scored.
4. **It cannot be rehearsed with a person.** Every existing mock-interview product, including university career services, assumes a human on the other side. The format that actually gates the candidate is the one nobody simulates.

**This is the wedge.** Not "international students can't get hired" — they do. It is that the stage which filters most of them out is the one stage with no practice, no feedback and no second take.

---

## 5. The problem decomposed

Four failures. Each is real in a live interview and each is strictly worse on a recording.

### 5.1 Credit attribution — the pronoun problem

Across much of the world, and emphatically across much of Asia, conversational courtesy means deferring credit to the group, softening claims, and minimising your contribution before someone else judges it. It is good manners, and it is taught.

An Australian reviewer hears *"we redesigned the pipeline"* and records **no evidence this candidate did anything.**

Every prep tool teaches STAR. **None checks whether the Action section contains a first-person verb** — the only part of STAR where this difference surfaces, and the part that decides whether the answer worked.

**On a recording this is terminal.** A live interviewer with any skill hears a group-credited answer and probes for the individual contribution — the question itself is a rescue. A recorded answer gets no probe. Six "we"s and no "I" is simply what the reviewer receives, and it is the last thing they will ever hear from that candidate.

The candidate cannot self-diagnose it. The answer *felt* appropriately modest, and nothing in the process will ever tell them otherwise.

### 5.2 Delivery scored against the wrong baseline

Delivery analytics — pace, fillers, pauses, inferred "confidence" — were tuned on native speakers. A second-language speaker pausing to retrieve a word produces a **fluency artefact, not a competence signal.** Every scorer on the market marks it as hesitancy.

Three layers, worsening:

1. **False penalty** — scored down for something that does not predict job performance.
2. **False lesson** — coached to fix a non-problem, spending scarce preparation time on it.
3. **Reinforced belief** — a tool they trusted has now confirmed the fear they already had, that they sound less competent than they are.

The third layer is the expensive one and appears in no metric any prep tool reports.

**On a recording, delivery is a larger share of the total signal**, because none of the compensating channels exist. No rapport, no back-and-forth, no chance to warm up. Some employers additionally run automated scoring over the recording, which means a native-speaker-calibrated model may be grading the answer directly.

### 5.3 The work-rights question

*"Will you now or in the future require sponsorship to work in Australia?"*

Structurally unlike every other question:

- **Fact-based, not narrative.** There is a correct answer; you know it or you do not.
- **Requires arithmetic under pressure.** How long can you work with no action from this employer? A function of visa subclass, qualification level, course end date, and whether study was regional. Computing that live is exactly what makes people hedge.
- **Hedging is fatal.** Uncertainty about work rights is heard as risk, and risk ends the process.
- **The most rehearsable question in the entire process** — and nothing rehearses it.

**The Australian answer is structurally stronger than the American one**, and almost no candidate knows to say it: the subclass 482 has no annual cap, no ballot, and no once-a-year filing window, which removes the precise objection the employer is bracing for. The strongest available answer goes unsaid because nobody has told them it exists.

**In the one-way format it is often not even a question** — it is a knockout checkbox, or thirty seconds to camera with no read on how it landed. The prevailing state of the art is a university blog post advising candidates to "answer honestly and confidently," which describes a desired outcome rather than providing preparation.

### 5.4 Untransmitted tacit knowledge

Domestic candidates learn interview conventions from parents, housemates and part-time managers who share their frame of reference. Unpriced, ambient, impossible to buy.

- **Inbound —** not knowing what the question tests. *"Tell me about yourself"* is a ninety-second positioning pitch, not a biography. *"Greatest weakness"* is a self-awareness probe, not a confession — and self-criticism that reads as appropriate modesty at home is taken here at face value.
- **Outbound —** vocabulary the reviewer cannot decode: "final year project", "fresher", "passed out" meaning *graduated*, "do the needful", a currency they cannot convert in their head, a grade from a system they do not recognise. Each costs a little credibility, and none is ever mentioned in a rejection.

Not a competence deficit. An information asymmetry with no distribution channel — and on a recording, no opportunity for the reviewer to ask what you meant.

---

## 6. Why the market has not solved it

| | Grades **what you say** | Grades **how you say it** | Intercultural layer | Work-rights rehearsal | **Simulates one-way format** |
| --- | :---: | :---: | :---: | :---: | :---: |
| Big Interview | ● | ◐ | ○ | ○ | ◐ |
| Yoodli | ○ | ● | ○ | ○ | ○ |
| Final Round AI | ● | ◐ | ○ | ○ | ○ |
| CleverPrep | ● | ○ | ○ | ○ | ○ |
| Huru | ◐ | ◐ | ○ | ○ | ◐ |
| Interstride | ○ | ○ | ◐ | ◐ | ○ |
| FrogHire / MigrateMate | ○ | ○ | ○ | ◐ | ○ |
| University career services | ◐ | ○ | ◐ | ◐ | ○ |

`●` core · `◐` partial or adjacent · `○` absent

Some tools let you record an answer. **None of them close the loop that matters:** recording without knowing what the reviewer will see is the same void the real process provides, just earlier.

Five structural reasons this persists:

1. **The affected population is invisible in the design process.** A team that shares the room's conventions cannot see the conventions.
2. **The adjacent products are content, not practice.** International-student career platforms publish advice with no practice engine; sponsorship-aware job boards filter listings and coach nothing. The two halves sit in different companies.
3. **The intercultural layer looks like localisation and is not.** It cannot be built by translation — it requires knowing that a *specific sentence* scores differently in two rooms. Hand-written knowledge, not generated content.
4. **Mock-interview products are built around a human partner**, so the one format with no human is the one they structurally cannot address.
5. **It is adjacent to hiring discrimination, so the naive build is a liability.** Any system that infers where a candidate is from and adjusts accordingly is legally and ethically dangerous in Australia. Getting it right requires a constraint (§9) that a team optimising for demo impact will not naturally adopt.

---

## 7. Cost of the problem

Stated carefully, given §2.1 — **none of this claims an employment-outcome gap.**

**For the candidate.** A gated stage with no feedback means failures are uninformative and therefore repeatable: the same mistake ships across dozens of applications, because nothing in the loop identifies it. Preparation effort is spent unguided, or on the wrong things. The process is experienced as opaque and arbitrary, against a visa clock that makes each cycle more expensive than it is for a domestic peer.

**For the employer.** A native-speaker-calibrated screen — human or automated — applied to a recorded artefact with no conversational context, measures willingness to claim credit in a second language, alone, to a lens, on one take. That is close to uncorrelated with job performance, and it is patterned by origin, which is the shape of a discrimination problem regardless of the aggregate hiring rate.

**For the university.** Graduate outcomes are a reported metric and a recruitment claim. Career services know about this gap and address it with PDFs and one-to-one appointments that do not scale, and that rehearse the wrong format.

> **Sizing note.** No market-size figures appear here. Enrolment counts, field-of-study distribution and any employment measure should be taken from Department of Education data and the Graduate Outcomes Survey before being stated anywhere, including on stage. The directional claims — accounting and business dominate over IT; large graduate employers screen with one-way video — are well supported; the precise numbers are not yet verified in this repository.

---

## 8. What a solution must do

| # | Requirement | From |
| --- | --- | --- |
| R1 | Simulate the actual gate: a prompt, a short preparation window, a capped answer, recorded to camera | §4 |
| R2 | **Close the feedback loop the real format lacks** — show the candidate what a reviewer receives, not how it felt | §4.2, §4.3 |
| R3 | Make credit attribution visible **while the candidate is still speaking**, because on a recording there is no later | §5.1 |
| R4 | Show the *same story* re-attributed, so the fix is concrete rather than abstract advice | §5.1 |
| R5 | Score delivery on properties that genuinely change how an answer lands, and **publish the list of things it refuses to score** | §5.2 |
| R6 | Never infer origin, nationality or first language from how somebody speaks | §5.2, §9.1 |
| R7 | Coach camera presence — framing, posture, eye-line, energy — as **observable and fixable technique** | §2.3, §5.2 |
| R8 | Do the work-rights arithmetic once, exactly, so the candidate memorises a number instead of computing it live | §5.3 |
| R9 | Rehearse the work-rights answer against a clock until it is short and free of hedging | §5.3 |
| R10 | Make question intent explicit — what is actually being tested, and what a strong answer contains | §5.4 |
| R11 | Flag outbound vocabulary that will not decode, **always with a replacement** | §5.4 |
| R12 | Feel instantaneous during speech — feedback arriving seconds late is worse than none | latency |

**R2 is the core of the product.** Everything else is a feature; R2 is the thing the real process structurally cannot provide, and the reason a candidate would use this rather than recording themselves on a phone.

**R12 is the binding architectural constraint.** R3 and R4 are worthless if feedback lags the speech, which forces work to be split by latency budget rather than by feature.

---

## 9. Constraints the problem imposes

Consequences of the problem, not implementation preferences. Violating any turns the solution into a worse product than not building it.

### 9.1 Do not classify the speaker
Detect patterns in text; never infer the person. Output is always *"here is a sentence you said and how it will land"* — never *"you are probably from X."* Inferring origin from speech is the exact inference this product exists to argue against, and near hiring it is legally fraught in Australia. Where origin is relevant it is **asked, optional and self-declared.**

### 9.2 Coach observable behaviour; never score inferred traits
This is where §2.3 has to be reconciled. Candidates want posture and confidence coaching, and the product refuses to score inferred confidence. Both can hold, on one distinction:

| Coachable — observable and fixable | Refused — inferred and unfixable |
| --- | --- |
| "You were framed off-centre and lit from behind" | "You seemed unconfident" |
| "You looked at your own preview, not the lens" | "You appeared nervous" |
| "Your pace dropped to 95 wpm in the last 20 seconds" | "You sounded uncertain" |
| "Brow movement rate rose during the closing" | Any emotional-state classification |

Telling someone they *seemed* unconfident is unfixable and lands as an insult. Telling them their eye-line was on the preview window is a thing they can change on the next take.

**One genuine open decision.** In a *live* interview, scoring eye contact penalises cultural deference — reducing eye contact with a senior person is respect in many cultures, and the current design refuses to score it for that reason. **In a one-way recording there is no person to defer to.** Looking at the lens rather than at your own thumbnail is camera technique, like not sitting backlit, and the cultural objection largely dissolves. Whether gaze becomes coachable — or scoreable — in the recorded format specifically is a decision to make deliberately, not to drift into. It currently sits in `NOT_SCORED_BY_DESIGN`.

### 9.3 Never score what you set out to defend
If accent, second-language grammar or inferred confidence enters any score, the product has reproduced the defect it was built to fix. This must be **stated in the UI**, not merely honoured in code — an unstated refusal is indistinguishable from no refusal.

### 9.4 Migration advice is regulated
In Australia only a MARA-registered migration agent or a legal practitioner may give it. The product coaches *how to say* a fact about work rights; it must never advise *what to do* about a visa. Requires a permanent, visible disclaimer.

### 9.5 Unverified data must be visibly unverified
A candidate repeats employer sponsorship claims out loud to someone who works there. Sample or unconfirmed data is marked in the API and warned about in the UI, and visa durations must be verifiable against the current Home Affairs source — the subclass 485 rules have changed more than once recently.

### 9.6 Practice, not assistance
Real-time help *during a live interview* is a different product and an ethics argument the category does not need. **This constraint is sharper in the one-way format**, where an assistant would be straightforwardly cheating a recorded assessment. The scope is rehearsal, before the fact.

### 9.7 Be specific about culture without being about a person
A coach that knows nothing about where you are from is the generic tool this replaces, so cultural specifics stay — as examples the reader may recognise or ignore, never assumptions about them. No norm is described as better. The claim is only that **the two rooms score the same sentence differently.**

---

## 10. Success criteria

**For the candidate — behaviour change, not satisfaction:**

- First-person attribution in the Action portion rises measurably between a first and second take of the same prompt.
- The work-rights answer lands under twenty seconds with no hedging language.
- The candidate can state, without computing, exactly how long they can work with no action from the employer.
- Outbound vocabulary that does not decode drops between sessions.
- The candidate can articulate what a reviewer would see in their recording — the gap the real process never closes.

**For the product — proof the constraints held:**

- No score derives from accent, second-language grammar or inferred confidence, and the refusal is visible in the UI.
- No output asserts or implies where the candidate is from.
- In-speech feedback reads as a live reaction, not a delayed report.
- Nothing generated as a placeholder can be mistaken for real analysis.

**Explicitly out of scope as success measures:** offer rates and hiring outcomes. Given §2.1 they are also the wrong measure — the aggregate outcome is already at parity, and the claim is about the cost and legibility of getting there.

---

## 11. Why now

- **Real-time speech in the browser is free.** The Web Speech API makes live transcription zero-infrastructure, which is what makes in-speech feedback viable at all.
- **Face landmarking runs client-side.** Camera presence can be analysed without a frame ever leaving the browser — which is the only acceptable way to do it.
- **Small models became cheap enough for a hot path.** Sub-cent, sub-second structured calls make mid-answer judgement affordable at fractions of a cent per session.
- **Most of the work is deterministic anyway.** Credit attribution, diffing, delivery scoring and the visa arithmetic are exactly computable; only a minority needs judgement, which keeps cost and latency low.
- **The one-way video screen is now the default gate at graduate scale**, and the tooling built for live mock interviews does not address it.

---

## 12. What this changes about current scope

Recorded here because §2.2 arrived after the build started, and the gap is real.

| Currently built for | The format users actually face |
| --- | --- |
| Three live rounds — recruiter screen, hiring manager, peer panel — with personas and rambling tolerance | A single asynchronous recorded screen, no persona present, hard time cap |
| Free-running answer length | Capped answer time, short preparation window, few or no retakes |
| Live-interview framing throughout the copy | The gate is a recording reviewed later, possibly scored automatically |
| Camera treated as a mirror, deliberately never scored | Camera presence is the *primary* channel when nothing else exists |

The panel simulation is not wasted — it models the rounds that come *after* the gate, and it is where the gap analysis lives. But **the one-way recorded screen is the stage that filters most candidates out, and nothing currently simulates it.** Closing that is the highest-value change available.

**Open questions to resolve before building further:**

1. Which measure supports §2.1, and at what horizon? Pin the citation.
2. Does gaze-to-lens become coachable in the recorded format, given §9.2's open decision?
3. Do we model retakes honestly — one take, as most employers enforce — or allow unlimited practice takes and be explicit that the real thing does not?
4. What preparation window and answer cap do the dominant Australian graduate employers actually use? These are concrete, checkable numbers and they should drive the timer defaults rather than being guessed.

---

*VentureWise · Problem definition · Not migration advice*
