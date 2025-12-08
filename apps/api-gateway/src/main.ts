import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  await app.listen(process.env.APIGATEWAY_PORT ?? 3000);
  console.log(`API Gateway is running on: http://localhost:${process.env.APIGATEWAY_PORT ?? 3000}`);
}
bootstrap();
