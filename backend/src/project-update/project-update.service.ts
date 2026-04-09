import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as fs from 'fs';
import * as path from 'path';

import { ProjectUpdate } from './project-update.entity';
import { Project } from '../project/project.entity';
import { Contractor } from '../contractor/contractor.entity';
import { UpdateStatus } from './project-update.entity';

@Injectable()
export class ProjectUpdateService {

  constructor(

    @InjectRepository(ProjectUpdate)
    private readonly updateRepo: Repository<ProjectUpdate>,

    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,

    @InjectRepository(Contractor)
    private readonly contractorRepo: Repository<Contractor>,

  ) {}

  /* ===============================
     CREATE UPDATE
  =================================*/

  async createUpdate(
    projectId: number,
    contractorId: number,
    note: string,
    file: Express.Multer.File,
  ) {

    const project = await this.projectRepo.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const contractor = await this.contractorRepo.findOne({
      where: { id: contractorId },
    });

    if (!contractor) {
      throw new NotFoundException('Contractor not found');
    }

    const update = this.updateRepo.create({
      project: project,
      contractor: contractor,
      message: note,
      status: UpdateStatus.IN_PROGRESS,
      photo: file?.filename || null, // ✅ STORED AS filename
    });

    return await this.updateRepo.save(update);
  }

  /* ===============================
     GET PROJECT TIMELINE
  =================================*/

  async getUpdatesByProject(projectId: number) {

    const project = await this.projectRepo.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return await this.updateRepo.find({
      where: {
        project: { id: projectId },
      },
      relations: ['contractor'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /* ===============================
     DELETE UPDATE (HARD DELETE)
  =================================*/

  async deleteUpdate(id: number) {

    const update = await this.updateRepo.findOne({
      where: { id },
    });

    if (!update) {
      throw new NotFoundException('Update not found');
    }

    /* ===============================
       DELETE IMAGE FROM FOLDER
    =================================*/

    if (update.photo) {
      const filePath = path.join(
        process.cwd(),
        'uploads',
        'project-updates',
        update.photo
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    /* ===============================
       DELETE FROM DATABASE
    =================================*/

    await this.updateRepo.remove(update);

    return {
      message: 'Update deleted successfully',
    };
  }
}