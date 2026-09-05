import { Injectable } from '@nestjs/common';

import { QuestionNotFoundError } from '../shared/errors/question_not_found.error';
import { BehaviouralQuestion } from './behavioural_question.entity';
import { BEHAVIOURAL_QUESTIONS } from './behavioural_questions.const';
import { QuestionCategory } from './question_category.enum';

@Injectable()
export class QuestionLibraryService {
  listQuestions(category: QuestionCategory | null): BehaviouralQuestion[] {
    if (category === null) return BEHAVIOURAL_QUESTIONS;

    return BEHAVIOURAL_QUESTIONS.filter(
      (question) => question.category === category,
    );
  }

  getQuestion(question_id: string): BehaviouralQuestion {
    const question = BEHAVIOURAL_QUESTIONS.find(
      (candidate) => candidate.question_id === question_id,
    );

    if (!question) throw new QuestionNotFoundError(question_id);

    return question;
  }

  findQuestion(question_id: string): BehaviouralQuestion | null {
    return (
      BEHAVIOURAL_QUESTIONS.find(
        (candidate) => candidate.question_id === question_id,
      ) ?? null
    );
  }
}
