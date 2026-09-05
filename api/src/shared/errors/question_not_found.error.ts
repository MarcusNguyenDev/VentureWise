import { AppError } from './app.error';

export class QuestionNotFoundError extends AppError {
  readonly http_status = 404;
  readonly error_code = 'QUESTION_NOT_FOUND';

  constructor(question_id: string) {
    super(`No behavioural question exists with id "${question_id}".`);
  }
}
