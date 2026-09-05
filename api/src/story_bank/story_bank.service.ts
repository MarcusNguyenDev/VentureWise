import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import { AI_COACH_PORT, AiCoachPort } from '../ai_coach/ai_coach.contract';
import { QuestionLibraryService } from '../question_library/question_library.service';
import { StoryNotFoundError } from '../shared/errors/story_not_found.error';
import { AddStoryDto } from './dto/add_story.dto';
import { Story } from './entities/story.entity';
import { buildRecallDrillCard, RecallDrillCard } from './recall_drill.util';
import { StoryBankStoreService } from './story_bank_store.service';

@Injectable()
export class StoryBankService {
  constructor(
    private readonly story_bank_store_service: StoryBankStoreService,
    private readonly question_library_service: QuestionLibraryService,
    @Inject(AI_COACH_PORT) private readonly ai_coach: AiCoachPort,
  ) {}

  listStories(session_id: string): Promise<Story[]> {
    return this.story_bank_store_service.listStories(session_id);
  }

  async addStory(session_id: string, input: AddStoryDto): Promise<Story> {
    const extracted = await this.ai_coach.extractStoryFromMemory({
      raw_memory_text: input.raw_memory_text,
      source_language: input.source_language ?? null,
    });

    const story: Story = {
      story_id: randomUUID(),
      title: extracted.title,
      detected_language: extracted.detected_language,
      situation: extracted.situation,
      task: extracted.task,
      action: extracted.action,
      result: extracted.result,
      themes: extracted.themes,
      created_at_ms: Date.now(),
      is_stubbed: extracted.is_stubbed,
    };

    const stories = await this.story_bank_store_service.listStories(session_id);
    await this.story_bank_store_service.saveStories(session_id, [
      ...stories,
      story,
    ]);

    return story;
  }

  async deleteStory(session_id: string, story_id: string): Promise<void> {
    const stories = await this.story_bank_store_service.listStories(session_id);

    const remaining = stories.filter((story) => story.story_id !== story_id);
    if (remaining.length === stories.length) {
      throw new StoryNotFoundError(story_id);
    }

    await this.story_bank_store_service.saveStories(session_id, remaining);
  }

  async buildRecallDrill(
    session_id: string,
    question_id: string,
  ): Promise<RecallDrillCard> {
    const question = this.question_library_service.getQuestion(question_id);
    const stories = await this.story_bank_store_service.listStories(session_id);

    return buildRecallDrillCard(question, stories);
  }
}
