import { AppError } from './app.error';

export class StoryNotFoundError extends AppError {
  readonly http_status = 404;
  readonly error_code = 'STORY_NOT_FOUND';

  constructor(story_id: string) {
    super(`No story exists with id "${story_id}".`);
  }
}
