import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ApiGatewayModule } from './api-gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  
  // Enable CORS for cross-origin requests
  app.enableCors();
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.APIGATEWAY_PORT ?? 3000;
  await app.listen(port);
  
  console.log(`🚀 API Gateway is running on: http://localhost:${port}`);
  console.log(`📋 Available routes:`);
  console.log(`   - GET  / - API information`);
  console.log(`   - GET  /internal/health - Health check endpoint`);
  console.log(`   - ALL  /v1/identity/* - Identity service`);
  console.log(`   - ALL  /v1/course/* - Course service`);
  console.log(`   - ALL  /v1/media/* - Media service`);
  console.log(`   - ALL  /v1/progress/* - Progress service`);
  console.log(`   - ALL  /v1/reviews/* - Reviews service`);
  console.log(`   - ALL  /v1/indexer/* - Indexer service`);
}
bootstrap();
