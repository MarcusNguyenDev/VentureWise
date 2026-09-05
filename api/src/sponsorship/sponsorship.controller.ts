import { Body, Controller, Post } from '@nestjs/common';

import { BuildSponsorshipAnswerDto } from './dto/build_sponsorship_answer.dto';
import { ScoreSponsorshipDrillDto } from './dto/score_sponsorship_drill.dto';
import { SponsorshipBriefing, SponsorshipService } from './sponsorship.service';
import { SponsorshipDrillScore } from './sponsorship_delivery_score.util';

@Controller('sponsorship')
export class SponsorshipController {
  constructor(private readonly sponsorship_service: SponsorshipService) {}

  /** Status in, timeline arithmetic and a ready-to-say answer out. */
  @Post('briefing')
  buildBriefing(
    @Body() build_sponsorship_answer_dto: BuildSponsorshipAnswerDto,
  ): SponsorshipBriefing {
    return this.sponsorship_service.buildBriefing(build_sponsorship_answer_dto);
  }

  /** Scores what the candidate actually said against the 20-second target. */
  @Post('drill-score')
  scoreDrill(
    @Body() score_sponsorship_drill_dto: ScoreSponsorshipDrillDto,
  ): SponsorshipDrillScore {
    return this.sponsorship_service.scoreDrill(score_sponsorship_drill_dto);
  }
}
