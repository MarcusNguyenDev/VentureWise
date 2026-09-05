import { InvalidVisaTimelineError } from '../shared/errors/invalid_visa_timeline.error';
import { WorkAuthorisationProfile } from './entities/work_authorisation_profile.entity';
import {
  QualificationLevel,
  STATUSES_REQUIRING_FUTURE_SPONSORSHIP,
  VisaStatus,
} from './entities/visa_status.enum';

/**
 * The date arithmetic behind F-02, for Australia.
 *
 * The point of the drill is that the candidate can state, without hesitating,
 * exactly how long they can work with no action from the employer. Doing that
 * sum live in an interview is what makes people hedge, so the app does it once
 * and they memorise the number.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * These durations are the published Temporary Graduate (subclass 485) rules and
 * they change often — the streams were renamed in 2024 and the duration table
 * has moved more than once. Verify against immi.homeaffairs.gov.au before a
 * candidate relies on any of it. Nothing here is migration advice, and the UI
 * says so.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Temporary Graduate visa length by what you studied. This is the Australian
 * equivalent of the question a US tool would answer with "is it STEM?" — here
 * it is the qualification level instead.
 */
const GRADUATE_VISA_MONTHS: Record<QualificationLevel, number> = {
  [QualificationLevel.VOCATIONAL]: 18,
  [QualificationLevel.BACHELOR]: 24,
  [QualificationLevel.MASTERS_COURSEWORK]: 24,
  [QualificationLevel.MASTERS_RESEARCH]: 36,
  [QualificationLevel.DOCTORAL]: 36,
};

/**
 * A second Temporary Graduate visa is available after eligible regional study.
 * It is a separate application, not an automatic extension, so it is reported
 * as a possibility rather than folded into the headline number.
 */
const REGIONAL_EXTENSION_MONTHS = 12;

/** Subclass 500 work rights while the course is in session. */
export const STUDENT_VISA_HOURS_PER_FORTNIGHT = 48;

