import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

/**
 * Camera-derived numbers, sent when the candidate stops speaking.
 *
 * Numbers only. No frame, landmark or image is ever sent — the face tracking
 * runs entirely in the browser and this is the whole of what crosses the
 * network. Keeping it to aggregates is what makes the camera acceptable.
 *
 * Entirely optional: the camera can be off, denied, or unsupported, and the
 * review is built the same way with this absent.
 */
export class CameraPresenceDto {
  @IsNumber()
  @Min(0)
  @Max(1)
  face_visible_fraction: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  facing_camera_fraction: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  gaze_steadiness: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  head_steadiness: number;

  @IsInt()
  @Min(0)
  blinks_per_minute: number;

  @IsInt()
  @Min(0)
  expression_transients_per_minute: number;

  /** Plain-English movement names, already de-identified of blendshape ids. */
  @IsOptional()
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  most_active_movements?: string[];

  /** The band and score the browser showed, logged as they were seen. */
  @IsString()
  @MaxLength(40)
  band: string;

  @IsInt()
  @Min(0)
  @Max(100)
  score: number;

  @IsBoolean()
  is_measurable: boolean;
}

/**
 * Delivery measurements taken from the microphone signal in the browser.
 *
 * These exist because the transcript cannot supply them: the speech recogniser
 * strips "um" and "uh" before the text is produced, and exposes no word
 * timings at all. Measured from text, filler density and pause placement were
 * both reading near zero regardless of how somebody actually spoke.
 *
 * Numbers only — no audio is recorded, buffered or sent.
 */
export class AudioDeliveryDto {
  @IsInt()
  @Min(0)
  pause_count: number;

  @IsInt()
  @Min(0)
  long_pause_count: number;

  @IsInt()
  @Min(0)
  longest_pause_ms: number;

  @IsInt()
  @Min(0)
  filled_pause_count: number;

  @IsNumber()
  @Min(0)
  filled_pauses_per_minute: number;

  /** Words per minute of speech, with silence excluded. */
  @IsInt()
  @Min(0)
  articulation_rate_wpm: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  speaking_ratio: number;
}

export class CompleteAttemptDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => CameraPresenceDto)
  camera_presence?: CameraPresenceDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AudioDeliveryDto)
  audio_delivery?: AudioDeliveryDto;
}
