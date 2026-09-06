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

  /**
   * The candidate's first language, if they choose to say.
   *
   * Asked rather than inferred. Guessing somebody's origin from how they speak
   * is both less accurate and a worse thing to do than simply offering them
   * the field, and a self-declared answer lets the coaching be specific
   * without anything having to be assumed.
   */
  @IsOptional()
  @IsString()
  @MaxLength(60)
  first_language?: string;
}
