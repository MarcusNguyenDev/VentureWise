import { Module } from '@nestjs/common';

import { DeliveryScoreService } from './delivery_score.service';
import { SpeechAnalysisService } from './speech_analysis.service';

@Module({
  providers: [SpeechAnalysisService, DeliveryScoreService],
  exports: [SpeechAnalysisService, DeliveryScoreService],
})
export class SpeechAnalysisModule {}
