import { Type } from 'class-transformer';
import { IsNumber, IsString, MaxLength, Min } from 'class-validator';

export class ScoreSponsorshipDrillDto {
  @IsString()
  @MaxLength(4000)
  spoken_text: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  spoken_seconds: number;
}
