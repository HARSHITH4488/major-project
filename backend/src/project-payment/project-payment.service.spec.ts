import { Test, TestingModule } from '@nestjs/testing';
import { ProjectPaymentService } from './project-payment.service';

describe('ProjectPaymentService', () => {
  let service: ProjectPaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectPaymentService],
    }).compile();

    service = module.get<ProjectPaymentService>(ProjectPaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
