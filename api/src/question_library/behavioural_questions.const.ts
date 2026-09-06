import { BehaviouralQuestion } from './behavioural_question.entity';
import { QuestionCategory } from './question_category.enum';

/**
 * Twenty-five behavioural questions, hand-written with the intent notes.
 *
 * Deliberately not generated. The spec's position is that twenty-five questions
 * with real intent notes out-demo a thousand generated ones, and the
 * `intercultural_note` field is content no competitor ships at all.
 *
 * The notes are written for an international student interviewing in
 * Australia. They describe communication norms, not people: the recurring
 * theme is that conversational courtesy in much of the world — deferring
 * credit to the group, softening claims, minimising your own contribution
 * before it is judged — is read by Australian interviewers as an absence of
 * evidence rather than as good manners.
 *
 * Where a note names a specific tradition it is as a concrete example, not a
 * claim about the reader. A coach that knows nothing about where you are from
 * is the generic tool this product exists to replace, so the specifics stay —
 * they are just no longer assumed. Nothing here says one norm is better; the
 * point is that the two rooms score the same sentence differently.
 */
export const BEHAVIOURAL_QUESTIONS: BehaviouralQuestion[] = [
  {
    question_id: 'tell-me-about-yourself',
    question_text: 'Tell me about yourself.',
    category: QuestionCategory.OPENER,
    interviewer_intent:
      'A 90-second positioning pitch, not a biography. They are checking whether you can decide what matters about you without being told.',
    what_lands: [
      'Where you are now, in one sentence',
      'Two or three things you have actually built or shipped',
      'Why this specific role is the next step',
    ],
    common_mistake:
      'Starting at birth, or reciting the resume in chronological order. The interviewer already has the resume.',
    intercultural_note:
      'Do not open with your university, your family, or how lucky you were to study here. Australian interviews treat credentials as context — what you personally did with them is the answer, and the first fifteen seconds are the ones they remember.',
    target_seconds: 90,
  },
  {
    question_id: 'disagreed-with-teammate',
    question_text: 'Tell me about a time you disagreed with a teammate.',
    category: QuestionCategory.CONFLICT,
    interviewer_intent:
      'Whether you can hold a position without making it personal, and whether you change your mind when the evidence changes.',
    what_lands: [
      'The substance of the disagreement, not just that it happened',
      'What you specifically argued for and why',
      'How it resolved, and what you did once it resolved against or for you',
    ],
    common_mistake:
      'Picking a disagreement so trivial it shows no judgement, or one where you were simply right and they were simply wrong.',
    intercultural_note:
      'This is the question where "we" costs you most. If you were raised to credit the group — the default across much of Asia, and common far beyond it — "we discussed it and we decided" will feel like the polite answer and tells an Australian interviewer nothing about you. Say what you argued for, even if the decision genuinely was shared.',
    target_seconds: 120,
  },
  {
    question_id: 'greatest-weakness',
    question_text: 'What is your greatest weakness?',
    category: QuestionCategory.FAILURE,
    interviewer_intent:
      'A self-awareness probe, not a confession. They want evidence you can see yourself clearly and act on it.',
    what_lands: [
      'A real weakness with a real cost',
      'The specific mechanism you use to manage it',
      'Evidence the mechanism works',
    ],
    common_mistake:
      'The humblebrag ("I work too hard"), or an unmanaged weakness with no fix attached.',
    intercultural_note:
      'Self-criticism that reads as appropriate modesty at home reads as a genuine red flag here — an Australian interviewer will simply take you at your word. Name one weakness, then spend most of the answer on the fix.',
    target_seconds: 60,
  },
  {
    question_id: 'time-you-failed',
    question_text: 'Tell me about a time you failed.',
    category: QuestionCategory.FAILURE,
    interviewer_intent:
      'Whether you take ownership under pressure, and whether the lesson was specific enough to change your behaviour.',
    what_lands: [
      'A failure with real stakes that you owned',
      'What you would do differently, concretely',
      'Evidence you have since done it differently',
    ],
    common_mistake:
      'Blaming the team, the tooling, or the timeline. Or choosing a "failure" that succeeded.',
    intercultural_note:
      'Owning a failure out loud is not losing face here — it is the whole point of the question, and Australian workplaces read it as maturity. Deflecting blame is the only wrong answer.',
    target_seconds: 120,
  },
  {
    question_id: 'led-without-authority',
    question_text:
      'Describe a time you led a project without formal authority.',
    category: QuestionCategory.LEADERSHIP,
    interviewer_intent:
      'Whether you can move a group when you cannot instruct it — the actual shape of most work.',
    what_lands: [
      'Why the group needed moving',
      'The specific thing you did to get alignment',
      'What shipped as a result',
    ],
    common_mistake:
      'Describing a title you held rather than influence you exercised.',
    intercultural_note:
      'Claiming leadership of a group you were part of is not boasting here. If you organised it, say "I organised it" — an Australian interviewer will not infer it from a description of the group.',
    target_seconds: 120,
  },
  {
    question_id: 'difficult-stakeholder',
    question_text: 'Tell me about a difficult person you had to work with.',
    category: QuestionCategory.CONFLICT,
    interviewer_intent:
      'Whether you can describe a hard relationship without becoming the villain of your own story.',
    what_lands: [
      'What made the working relationship hard, factually',
      'What you changed about your own approach',
      'The working outcome, not a character verdict',
    ],
    common_mistake:
      'Venting. The interviewer is imagining being described this way by you later.',
    intercultural_note: null,
    target_seconds: 120,
  },
  {
    question_id: 'tight-deadline',
    question_text:
      'Tell me about a time you had to deliver under a tight deadline.',
    category: QuestionCategory.PROBLEM_SOLVING,
    interviewer_intent:
      'How you triage. They want to hear what you cut, not that you worked more hours.',
    what_lands: [
      'The constraint and why it was real',
      'What you explicitly deprioritised',
      'What shipped, with a number',
    ],
    common_mistake:
      'Making heroism the answer. "I stayed up all night" describes a planning failure.',
    intercultural_note: null,
    target_seconds: 120,
  },
  {
    question_id: 'ambiguous-problem',
    question_text:
      'Describe a time you had to solve a problem with incomplete information.',
    category: QuestionCategory.PROBLEM_SOLVING,
    interviewer_intent:
      'Whether you can act under uncertainty instead of waiting to be told.',
    what_lands: [
      'What was genuinely unknown',
      'The assumption you chose to make, and why',
      'How you checked the assumption once you could',
    ],
    common_mistake:
      'Skipping straight to the solution and never naming the ambiguity.',
    intercultural_note:
      'Acting before being given permission is read as initiative in an Australian workplace, not as overstepping a senior person. Where you come from may draw that line very differently, so it is worth a story that shows you can work this way.',
    target_seconds: 120,
  },
  {
    question_id: 'took-initiative',
    question_text:
      'Tell me about something you built or started that nobody asked you to.',
    category: QuestionCategory.INITIATIVE,
    interviewer_intent:
      'Whether you have ever generated work rather than only receiving it.',
    what_lands: [
      'What you noticed that others had not',
      'What you built, specifically',
      'Who used it and what changed',
    ],
    common_mistake:
      'Describing an assigned project as if it were self-directed. Interviewers can hear the difference.',
    intercultural_note: null,
    target_seconds: 120,
  },
  {
    question_id: 'received-hard-feedback',
    question_text: 'Tell me about a time you received difficult feedback.',
    category: QuestionCategory.FAILURE,
    interviewer_intent:
      'Whether feedback reaches you. They are forecasting how expensive you will be to manage.',
    what_lands: [
      'The feedback, stated plainly and without softening it',
      'Your first reaction, honestly',
      'The specific change you made',
    ],
    common_mistake:
      'Choosing feedback you disagreed with and then explaining why you were right.',
    intercultural_note: null,
    target_seconds: 90,
  },
  {
    question_id: 'persuaded-someone',
    question_text: 'Describe a time you changed someone’s mind.',
    category: QuestionCategory.LEADERSHIP,
    interviewer_intent:
      'Whether you persuade with evidence or with persistence.',
    what_lands: [
      'What they believed and why it was reasonable',
      'The specific evidence you brought',
      'What they did differently afterwards',
    ],
    common_mistake: 'Describing being overruled and calling it persuasion.',
    intercultural_note: null,
    target_seconds: 120,
  },
  {
    question_id: 'competing-priorities',
    question_text: 'How do you handle competing priorities?',
    category: QuestionCategory.PROBLEM_SOLVING,
    interviewer_intent:
      'They want a decision rule, demonstrated on a real example — not a description of a to-do list.',
    what_lands: [
      'The rule you actually apply',
      'One concrete case where it forced an unpopular choice',
      'Who you told, and when',
    ],
    common_mistake:
      'Naming a tool ("I use a Kanban board") instead of a judgement.',
    intercultural_note: null,
    target_seconds: 90,
  },
  {
    question_id: 'mistake-you-caught',
    question_text: 'Tell me about a mistake you caught before it shipped.',
    category: QuestionCategory.INITIATIVE,
    interviewer_intent:
      'Whether you look for your own errors, and what you do when you find someone else’s.',
    what_lands: [
      'How you found it',
      'What you did in the next ten minutes',
      'What you changed so it could not recur',
    ],
    common_mistake:
      'Stopping at "I told my manager". The process change is the answer.',
    intercultural_note: null,
    target_seconds: 90,
  },
  {
    question_id: 'worked-with-different-culture',
    question_text:
      'Tell me about working with someone from a very different background.',
    category: QuestionCategory.TEAMWORK,
    interviewer_intent:
      'Whether you adapt, and whether you notice when the other person is adapting to you.',
    what_lands: [
      'The specific difference that caused friction in the work',
      'What you changed in how you communicated',
      'The result',
    ],
    common_mistake:
      'Answering abstractly about "respecting diversity" with no incident in it.',
    intercultural_note:
      'This is the one question where being an international student is unambiguously an asset. Use a real story — a specific misunderstanding you navigated — and do not flatten it into a platitude about respecting diversity.',
    target_seconds: 120,
  },
  {
    question_id: 'why-this-company',
    question_text: 'Why do you want to work here?',
    category: QuestionCategory.MOTIVATION,
    interviewer_intent:
      'Whether you have done any work at all, and whether your answer would survive swapping in a competitor’s name.',
    what_lands: [
      'Something specific and recent about the company',
      'Why it connects to what you have built',
      'What you want to learn there',
    ],
    common_mistake:
      'Praising the company’s size, culture page, or mission statement. Every candidate says that.',
    intercultural_note:
      'Do not lead with visa sponsorship or wanting to stay in Australia. That is the recruiter round’s question, and answering it here reframes you as a logistics problem rather than a candidate.',
    target_seconds: 90,
  },
  {
    question_id: 'why-this-role',
    question_text: 'Why this role, given your background?',
    category: QuestionCategory.MOTIVATION,
    interviewer_intent:
      'They have spotted a discontinuity in your resume and are giving you the chance to explain it.',
    what_lands: [
      'The through-line your resume does not make obvious',
      'What transfers, concretely',
      'What you know you will have to learn',
    ],
    common_mistake:
      'Pretending there is no gap. They asked because they can see one.',
    intercultural_note: null,
    target_seconds: 90,
  },
  {
    question_id: 'proudest-work',
    question_text: 'What is the piece of work you are proudest of?',
    category: QuestionCategory.INITIATIVE,
    interviewer_intent:
      'Your own standard for good work — which tells them what you will optimise for unsupervised.',
    what_lands: [
      'What it was and who it was for',
      'The specific hard part',
      'Why you are proud of it, in your own terms',
    ],
    common_mistake:
      'Choosing the most prestigious project rather than the one you can actually talk about in detail.',
    intercultural_note:
      'Pride in your own work is expected here and is not immodest. Deflecting to the team — the instinctive, polite answer in many cultures — reads as having nothing of your own to point at.',
    target_seconds: 120,
  },
  {
    question_id: 'taught-yourself',
    question_text: 'Tell me about something difficult you taught yourself.',
    category: QuestionCategory.INITIATIVE,
    interviewer_intent:
      'How you learn without a syllabus, since most of the job has none.',
    what_lands: [
      'What you needed and why',
      'How you actually went about it',
      'What you built to prove you had learned it',
    ],
    common_mistake:
      'Listing courses completed. Certificates are not evidence of learning.',
    intercultural_note:
      'Self-directed learning outranks formal coursework in this answer. A finished side project beats a completed subject, and beats a certificate outright.',
    target_seconds: 90,
  },
  {
    question_id: 'handled-scope-creep',
    question_text: 'Tell me about a project whose scope kept expanding.',
    category: QuestionCategory.PROBLEM_SOLVING,
    interviewer_intent:
      'Whether you can say no to a stakeholder and stay employed.',
    what_lands: [
      'Where the pressure came from',
      'The specific conversation where you pushed back',
      'What you protected and what you gave up',
    ],
    common_mistake: 'Absorbing all of it and describing that as flexibility.',
    intercultural_note:
      'Pushing back on a senior person is expected in an Australian workplace when you have a reason, and it is not disrespect. Silent absorption — the deferential option, and the correct one in many workplaces elsewhere — is read here as poor judgement rather than good manners.',
    target_seconds: 120,
  },
  {
    question_id: 'explained-technical-to-nontechnical',
    question_text:
      'Describe explaining something technical to a non-technical audience.',
    category: QuestionCategory.TEAMWORK,
    interviewer_intent:
      'Whether you can drop altitude, which is most of what senior work is.',
    what_lands: [
      'Who the audience was and what they needed to decide',
      'The analogy or framing you chose',
      'The decision they were then able to make',
    ],
    common_mistake:
      'Describing simplification without saying what the audience did afterwards.',
    intercultural_note: null,
    target_seconds: 90,
  },
  {
    question_id: 'juggled-work-and-study',
    question_text:
      'How did you balance coursework with everything else you were doing?',
    category: QuestionCategory.TEAMWORK,
    interviewer_intent:
      'A workload-capacity probe dressed as small talk. They are asking whether you burn out.',
    what_lands: [
      'The real constraint you were under',
      'The system you used, specifically',
      'What you dropped on purpose',
    ],
    common_mistake:
      'Claiming you did everything. Nobody believes it and it answers the wrong question.',
    intercultural_note:
      'The 48-hour-a-fortnight visa cap is a legitimate constraint to name, and so is part-time work you needed to do. It is context, not an excuse, and Australian interviewers respect it.',
    target_seconds: 90,
  },
  {
    question_id: 'questions-for-us',
    question_text: 'What questions do you have for us?',
    category: QuestionCategory.LOGISTICS,
    interviewer_intent:
      'Still a scored question. What you ask about reveals what you will care about on the job.',
    what_lands: [
      'Something specific about how the team actually works',
      'A question only answerable by someone who works there',
      'One about how success is measured in the first six months',
    ],
    common_mistake:
      'Having no questions, or asking something the careers page answers.',
    intercultural_note:
      'Asking questions is not challenging authority here — it is expected. Having none reads as indifference, and Australian interviewers are unusually informal about this, so a direct question about the team is welcome.',
    target_seconds: 60,
  },
  {
    question_id: 'sponsorship-requirement',
    question_text:
      'Do you have full working rights in Australia, or would you need sponsorship?',
    category: QuestionCategory.LOGISTICS,
    interviewer_intent:
      'A compliance checkbox the recruiter has to tick, not a judgement. What they are actually listening for is whether you know your own situation — vagueness here is what kills the application, not the visa itself.',
    what_lands: [
      'A direct answer in the first three words',
      'The visa by subclass number, with dates',
      'How long you can work with nothing for them to lodge',
    ],
    common_mistake:
      'Apologising, hedging, or over-explaining. Length reads as uncertainty here more than anywhere else.',
    intercultural_note:
      'Say it in under twenty seconds and then stop. The silence afterwards is theirs to fill, not yours — resist the urge to keep explaining, which in many conversational traditions is simple courtesy and here reads as anxiety.',
    target_seconds: 20,
  },
  {
    question_id: 'work-authorisation-status',
    question_text: 'What visa are you on, and what are your work rights?',
    category: QuestionCategory.LOGISTICS,
    interviewer_intent:
      'A factual question with a factual answer. Precision here builds more confidence than any other answer in the round.',
    what_lands: [
      'The subclass number, said out loud',
      'The dates that bound it',
      'Any cap on your hours, stated before they ask',
    ],
    common_mistake:
      'Vagueness. "I think I can work for a while" is worse than any actual status.',
    intercultural_note:
      'Say the subclass number — "500", "485". Australian recruiters work in those numbers daily, and using them signals you understand your own situation. Volunteering the 48-hour fortnightly cap before being asked reads as organised, not as a problem.',
    target_seconds: 30,
  },
  {
    question_id: 'where-in-five-years',
    question_text: 'Where do you see yourself in five years?',
    category: QuestionCategory.MOTIVATION,
    interviewer_intent:
      'A retention question. They are checking that the role is a step on a path you have thought about.',
    what_lands: [
      'A direction rather than a job title',
      'What you want to be good at',
      'Why this role is a plausible first step',
    ],
    common_mistake:
      'Naming a title above the interviewer’s, or saying "I have not thought about it".',
    intercultural_note:
      'Do not answer this with your visa timeline or permanent residence plans. It is a question about ambition, and answering it with migration reframes you as temporary.',
    target_seconds: 60,
  },
  {
    question_id: 'why-australia',
    question_text: 'Why do you want to stay and work in Australia?',
    category: QuestionCategory.MOTIVATION,
    interviewer_intent:
      'Not a migration question, despite how it sounds. They are checking whether you want this work, or whether the job is a means to a visa — because the second kind leaves as soon as the visa is settled.',
    what_lands: [
      'Something about the work or the industry here, not the country',
      'What you have already built or contributed while studying',
      'Why this employer specifically fits that',
    ],
    common_mistake:
      'Answering with lifestyle, weather, or permanent residence. All three confirm the fear behind the question.',
    intercultural_note:
      'The honest answer for many international students includes family and permanent residence, and that is entirely legitimate — but it is not what this question is asking. Answer about the work. Nobody is owed your migration plans in a first-round interview.',
    target_seconds: 90,
  },
  {
    question_id: 'no-local-experience',
    question_text:
      'You have no Australian work experience. How would you handle that?',
    category: QuestionCategory.MOTIVATION,
    interviewer_intent:
      'A direct test of whether you fold. They already know the answer to the factual part — what they are measuring is whether you argue for yourself or agree with the objection.',
    what_lands: [
      'A short, non-defensive acknowledgement — one clause, not a paragraph',
      'The closest thing you have actually done, with specifics',
      'What transfers and what you would need to learn',
    ],
    common_mistake:
      'Agreeing at length. The interviewer raised it to see the rebuttal, not to be told they are right.',
    intercultural_note:
      'The polite response in many cultures is to concede the point and apologise for the gap. Here that ends the conversation. Concede in five words, then spend the rest of the answer on evidence — casual work, placements, university projects with real users and a real deadline all count.',
    target_seconds: 90,
  },
];

export const SPONSORSHIP_QUESTION_ID = 'sponsorship-requirement';
