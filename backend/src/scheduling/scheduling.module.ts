import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Schedule } from './scheduling.entity';
import { ScheduleTask } from './schedule-task.entity';

import { SchedulingService } from './scheduling.service';
import { SchedulingController } from './scheduling.controller';
import { ScheduleTaskController } from './schedule-task.controller';

import { Project } from '../project/project.entity';
import { Contractor } from '../contractor/contractor.entity';
import { ScheduleAssignment } from './schedule-assignment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Schedule,
      ScheduleTask,
      Project,
      Contractor,
      ScheduleAssignment,
    ]),
  ],
  controllers: [
    SchedulingController,
    ScheduleTaskController,   // ✅ VERY IMPORTANT
  ],
  providers: [SchedulingService],
})
export class SchedulingModule {}