import { NestFactory } from '@nestjs/core';
import { IndexerServiceModule } from './indexer-service.module';

async function bootstrap() {
  const app = await NestFactory.create(IndexerServiceModule);
  await app.listen(process.env.INDEXERSERVICE_PORT ?? 3006);
  console.log(`Indexer Service is running on: http://localhost:${process.env.INDEXERSERVICE_PORT ?? 3006}`);
}
bootstrap();
