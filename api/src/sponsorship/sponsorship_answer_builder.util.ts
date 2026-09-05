import { WorkAuthorisationProfile } from './entities/work_authorisation_profile.entity';
import { VisaStatus } from './entities/visa_status.enum';
import {
  EmployerSponsorshipRecord,
  findEmployerSponsorshipRecord,
} from './employer_sponsorship_data.const';
import { WorkAuthorisationTimeline } from './work_authorisation_timeline.util';

/**
 * Assembles the answer to Field 19a from the candidate's own facts.
 *
 * The shape is fixed and deliberate, because the failure mode here is length:
 *
 *   1. A direct yes or no, in the first three words.
 *   2. The status, with dates.
 *   3. How long they can work with no action from the employer.
 *   4. When sponsorship would come up, framed as a shared plan.
 *   5. Evidence the employer has done this before.
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
  if (!iso_date) return 'my start date';

  return new Date(iso_date).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

function buildStatusSentence(
  profile: WorkAuthorisationProfile,
  timeline: WorkAuthorisationTimeline,
): string {
  const opt_start = formatMonthAndYear(timeline.authorisation_start_date);

  switch (profile.visa_status) {
    case VisaStatus.F1_BEFORE_OPT:
      return `I'm on an F-1 student visa, and I'll have 12 months of OPT starting ${opt_start}.`;

    case VisaStatus.F1_ON_CPT:
      return `I'm on an F-1 visa working under CPT now, and I'll move to 12 months of OPT from ${opt_start}.`;

    case VisaStatus.F1_ON_OPT:
      return `I'm on F-1 OPT, which started ${opt_start}.`;

    case VisaStatus.F1_ON_STEM_OPT:
      return `I'm on the STEM extension of my F-1 OPT, which runs from ${opt_start}.`;

    case VisaStatus.J1_ACADEMIC_TRAINING:
      return `I'm on a J-1 with academic training authorised from ${opt_start}.`;

    default:
      return `My work authorisation began ${opt_start}.`;
  }
}

function buildDurationSentence(timeline: WorkAuthorisationTimeline): string {
  const stem_clause = timeline.is_stem_extension_included
    ? 'My degree is STEM-designated, so'
    : 'That means';

  return `${stem_clause} I'm authorised to work for ${timeline.duration_phrase} with no action from you.`;
}

function buildPlanSentence(timeline: WorkAuthorisationTimeline): string {
  if (!timeline.first_h1b_registration_date) return '';

  const registration_year = new Date(
    timeline.first_h1b_registration_date,
  ).getFullYear();

  return `I'd want us to look at H-1B in the ${registration_year} cap registration, which is well inside that window.`;
}

function buildEvidenceSentence(
  employer_record: EmployerSponsorshipRecord | null,
): string {
  if (!employer_record?.h1b_petitions_last_year) return '';

  return `And I know your team filed ${employer_record.h1b_petitions_last_year} petitions in ${employer_record.petition_data_year}, so I'm not asking for something new.`;
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
        buildDurationSentence(timeline),
        buildPlanSentence(timeline),
        buildEvidenceSentence(employer_record),
      ]
    : [
        'No.',
        'I have permanent work authorisation, so there is nothing for you to file — now or later.',
      ];

  const kept_sentences = sentences.filter((sentence) => sentence.length > 0);
  const answer_text = kept_sentences.join(' ');
  const word_count = (answer_text.match(/\S+/g) ?? []).length;

  return {
    answer_text,
    sentences: kept_sentences,
    estimated_spoken_seconds: Math.round(word_count / SPOKEN_WORDS_PER_SECOND),
    must_verify_before_use:
      employer_record !== null &&
      employer_record.h1b_petitions_last_year !== null &&
      !employer_record.is_verified,
    cited_employer: employer_record,
  };
}
