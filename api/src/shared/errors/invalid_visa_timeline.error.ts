import { AppError } from './app.error';

export class InvalidVisaTimelineError extends AppError {
  readonly http_status = 422;
  readonly error_code = 'INVALID_VISA_TIMELINE';
}
