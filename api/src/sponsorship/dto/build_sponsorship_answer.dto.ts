import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { QualificationLevel, VisaStatus } from '../entities/visa_status.enum';

export class BuildSponsorshipAnswerDto {
  @IsEnum(VisaStatus)
  visa_status: VisaStatus;

  @IsEnum(QualificationLevel)
  qualification_level: QualificationLevel;

  @IsOptional()
  @IsISO8601()
  graduate_visa_start_date?: string;

  @IsOptional()
  @IsISO8601()
  course_completion_date?: string;

  @IsBoolean()
  @Type(() => Boolean)
  is_regional_study: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  employer_name?: string;
}
