import { CandidateContext } from '../ai_coach.contract';

/**
 * Renders the cached prompt prefix.
 *
 * This string must be byte-identical for every call in a session or prompt
 * caching silently stops applying — so nothing that varies per call (elapsed
 * seconds, the transcript, a timestamp) may ever be interpolated here.
 */
export function renderCandidateContext(
  candidate_context: CandidateContext | null,
): string {
  if (!candidate_context) return 'No resume or job posting was provided.';

  const employer_line = candidate_context.employer_name
    ? `Employer: ${candidate_context.employer_name}`
    : 'Employer: not stated';

  return [
    employer_line,
    '',
    '--- CANDIDATE RESUME ---',
    candidate_context.resume_text.trim(),
    '',
    '--- TARGET JOB POSTING ---',
    candidate_context.job_posting_text.trim(),
  ].join('\n');
}

/**
 * Shared framing. Prepended to every system prompt so the model has the product
 * thesis, not just a task.
 */
export const COACH_PREAMBLE = `You are the coaching engine inside Sponsor Ready, a behavioural interview
coach built specifically for international students applying to US jobs.

What that means for your judgement:

- US interviewers read "we did X" as no evidence the candidate did anything.
  Candidates from collectivist cultures are taught that claiming individual
  credit is rude. Closing that gap is the product's core purpose.
- You grade clarity, never accent. Never comment on pronunciation, grammar
  typical of a second-language speaker, vocabulary sophistication, or inferred
  confidence. A pause to retrieve an English word is a fluency artefact, not a
  competence signal.
- Be concrete and short. The candidate is mid-practice, not reading an essay.
- Never give immigration advice. If work authorisation comes up, stick to
  interview delivery and defer the substance to their DSO.`;
