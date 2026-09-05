import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';

import { AddStoryDto } from './dto/add_story.dto';
import { Story } from './entities/story.entity';
import { RecallDrillCard } from './recall_drill.util';
import { StoryBankService } from './story_bank.service';

@Controller('sessions/:session_id/stories')
export class StoryBankController {
  constructor(private readonly story_bank_service: StoryBankService) {}

  @Get()
  listStories(@Param('session_id') session_id: string): Promise<Story[]> {
    return this.story_bank_service.listStories(session_id);
  }

  @Post()
  addStory(
    @Param('session_id') session_id: string,
    @Body() add_story_dto: AddStoryDto,
  ): Promise<Story> {
    return this.story_bank_service.addStory(session_id, add_story_dto);
  }

  @Get('recall-drill/:question_id')
  buildRecallDrill(
    @Param('session_id') session_id: string,
    @Param('question_id') question_id: string,
  ): Promise<RecallDrillCard> {
    return this.story_bank_service.buildRecallDrill(session_id, question_id);
  }

  @Delete(':story_id')
  deleteStory(
    @Param('session_id') session_id: string,
    @Param('story_id') story_id: string,
  ): Promise<void> {
    return this.story_bank_service.deleteStory(session_id, story_id);
  }
}
