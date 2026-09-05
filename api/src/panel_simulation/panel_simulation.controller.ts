import { Controller, Get, Param } from '@nestjs/common';

import {
  InterviewPlan,
  PanelSimulationService,
} from './panel_simulation.service';
import { ROUND_PERSONAS, RoundPersona } from './round_personas.const';

@Controller('sessions/:session_id/panel')
export class PanelSimulationController {
  constructor(
    private readonly panel_simulation_service: PanelSimulationService,
  ) {}

  @Get('plan')
  buildPlan(@Param('session_id') session_id: string): Promise<InterviewPlan> {
    return this.panel_simulation_service.buildPlan(session_id);
  }

  /** The personas alone, for the round picker before a plan exists. */
  @Get('personas')
  listPersonas(): RoundPersona[] {
    return ROUND_PERSONAS;
  }
}
