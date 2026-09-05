import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class TranscriptWordDto {
  @IsString()
  @MaxLength(120)
  text: string;

  @IsNumber()
  @Min(0)
  start_ms: number;

  @IsNumber()
  @Min(0)
  end_ms: number;

  /**
   * False for words from the browser Web Speech API, whose timings are not
   * trustworthy. F-05 suppresses its pause metrics rather than guessing.
   */
  @IsBoolean()
  has_reliable_timing: boolean;
}

export class AppendTranscriptChunkDto {
  @IsInt()
  @Min(0)
  chunk_index: number;

  @IsString()
  @MaxLength(8000)
  text: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TranscriptWordDto)
  words: TranscriptWordDto[];

  @IsBoolean()
  is_final: boolean;
}
