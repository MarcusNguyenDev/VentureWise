import { VisaStatus } from './visa_status.enum';

/**
 * Everything the drill needs about a candidate, entered once.
 *
 * Held in the session store, never persisted to a user account — the spec cuts
 * accounts entirely, and this is the last data anyone should be storing without
 * one.
 */
export interface WorkAuthorisationProfile {
  visa_status: VisaStatus;
  /** ISO date. The day post-completion OPT begins or began. */
  opt_start_date: string | null;
  /** STEM-designated degrees qualify for the 24-month extension. */
  is_stem_designated: boolean;
  /** Graduation date, used when OPT has not been dated yet. */
  graduation_date: string | null;
  /** Free text from the job posting, used to look up filing history. */
  employer_name: string | null;
}
