import { InvalidVisaTimelineError } from '../shared/errors/invalid_visa_timeline.error';
import { WorkAuthorisationProfile } from './entities/work_authorisation_profile.entity';
import {
  STATUSES_REQUIRING_FUTURE_SPONSORSHIP,
  VisaStatus,
} from './entities/visa_status.enum';

/**
 * The date arithmetic behind F-02.
 *
 * The point of the drill is that the candidate can state, without hesitating,
 * exactly how long they can work with no action from the employer. Doing that
 * sum live in an interview is what makes people hedge, so the app does it once
 * and they memorise the number.
 *
 * Durations are the standard published ones: 12 months of post-completion OPT,
 * plus a 24-month STEM extension for a STEM-designated degree where the
 * employer is enrolled in E-Verify. Nothing here is immigration advice and the
 * UI says so.
 */

const POST_COMPLETION_OPT_MONTHS = 12;
const STEM_EXTENSION_MONTHS = 24;

/** H-1B cap registration opens in March; selected petitions start on 1 October. */
const H1B_REGISTRATION_MONTH_INDEX = 2;
const H1B_EMPLOYMENT_START_MONTH_INDEX = 9;

export interface WorkAuthorisationTimeline {
  requires_future_sponsorship: boolean;
  /** Total months the candidate can work without employer action. */
  total_authorised_months: number;
  /** Months still remaining as of today. */
  remaining_authorised_months: number;
  authorisation_start_date: string | null;
  authorisation_end_date: string | null;
  /** The phrase the answer uses, e.g. "three years". */
  duration_phrase: string;
  is_stem_extension_included: boolean;
  /** The cap season the candidate should aim at. */
  first_h1b_registration_date: string | null;
  first_h1b_employment_start_date: string | null;
  /** Human summary for the profile card. */
  summary_line: string;
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date.getTime());
  result.setMonth(result.getMonth() + months);
  return result;
}

function monthsBetween(from: Date, to: Date): number {
  const whole_months =
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth());

  // Round toward the candidate's disadvantage: a partial month is not a month.
  return to.getDate() >= from.getDate() ? whole_months : whole_months - 1;
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function parseRequiredDate(value: string | null, field_name: string): Date {
  if (!value) {
    throw new InvalidVisaTimelineError(
      `${field_name} is required for this visa status.`,
    );
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new InvalidVisaTimelineError(`${field_name} is not a valid date.`);
  }

  return parsed;
}

/** "three years", "18 months" — whichever reads more naturally out loud. */
function describeDuration(total_months: number): string {
  if (total_months <= 0) return 'no remaining authorisation';
  if (total_months % 12 === 0) {
    const years = total_months / 12;
    const YEAR_WORDS = [
      '',
      'one year',
      'two years',
      'three years',
      'four years',
    ];
    return YEAR_WORDS[years] ?? `${years} years`;
  }

  return `${total_months} months`;
}

/** The next March registration that falls after the given date. */
function nextH1bRegistrationDate(after: Date): Date {
  const registration_this_year = new Date(
    after.getFullYear(),
    H1B_REGISTRATION_MONTH_INDEX,
    1,
  );

  if (registration_this_year > after) return registration_this_year;

  return new Date(after.getFullYear() + 1, H1B_REGISTRATION_MONTH_INDEX, 1);
}

export function buildWorkAuthorisationTimeline(
  profile: WorkAuthorisationProfile,
  today: Date = new Date(),
): WorkAuthorisationTimeline {
  const requires_future_sponsorship =
    STATUSES_REQUIRING_FUTURE_SPONSORSHIP.includes(profile.visa_status);

  if (!requires_future_sponsorship) {
    return buildNoSponsorshipTimeline(profile.visa_status);
  }

  const authorisation_start = resolveAuthorisationStart(profile);

  const is_stem_extension_included =
    profile.is_stem_designated &&
    (profile.visa_status === VisaStatus.F1_ON_OPT ||
      profile.visa_status === VisaStatus.F1_ON_STEM_OPT ||
      profile.visa_status === VisaStatus.F1_BEFORE_OPT);

  const total_authorised_months =
    POST_COMPLETION_OPT_MONTHS +
    (is_stem_extension_included ? STEM_EXTENSION_MONTHS : 0);

  const authorisation_end = addMonths(
    authorisation_start,
    total_authorised_months,
  );

  const remaining_authorised_months = Math.max(
    monthsBetween(
      today > authorisation_start ? today : authorisation_start,
      authorisation_end,
    ),
    0,
  );

  // Aim at the cap season roughly a year into the authorisation, which leaves
  // a second attempt inside the window if the first lottery is not selected.
  const target_registration = nextH1bRegistrationDate(
    addMonths(authorisation_start, POST_COMPLETION_OPT_MONTHS - 4),
  );

  const employment_start = new Date(
    target_registration.getFullYear(),
    H1B_EMPLOYMENT_START_MONTH_INDEX,
    1,
  );

  return {
    requires_future_sponsorship: true,
    total_authorised_months,
    remaining_authorised_months,
    authorisation_start_date: toIsoDate(authorisation_start),
    authorisation_end_date: toIsoDate(authorisation_end),
    duration_phrase: describeDuration(total_authorised_months),
    is_stem_extension_included,
    first_h1b_registration_date: toIsoDate(target_registration),
    first_h1b_employment_start_date: toIsoDate(employment_start),
    summary_line: buildSummaryLine(
      total_authorised_months,
      is_stem_extension_included,
      authorisation_end,
    ),
  };
}

function resolveAuthorisationStart(profile: WorkAuthorisationProfile): Date {
  if (profile.opt_start_date) {
    return parseRequiredDate(profile.opt_start_date, 'OPT start date');
  }

  // Post-completion OPT cannot begin before the degree is finished, so a
  // graduation date is the next best anchor.
  return parseRequiredDate(profile.graduation_date, 'Graduation date');
}

function buildSummaryLine(
  total_authorised_months: number,
  is_stem_extension_included: boolean,
  authorisation_end: Date,
): string {
  const ends_on = authorisation_end.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const basis = is_stem_extension_included
    ? '12 months of OPT plus the 24-month STEM extension'
    : '12 months of OPT';

  return `${describeDuration(total_authorised_months)} of work authorisation (${basis}), running to ${ends_on}.`;
}

function buildNoSponsorshipTimeline(
  visa_status: VisaStatus,
): WorkAuthorisationTimeline {
  const is_already_sponsored = visa_status === VisaStatus.H1B_HELD;

  return {
    requires_future_sponsorship: is_already_sponsored,
    total_authorised_months: 0,
    remaining_authorised_months: 0,
    authorisation_start_date: null,
    authorisation_end_date: null,
    duration_phrase: 'indefinitely',
    is_stem_extension_included: false,
    first_h1b_registration_date: null,
    first_h1b_employment_start_date: null,
    summary_line: is_already_sponsored
      ? 'You already hold an H-1B. A new employer files a transfer, which does not go through the cap lottery.'
      : 'You are authorised to work without sponsorship. The answer to Field 19a is a clean "no".',
  };
}
