import { Controller, Get } from '@nestjs/common';
import { ProgressServiceService } from './progress-service.service';

@Controller()
export class ProgressServiceController {
  constructor(private readonly progressServiceService: ProgressServiceService) {}

  @Get()
  getHello(): string {
    return this.progressServiceService.getHello();
  }
}
