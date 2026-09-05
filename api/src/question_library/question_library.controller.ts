import { Controller, Get, Param, Query } from '@nestjs/common';

import { BehaviouralQuestion } from './behavioural_question.entity';
import { QuestionCategory } from './question_category.enum';
import { QuestionLibraryService } from './question_library.service';
import { UNTRANSLATED_PHRASES } from './untranslated_phrases.const';

@Controller('questions')
export class QuestionLibraryController {
  constructor(
    private readonly question_library_service: QuestionLibraryService,
  ) {}

  @Get()
  listQuestions(
    @Query('category') category?: QuestionCategory,
  ): BehaviouralQuestion[] {
    return this.question_library_service.listQuestions(category ?? null);
  }

  /** The lexicon itself, so the browser can highlight phrases as they appear. */
  @Get('untranslated-phrases')
  listUntranslatedPhrases() {
    return UNTRANSLATED_PHRASES;
  }

  @Get(':question_id')
  getQuestion(
    @Param('question_id') question_id: string,
  ): BehaviouralQuestion {
    return this.question_library_service.getQuestion(question_id);
  }
}
