import { Test, TestingModule } from '@nestjs/testing';
import { ProjectPaymentController } from './project-payment.controller';

describe('ProjectPaymentController', () => {
  let controller: ProjectPaymentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectPaymentController],
    }).compile();

    controller = module.get<ProjectPaymentController>(ProjectPaymentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
