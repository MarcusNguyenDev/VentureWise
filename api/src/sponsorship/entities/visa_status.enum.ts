/**
 * Australian work-authorisation situations this drill covers.
 *
 * Deliberately a short list. Every value maps to a timeline the app can compute
 * exactly; anything more exotic belongs with a registered migration agent.
 *
 * Subclass numbers are used in the labels because that is how Australian
 * recruiters and HR systems actually refer to them — a candidate who says
 * "485" sounds like they know their own situation.
 */
export enum VisaStatus {
  /** Subclass 500, still enrolled and studying. */
  STUDENT_500_STUDYING = 'STUDENT_500_STUDYING',
  /** Subclass 500, course finished, Temporary Graduate visa not yet granted. */
  STUDENT_500_COMPLETED = 'STUDENT_500_COMPLETED',
  /** Subclass 485, Post-Higher Education Work stream (degree-level study). */
  GRADUATE_485_POST_HIGHER_EDUCATION = 'GRADUATE_485_POST_HIGHER_EDUCATION',
  /** Subclass 485, Post-Vocational Education Work stream (VET-level study). */
  GRADUATE_485_POST_VOCATIONAL = 'GRADUATE_485_POST_VOCATIONAL',
  /** Subclass 482 Skills in Demand — already employer-sponsored. */
  SKILLS_IN_DEMAND_482 = 'SKILLS_IN_DEMAND_482',
  /** Bridging visa while another application is decided. */
  BRIDGING_VISA = 'BRIDGING_VISA',
  /** Permanent resident, citizen, or NZ citizen — no sponsorship ever needed. */
  PERMANENT_WORK_RIGHTS = 'PERMANENT_WORK_RIGHTS',
}

/** Statuses where the honest answer is "yes, eventually". */
export const STATUSES_REQUIRING_FUTURE_SPONSORSHIP: VisaStatus[] = [
  VisaStatus.STUDENT_500_STUDYING,
  VisaStatus.STUDENT_500_COMPLETED,
  VisaStatus.GRADUATE_485_POST_HIGHER_EDUCATION,
  VisaStatus.GRADUATE_485_POST_VOCATIONAL,
  VisaStatus.BRIDGING_VISA,
];

/**
 * How long a Temporary Graduate visa runs, which depends on what you studied
 * rather than on any equivalent of a STEM designation.
 */
export enum QualificationLevel {
  VOCATIONAL = 'VOCATIONAL',
  BACHELOR = 'BACHELOR',
  MASTERS_COURSEWORK = 'MASTERS_COURSEWORK',
  MASTERS_RESEARCH = 'MASTERS_RESEARCH',
  DOCTORAL = 'DOCTORAL',
}
