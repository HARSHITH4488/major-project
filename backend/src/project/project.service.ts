import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { AuditLog } from '../audit/audit-log.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { Contractor } from '../contractor/contractor.entity';
import { ProjectContractor } from '../project-contractor/project-contractor.entity';
import { Schedule } from '../scheduling/scheduling.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,

    @InjectRepository(Contractor)
    private readonly contractorRepository: Repository<Contractor>,

    @InjectRepository(ProjectContractor)
    private readonly projectContractorRepository: Repository<ProjectContractor>,
    @InjectRepository(Schedule)
private readonly scheduleRepository: Repository<Schedule>,
  ) {}
 async getProjectProgress(projectId: number): Promise<number> {
  const schedules = await this.scheduleRepository.find({
    where: { project: { id: projectId } },
  });

  if (!schedules.length) return 0;

  const total = schedules.reduce(
    (sum, s) => sum + (s.progress || 0),
    0
  );

  return Math.round(total / schedules.length);
}

  /* =====================================================
     CREATE PROJECT
  ===================================================== */
  async createProject(data: CreateProjectDto, userId: number) {
    const project = this.projectRepository.create({
      ...data,
      totalPaidAmount: 0,
      balanceAmount: Number(data.totalAmount),
      paymentStatus: 'PENDING',
      createdBy: userId,
    });

    const savedProject = await this.projectRepository.save(project);

    await this.auditRepository.save({
      entity: 'Project',
      entityId: savedProject.id,
      action: 'CREATE',
      performedBy: userId,
      oldData: null,
      newData: savedProject,
    });

    return savedProject;
  }

  /* =====================================================
     GET ALL PROJECTS
  ===================================================== */
  async getAllProjects(paginationDto: PaginationDto) {
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 10;
    const search = paginationDto.search;

    const queryBuilder =
      this.projectRepository.createQueryBuilder('project');

    if (search) {
      queryBuilder.where('project.projectName ILIKE :search', {
        search: `%${search}%`,
      });
    }

    queryBuilder.skip((page - 1) * limit).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    const updatedData = await Promise.all(
  data.map(async (project) => {
    const progress = await this.getProjectProgress(project.id);

    return {
      ...project,
      progress,
    };
  }),
);

return {
  data: updatedData,
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
};
  }

  /* =====================================================
     ASSIGN CONTRACTOR (FIXED)
  ===================================================== */
 async assignContractor(
  projectId: number,
  contractorId: number,
  contractAmount: number,
) {

  const project = await this.projectRepository.findOne({
    where: { id: projectId },
  });

  if (!project) {
    throw new NotFoundException('Project not found');
  }

  const contractor = await this.contractorRepository.findOne({
    where: { id: contractorId },
  });

  if (!contractor) {
    throw new NotFoundException('Contractor not found');
  }

  const existing = await this.projectContractorRepository.findOne({
    where: {
      project: { id: projectId },
      contractor: { id: contractorId },
    },
  });

  if (existing) {
    throw new BadRequestException(
      'Contractor already assigned to this project',
    );
  }

  const assignment = this.projectContractorRepository.create({
    project,
    contractor,
    role: 'MAIN CONTRACTOR',

    // ✅ NOW USING CONTRACTOR QUOTATION
    contractAmount: contractAmount,

    totalPaid: 0,
    remainingAmount: contractAmount,
    assignedDate: new Date(),
    status: 'ACTIVE',
    notes: null,
  });

  return this.projectContractorRepository.save(assignment);
}

  /* =====================================================
     REMOVE CONTRACTOR
  ===================================================== */
  async removeContractor(projectId: number, contractorId: number) {
    const assignment =
      await this.projectContractorRepository.findOne({
        where: {
          project: { id: projectId },
          contractor: { id: contractorId },
        },
      });

    if (!assignment) {
      throw new NotFoundException(
        'Contractor not assigned to this project',
      );
    }

    await this.projectContractorRepository.remove(assignment);

    return { message: 'Contractor removed from project' };
  }

  /* =====================================================
     GET PROJECT CONTRACTORS
  ===================================================== */
  async getProjectContractors(projectId: number) {
    const assignments =
      await this.projectContractorRepository.find({
        where: { project: { id: projectId } },
        relations: ['contractor'],
      });

    return {
  success: true,
  data: assignments
};
  }

  /* =====================================================
     GET PROJECT BY ID
  ===================================================== */
  async getProjectById(id: number) {
    const project = await this.projectRepository.findOne({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  /* =====================================================
     UPDATE PROJECT
  ===================================================== */
  async updateProject(
    id: number,
    dto: CreateProjectDto,
    userId: number,
  ) {
    const project = await this.projectRepository.findOne({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    Object.assign(project, dto);
    project.updatedBy = userId;

    return this.projectRepository.save(project);
  }

  /* =====================================================
     DELETE PROJECT (SOFT)
  ===================================================== */
  async deleteProject(id: number, userId: number) {
    const project = await this.projectRepository.findOne({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    project.deletedBy = userId;
    await this.projectRepository.save(project);
    await this.projectRepository.softDelete(id);

    return { message: 'Project soft deleted successfully' };
  }

  /* =====================================================
     RESTORE PROJECT
  ===================================================== */
  async restoreProject(id: number, userId: number) {
    const project = await this.projectRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    await this.projectRepository.restore(id);

    project.deletedBy = null;
    project.updatedBy = userId;
    await this.projectRepository.save(project);

    return { message: 'Project restored successfully' };
  }
  
}