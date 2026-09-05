import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

import {
  dim,
  formatDuration,
  formatHttpMethod,
  formatHttpStatus,
} from '../logging/log_format.util';

/**
 * One line per HTTP request, with the duration colour-coded.
 *
 * The transcript endpoint fires several times a second while somebody is
 * speaking, so it is collapsed to a counter rather than printed each time —
 * otherwise it buries everything else in the log.
 */
@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  /** Endpoints too chatty to print in full, counted per attempt instead. */
  private static readonly NOISY_PATH_PATTERN = /\/transcript$/;
  private readonly suppressed_counts = new Map<string, number>();

  use(request: Request, response: Response, next: NextFunction): void {
    const started_at_ms = Date.now();
    const { method, originalUrl } = request;

    response.on('finish', () => {
      const duration_ms = Date.now() - started_at_ms;

      if (RequestLoggerMiddleware.NOISY_PATH_PATTERN.test(originalUrl)) {
        this.logSuppressed(originalUrl, method, response.statusCode);
        return;
      }

      this.logger.log(
        `${formatHttpMethod(method)} ${formatHttpStatus(response.statusCode)} ` +
          `${originalUrl} ${formatDuration(duration_ms)}`,
      );
    });

    next();
  }

  /** Prints every tenth transcript append so the stream is visible but quiet. */
  private logSuppressed(
    path: string,
    method: string,
    status_code: number,
  ): void {
    const PRINT_EVERY = 10;

    const count = (this.suppressed_counts.get(path) ?? 0) + 1;
    this.suppressed_counts.set(path, count);

    if (count % PRINT_EVERY !== 0) return;

    this.logger.log(
      `${formatHttpMethod(method)} ${formatHttpStatus(status_code)} ` +
        `${path} ${dim(`(x${count} transcript appends)`)}`,
    );
  }
}
