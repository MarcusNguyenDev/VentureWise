import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

import { Story } from './entities/story.entity';

@Injectable()
export class StoryBankStoreService {
  private static readonly STORY_BANK_TTL_MS = 12 * 60 * 60 * 1000;

  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  private buildKey(session_id: string): string {
    return `story_bank:${session_id}`;
  }

  async listStories(session_id: string): Promise<Story[]> {
    const stories = await this.cache.get<Story[]>(this.buildKey(session_id));
    return stories ?? [];
  }

  async saveStories(session_id: string, stories: Story[]): Promise<void> {
    await this.cache.set(
      this.buildKey(session_id),
      stories,
      StoryBankStoreService.STORY_BANK_TTL_MS,
    );
  }
}
