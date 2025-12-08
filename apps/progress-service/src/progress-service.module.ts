import { Module } from '@nestjs/common';
import { ProgressServiceController } from './progress-service.controller';
import { ProgressServiceService } from './progress-service.service';

@Module({
  imports: [],
  controllers: [ProgressServiceController],
  providers: [ProgressServiceService],
})
export class ProgressServiceModule {}
