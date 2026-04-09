import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Contractor } from './contractor.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ProjectContractor } from '../project-contractor/project-contractor.entity';
import { ProjectPayment } from '../project-payment/project-payment.entity';

@Injectable()
export class ContractorService {
  constructor(
    @InjectRepository(Contractor)
    private readonly contractorRepository: Repository<Contractor>,

    @InjectRepository(ProjectContractor)
    private readonly projectContractorRepository: Repository<ProjectContractor>,

    @InjectRepository(ProjectPayment)
    private readonly projectPaymentRepository: Repository<ProjectPayment>,
  ) {}

  /* =========================================================
     CREATE
  ========================================================= */

 async createContractor(data: Partial<Contractor>) {

  if (!data.user || !data.user.id) {
    throw new NotFoundException('User ID is required');
  }

  // ✅ Fetch actual user reference (IMPORTANT)
  const contractor = this.contractorRepository.create({
    name: data.name,
    email: data.email,
    phone: data.phone,
    companyName: data.companyName,
    address: data.address,
    natureOfWork: data.natureOfWork,
    specialization: data.specialization,

    user: { id: data.user.id } // ✅ relation fix
  });

  return this.contractorRepository.save(contractor);
}

  async getContractorById(id: number) {
    const contractor = await this.contractorRepository.findOne({
      where: { id },
    });

    if (!contractor) {
      throw new NotFoundException('Contractor not found');
    }

    return contractor;
  }

  /* =========================================================
     SUMMARY
  ========================================================= */

  async getContractorSummary(id: number) {
    const contractor = await this.getContractorById(id);

    const assignments = await this.projectContractorRepository.find({
      where: { contractor: { id } },
      relations: ['project'],
    });

    let totalContractValue = 0;
    let totalPaid = 0;
    let totalRemaining = 0;

    for (const assignment of assignments) {
      totalContractValue += Number(assignment.contractAmount);
      totalPaid += Number(assignment.totalPaid);
      totalRemaining += Number(assignment.remainingAmount);
    }

    return {
      success: true,
      data: {
        contractor,
        totalContractValue,
        totalPaid,
        remaining: totalRemaining,
        projectCount: assignments.length,
      },
    };
  }

  /* =========================================================
     PROJECT FINANCIALS
  ========================================================= */

  async getContractorProjectsWithFinancials(id: number) {
    await this.getContractorById(id);

    const assignments = await this.projectContractorRepository.find({
      where: { contractor: { id } },
      relations: ['project'],
    });

    const result = assignments.map((assignment) => ({
      projectId: assignment.project.id,
      projectName: assignment.project.projectName,
      role: assignment.role,
      contractAmount: Number(assignment.contractAmount),
      totalPaid: Number(assignment.totalPaid),
      remaining: Number(assignment.remainingAmount),
      status: assignment.status,
    }));

    return {
      success: true,
      data: result,
    };
  }

  /* =========================================================
     CONTRACTOR PAYMENTS (🔥 FIXED CORRECTLY)
  ========================================================= */

  async getContractorPayments(id: number) {
    await this.getContractorById(id);

    // 1️⃣ Get all projects assigned to contractor
    const assignments = await this.projectContractorRepository.find({
      where: { contractor: { id } },
      relations: ['project'],
    });

    const projectIds = assignments.map(a => a.project.id);

    if (!projectIds.length) {
      return {
        success: true,
        data: [],
      };
    }

    // 2️⃣ Get all payments from those projects
    const payments = await this.projectPaymentRepository.find({
      where: {
        project: {
          id: In(projectIds),
        },
      },
      relations: ['project'],
      order: { paymentDate: 'DESC' },
    });

    return {
      success: true,
      data: payments,
    };
  }

  /* =========================================================
     PAGINATION
  ========================================================= */

  async getAllContractors(paginationDto: PaginationDto) {
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 10;
    const search = paginationDto.search;
    const sortBy = paginationDto.sortBy || 'id';
    const order = paginationDto.order || 'DESC';

    const queryBuilder =
      this.contractorRepository.createQueryBuilder('contractor');

    if (search) {
      queryBuilder.where('contractor.name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    queryBuilder
      .orderBy(`contractor.${sortBy}`, order as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      success: true,
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /* =========================================================
     UPDATE
  ========================================================= */

  async updateContractor(id: number, data: Partial<Contractor>) {
    const contractor = await this.getContractorById(id);
    Object.assign(contractor, data);
    return this.contractorRepository.save(contractor);
  }

  /* =========================================================
     SOFT DELETE
  ========================================================= */

  async deleteContractor(id: number) {
    const result = await this.contractorRepository.softDelete(id);

    if (result.affected === 0) {
      throw new NotFoundException('Contractor not found');
    }

    return {
      success: true,
      message: 'Contractor soft deleted successfully',
    };
  }

  async restoreContractor(id: number) {
    const result = await this.contractorRepository.restore(id);

    if (result.affected === 0) {
      throw new NotFoundException(
        'Contractor not found or not deleted',
      );
    }

    return {
      success: true,
      message: 'Contractor restored successfully',
    };
  }
  async getContractorProjects(id: number) {
  await this.getContractorById(id);

  const assignments = await this.projectContractorRepository.find({
    where: { contractor: { id } },
    relations: ['project'],
  });

  const projects = assignments.map(a => ({
    id: a.project.id,
    projectName: a.project.projectName,
  }));

  return {
    success: true,
    data: projects,
  };
}
// 🔥 GET CONTRACTOR BY USER ID
async getContractorByUserId(userId: number) {

  const contractor = await this.contractorRepository.findOne({
    where: {
      user: {
        id: userId
      }
    },
    relations: ['user'] // optional but recommended
  });

  if (!contractor) {
    throw new NotFoundException('Contractor not found for this user');
  }

  return {
    success: true,
    data: contractor,
  };
}
  
}