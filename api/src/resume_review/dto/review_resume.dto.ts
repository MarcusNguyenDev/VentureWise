import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ReviewResumeRequestDto {
  @IsString()
  @MinLength(100, {
    message:
      'That is too short to review as a CV. Paste the whole document, or upload the PDF.',
  })
  @MaxLength(30000)
  resume_text: string;

  /** Optional. Supplied, the review is targeted at that specific role. */
  @IsOptional()
  @IsString()
  @MaxLength(20000)
  job_posting_text?: string;

  /**
   * Whether the source PDF contained an image.
   *
   * Only knowable while the file is parsed, which happens in the browser, so
   * it is reported rather than detected here. Defaults to false, which means a
   * pasted CV never triggers the photo finding.
   */
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  has_embedded_image?: boolean;
}
