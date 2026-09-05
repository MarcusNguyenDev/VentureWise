import { Module } from '@nestjs/common';

import { AiCoachModule } from '../ai_coach/ai_coach.module';
import { QuestionLibraryModule } from '../question_library/question_library.module';
import { StoryBankController } from './story_bank.controller';
import { StoryBankService } from './story_bank.service';
import { StoryBankStoreService } from './story_bank_store.service';

@Module({
  imports: [AiCoachModule, QuestionLibraryModule],
  controllers: [StoryBankController],
  providers: [StoryBankService, StoryBankStoreService],
  exports: [StoryBankService],
})
export class StoryBankModule {}
