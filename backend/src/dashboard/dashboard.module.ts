import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Project } from '../project/project.entity';
import { Task } from 'src/task/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project,Task])],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}


