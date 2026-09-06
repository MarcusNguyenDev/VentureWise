import { DecodeSubtextInput } from '../ai_coach.contract';
import {
  COACH_PREAMBLE,
  renderCandidateContext,
} from './candidate_context.prompt';

/**
 * The slow loop's second half: what the question was really testing, and what
 * the candidate said that an Australian interviewer will not decode.
 *
 * The hand-written question intent is passed in when the library has one, so
 * the model refines curated content rather than reinventing it. The lexicon has
 * already flagged the obvious phrases; the model explains those and finds ones
 * the lexicon missed.
 */

export interface DecodeSubtextModelOutput {
  interviewer_intent: string;
  what_lands: string[];
  untranslated_phrases: {
    phrase: string;
    why_it_does_not_travel: string;
    suggested_replacement: string;
  }[];
}

export const DECODE_SUBTEXT_SCHEMA: Record<string, unknown> = {
  type: 'object',
  additionalProperties: false,
  required: ['interviewer_intent', 'what_lands', 'untranslated_phrases'],
  properties: {
    interviewer_intent: {
      type: 'string',
      description: 'Two sentences at most on what is actually being tested.',
    },
    what_lands: {
      type: 'array',
      items: { type: 'string' },
      description:
        'Two to four things a strong answer to THIS question contains.',
    },
    untranslated_phrases: {
      type: 'array',
      description:
        'Phrases the candidate used that an Australian interviewer will misread. Empty array if none.',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['phrase', 'why_it_does_not_travel', 'suggested_replacement'],
        properties: {
          phrase: {
            type: 'string',
            description: 'Copied verbatim from the transcript.',
          },
          why_it_does_not_travel: { type: 'string' },
          suggested_replacement: { type: 'string' },
        },
      },
    },
  },
};

export function buildDecodeSubtextSystemPrompt(
  input: DecodeSubtextInput,
): string {
  const curated_intent = input.known_question_intent
    ? `A career advisor has already written the intent for this question. Use it
as the basis and only sharpen it against what the candidate actually said:

"${input.known_question_intent}"`
    : 'No curated intent exists for this question. Write one.';

  return `${COACH_PREAMBLE}

Explain what the interviewer was really testing, then flag what did not travel.

INTERVIEWER INTENT
${curated_intent}

UNTRANSLATED PHRASES

Flag phrases an Australian interviewer will silently misread. Three categories:

  1. Modesty and softening carried over from a first language — "I have no
     experience" meant as modesty, "I only did", "my English is not good".
     These are grammatical English and Australians take them literally. Do not
     assume which language the candidate thinks in; the pattern is shared
     across many.
  2. Education vocabulary with no Australian equivalent — "final year project"
     (AU: capstone), "fresher" (AU: graduate), "passed out" (AU: lost
     consciousness), "my guide" (AU: supervisor), "CGPA" (AU: WAM, or GPA on a
     7-point scale), "teacher" (AU: lecturer or tutor).
  3. American English absorbed from study materials — "college", "freshman",
     "math", a 4.0 GPA. Understood here, but it marks the speaker as having
     learned from US sources rather than Australian ones.
  4. Units and currencies an Australian cannot convert in their head — lakh,
     crore, and figures quoted in a home currency. The number lands as nothing.

Rules:
  - Copy the phrase VERBATIM from the transcript. Never invent one.
  - Always give a replacement. Flagging without a swap is just telling somebody
    their English is wrong, which is the opposite of this product.
  - This is NOT a grammar or accent check. Only flag things that will be
    genuinely MISUNDERSTOOD, not things that merely sound non-native.
  - An empty array is a perfectly good answer.

--- CANDIDATE CONTEXT ---
${renderCandidateContext(input.candidate_context)}`;
}

export function buildDecodeSubtextUserMessage(
  input: DecodeSubtextInput,
): string {
  const already_flagged =
    input.flagged_phrases.length > 0
      ? `A lexicon already flagged these; explain them and add any it missed:\n${input.flagged_phrases.map((phrase) => `- ${phrase}`).join('\n')}`
      : 'The lexicon flagged nothing. Look for phrases it may have missed.';

  return `Question: ${input.question_text}

${already_flagged}

Transcript:
${input.transcript_text}`;
}
