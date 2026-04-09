import { Test, TestingModule } from '@nestjs/testing';
import { ContractorPaymentController } from './contractor-payment.controller';

describe('ContractorPaymentController', () => {
  let controller: ContractorPaymentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContractorPaymentController],
    }).compile();

    controller = module.get<ContractorPaymentController>(ContractorPaymentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
