import { AppError } from './app.error';

/**
 * Raised by the real AI provider until a model is wired in.
 *
 * The stub provider never raises this — it returns fixture data flagged with
 * `is_stubbed`, so the product is demoable while the model is still pending.
 */
export class AiProviderNotConfiguredError extends AppError {
  readonly http_status = 503;
  readonly error_code = 'AI_PROVIDER_NOT_CONFIGURED';

  constructor(capability_name: string) {
    super(
      `The AI capability "${capability_name}" has no model wired in yet. ` +
        `Set AI_COACH_PROVIDER=stub to use fixture output, or implement ` +
        `ModelAiCoachProvider.`,
    );
  }
}
