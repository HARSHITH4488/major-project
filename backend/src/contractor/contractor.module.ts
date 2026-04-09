import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractorController } from './contractor.controller';
import { ContractorService } from './contractor.service';
import { Contractor } from './contractor.entity';
import { Project } from '../project/project.entity';
import { ProjectPayment } from '../project-payment/project-payment.entity';
import { ProjectContractor } from '../project-contractor/project-contractor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Contractor,
      Project,
      ProjectPayment,
      ProjectContractor, // ✅ ADD THIS
    ]),
  ],
  controllers: [ContractorController],
  providers: [ContractorService],
})
export class ContractorModule {}
