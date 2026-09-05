/**
 * Base class for every error this application raises deliberately.
 *
 * Carrying the HTTP status on the error itself lets a single exception filter
 * translate the whole domain layer without a mapping table that drifts.
 */
export abstract class AppError extends Error {
  abstract readonly http_status: number;
  abstract readonly error_code: string;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}
