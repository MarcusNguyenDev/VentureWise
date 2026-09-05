import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { Response } from 'express';

import { AppError } from '../errors/app.error';

/**
 * Translates domain errors into HTTP responses with a stable shape, so the
 * front-end can branch on `error_code` rather than parsing messages.
 */
@Catch(AppError)
export class AppErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppErrorFilter.name);

  catch(error: AppError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    this.logger.warn(`${error.error_code}: ${error.message}`);

    response.status(error.http_status).json({
      error_code: error.error_code,
      message: error.message,
    });
  }
}
