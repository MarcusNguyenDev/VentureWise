import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class AddStoryDto {
  /**
   * The messy version, in any language. Nothing about this field assumes
   * English — that assumption is the wall this feature exists to remove.
   */
  @IsString()
  @MinLength(20)
  @MaxLength(8000)
  raw_memory_text: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  source_language?: string;
}
