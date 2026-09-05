import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { VisaStatus } from '../entities/visa_status.enum';

export class BuildSponsorshipAnswerDto {
  @IsEnum(VisaStatus)
  visa_status: VisaStatus;

  @IsOptional()
  @IsISO8601()
  opt_start_date?: string;

  @IsOptional()
  @IsISO8601()
  graduation_date?: string;

  @IsBoolean()
  @Type(() => Boolean)
  is_stem_designated: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  employer_name?: string;
}
