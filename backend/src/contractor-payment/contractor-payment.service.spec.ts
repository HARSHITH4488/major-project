import { Test, TestingModule } from '@nestjs/testing';
import { ContractorPaymentService } from './contractor-payment.service';

describe('ContractorPaymentService', () => {
  let service: ContractorPaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContractorPaymentService],
    }).compile();

    service = module.get<ContractorPaymentService>(ContractorPaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
