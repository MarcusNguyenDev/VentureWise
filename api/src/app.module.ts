import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import KeyvRedis, { RedisClientOptions } from '@keyv/redis';

import { AiCoachModule } from './ai_coach/ai_coach.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PanelSimulationModule } from './panel_simulation/panel_simulation.module';
import { QuestionLibraryModule } from './question_library/question_library.module';
import { SessionManagementModule } from './session_management/session_management.module';
import { SpeechAnalysisModule } from './speech_analysis/speech_analysis.module';
import { SponsorshipModule } from './sponsorship/sponsorship.module';
import { StoryBankModule } from './story_bank/story_bank.module';

/** Session state outlives a dev-server restart but nothing longer. */
const SESSION_STATE_TTL_MS = 12 * 60 * 60 * 1000;

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config_service: ConfigService) => {
        // Inside the dev container Redis is reachable as `redis:6379` on the
        // shared network; REDIS_URL is set by docker-compose.
        const redis_url = config_service.get<string>(
          'REDIS_URL',
          'redis://redis:6379',
        );

        const options: RedisClientOptions = { url: redis_url };

        return { stores: [new KeyvRedis(options)], ttl: SESSION_STATE_TTL_MS };
      },
    }),
    AiCoachModule,
    SpeechAnalysisModule,
    QuestionLibraryModule,
    SessionManagementModule,
    SponsorshipModule,
    StoryBankModule,
    PanelSimulationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
