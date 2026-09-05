import { TranscriptChunk } from './transcript_chunk.entity';

/**
 * One take at one question.
 *
 * Attempts are kept rather than overwritten, because the demo beat is take one
 * against take two — the I/We meter swinging from 1:6 to 4:1.
 */
export interface AnswerAttempt {
  attempt_id: string;
  question_id: string;
  question_text: string;
  /** 1 for the first take at this question, 2 for the second, and so on. */
  take_number: number;
  started_at_ms: number;
  ended_at_ms: number | null;
  chunks: TranscriptChunk[];
  /** The nudge currently on screen, so the mid loop can decline to replace it. */
  current_nudge_text: string | null;
  current_nudge_shown_at_ms: number | null;
}
