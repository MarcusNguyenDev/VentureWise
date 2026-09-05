import { Controller, Get } from '@nestjs/common';

import { AppService, ServiceHealth } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly app_service: AppService) {}

  @Get('health')
  getHealth(): ServiceHealth {
    return this.app_service.getHealth();
  }
}
