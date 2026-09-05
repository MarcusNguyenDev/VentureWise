import { Module } from '@nestjs/common';

import { QuestionLibraryController } from './question_library.controller';
import { QuestionLibraryService } from './question_library.service';

@Module({
  controllers: [QuestionLibraryController],
  providers: [QuestionLibraryService],
  exports: [QuestionLibraryService],
})
export class QuestionLibraryModule {}
