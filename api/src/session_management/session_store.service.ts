import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

import { SessionNotFoundError } from '../shared/errors/session_not_found.error';
import { PracticeSession } from './entities/practice_session.entity';

/**
 * The only thing that knows where sessions are kept.
 *
 * Redis rather than a database: the spec cuts persistence, but a dev server
 * that restarts mid-demo should not take the session with it.
 */
@Injectable()
export class SessionStoreService {
  /** A sitting, not an account. Long enough for a hackathon day. */
  private static readonly SESSION_TTL_MS = 12 * 60 * 60 * 1000;

  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  private buildKey(session_id: string): string {
    return `practice_session:${session_id}`;
  }

  async save(session: PracticeSession): Promise<void> {
    await this.cache.set(
      this.buildKey(session.session_id),
      session,
      SessionStoreService.SESSION_TTL_MS,
    );
  }

  async find(session_id: string): Promise<PracticeSession | null> {
    const session = await this.cache.get<PracticeSession>(
      this.buildKey(session_id),
    );

    return session ?? null;
  }

  async get(session_id: string): Promise<PracticeSession> {
    const session = await this.find(session_id);
    if (!session) throw new SessionNotFoundError(session_id);

    return session;
  }
}
