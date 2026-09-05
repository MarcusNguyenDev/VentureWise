/**
 * Phrases an international student says naturally that a US interviewer will
 * not decode.
 *
 * This is the reverse direction of F-03: not what the interviewer meant, but
 * what the candidate said that did not travel. Detection is a lexicon match, so
 * it runs with no model call; the explanation of *why* is the model's job.
 *
 * Each entry carries a replacement, because flagging without a swap is just
 * telling somebody their English is wrong.
 */

export interface UntranslatedPhraseEntry {
  /** Matched case-insensitively as a whole phrase. */
  phrase: string;
  why_it_does_not_travel: string;
  suggested_replacement: string;
}

export const UNTRANSLATED_PHRASES: UntranslatedPhraseEntry[] = [
  {
    phrase: 'final year project',
    why_it_does_not_travel:
      'US degrees call this a capstone or senior project. "Final year" reads as a translation.',
    suggested_replacement: 'my capstone project',
  },
  {
    phrase: 'fresher',
    why_it_does_not_travel:
      'In US usage a "fresher" is a first-year undergraduate, not a new graduate entering the workforce.',
    suggested_replacement: 'new graduate',
  },
  {
    phrase: 'passed out',
    why_it_does_not_travel:
      'In US English this means losing consciousness, not graduating.',
    suggested_replacement: 'graduated',
  },
  {
    phrase: 'do the needful',
    why_it_does_not_travel:
      'Not current US business English. It reads as either archaic or as a form email.',
    suggested_replacement: 'handle it',
  },
  {
    phrase: 'revert back',
    why_it_does_not_travel:
      '"Revert" means to return to a previous state in US usage, not to reply.',
    suggested_replacement: 'get back to you',
  },
  {
    phrase: 'prepone',
    why_it_does_not_travel: 'Not a word in US English.',
    suggested_replacement: 'move it earlier',
  },
  {
    phrase: 'cgpa',
    why_it_does_not_travel:
      'US interviewers know GPA on a 4.0 scale. A CGPA out of 10 will be misread by more than half.',
    suggested_replacement: 'GPA, converted to the 4.0 scale',
  },
  {
    phrase: 'sem 7',
    why_it_does_not_travel:
      'Numbered semesters are not a US convention and give no sense of when this was.',
    suggested_replacement: 'my final year',
  },
  {
    phrase: 'college',
    why_it_does_not_travel:
      'In much of the world "college" means secondary school. In the US it means university, so this can silently misdate your story.',
    suggested_replacement: 'university',
  },
  {
    phrase: 'marks',
    why_it_does_not_travel: 'US academics say grades or scores.',
    suggested_replacement: 'grades',
  },
  {
    phrase: 'batchmate',
    why_it_does_not_travel: 'Not used in the US.',
    suggested_replacement: 'classmate',
  },
  {
    phrase: 'my guide',
    why_it_does_not_travel:
      '"Guide" for a thesis supervisor is not US usage and will be heard as a tour guide.',
    suggested_replacement: 'my advisor',
  },
  {
    phrase: 'placement',
    why_it_does_not_travel:
      'Campus placement systems do not exist in the US; the word carries no meaning here.',
    suggested_replacement: 'campus recruiting',
  },
  {
    phrase: 'intimate',
    why_it_does_not_travel:
      'Used in some varieties of English to mean "notify". In US English it does not mean that at all.',
    suggested_replacement: 'let them know',
  },
  {
    phrase: 'out of station',
    why_it_does_not_travel: 'Not US usage.',
    suggested_replacement: 'out of town',
  },
  {
    phrase: 'tuition',
    why_it_does_not_travel:
      'In US English "tuition" is the fee you pay a university, never private coaching.',
    suggested_replacement: 'tutoring',
  },
  {
    phrase: 'lakh',
    why_it_does_not_travel:
      'A unit most US interviewers cannot convert, so your number does not land.',
    suggested_replacement: 'the figure in thousands or millions',
  },
  {
    phrase: 'crore',
    why_it_does_not_travel:
      'A unit most US interviewers cannot convert, so your number does not land.',
    suggested_replacement: 'the figure in millions',
  },
  {
    phrase: 'first class',
    why_it_does_not_travel:
      'A degree classification with no US equivalent; it will be heard as an airline seat.',
    suggested_replacement: 'the GPA itself',
  },
  {
    phrase: 'mail id',
    why_it_does_not_travel: 'Not US usage.',
    suggested_replacement: 'email address',
  },
  {
    phrase: 'cv',
    why_it_does_not_travel:
      'In the US a CV is an academic document. Industry roles expect a resume, and the words are not interchangeable.',
    suggested_replacement: 'resume',
  },
  {
    phrase: 'take a call',
    why_it_does_not_travel:
      'Means "make a decision" in some varieties; in US English it means answering the phone.',
    suggested_replacement: 'make the decision',
  },
];
