import { IsString, MaxLength } from 'class-validator';

export class StartAnswerAttemptDto {
  @IsString()
  @MaxLength(120)
  question_id: string;
}
