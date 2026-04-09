import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProjectUpdate } from './project-update.entity';
import { ProjectUpdateService } from './project-update.service';
import { ProjectUpdateController } from './project-update.controller';

import { Project } from '../project/project.entity';
import { Contractor } from '../contractor/contractor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProjectUpdate,
      Project,
      Contractor,
    ]),
  ],
  controllers: [ProjectUpdateController],
  providers: [ProjectUpdateService],
  exports: [ProjectUpdateService],
})
export class ProjectUpdateModule {}