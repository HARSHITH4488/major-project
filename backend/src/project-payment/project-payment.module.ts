import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProjectPayment } from './project-payment.entity';
import { Project } from '../project/project.entity';

import { ProjectPaymentService } from './project-payment.service';
import { ProjectPaymentController } from './project-payment.controller';

import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProjectPayment,
      Project,
    ]),
    AuditModule,
  ],
  controllers: [ProjectPaymentController],
  providers: [ProjectPaymentService],
})
export class ProjectPaymentModule {}