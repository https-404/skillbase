import { NestFactory } from '@nestjs/core';
import { CourseServiceModule } from './course-service.module';

async function bootstrap() {
  const app = await NestFactory.create(CourseServiceModule);
  await app.listen(process.env.COURSESERVICE_PORT ?? 3002);
  console.log(`Course Service is running on: http://localhost:${process.env.COURSESERVICE_PORT ?? 3002}`);
}
bootstrap();
