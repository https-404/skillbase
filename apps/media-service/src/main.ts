import { NestFactory } from '@nestjs/core';
import { MediaServiceModule } from './media-service.module';

async function bootstrap() {
  const app = await NestFactory.create(MediaServiceModule);
  await app.listen(process.env.MEDIASERVICE_PORT ?? 3003);
  console.log(`Media Service is running on: http://localhost:${process.env.MEDIASERVICE_PORT ?? 3003}`);
}
bootstrap();
