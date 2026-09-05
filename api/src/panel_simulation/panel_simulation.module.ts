import { Module } from '@nestjs/common';

import { AiCoachModule } from '../ai_coach/ai_coach.module';
import { QuestionLibraryModule } from '../question_library/question_library.module';
import { SessionManagementModule } from '../session_management/session_management.module';
import { PanelSimulationController } from './panel_simulation.controller';
import { PanelSimulationService } from './panel_simulation.service';

@Module({
  imports: [AiCoachModule, QuestionLibraryModule, SessionManagementModule],
  controllers: [PanelSimulationController],
  providers: [PanelSimulationService],
})
export class PanelSimulationModule {}
