import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import {
  AI_COACH_PORT,
  AiCoachPort,
  TrackAnswerProgressResult,
} from '../ai_coach/ai_coach.contract';
import { QuestionLibraryService } from '../question_library/question_library.service';
import {
  LiveMetricsSnapshot,
  SpeechAnalysisService,
} from '../speech_analysis/speech_analysis.service';
import { AnswerReview, AnswerReviewService } from './answer_review.service';
import { AppendTranscriptChunkDto } from './dto/append_transcript_chunk.dto';
import { CreateSessionDto } from './dto/create_session.dto';
import { StartAnswerAttemptDto } from './dto/start_answer_attempt.dto';
import { AnswerAttempt } from './entities/answer_attempt.entity';
import { PracticeSession } from './entities/practice_session.entity';
import { SessionNotFoundError } from '../shared/errors/session_not_found.error';
import { SessionStoreService } from './session_store.service';
import { TranscriptBufferService } from './transcript_buffer.service';

/**
 * Orchestrates a practice session across the three loops.
 *
 * The fast loop is not here — it runs in the browser with no network call, by
 * design. This service serves the mid loop (`trackProgress`) and the slow loop
 * (`completeAttempt`).
 */

/** A nudge stays put for at least this long, so they do not flicker. */
const NUDGE_MINIMUM_DWELL_MS = 4000;

export interface AnswerProgress {
  metrics: LiveMetricsSnapshot;
  progress: TrackAnswerProgressResult;
  /** What the UI should display now, after the dwell rule is applied. */
  active_nudge_text: string | null;
}

@Injectable()
export class SessionService {
  constructor(
    private readonly session_store_service: SessionStoreService,
    private readonly transcript_buffer_service: TranscriptBufferService,
    private readonly speech_analysis_service: SpeechAnalysisService,
    private readonly answer_review_service: AnswerReviewService,
    private readonly question_library_service: QuestionLibraryService,
    @Inject(AI_COACH_PORT) private readonly ai_coach: AiCoachPort,
  ) {}

  async createSession(input: CreateSessionDto): Promise<PracticeSession> {
    const session: PracticeSession = {
      session_id: randomUUID(),
      created_at_ms: Date.now(),
      resume_text: input.resume_text,
      job_posting_text: input.job_posting_text,
      employer_name: input.employer_name ?? null,
      attempts: [],
    };

    await this.session_store_service.save(session);

    return session;
  }

  async getSession(session_id: string): Promise<PracticeSession> {
    return this.session_store_service.get(session_id);
  }

  async startAttempt(
    session_id: string,
    input: StartAnswerAttemptDto,
  ): Promise<AnswerAttempt> {
    const session = await this.session_store_service.get(session_id);
    const question = this.question_library_service.getQuestion(input.question_id);

    const previous_takes = session.attempts.filter(
      (attempt) => attempt.question_id === question.question_id,
    );

    const attempt: AnswerAttempt = {
      attempt_id: randomUUID(),
      question_id: question.question_id,
      question_text: question.question_text,
      take_number: previous_takes.length + 1,
      started_at_ms: Date.now(),
      ended_at_ms: null,
      chunks: [],
      current_nudge_text: null,
      current_nudge_shown_at_ms: null,
    };

    await this.session_store_service.save({
      ...session,
      attempts: [...session.attempts, attempt],
    });

    return attempt;
  }

  async appendTranscriptChunk(
    session_id: string,
    attempt_id: string,
    input: AppendTranscriptChunkDto,
  ): Promise<{ transcript_text: string }> {
    const session = await this.session_store_service.get(session_id);
    const attempt = this.findAttempt(session, attempt_id);

    const updated_attempt = this.transcript_buffer_service.appendChunk(attempt, {
      chunk_index: input.chunk_index,
      text: input.text,
      words: input.words,
      is_final: input.is_final,
    });

    await this.saveAttempt(session, updated_attempt);

    return {
      transcript_text: this.transcript_buffer_service.readText(updated_attempt),
    };
  }

