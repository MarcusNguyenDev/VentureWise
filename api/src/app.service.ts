import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AiCoachConfig } from './ai_coach/ai_coach.config';

export interface ServiceHealth {
  service_name: string;
  is_healthy: boolean;
  /** Which AI provider is bound, so the front-end can badge stubbed output. */
  ai_coach_provider: string;
  /**
   * False when `model` is bound but no API key is set — the one misconfiguration
   * that looks fine at boot and fails on the first call.
   */
  is_ai_coach_ready: boolean;
}

@Injectable()
export class AppService {
  constructor(
    private readonly config_service: ConfigService,
    private readonly ai_coach_config: AiCoachConfig,
  ) {}

  getHealth(): ServiceHealth {
    const ai_coach_provider = this.config_service.get<string>(
      'AI_COACH_PROVIDER',
      'stub',
    );

    return {
      service_name: 'sponsor-ready-api',
      is_healthy: true,
      ai_coach_provider,
      is_ai_coach_ready:
        ai_coach_provider !== 'model' || this.ai_coach_config.is_configured,
    };
  }
}
