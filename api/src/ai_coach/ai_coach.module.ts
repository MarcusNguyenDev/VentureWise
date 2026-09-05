import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { SpeechAnalysisModule } from '../speech_analysis/speech_analysis.module';
import { AiCoachConfig } from './ai_coach.config';
import { AI_COACH_PORT } from './ai_coach.contract';
import { LoggingAiCoachProvider } from './providers/logging_ai_coach.provider';
import { ModelAiCoachProvider } from './providers/model_ai_coach.provider';
import { StubAiCoachProvider } from './providers/stub_ai_coach.provider';

/**
 * Binds one implementation of `AiCoachPort` for the whole application.
 *
 * AI_COACH_PROVIDER=stub (default) runs on fixtures so the product is demoable
 * before a model exists. AI_COACH_PROVIDER=model uses OpenAI.
 */
@Module({
  imports: [ConfigModule, SpeechAnalysisModule],
  providers: [
    AiCoachConfig,
    StubAiCoachProvider,
    ModelAiCoachProvider,
    {
      provide: AI_COACH_PORT,
      inject: [
        ConfigService,
        AiCoachConfig,
        StubAiCoachProvider,
        ModelAiCoachProvider,
      ],
      useFactory: (
        config_service: ConfigService,
        ai_coach_config: AiCoachConfig,
        stub_provider: StubAiCoachProvider,
        model_provider: ModelAiCoachProvider,
      ) => {
        const logger = new Logger('AiCoachModule');

        const provider_name = config_service.get<string>(
          'AI_COACH_PROVIDER',
          'stub',
        );

        if (provider_name !== 'model') {
          logger.warn(
            'AI coach is running on FIXTURES (AI_COACH_PROVIDER=stub). Every result is flagged `is_stubbed`, the UI shows "Awaiting AI", and no model is called. This is not the app waiting on anything.',
          );

          // Wrapped too, so the log proves stub calls return in ~0 ms rather
          // than leaving you guessing whether something is hanging.
          return new LoggingAiCoachProvider(stub_provider);
        }

        // Saying this at boot beats failing mid-demo on the first call.
        if (!ai_coach_config.is_configured) {
          logger.error(
            'AI_COACH_PROVIDER=model but OPENAI_API_KEY is empty. Set it in api/.env, or go back to AI_COACH_PROVIDER=stub.',
          );
        }

        logger.log('AI coach bound to the OpenAI provider.');

        return new LoggingAiCoachProvider(model_provider);
      },
    },
  ],
  exports: [AI_COACH_PORT, AiCoachConfig],
})
export class AiCoachModule {}
