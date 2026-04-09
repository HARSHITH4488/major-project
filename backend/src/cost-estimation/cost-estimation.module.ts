import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CostEstimation } from './cost-estimation.entity';
import { EstimatedCostItem } from './estimated-cost-item.entity';
import { ProjectPayment } from './project-payment.entity';
import { Project } from '../project/project.entity';   // ✅ ADD THIS
import { CostEstimationService } from './cost-estimation.service';
import { CostEstimationController } from './cost-estimation.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CostEstimation,
      EstimatedCostItem,
      ProjectPayment,
      Project,  // ✅ REGISTER PROJECT HERE
    ]),
  ],
  providers: [CostEstimationService],
  controllers: [CostEstimationController],
})
export class CostEstimationModule {}

