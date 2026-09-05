import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { SpeechAnalysisModule } from '../speech_analysis/speech_analysis.module';
import { AI_COACH_PORT } from './ai_coach.contract';
import { ModelAiCoachProvider } from './providers/model_ai_coach.provider';
import { StubAiCoachProvider } from './providers/stub_ai_coach.provider';

/**
 * Binds one implementation of `AiCoachPort` for the whole application.
 *
 * AI_COACH_PROVIDER=stub (default) runs on fixtures so the product is demoable
 * before a model exists. AI_COACH_PROVIDER=model uses the real one.
 */
@Module({
  imports: [ConfigModule, SpeechAnalysisModule],
  providers: [
    StubAiCoachProvider,
    ModelAiCoachProvider,
    {
      provide: AI_COACH_PORT,
      inject: [ConfigService, StubAiCoachProvider, ModelAiCoachProvider],
      useFactory: (
        config_service: ConfigService,
        stub_provider: StubAiCoachProvider,
        model_provider: ModelAiCoachProvider,
      ) => {
        const provider_name = config_service.get<string>(
          'AI_COACH_PROVIDER',
          'stub',
        );

        return provider_name === 'model' ? model_provider : stub_provider;
      },
    },
  ],
  exports: [AI_COACH_PORT],
})
export class AiCoachModule {}
