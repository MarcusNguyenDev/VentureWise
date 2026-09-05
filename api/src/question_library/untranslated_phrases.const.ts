/**
 * Phrases a Vietnamese student in Australia says naturally that an Australian
 * interviewer will misread.
 *
 * This is the reverse direction of F-03: not what the interviewer meant, but
 * what the candidate said that did not travel. Detection is a lexicon match, so
 * it runs with no model call; explaining what the lexicon misses is the model's
 * job.
 *
 * Three sources of friction, in rough order of how often they bite:
 *
 *   1. Direct translations from Vietnamese that are grammatical English but
 *      carry the wrong meaning here.
 *   2. Vietnamese and wider South-East Asian education vocabulary with no
 *      Australian equivalent.
 *   3. American English absorbed from study materials and the internet, which
 *      is understood in Australia but marks the speaker as having learned from
 *      US sources rather than local ones.
 *
 * Every entry carries a replacement, because flagging without a swap is just
 * telling somebody their English is wrong — the opposite of this product.
 */

export interface UntranslatedPhraseEntry {
  /** Matched case-insensitively as a whole phrase. */
  phrase: string;
  why_it_does_not_travel: string;
  suggested_replacement: string;
}

export const UNTRANSLATED_PHRASES: UntranslatedPhraseEntry[] = [
  // ── Education vocabulary ────────────────────────────────────────────────
  {
    phrase: 'final year project',
    why_it_does_not_travel:
      'Australian degrees call this a capstone, thesis or honours project. "Final year project" reads as a translation.',
    suggested_replacement: 'my capstone project',
  },
  {
    phrase: 'fresher',
    why_it_does_not_travel:
      'Not used in Australia. A new graduate is a "graduate", and the graduate programs are literally named that.',
    suggested_replacement: 'a recent graduate',
  },
  {
    phrase: 'passed out',
    why_it_does_not_travel:
      'In Australian English this means losing consciousness, not graduating.',
    suggested_replacement: 'graduated',
  },
  {
    phrase: 'do the needful',
    why_it_does_not_travel:
      'Not Australian business English. It reads as either archaic or as a form email.',
    suggested_replacement: 'sort it out',
  },
  {
    phrase: 'revert back',
    why_it_does_not_travel:
      '"Revert" means to return to a previous state in Australian usage, not to reply.',
    suggested_replacement: 'get back to you',
  },
  {
    phrase: 'sem 7',
    why_it_does_not_travel:
      'Numbered semesters past two are not an Australian convention and give no sense of when this was.',
    suggested_replacement: 'my final year',
  },
  {
    phrase: 'cgpa',
    why_it_does_not_travel:
      'Australian universities use a WAM out of 100, or a GPA on a 7-point scale. A CGPA out of 10 or 4 will be misread.',
    suggested_replacement: 'my WAM, or the GPA on the 7-point scale',
  },
  {
    phrase: 'marks',
    why_it_does_not_travel:
      'Understood, but Australian workplaces say grades or results. "Marks" sounds like secondary school.',
    suggested_replacement: 'grades',
  },
  {
    phrase: 'my guide',
    why_it_does_not_travel:
      '"Guide" for a thesis supervisor is not Australian usage and will be heard as a tour guide.',
    suggested_replacement: 'my supervisor',
  },
  {
    phrase: 'batchmate',
    why_it_does_not_travel: 'Not used in Australia.',
    suggested_replacement: 'someone in my cohort',
  },
  {
    phrase: 'giving exam',
    why_it_does_not_travel:
      'In Australian English the examiner gives an exam; the student sits it.',
    suggested_replacement: 'sitting an exam',
  },
  {
    phrase: 'doing internship',
    why_it_does_not_travel:
      'Missing the article marks it as translated. Australians say "doing an internship" or, more often, "on placement".',
    suggested_replacement: 'on placement',
  },

  // ── Direct translations from Vietnamese ─────────────────────────────────
  {
    phrase: 'i have no experience',
    why_it_does_not_travel:
      'Often a direct rendering of a modest Vietnamese framing, but an Australian interviewer takes it literally and stops looking for evidence.',
    suggested_replacement:
      "I haven't done exactly this, but the closest thing I've done is",
  },
  {
    phrase: 'i only did',
    why_it_does_not_travel:
      'Pre-emptive minimising reads as a factual limit on your contribution rather than as modesty.',
    suggested_replacement: 'I did',
  },
  {
    phrase: 'just a small project',
    why_it_does_not_travel:
      'Diminishing your own work before it is judged. The interviewer will accept your assessment.',
    suggested_replacement: 'a project where I',
  },
  {
    phrase: 'my english is not good',
    why_it_does_not_travel:
      'Standard Vietnamese politeness, but it introduces a doubt the interviewer did not have and cannot now unhear.',
    suggested_replacement: '(say nothing — let the answer speak)',
  },
  {
    phrase: 'sorry for my english',
    why_it_does_not_travel:
      'Apologising for your English is the single most common self-inflicted wound in these interviews. Australian workplaces are used to accents.',
    suggested_replacement: '(say nothing — let the answer speak)',
  },
  {
    phrase: 'i think maybe i can',
    why_it_does_not_travel:
      'Stacked hedges. Vietnamese softens claims as a matter of courtesy; Australian interviewers read stacked hedging as genuine uncertainty.',
    suggested_replacement: 'I can',
  },
  {
    phrase: 'teacher',
    why_it_does_not_travel:
      'At university level Australians say lecturer, tutor or supervisor. "Teacher" reads as school.',
    suggested_replacement: 'my lecturer',
  },
  {
    phrase: 'company want',
    why_it_does_not_travel:
      'Vietnamese does not inflect verbs for number, so a dropped "s" is a very common carry-over. It is minor, but it is easy to fix.',
    suggested_replacement: 'the company wants',
  },

  // ── American English absorbed from study materials ──────────────────────
  {
    phrase: 'resume',
    why_it_does_not_travel:
      'Understood in Australia, but "CV" is more common in job ads here. Minor, and only worth matching to the posting.',
    suggested_replacement: 'CV',
  },
  {
    phrase: 'freshman',
    why_it_does_not_travel:
      'A US year label with no Australian equivalent. Australians say first year.',
    suggested_replacement: 'first year',
  },
  {
    phrase: 'gpa of 4.0',
    why_it_does_not_travel:
      'The Australian GPA scale runs to 7, so a 4.0 sounds mediocre here rather than perfect.',
    suggested_replacement: 'my GPA on the 7-point scale',
  },
  {
    phrase: 'college',
    why_it_does_not_travel:
      'In Australia "college" usually means a secondary school or a residential hall, not university.',
    suggested_replacement: 'university',
  },
  {
    phrase: 'math',
    why_it_does_not_travel: 'Australians say maths.',
    suggested_replacement: 'maths',
  },
  {
    phrase: 'internship program',
    why_it_does_not_travel:
      'Australian employers usually call the structured entry route a graduate program, and short placements vacation work.',
    suggested_replacement: 'graduate program',
  },

  // ── Units and money ─────────────────────────────────────────────────────
  {
    phrase: 'lakh',
    why_it_does_not_travel:
      'A unit almost no Australian interviewer can convert, so your number does not land.',
    suggested_replacement: 'the figure in thousands',
  },
  {
    phrase: 'crore',
    why_it_does_not_travel:
      'A unit almost no Australian interviewer can convert, so your number does not land.',
    suggested_replacement: 'the figure in millions',
  },
  {
    phrase: 'dong',
    why_it_does_not_travel:
      'Quoting a figure in Vietnamese dong makes the interviewer do a conversion they cannot do in their head, and the point is lost.',
    suggested_replacement: 'the approximate Australian dollar equivalent',
  },
];
