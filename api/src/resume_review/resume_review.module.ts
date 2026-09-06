import { Module } from '@nestjs/common';

import { AiCoachModule } from '../ai_coach/ai_coach.module';
import { ResumeReviewController } from './resume_review.controller';
import { ResumeReviewService } from './resume_review.service';

@Module({
  imports: [AiCoachModule],
  controllers: [ResumeReviewController],
  providers: [ResumeReviewService],
})
export class ResumeReviewModule {}
