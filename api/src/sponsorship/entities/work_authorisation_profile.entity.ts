import { QualificationLevel, VisaStatus } from './visa_status.enum';

/**
 * Everything the drill needs about a candidate, entered once.
 *
 * Held in the session store, never persisted to an account — the spec cuts
 * accounts entirely, and this is the last data anyone should be storing
 * without one.
 */
export interface WorkAuthorisationProfile {
  visa_status: VisaStatus;
  /** ISO date the Temporary Graduate visa began, when it already has. */
  graduate_visa_start_date: string | null;
  /** ISO date the course finished, used before a 485 has been granted. */
  course_completion_date: string | null;
  /** Drives the 485 duration in place of any STEM-style designation. */
  qualification_level: QualificationLevel;
  /** Study at a regional campus can extend the Temporary Graduate visa. */
  is_regional_study: boolean;
  /** Free text from the job posting, used to look up sponsorship history. */
  employer_name: string | null;
}
