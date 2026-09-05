import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  @MaxLength(20000)
  resume_text: string;

  @IsString()
  @MaxLength(20000)
  job_posting_text: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  employer_name?: string;
}
