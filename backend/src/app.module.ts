import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';   // ✅ ADD THIS

import { ProjectModule } from './project/project.module';
import { ContractorModule } from './contractor/contractor.module';
import { SchedulingModule } from './scheduling/scheduling.module';
import { CostEstimationModule } from './cost-estimation/cost-estimation.module';
import { ProjectPaymentModule } from './project-payment/project-payment.module';
import { DocumentModule } from './document/document.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AuthModule } from './auth/auth.module';
import { AuditModule } from './audit/audit.module';
import { ContractorPaymentModule } from './contractor-payment/contractor-payment.module';
import { ProjectUpdateModule } from './project-update/project-update.module';
import { UsersModule } from './users/users.module';
import { TaskModule } from './task/task.module';




@Module({
  imports: [
    ConfigModule.forRoot({   // ✅ ADD THIS BLOCK
      isGlobal: true,
    }),

   TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  autoLoadEntities: true,
  synchronize: true,
  ssl: {
    rejectUnauthorized: false,
  },
}),

    ProjectModule,
    ContractorModule,
    SchedulingModule,
    CostEstimationModule,
    ProjectPaymentModule,
    DocumentModule,
    DashboardModule,
    AuthModule,
    AuditModule,
    ContractorPaymentModule,
    ProjectUpdateModule,
    UsersModule,
    TaskModule,

  ],
})
export class AppModule {}
