import { Injectable } from '@nestjs/common';

import { BuildSponsorshipAnswerDto } from './dto/build_sponsorship_answer.dto';
import { ScoreSponsorshipDrillDto } from './dto/score_sponsorship_drill.dto';
import { WorkAuthorisationProfile } from './entities/work_authorisation_profile.entity';
import {
  buildSponsorshipAnswer,
  SponsorshipAnswer,
} from './sponsorship_answer_builder.util';
import {
  scoreSponsorshipDrill,
  SponsorshipDrillScore,
} from './sponsorship_delivery_score.util';
import {
  buildWorkAuthorisationTimeline,
  WorkAuthorisationTimeline,
} from './work_authorisation_timeline.util';

export interface SponsorshipBriefing {
  timeline: WorkAuthorisationTimeline;
  answer: SponsorshipAnswer;
  /** Rendered next to the answer. Non-negotiable per the spec. */
  disclaimer: string;
}

/**
 * Australia has no equivalent of a US DSO. Migration advice may only be given
 * by a registered migration agent (MARA) or an Australian legal practitioner —
 * an education agent or university adviser giving it is committing an offence,
 * so the wording has to point somewhere legitimate.
 */
export const MIGRATION_ADVICE_DISCLAIMER =
  "Not migration advice — check anything here with a MARA-registered migration agent or your university's international student support team before you rely on it.";

@Injectable()
export class SponsorshipService {
  buildBriefing(input: BuildSponsorshipAnswerDto): SponsorshipBriefing {
    const profile: WorkAuthorisationProfile = {
      visa_status: input.visa_status,
      qualification_level: input.qualification_level,
      graduate_visa_start_date: input.graduate_visa_start_date ?? null,
      course_completion_date: input.course_completion_date ?? null,
      is_regional_study: input.is_regional_study,
      employer_name: input.employer_name ?? null,
    };

    const timeline = buildWorkAuthorisationTimeline(profile);

    return {
      timeline,
      answer: buildSponsorshipAnswer(profile, timeline),
      disclaimer: MIGRATION_ADVICE_DISCLAIMER,
    };
  }

  scoreDrill(input: ScoreSponsorshipDrillDto): SponsorshipDrillScore {
    return scoreSponsorshipDrill(input.spoken_text, input.spoken_seconds);
  }
}
