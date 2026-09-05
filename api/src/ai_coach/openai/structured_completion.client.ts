import { Logger } from '@nestjs/common';
import OpenAI from 'openai';

/**
 * One place where a structured-output request is actually made.
 *
 * Every capability needs the same four things — a cacheable system prefix, a
 * varying user message, a strict JSON schema, and a timeout — so they are done
 * once here rather than five times with small differences.
 */

export interface StructuredCompletionRequest {
  client: OpenAI;
  model: string;
  /**
   * Static for the whole session. Goes first, because OpenAI caches on an
   * exact prefix match and only for prompts over 1024 tokens.
   */
  system_prompt: string;
  /** The part that changes per call. Never put this in the system prompt. */
  user_message: string;
  schema_name: string;
  json_schema: Record<string, unknown>;
  timeout_ms: number;
  /** The mid loop cannot afford a retry; the slow loop can. */
  max_retries: number;
}

export class StructuredCompletionError extends Error {
  constructor(
    message: string,
    readonly is_timeout: boolean,
  ) {
    super(message);
    this.name = 'StructuredCompletionError';
  }
}

const logger = new Logger('OpenAI');

export async function requestStructuredCompletion<ResultType>(
  request: StructuredCompletionRequest,
): Promise<ResultType> {
  let response: OpenAI.Chat.Completions.ChatCompletion;

  try {
    response = await request.client.chat.completions.create(
      {
        model: request.model,
        messages: [
          { role: 'system', content: request.system_prompt },
          { role: 'user', content: request.user_message },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: request.schema_name,
            strict: true,
            schema: request.json_schema,
          },
        },
      },
      { timeout: request.timeout_ms, maxRetries: request.max_retries },
    );
  } catch (error) {
    const is_timeout =
      error instanceof OpenAI.APIConnectionTimeoutError ||
      (error instanceof Error && /timed? ?out/i.test(error.message));

    throw new StructuredCompletionError(
      error instanceof Error ? error.message : String(error),
      is_timeout,
    );
  }

  logUsage(request.model, request.schema_name, response.usage);

  const choice = response.choices[0];

  // A refusal is a valid response shape, not an error, so it has to be checked
  // explicitly or it surfaces later as a confusing JSON parse failure.
  if (choice?.message.refusal) {
    throw new StructuredCompletionError(
      `Model refused: ${choice.message.refusal}`,
      false,
    );
  }

  const content = choice?.message.content;
  if (!content) {
    throw new StructuredCompletionError('Model returned empty content.', false);
  }

  try {
    return JSON.parse(content) as ResultType;
  } catch {
    throw new StructuredCompletionError(
      `Model returned content that was not valid JSON: ${content.slice(0, 200)}`,
      false,
    );
  }
}

/**
 * Caching is worth roughly half the bill, and it silently does not apply below
 * 1024 prompt tokens — so a zero here is reported rather than left to be
 * discovered on an invoice.
 */
function logUsage(
  model: string,
  schema_name: string,
  usage: OpenAI.Completions.CompletionUsage | undefined,
): void {
  if (!usage) return;

  const cached_tokens = usage.prompt_tokens_details?.cached_tokens ?? 0;
  const reasoning_tokens =
    usage.completion_tokens_details?.reasoning_tokens ?? 0;

  logger.debug(
    `${model} ${schema_name} in=${usage.prompt_tokens} cached=${cached_tokens} ` +
      `out=${usage.completion_tokens} reasoning=${reasoning_tokens}`,
  );

  if (cached_tokens === 0 && usage.prompt_tokens > 1024) {
    // Expected on the first call with a given prefix — there is nothing to hit
    // yet. Repeated across a session it means the prefix is not stable.
    logger.debug(
      `${schema_name}: ${usage.prompt_tokens} prompt tokens, none cached. ` +
        'Normal on a cold prefix; if it repeats within a session the system ' +
        'prompt is not byte-identical between calls.',
    );
  }
}
