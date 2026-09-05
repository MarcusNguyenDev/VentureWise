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

export const DSO_DISCLAIMER =
  'Not immigration advice — confirm anything here with your DSO before you rely on it.';

@Injectable()
export class SponsorshipService {
  buildBriefing(input: BuildSponsorshipAnswerDto): SponsorshipBriefing {
    const profile: WorkAuthorisationProfile = {
      visa_status: input.visa_status,
      opt_start_date: input.opt_start_date ?? null,
      graduation_date: input.graduation_date ?? null,
      is_stem_designated: input.is_stem_designated,
      employer_name: input.employer_name ?? null,
    };

    const timeline = buildWorkAuthorisationTimeline(profile);

    return {
      timeline,
      answer: buildSponsorshipAnswer(profile, timeline),
      disclaimer: DSO_DISCLAIMER,
    };
  }

  scoreDrill(input: ScoreSponsorshipDrillDto): SponsorshipDrillScore {
    return scoreSponsorshipDrill(input.spoken_text, input.spoken_seconds);
  }
}
