/**
 * Australian CV conventions that a CV written to another country's norms will
 * routinely break.
 *
 * This is §3.4 of PROBLEM.md applied to the document rather than the answer:
 * outbound information the reader cannot decode, or — worse here — information
 * the reader is not supposed to have at all.
 *
 * The photo, date of birth and marital status checks matter most and are the
 * least intuitive. Including them is completely standard in much of Europe and
 * Asia. In Australia they are not neutral: an employer who can see a
 * candidate's age, gender or marital status before shortlisting has acquired
 * evidence they may later have to prove they did not use, so many organisations
 * discard or redact such CVs on policy. The candidate is penalised for
 * following the convention they were taught, and nothing in the rejection ever
 * says so.
 *
 * Per §7, these findings describe the DOCUMENT. Nothing here infers where the
 * candidate is from, and no norm is described as better — only as scored
 * differently in this market.
 */

export enum CvConventionIssue {
  PHOTO_PRESENT = 'PHOTO_PRESENT',
  DATE_OF_BIRTH = 'DATE_OF_BIRTH',
  MARITAL_OR_PERSONAL_STATUS = 'MARITAL_OR_PERSONAL_STATUS',
  NATIONALITY_STATED = 'NATIONALITY_STATED',
  FULL_STREET_ADDRESS = 'FULL_STREET_ADDRESS',
  REFERENCES_ON_REQUEST = 'REFERENCES_ON_REQUEST',
  OBJECTIVE_STATEMENT = 'OBJECTIVE_STATEMENT',
  UNCONVERTED_GRADE = 'UNCONVERTED_GRADE',
}

export interface CvConventionFinding {
  issue: CvConventionIssue;
  /** The candidate's own text, so nothing is asserted in the abstract. */
  evidence: string | null;
  headline: string;
  explanation: string;
  action: string;
}

interface ConventionRule {
  issue: CvConventionIssue;
  expression: RegExp;
  headline: string;
  explanation: string;
  action: string;
}

const CONVENTION_RULES: ConventionRule[] = [
  {
    issue: CvConventionIssue.DATE_OF_BIRTH,
    expression:
      /\b(date\s+of\s+birth|d\.?o\.?b\.?|birth\s*day|born\s+on)\b\s*[:\-]?\s*[^\n]{0,30}/i,
    headline: 'Date of birth',
    explanation:
      'Standard on a CV in much of the world, and a problem here. Australian employers are not permitted to select on age, so many will not accept a CV that states it — some recruiters redact it before it reaches the hiring manager, and some discard the document.',
    action: 'Delete the line entirely. Nobody will ask.',
  },
  {
    issue: CvConventionIssue.MARITAL_OR_PERSONAL_STATUS,
    expression:
      /\b(marital\s+status|married|single|divorced|spouse|gender|sex)\b\s*[:\-]\s*[^\n]{0,20}/i,
    headline: 'Marital status or gender',
    explanation:
      'Normal on a CV in many countries. In Australia it is protected-attribute information an employer would rather not have before shortlisting, and including it can get the document set aside on policy.',
    action: 'Delete the line.',
  },
  {
    issue: CvConventionIssue.NATIONALITY_STATED,
    expression:
      /\b(nationality|citizenship|country\s+of\s+origin|place\s+of\s+birth)\b\s*[:\-]\s*[^\n]{0,30}/i,
    headline: 'Nationality or citizenship',
    explanation:
      'What an Australian employer actually needs is your work rights, not your nationality — and those are two different facts. Stating nationality answers a question nobody asked and leaves the one they did ask unanswered.',
    action:
      'Replace with a work-rights line, e.g. "Full working rights — Temporary Graduate visa (subclass 485) to March 2029."',
  },
  {
    issue: CvConventionIssue.FULL_STREET_ADDRESS,
    expression:
      /\b\d{1,4}[a-z]?[\/-]?\d{0,4}\s+[A-Z][a-z]+\s+(street|st|road|rd|avenue|ave|drive|dr|court|ct|crescent|cres|parade|pde|lane|ln|way|place|pl)\b[^\n]{0,40}/,
    headline: 'Full street address',
    explanation:
      'The Australian convention is suburb and state only. A full address gives away more than it needs to and occasionally invites assumptions about commute.',
    action: 'Cut to something like "Carlton VIC" or just "Melbourne VIC".',
  },
  {
    issue: CvConventionIssue.REFERENCES_ON_REQUEST,
    expression: /references?\s+(are\s+)?available\s+(up)?on\s+request/i,
    headline: '"References available on request"',
    explanation:
      'Assumed, so it says nothing. It reads as filler and costs a line at the bottom of the page where a reader is still paying attention.',
    action: 'Delete it. Provide referees when asked.',
  },
  {
    issue: CvConventionIssue.OBJECTIVE_STATEMENT,
    expression:
      /\b(career\s+)?objective\s*[:\-]|seeking\s+(a\s+)?(challenging|suitable|reputed|growth[- ]oriented)/i,
    headline: 'Objective statement',
    explanation:
      'The "seeking a challenging role in a reputable organisation" opener is out of use in Australia, and it describes what you want rather than what you offer — in the position on the page where a reader decides whether to keep going.',
    action:
      'Replace with two or three lines on what you do and the strongest evidence you have of it.',
  },
  {
    issue: CvConventionIssue.UNCONVERTED_GRADE,
    expression:
      /\b(cgpa|c\.g\.p\.a\.?)\b[^\n]{0,20}|\b(gpa|grade)\b\s*[:\-]?\s*\d(\.\d+)?\s*\/\s*(10|100|5)\b|\b\d{2}(\.\d+)?\s*%\s*(aggregate|marks|overall)\b|\bfirst\s+class(\s+with\s+distinction)?\b/i,
    headline: 'Grade in a system Australian readers do not use',
    explanation:
      'Australian universities report a WAM out of 100 or a GPA on a 7-point scale. A CGPA out of 10, a percentage aggregate, or a degree classification will be skimmed past or silently misread — an 8.1/10 looks worse than it is next to an unexplained 4.0.',
    action:
      'State the local equivalent, or give both: "CGPA 8.1/10 (approx. 6.0/7 Australian GPA)".',
  },
];

/**
 * Detects the conventions above.
 *
 * `has_embedded_image` is passed in rather than found here: whether the PDF
 * contains a photo can only be known while the file is being parsed, which
 * happens in the browser.
 */
export function detectCvConventionIssues(
  resume_text: string,
  has_embedded_image: boolean,
): CvConventionFinding[] {
  const findings: CvConventionFinding[] = [];

  if (has_embedded_image) {
    findings.push({
      issue: CvConventionIssue.PHOTO_PRESENT,
      evidence: null,
      headline:
        'Your CV contains an image — if it is a photo of you, remove it',
      explanation:
        'A photo is expected on a CV across much of Europe and Asia, and it is the single most common convention difference we see. Australian employers generally do not want one: it hands them age, gender and ethnicity before shortlisting, which is information they may later have to prove they did not act on. Many organisations discard or redact photo CVs as policy, and the rejection never explains why.',
      action:
        'Remove the photo. If the image is a logo, a chart or a skills bar, it is safe to keep — though plain text survives applicant tracking systems better.',
    });
  }

  for (const rule of CONVENTION_RULES) {
    const match = rule.expression.exec(resume_text);
    if (!match) continue;

    findings.push({
      issue: rule.issue,
      evidence: match[0].trim().slice(0, 80),
      headline: rule.headline,
      explanation: rule.explanation,
      action: rule.action,
    });
  }

  return findings;
}
