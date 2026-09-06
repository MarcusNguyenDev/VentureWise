import { Body, Controller, Post } from '@nestjs/common';

import { ReviewResumeRequestDto } from './dto/review_resume.dto';
import { ResumeReview, ResumeReviewService } from './resume_review.service';

@Controller('resume-review')
export class ResumeReviewController {
  constructor(private readonly resume_review_service: ResumeReviewService) {}

  @Post()
  reviewResume(
    @Body() review_resume_request_dto: ReviewResumeRequestDto,
  ): Promise<ResumeReview> {
    return this.resume_review_service.reviewResume(review_resume_request_dto);
  }
}
