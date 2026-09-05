import { ExtractStoryInput } from '../ai_coach.contract';
import { COACH_PREAMBLE } from './candidate_context.prompt';

/**
 * F-04: a messy memory in any language, out as a STAR story in English.
 *
 * No competitor accepts non-English input anywhere, and that is the whole point
 * — students cannot retrieve stories under pressure in a second language, so
 * they dump the memory in the one they think in. The specifics survive
 * untranslated where translating them would lose information.
 */

export interface ExtractStoryModelOutput {
  title: string;
  detected_language: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  themes: string[];
}

export const EXTRACT_STORY_SCHEMA: Record<string, unknown> = {
  type: 'object',
  additionalProperties: false,
  required: [
    'title',
    'detected_language',
    'situation',
    'task',
    'action',
    'result',
    'themes',
  ],
  properties: {
    title: {
      type: 'string',
      description: 'Three to six words the candidate will recognise instantly.',
    },
    detected_language: {
      type: 'string',
      description: 'BCP-47 tag of the language the memory was written in.',
    },
    situation: { type: 'string' },
    task: { type: 'string' },
    action: {
      type: 'string',
      description: 'First person. What this candidate personally did.',
    },
    result: {
      type: 'string',
      description: 'Empty string if the memory genuinely contains no outcome.',
    },
    themes: {
      type: 'array',
      items: { type: 'string' },
      description:
        'Two to five lowercase behavioural themes for the recall drill, e.g. "conflict", "leadership", "data quality".',
    },
  },
};

export const EXTRACT_STORY_SYSTEM_PROMPT = `${COACH_PREAMBLE}

A candidate has dumped a memory, messily, in whatever language they think in.
Turn it into a STAR story in English.

  - KEEP EVERY SPECIFIC. Names, numbers, tools, team sizes, dates. These are
    what make a story credible and they are the first thing lost in
    translation. If the memory says 12%, the output says 12%.
  - Translate the DELIVERY, not the substance. Do not summarise away detail to
    make it read smoothly.
  - Write the action in FIRST PERSON. If the memory is vague about who did
    what, keep it vague rather than inventing sole credit.
  - INVENT NOTHING. If there is no result in the memory, return an empty string
    for result. A missing result is information the candidate needs.
  - Keep proper nouns in their original form where translating would lose
    meaning — a university or product name stays as written.
  - Themes drive a recall drill, so they must be the kind of thing a
    behavioural question is about, not topic labels from the story's domain.`;

export function buildExtractStoryUserMessage(input: ExtractStoryInput): string {
  const language_hint = input.source_language
    ? `The candidate says this is written in: ${input.source_language}`
    : 'Language not stated — detect it.';

  return `${language_hint}

Memory:
${input.raw_memory_text}`;
}
