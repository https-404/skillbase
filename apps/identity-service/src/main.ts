import { NestFactory } from '@nestjs/core';
import { IdentityServiceModule } from './identity-service.module';

async function bootstrap() {
  const app = await NestFactory.create(IdentityServiceModule);
  await app.listen(process.env.IDENTITYSERVICE_PORT ?? 3001);
  console.log(`Identity Service is running on: http://localhost:${process.env.IDENTITYSERVICE_PORT ?? 3001}`);
}
bootstrap();
