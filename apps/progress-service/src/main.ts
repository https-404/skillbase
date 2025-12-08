import { NestFactory } from '@nestjs/core';
import { ProgressServiceModule } from './progress-service.module';

async function bootstrap() {
  const app = await NestFactory.create(ProgressServiceModule);
  await app.listen(process.env.PROGRESSSERVICE_PORT ?? 3004);
  console.log(`Progress Service is running on: http://localhost:${process.env.PROGRESSSERVICE_PORT ?? 3004}`);
}
bootstrap();
