import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ContractorPayment } from './contractor-payment.entity';
import { ContractorPaymentService } from './contractor-payment.service';
import { ContractorPaymentController } from './contractor-payment.controller';
import { ProjectContractor } from '../project-contractor/project-contractor.entity';
import { Contractor } from '../contractor/contractor.entity';
import { Project } from '../project/project.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContractorPayment,
      Contractor,   // ✅ ADD THIS
      Project  , ProjectContractor     // ✅ ADD THIS
    ]),
  ],
  controllers: [ContractorPaymentController],
  providers: [ContractorPaymentService],
  exports: [ContractorPaymentService],
})
export class ContractorPaymentModule {}