import { AppError } from './app.error';

export class SessionNotFoundError extends AppError {
  readonly http_status = 404;
  readonly error_code = 'SESSION_NOT_FOUND';

  constructor(session_id: string) {
    super(`No practice session exists with id "${session_id}".`);
  }
}
