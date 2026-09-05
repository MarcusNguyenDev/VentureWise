import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ServiceHealth {
  service_name: string;
  is_healthy: boolean;
  /** Which AI provider is bound, so the front-end can badge stubbed output. */
  ai_coach_provider: string;
}

@Injectable()
export class AppService {
  constructor(private readonly config_service: ConfigService) {}

  getHealth(): ServiceHealth {
    return {
      service_name: 'sponsor-ready-api',
      is_healthy: true,
      ai_coach_provider: this.config_service.get<string>(
        'AI_COACH_PROVIDER',
        'stub',
      ),
    };
  }
}
