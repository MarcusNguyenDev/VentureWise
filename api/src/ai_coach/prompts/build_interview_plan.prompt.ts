import { BuildInterviewPlanInput } from '../ai_coach.contract';
import { COACH_PREAMBLE } from './candidate_context.prompt';

/**
 * F-06: resume plus posting in, gaps and per-round questions out.
 *
 * The round structure, the personas and the opening questions are fixed in
 * `round_personas.const.ts` and are NOT the model's job — it supplies only the
 * coverage gaps and the questions derived from the specific posting. That is
 * why the recruiter round always opens on work authorisation regardless of what
 * comes back from here.
 */

export interface BuildInterviewPlanModelOutput {
  coverage_gaps: string[];
  rounds: {
    round_key: string;
    questions: { question_text: string; targets_requirement: string }[];
  }[];
}

export const BUILD_INTERVIEW_PLAN_SCHEMA: Record<string, unknown> = {
  type: 'object',
  additionalProperties: false,
  required: ['coverage_gaps', 'rounds'],
  properties: {
    coverage_gaps: {
      type: 'array',
      items: { type: 'string' },
      description:
        'Three to six requirements in the posting the resume does not evidence. Each a short noun phrase.',
    },
    rounds: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['round_key', 'questions'],
        properties: {
          round_key: {
            type: 'string',
            enum: ['RECRUITER_SCREEN', 'HIRING_MANAGER', 'PEER_PANEL'],
          },
          questions: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['question_text', 'targets_requirement'],
              properties: {
                question_text: { type: 'string' },
                targets_requirement: {
                  type: 'string',
                  description:
                    'The posting requirement this probes, quoted or closely paraphrased.',
                },
              },
            },
          },
        },
      },
    },
  },
};

export const BUILD_INTERVIEW_PLAN_SYSTEM_PROMPT = `${COACH_PREAMBLE}

Read the resume against the job posting and plan a three-round process.

COVERAGE GAPS

Requirements the posting asks for that the resume does not evidence. Be honest
and specific — "no streaming systems experience; posting asks for Kafka or
Flink with exactly-once semantics" beats "lacks some skills". A gap the
candidate can prepare for is worth more than a flattering assessment.

Do NOT list work authorisation or visa status as a gap. It is handled elsewhere
in the product and framing it as a deficiency is exactly the wrong message.

QUESTIONS PER ROUND

Two to three per round, each probing a specific posting requirement, preferably
one of the gaps. Match the round:

  RECRUITER_SCREEN  logistics, motivation, a plain-language summary of the
                    work. Not deep technical judgement.
  HIRING_MANAGER    judgement, ownership, how they handle being wrong.
  PEER_PANEL        collaboration, conflict, day-to-day specifics that a
                    rehearsed answer will not survive.

Write questions an interviewer would actually say out loud — behavioural and
open, never a quiz. Each must be answerable as a STAR story.

The product already supplies fixed opening questions for each round, so do not
produce generic openers like "tell me about yourself".`;

export function buildInterviewPlanUserMessage(
  input: BuildInterviewPlanInput,
): string {
  return `Employer: ${input.employer_name ?? 'not stated'}

--- RESUME ---
${input.resume_text}

--- JOB POSTING ---
${input.job_posting_text}`;
}
