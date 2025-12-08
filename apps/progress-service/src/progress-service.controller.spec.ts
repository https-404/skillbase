import { Test, TestingModule } from '@nestjs/testing';
import { ProgressServiceController } from './progress-service.controller';
import { ProgressServiceService } from './progress-service.service';

describe('ProgressServiceController', () => {
  let progressServiceController: ProgressServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ProgressServiceController],
      providers: [ProgressServiceService],
    }).compile();

    progressServiceController = app.get<ProgressServiceController>(ProgressServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(progressServiceController.getHello()).toBe('Hello World!');
    });
  });
});
