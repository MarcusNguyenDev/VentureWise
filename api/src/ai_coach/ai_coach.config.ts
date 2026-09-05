import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AiProviderNotConfiguredError } from '../shared/errors/ai_provider_not_configured.error';

/**
 * Reads and validates the AI provider settings in one place.
 *
 * Nothing here reaches the network. It exists so `ModelAiCoachProvider` never
 * has to guess at an env var name, and so a missing key produces one clear
 * error instead of an SDK stack trace.
 */

/** Which loop a call belongs to. They get different models on purpose. */
export enum ModelTier {
  /** Hot path, ~800 ms budget, fires roughly 40 times a session. */
  MID_LOOP = 'MID_LOOP',
  /** Runs once on stop. Quality matters more than latency. */
  SLOW_LOOP = 'SLOW_LOOP',
}

@Injectable()
export class AiCoachConfig {
  constructor(private readonly config_service: ConfigService) {}

  /** True when a key is present. Checked before binding the model provider. */
  get is_configured(): boolean {
    return this.readApiKey().length > 0;
  }

  /** Throws with a useful message rather than letting the SDK fail obscurely. */
  requireApiKey(capability_name: string): string {
    const api_key = this.readApiKey();

    if (api_key.length === 0) {
      throw new AiProviderNotConfiguredError(capability_name);
    }

    return api_key;
  }

  /** Blank means api.openai.com. Set for Azure, a gateway, or a local server. */
  get base_url(): string | undefined {
    const base_url = this.config_service
      .get<string>('OPENAI_BASE_URL', '')
      .trim();
    return base_url.length > 0 ? base_url : undefined;
  }

  getModelName(tier: ModelTier): string {
    return tier === ModelTier.MID_LOOP
      ? this.config_service.get<string>('OPENAI_MID_LOOP_MODEL', 'gpt-4.1-nano')
      : this.config_service.get<string>(
          'OPENAI_SLOW_LOOP_MODEL',
          'gpt-5.6-luna',
        );
  }

  /**
   * A mid-loop call that outlives this is abandoned.
   *
   * The spec's target is ~800 ms; measured round trips run 0.9-11 s depending
   * on the model. Overlap is prevented in the browser by an in-flight guard
   * rather than by this timeout, so this can be generous — past roughly eight
   * seconds a nudge describes speech the candidate has already moved past, so
   * it is abandoned rather than shown.
   */
  get mid_loop_timeout_ms(): number {
    const DEFAULT_TIMEOUT_MS = 8000;

    const configured = Number(
      this.config_service.get<string>('OPENAI_MID_LOOP_TIMEOUT_MS', ''),
    );

    return Number.isFinite(configured) && configured > 0
      ? configured
      : DEFAULT_TIMEOUT_MS;
  }

  private readApiKey(): string {
    return this.config_service.get<string>('OPENAI_API_KEY', '').trim();
  }
}
