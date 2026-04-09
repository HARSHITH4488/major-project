import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { AuditLog } from '../audit/audit-log.entity';
import { Contractor } from '../contractor/contractor.entity';
import { ProjectContractor } from '../project-contractor/project-contractor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      AuditLog,
      Contractor,
      ProjectContractor   // 🔥 THIS MUST BE HERE
    ]),
  ],
  providers: [ProjectService],
  controllers: [ProjectController],
})
export class ProjectModule {}