export interface WorkAuthorisationTimeline {
  requires_future_sponsorship: boolean;
  /** Total months workable without employer action. */
  total_authorised_months: number;
  remaining_authorised_months: number;
  authorisation_start_date: string | null;
  authorisation_end_date: string | null;
  /** The phrase the answer uses, e.g. "two years". */
  duration_phrase: string;
  /** Set when study location may support a second Temporary Graduate visa. */
  regional_extension_months: number | null;
  /** True while the candidate is capped at 48 hours a fortnight. */
  is_capped_to_part_time: boolean;
  hours_per_fortnight_cap: number | null;
  /** The visa an employer would sponsor next, named so the candidate can say it. */
  next_sponsorship_pathway: string | null;
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

/** "two years", "18 months" — whichever reads more naturally out loud. */
function describeDuration(total_months: number): string {
  if (total_months <= 0) return 'no remaining work rights';

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

const SKILLS_IN_DEMAND_PATHWAY =
  'a Skills in Demand visa (subclass 482), which has no annual cap and no lottery';

export function buildWorkAuthorisationTimeline(
  profile: WorkAuthorisationProfile,
  today: Date = new Date(),
): WorkAuthorisationTimeline {
  const requires_future_sponsorship =
    STATUSES_REQUIRING_FUTURE_SPONSORSHIP.includes(profile.visa_status);

  if (!requires_future_sponsorship) {
    return buildNoSponsorshipTimeline(profile.visa_status);
  }

  // Still studying: the constraint is the fortnightly cap, not an end date.
  if (profile.visa_status === VisaStatus.STUDENT_500_STUDYING) {
    return buildStudentTimeline(profile);
  }

  const authorisation_start = resolveAuthorisationStart(profile);
  const total_authorised_months =
    GRADUATE_VISA_MONTHS[profile.qualification_level];

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

  return {
    requires_future_sponsorship: true,
    total_authorised_months,
    remaining_authorised_months,
    authorisation_start_date: toIsoDate(authorisation_start),
    authorisation_end_date: toIsoDate(authorisation_end),
    duration_phrase: describeDuration(total_authorised_months),
    regional_extension_months: profile.is_regional_study
      ? REGIONAL_EXTENSION_MONTHS
      : null,
    is_capped_to_part_time: false,
    hours_per_fortnight_cap: null,
    next_sponsorship_pathway: SKILLS_IN_DEMAND_PATHWAY,
    summary_line: buildSummaryLine(
      profile,
      total_authorised_months,
      authorisation_end,
    ),
  };
}

/**
 * A student on subclass 500 has work rights now, but capped. That cap is the
 * thing a recruiter actually needs to hear, so it leads.
 */
function buildStudentTimeline(
  profile: WorkAuthorisationProfile,
): WorkAuthorisationTimeline {
  const graduate_visa_months =
    GRADUATE_VISA_MONTHS[profile.qualification_level];

  return {
    requires_future_sponsorship: true,
    total_authorised_months: graduate_visa_months,
    remaining_authorised_months: graduate_visa_months,
    authorisation_start_date: profile.course_completion_date,
    authorisation_end_date: null,
    duration_phrase: describeDuration(graduate_visa_months),
    regional_extension_months: profile.is_regional_study
      ? REGIONAL_EXTENSION_MONTHS
      : null,
    is_capped_to_part_time: true,
    hours_per_fortnight_cap: STUDENT_VISA_HOURS_PER_FORTNIGHT,
    next_sponsorship_pathway: SKILLS_IN_DEMAND_PATHWAY,
    summary_line:
      `On a student visa you can work ${STUDENT_VISA_HOURS_PER_FORTNIGHT} hours a fortnight while your course is in session, ` +
      `and unlimited hours during scheduled breaks. After you finish, a Temporary Graduate visa (subclass 485) gives you ` +
      `${describeDuration(graduate_visa_months)} of unrestricted full-time work rights.`,
  };
}

function resolveAuthorisationStart(profile: WorkAuthorisationProfile): Date {
  if (profile.graduate_visa_start_date) {
    return parseRequiredDate(
      profile.graduate_visa_start_date,
      'Temporary Graduate visa start date',
    );
  }

  // Before a 485 is granted, course completion is the only anchor available.
  return parseRequiredDate(
    profile.course_completion_date,
    'Course completion date',
  );
}

function buildSummaryLine(
  profile: WorkAuthorisationProfile,
  total_authorised_months: number,
  authorisation_end: Date,
): string {
  const ends_on = authorisation_end.toLocaleDateString('en-AU', {
    month: 'long',
    year: 'numeric',
  });

  const stream =
    profile.visa_status === VisaStatus.GRADUATE_485_POST_VOCATIONAL
      ? 'Post-Vocational Education Work stream'
      : 'Post-Higher Education Work stream';

  const regional_clause = profile.is_regional_study
    ? ` Eligible regional study may support a second Temporary Graduate visa of about ${REGIONAL_EXTENSION_MONTHS} months on top.`
    : '';

  return (
    `${describeDuration(total_authorised_months)} of full work rights on a Temporary Graduate visa ` +
    `(subclass 485, ${stream}), running to ${ends_on}.${regional_clause}`
  );
}

function buildNoSponsorshipTimeline(
  visa_status: VisaStatus,
): WorkAuthorisationTimeline {
  const is_already_sponsored = visa_status === VisaStatus.SKILLS_IN_DEMAND_482;

  return {
    requires_future_sponsorship: is_already_sponsored,
    total_authorised_months: 0,
    remaining_authorised_months: 0,
    authorisation_start_date: null,
    authorisation_end_date: null,
    duration_phrase: 'indefinitely',
    regional_extension_months: null,
    is_capped_to_part_time: false,
    hours_per_fortnight_cap: null,
    next_sponsorship_pathway: is_already_sponsored
      ? 'a nomination transfer, then employer-sponsored permanent residence (subclass 186)'
      : null,
    summary_line: is_already_sponsored
      ? 'You already hold a Skills in Demand visa (subclass 482). A new employer lodges a fresh nomination — there is no cap and no lottery.'
      : 'You have full working rights in Australia. The answer to the work-rights question is a clean "no sponsorship needed".',
  };
}
