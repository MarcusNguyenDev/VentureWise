import { ReviewResumeInput } from '../ai_coach.contract';
import { COACH_PREAMBLE } from './candidate_context.prompt';

/**
 * CV review — the judgement half.
 *
 * Australian convention breaches, weak openers, unevidenced claims and
 * quantification are all detected deterministically before this runs and are
 * passed in as `already_detected`, so the model's whole job is the part that
 * genuinely needs reading comprehension: rewriting weak bullets and spotting
 * what the posting asks for that the CV never proves.
 */

export interface ReviewResumeModelOutput {
  overall_read: string;
  strongest_evidence: string;
  bullet_rewrites: { original: string; rewritten: string; why: string }[];
  missing_evidence: string[];
}

export const REVIEW_RESUME_SCHEMA: Record<string, unknown> = {
  type: 'object',
  additionalProperties: false,
  required: [
    'overall_read',
    'strongest_evidence',
    'bullet_rewrites',
    'missing_evidence',
  ],
  properties: {
    overall_read: {
      type: 'string',
      description: 'Two or three sentences on the document as a whole.',
    },
    strongest_evidence: {
      type: 'string',
      description:
        'The single most convincing thing in the CV, quoted or closely paraphrased.',
    },
    bullet_rewrites: {
      type: 'array',
      description:
        'Three to six weak bullets, rewritten. Empty if none are weak.',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['original', 'rewritten', 'why'],
        properties: {
          original: {
            type: 'string',
            description: 'Copied VERBATIM from the CV. Never paraphrased.',
          },
          rewritten: { type: 'string' },
          why: {
            type: 'string',
            description:
              'One sentence on what changed and why it lands better.',
          },
        },
      },
    },
    missing_evidence: {
      type: 'array',
      items: { type: 'string' },
      description:
        'Requirements the posting asks for that the CV never evidences. Empty when no posting was given.',
    },
  },
};

export function buildReviewResumeSystemPrompt(
  input: ReviewResumeInput,
): string {
  const already_found =
    input.already_detected.length > 0
      ? `Automated checks have ALREADY flagged the following. Do not repeat them; assume the candidate has seen them:\n${input.already_detected.map((item) => `- ${item}`).join('\n')}`
      : 'Automated checks flagged nothing.';

  return `${COACH_PREAMBLE}

You are reviewing a CV for the Australian graduate market.

${already_found}

BULLET REWRITES — the most valuable thing you produce.

Pick the three to six weakest achievement bullets and rewrite them.

  - Copy the original VERBATIM. If you paraphrase it the candidate cannot find
    the line in their own document.
  - INVENT NOTHING. No numbers, tools, dates or outcomes that are not already
    in the CV. If a bullet needs a number it does not have, say so in "why"
    rather than inventing one — a fabricated metric on a CV is a job-losing
    problem, not a stylistic one.
  - Lead with what the person did, in a strong past-tense verb. No "responsible
    for", no "helped with".
  - Keep their voice and their level. Do not inflate a student placement into
    a senior role.
  - One line each where possible. A CV bullet that wraps to three lines does
    not get read.

MISSING EVIDENCE

If a job posting is provided, list what it asks for that the CV never
evidences. Be specific and quote the posting's own words. Do NOT list work
rights, visa status or "no Australian experience" — those are handled elsewhere
and framing them as CV deficiencies is exactly wrong.

If no posting was provided, return an empty array rather than guessing at a
target role.

TONE

This document is the candidate's own record of their work. Be direct about what
is weak, and never condescending about it. Say what a reader will do with each
line, not whether it is good.`;
}

export function buildReviewResumeUserMessage(input: ReviewResumeInput): string {
  const posting_section = input.job_posting_text
    ? `\n\n--- TARGET JOB POSTING ---\n${input.job_posting_text}`
    : '\n\n(No job posting provided — return an empty missing_evidence array.)';

  return `--- CV ---\n${input.resume_text}${posting_section}`;
}
