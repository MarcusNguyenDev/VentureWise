/**
 * The work-authorisation situations this drill covers.
 *
 * Deliberately a short list. Every value here maps to a timeline the app can
 * compute exactly; anything more exotic belongs with a DSO, not a hackathon
 * build.
 */
export enum VisaStatus {
  /** Studying, OPT not yet applied for. */
  F1_BEFORE_OPT = 'F1_BEFORE_OPT',
  /** Studying, working on Curricular Practical Training. */
  F1_ON_CPT = 'F1_ON_CPT',
  /** Graduated, on post-completion Optional Practical Training. */
  F1_ON_OPT = 'F1_ON_OPT',
  /** On the 24-month STEM extension. */
  F1_ON_STEM_OPT = 'F1_ON_STEM_OPT',
  /** Exchange visitor. */
  J1_ACADEMIC_TRAINING = 'J1_ACADEMIC_TRAINING',
  /** Already sponsored — the answer is "no". */
  H1B_HELD = 'H1B_HELD',
  /** No sponsorship needed, ever. */
  PERMANENT_WORK_AUTHORISATION = 'PERMANENT_WORK_AUTHORISATION',
}

/** Statuses where the honest answer to Field 19a is "yes, eventually". */
export const STATUSES_REQUIRING_FUTURE_SPONSORSHIP: VisaStatus[] = [
  VisaStatus.F1_BEFORE_OPT,
  VisaStatus.F1_ON_CPT,
  VisaStatus.F1_ON_OPT,
  VisaStatus.F1_ON_STEM_OPT,
  VisaStatus.J1_ACADEMIC_TRAINING,
];
