import { WorkAuthorisationProfile } from './entities/work_authorisation_profile.entity';
import { VisaStatus } from './entities/visa_status.enum';
import {
  EmployerSponsorshipRecord,
  findEmployerSponsorshipRecord,
} from './employer_sponsorship_data.const';
import { WorkAuthorisationTimeline } from './work_authorisation_timeline.util';

/**
 * Assembles the answer to the Australian work-rights question from the
 * candidate's own facts.
 *
 * The shape is fixed and deliberate, because the failure mode is length:
 *
 *   1. A direct answer in the first three words.
 *   2. The visa, by subclass number, with dates.
 *   3. How long they can work with no action from the employer.
 *   4. What sponsorship would actually involve — and that there is no cap,
 *      no lottery and no fixed filing window, which is the single most
 *      reassuring fact an Australian recruiter can hear and one that almost
 *      no candidate says out loud.
 *   5. Evidence the employer has done it before.
 *
 * No model needed — it is the candidate's own data plus arithmetic. What the
 * drill trains is saying it in under twenty seconds without apologising.
 */

/** Roughly the rate of unhurried spoken English. */
const SPOKEN_WORDS_PER_SECOND = 2.5;

export interface SponsorshipAnswer {
  answer_text: string;
  /** Each sentence separately, so the UI can show what to cut if over time. */
  sentences: string[];
  estimated_spoken_seconds: number;
  /** True when the answer cites employer data nobody has verified yet. */
  must_verify_before_use: boolean;
  cited_employer: EmployerSponsorshipRecord | null;
}

function formatMonthAndYear(iso_date: string | null): string {
  if (!iso_date) return 'when I finish';

  return new Date(iso_date).toLocaleDateString('en-AU', {
    month: 'long',
    year: 'numeric',
  });
}

function buildStatusSentence(
  profile: WorkAuthorisationProfile,
  timeline: WorkAuthorisationTimeline,
): string {
  switch (profile.visa_status) {
    case VisaStatus.STUDENT_500_STUDYING:
      return `I'm on a student visa, subclass 500, so right now I can work ${timeline.hours_per_fortnight_cap} hours a fortnight during semester and full time over the breaks.`;

    case VisaStatus.STUDENT_500_COMPLETED:
      return `I finished my course in ${formatMonthAndYear(profile.course_completion_date)} and I'm applying for the Temporary Graduate visa, subclass 485.`;

    case VisaStatus.GRADUATE_485_POST_HIGHER_EDUCATION:
    case VisaStatus.GRADUATE_485_POST_VOCATIONAL:
      return `I'm on a Temporary Graduate visa, subclass 485, which started in ${formatMonthAndYear(timeline.authorisation_start_date)}.`;

    case VisaStatus.BRIDGING_VISA:
      return `I'm on a bridging visa with full work rights while my Temporary Graduate visa is being decided.`;

    default:
      return `My work rights began in ${formatMonthAndYear(timeline.authorisation_start_date)}.`;
  }
}

function buildDurationSentence(
  profile: WorkAuthorisationProfile,
  timeline: WorkAuthorisationTimeline,
): string {
  if (profile.visa_status === VisaStatus.STUDENT_500_STUDYING) {
    return `Once I graduate that becomes ${timeline.duration_phrase} of unrestricted full-time work rights, with nothing for you to file.`;
  }

  const regional_clause = timeline.regional_extension_months
    ? ` I studied regionally, so I may be eligible for a further ${timeline.regional_extension_months} months after that.`
    : '';

  return `That gives me ${timeline.duration_phrase} of full work rights with no action from you.${regional_clause}`;
}

/**
 * The differentiator. Australian sponsorship has no annual cap, no ballot and
 * no once-a-year window, which removes the objection the recruiter is probably
 * bracing for.
 */
function buildPathwaySentence(timeline: WorkAuthorisationTimeline): string {
  if (!timeline.next_sponsorship_pathway) return '';

  return `If it goes well, the step after that is ${timeline.next_sponsorship_pathway}, so it can be lodged whenever it suits the team rather than in a fixed window.`;
}

function buildEvidenceSentence(
  employer_record: EmployerSponsorshipRecord | null,
): string {
  if (!employer_record) return '';

  if (employer_record.is_accredited_sponsor) {
    return `And I know you're an accredited sponsor, so nominations get priority processing — I'm not asking for something new.`;
  }

  if (employer_record.is_approved_sponsor) {
    return `And I know you're already an approved sponsor, so I'm not asking for something new.`;
  }

  return '';
}

export function buildSponsorshipAnswer(
  profile: WorkAuthorisationProfile,
  timeline: WorkAuthorisationTimeline,
): SponsorshipAnswer {
  const employer_record = findEmployerSponsorshipRecord(profile.employer_name);

  const sentences = timeline.requires_future_sponsorship
    ? [
        'Yes, eventually.',
        buildStatusSentence(profile, timeline),
        buildDurationSentence(profile, timeline),
        buildPathwaySentence(timeline),
        buildEvidenceSentence(employer_record),
      ]
    : [
        'No.',
        'I have full working rights in Australia, so there is nothing for you to lodge — now or later.',
      ];

  const kept_sentences = sentences.filter((sentence) => sentence.length > 0);
  const answer_text = kept_sentences.join(' ');
  const word_count = (answer_text.match(/\S+/g) ?? []).length;

  return {
    answer_text,
    sentences: kept_sentences,
    estimated_spoken_seconds: Math.round(word_count / SPOKEN_WORDS_PER_SECOND),
    must_verify_before_use:
      employer_record !== null && !employer_record.is_verified,
    cited_employer: employer_record,
  };
}
