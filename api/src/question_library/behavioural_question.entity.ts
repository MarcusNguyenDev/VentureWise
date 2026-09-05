import { QuestionCategory } from './question_category.enum';

export interface BehaviouralQuestion {
  question_id: string;
  question_text: string;
  category: QuestionCategory;
  /** What the interviewer is actually testing. The heart of F-03. */
  interviewer_intent: string;
  /** What a strong answer must contain. */
  what_lands: string[];
  /** The specific way this question is usually answered badly. */
  common_mistake: string;
  /**
   * The note that only matters if you did not grow up interviewing here.
   * Null where the question carries no particular cultural trap.
   */
  intercultural_note: string | null;
  target_seconds: number;
}