  /** The mid loop. Called every six to eight seconds of speech. */
  async trackProgress(
    session_id: string,
    attempt_id: string,
  ): Promise<AnswerProgress> {
    const session = await this.session_store_service.get(session_id);
    const attempt = this.findAttempt(session, attempt_id);

    const transcript_text = this.transcript_buffer_service.readText(attempt);
    const words = this.transcript_buffer_service.readWords(attempt);
    const elapsed_ms = this.transcript_buffer_service.readElapsedMs(attempt);

    const metrics = this.speech_analysis_service.analyseTranscript(
      transcript_text,
      words,
      elapsed_ms,
    );

    const progress = await this.ai_coach.trackAnswerProgress({
      question_text: attempt.question_text,
      transcript_text,
      seconds_elapsed: Math.round(elapsed_ms / 1000),
      first_person_count: metrics.pronoun_attribution.first_person_count,
      collective_count: metrics.pronoun_attribution.collective_count,
      current_nudge_text: attempt.current_nudge_text,
    });

    const updated_attempt = this.applyNudgeDwellRule(attempt, progress.nudge_text);
    await this.saveAttempt(session, updated_attempt);

    return {
      metrics,
      progress,
      active_nudge_text: updated_attempt.current_nudge_text,
    };
  }

  /**
   * A new nudge cannot replace one that has been on screen for less than the
   * dwell time. Competing nudges are what make this feel broken.
   */
  private applyNudgeDwellRule(
    attempt: AnswerAttempt,
    proposed_nudge_text: string | null,
  ): AnswerAttempt {
    if (proposed_nudge_text === null) return attempt;
    if (proposed_nudge_text === attempt.current_nudge_text) return attempt;

    const shown_at_ms = attempt.current_nudge_shown_at_ms;
    const has_dwelled =
      shown_at_ms === null || Date.now() - shown_at_ms >= NUDGE_MINIMUM_DWELL_MS;

    if (!has_dwelled) return attempt;

    return {
      ...attempt,
      current_nudge_text: proposed_nudge_text,
      current_nudge_shown_at_ms: Date.now(),
    };
  }

  /** The slow loop. Called once, when the candidate stops speaking. */
  async completeAttempt(
    session_id: string,
    attempt_id: string,
  ): Promise<AnswerReview> {
    const session = await this.session_store_service.get(session_id);
    const attempt = this.findAttempt(session, attempt_id);

    const ended_attempt: AnswerAttempt = {
      ...attempt,
      ended_at_ms: attempt.ended_at_ms ?? Date.now(),
      current_nudge_text: null,
      current_nudge_shown_at_ms: null,
    };

    await this.saveAttempt(session, ended_attempt);

    return this.answer_review_service.buildReview({
      attempt_id: ended_attempt.attempt_id,
      question_id: ended_attempt.question_id,
      question_text: ended_attempt.question_text,
      transcript_text: this.transcript_buffer_service.readText(ended_attempt),
      words: this.transcript_buffer_service.readWords(ended_attempt),
      duration_ms: this.transcript_buffer_service.readElapsedMs(ended_attempt),
    });
  }

  private findAttempt(
    session: PracticeSession,
    attempt_id: string,
  ): AnswerAttempt {
    const attempt = session.attempts.find(
      (candidate) => candidate.attempt_id === attempt_id,
    );

    if (!attempt) throw new SessionNotFoundError(attempt_id);

    return attempt;
  }

  private async saveAttempt(
    session: PracticeSession,
    updated_attempt: AnswerAttempt,
  ): Promise<void> {
    await this.session_store_service.save({
      ...session,
      attempts: session.attempts.map((attempt) =>
        attempt.attempt_id === updated_attempt.attempt_id
          ? updated_attempt
          : attempt,
      ),
    });
  }
}
