import { CritiqueAnswerInput } from '../ai_coach.contract';
import {
  COACH_PREAMBLE,
  renderCandidateContext,
} from './candidate_context.prompt';

/**
 * The slow loop's first half: the first-person rewrite and three lengths.
 *
 * The rewrite is the emotional beat of the whole product, so this prompt is
 * unusually prescriptive about what may and may not change. The model returns
 * rewrite TEXT only — the word-level diff is computed deterministically in
 * `answer_diff.util.ts`, because a model asked for diff markup gets it subtly
 * wrong in ways that are hard to spot on stage.
 *
 * The three lengths are separate fields rather than an array so the schema
 * guarantees exactly three and they cannot come back mislabelled.
 */

export interface CritiqueAnswerModelOutput {
  first_person_rewrite: string;
  answer_30_seconds: string;
  answer_90_seconds: string;
  answer_120_seconds: string;
  strengths: string[];
  fixes: string[];
}

export const CRITIQUE_ANSWER_SCHEMA: Record<string, unknown> = {
  type: 'object',
  additionalProperties: false,
  required: [
    'first_person_rewrite',
    'answer_30_seconds',
    'answer_90_seconds',
    'answer_120_seconds',
    'strengths',
    'fixes',
  ],
  properties: {
    first_person_rewrite: {
      type: 'string',
      description:
        'The same story with credit-taking verbs in first person. Same facts, same order, same voice.',
    },
    answer_30_seconds: { type: 'string' },
    answer_90_seconds: { type: 'string' },
    answer_120_seconds: { type: 'string' },
    strengths: {
      type: 'array',
      items: { type: 'string' },
      description: 'One to three specific things that worked. Not flattery.',
    },
    fixes: {
      type: 'array',
      items: { type: 'string' },
      description:
        'One to three specific changes, each tied to something said.',
    },
  },
};

export function buildCritiqueAnswerSystemPrompt(
  input: CritiqueAnswerInput,
): string {
  return `${COACH_PREAMBLE}

The candidate has finished an answer. Produce a critique.

FIRST-PERSON REWRITE — the most important field.

Rewrite the answer so the candidate takes credit for what they actually did.

  - Change "we" to "I" ONLY where the candidate was the actor. "We were a team
    of five" is scene setting and must stay "we". "We decided to drop the
    outliers" becomes "I argued we should keep them" only if the transcript
    supports that they drove it; if it genuinely was a group call, say "I
    pushed for X and the team agreed" rather than inventing sole authorship.
  - INVENT NOTHING. No numbers, tools, dates or outcomes that are not in the
    transcript. If the answer had no result, the rewrite has no result.
  - Keep their voice. Do not upgrade the vocabulary, do not smooth the grammar,
    do not make it sound like a native speaker. You are reassigning credit, not
    rewriting their English.
  - Remove hedges ("I was kind of responsible for") — those are the one thing
    you may delete outright.
  - Keep it close in length to the original so the diff stays readable.

THE THREE LENGTHS

Interviewers cut you off at different points, so give the same story at three
sizes: roughly 30 seconds (about 75 words), 90 seconds (about 220 words) and
two minutes (about 300 words). All three in first person. The 30-second one
should be the decision and the result, nothing else.

STRENGTHS AND FIXES

One to three each, both tied to specific words in the transcript. Never comment
on accent, grammar or vocabulary.

--- CANDIDATE CONTEXT ---
${renderCandidateContext(input.candidate_context)}`;
}

export function buildCritiqueAnswerUserMessage(
  input: CritiqueAnswerInput,
): string {
  return `Question: ${input.question_text}
Answer duration: ${input.duration_seconds}s

Transcript:
${input.transcript_text}`;
}
