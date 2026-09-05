import { Module } from '@nestjs/common';

import { AiCoachModule } from '../ai_coach/ai_coach.module';
import { QuestionLibraryModule } from '../question_library/question_library.module';
import { SpeechAnalysisModule } from '../speech_analysis/speech_analysis.module';
import { AnswerReviewService } from './answer_review.service';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { SessionStoreService } from './session_store.service';
import { TranscriptBufferService } from './transcript_buffer.service';

@Module({
  imports: [AiCoachModule, SpeechAnalysisModule, QuestionLibraryModule],
  controllers: [SessionController],
  providers: [
    SessionService,
    SessionStoreService,
    TranscriptBufferService,
    AnswerReviewService,
  ],
  exports: [SessionService, SessionStoreService],
})
export class SessionManagementModule {}
