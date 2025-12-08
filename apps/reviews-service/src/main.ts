import { NestFactory } from '@nestjs/core';
import { ReviewsServiceModule } from './reviews-service.module';

async function bootstrap() {
  const app = await NestFactory.create(ReviewsServiceModule);
  await app.listen(process.env.REVIEWSSERVICE_PORT ?? 3005);
  console.log(`Reviews Service is running on: http://localhost:${process.env.REVIEWSSERVICE_PORT ?? 3005}`);
}
bootstrap();
