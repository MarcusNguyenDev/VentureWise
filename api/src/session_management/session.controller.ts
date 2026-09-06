import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { AnswerReview } from './answer_review.service';
import { AppendTranscriptChunkDto } from './dto/append_transcript_chunk.dto';
import { CompleteAttemptDto } from './dto/complete_attempt.dto';
import { CreateSessionDto } from './dto/create_session.dto';
import { StartAnswerAttemptDto } from './dto/start_answer_attempt.dto';
import { AnswerAttempt } from './entities/answer_attempt.entity';
import { PracticeSession } from './entities/practice_session.entity';
import { AnswerProgress, SessionService } from './session.service';

@Controller('sessions')
export class SessionController {
  constructor(private readonly session_service: SessionService) {}

  @Post()
  createSession(
    @Body() create_session_dto: CreateSessionDto,
  ): Promise<PracticeSession> {
    return this.session_service.createSession(create_session_dto);
  }

  @Get(':session_id')
  getSession(
    @Param('session_id') session_id: string,
  ): Promise<PracticeSession> {
    return this.session_service.getSession(session_id);
  }

  @Post(':session_id/attempts')
  startAttempt(
    @Param('session_id') session_id: string,
    @Body() start_answer_attempt_dto: StartAnswerAttemptDto,
  ): Promise<AnswerAttempt> {
    return this.session_service.startAttempt(
      session_id,
      start_answer_attempt_dto,
    );
  }

  /** Append-only. Interim chunks may be superseded; finals may not. */
  @Post(':session_id/attempts/:attempt_id/transcript')
  appendTranscriptChunk(
    @Param('session_id') session_id: string,
    @Param('attempt_id') attempt_id: string,
    @Body() append_transcript_chunk_dto: AppendTranscriptChunkDto,
  ): Promise<{ transcript_text: string }> {
    return this.session_service.appendTranscriptChunk(
      session_id,
      attempt_id,
      append_transcript_chunk_dto,
    );
  }

  /** Mid loop — every 6-8 seconds of speech. */
  @Post(':session_id/attempts/:attempt_id/progress')
  trackProgress(
    @Param('session_id') session_id: string,
    @Param('attempt_id') attempt_id: string,
  ): Promise<AnswerProgress> {
    return this.session_service.trackProgress(session_id, attempt_id);
  }

  /** Slow loop — once, on stop. */
  @Post(':session_id/attempts/:attempt_id/complete')
  completeAttempt(
    @Param('session_id') session_id: string,
    @Param('attempt_id') attempt_id: string,
    @Body() complete_attempt_dto: CompleteAttemptDto,
  ): Promise<AnswerReview> {
    return this.session_service.completeAttempt(
      session_id,
      attempt_id,
      complete_attempt_dto,
    );
  }
}
