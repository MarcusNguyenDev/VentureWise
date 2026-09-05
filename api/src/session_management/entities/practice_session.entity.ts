import { AnswerAttempt } from './answer_attempt.entity';

/**
 * All the state there is. No accounts, no user table — the spec cuts both, and
 * this lives in Redis under a generated id for the length of a sitting.
 */
export interface PracticeSession {
  session_id: string;
  created_at_ms: number;
  resume_text: string;
  job_posting_text: string;
  employer_name: string | null;
  attempts: AnswerAttempt[];
}
