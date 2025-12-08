import { Module } from '@nestjs/common';
import { IndexerServiceController } from './indexer-service.controller';
import { IndexerServiceService } from './indexer-service.service';

@Module({
  imports: [],
  controllers: [IndexerServiceController],
  providers: [IndexerServiceService],
})
export class IndexerServiceModule {}
