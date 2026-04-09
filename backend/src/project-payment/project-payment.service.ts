import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ProjectPayment } from './project-payment.entity';
import { Project } from '../project/project.entity';
import { ProjectContractor } from '../project-contractor/project-contractor.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class ProjectPaymentService {
  constructor(
    @InjectRepository(ProjectPayment)
    private readonly paymentRepository: Repository<ProjectPayment>,

    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    private readonly dataSource: DataSource,
    private readonly auditService: AuditService,
  ) {}

  /* =========================================================
     ADD CLIENT PAYMENT
  ========================================================= */
  async addPayment(projectId: number, paymentData: any) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const project = await queryRunner.manager.findOne(Project, {
        where: { id: projectId },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      const amount = Number(paymentData.amount);

      if (!amount || amount <= 0) {
        throw new BadRequestException(
          'Payment amount must be greater than zero',
        );
      }

      if (amount > Number(project.balanceAmount)) {
        throw new BadRequestException(
          'Payment exceeds remaining balance',
        );
      }

      // Update totals
      project.totalPaidAmount =
        Number(project.totalPaidAmount) + amount;

      project.balanceAmount =
        Number(project.totalAmount) -
        Number(project.totalPaidAmount);

      if (project.totalPaidAmount === 0) {
        project.paymentStatus = 'PENDING';
      } else if (project.balanceAmount === 0) {
        project.paymentStatus = 'COMPLETED';
      } else {
        project.paymentStatus = 'PARTIAL';
      }

      await queryRunner.manager.save(project);

      // Create payment
      const payment = queryRunner.manager.create(ProjectPayment, {
        amount,
        paymentType: paymentData.paymentType,
        paymentDate: paymentData.paymentDate,
        paymentMode: paymentData.paymentMode,
        remarks: paymentData.remarks,
        notes: paymentData.notes,
        project,
      });

      await queryRunner.manager.save(payment);

      await queryRunner.commitTransaction();

      // Optional audit
      try {
        await this.auditService.logAction(
          'PROJECT_PAYMENT',
          payment.id,
          'CREATE',
          paymentData.userId ?? null,
          null,
          payment,
        );
      } catch (err) {
        console.error('Audit failed:', err);
      }

      return payment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /* =========================================================
     DELETE CLIENT PAYMENT
  ========================================================= */
  async deletePayment(paymentId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const payment = await queryRunner.manager.findOne(
        ProjectPayment,
        {
          where: { id: paymentId },
          relations: ['project'],
        },
      );

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      const project = payment.project;
      const amount = Number(payment.amount);

      // Reverse totals
      project.totalPaidAmount =
        Number(project.totalPaidAmount) - amount;

      project.balanceAmount =
        Number(project.totalAmount) -
        Number(project.totalPaidAmount);

      if (project.totalPaidAmount === 0) {
        project.paymentStatus = 'PENDING';
      } else if (project.balanceAmount === 0) {
        project.paymentStatus = 'COMPLETED';
      } else {
        project.paymentStatus = 'PARTIAL';
      }

      await queryRunner.manager.save(project);
      await queryRunner.manager.remove(payment);

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'Payment deleted successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /* =========================================================
     GET PAYMENTS BY PROJECT
  ========================================================= */
  async getPaymentsByProject(projectId: number) {
    return this.paymentRepository.find({
      where: { project: { id: projectId } },
      relations: ['project'],
      order: {
        paymentDate: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  /* =========================================================
     🔥 GET PAYMENTS BY CONTRACTOR (CORRECTED VERSION)
  ========================================================= */
  async getPaymentsByContractor(contractorId: number) {

    // Step 1: Find projects assigned to contractor
    const assignments = await this.dataSource
      .getRepository(ProjectContractor)
      .createQueryBuilder('pc')
      .leftJoinAndSelect('pc.project', 'project')
      .leftJoin('pc.contractor', 'contractor')
      .where('contractor.id = :contractorId', { contractorId })
      .getMany();

    const projectIds = assignments.map(a => a.project.id);

    if (!projectIds.length) return [];

    // Step 2: Fetch payments for those projects
    return this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.project', 'project')
      .where('project.id IN (:...projectIds)', { projectIds })
      .orderBy('payment.paymentDate', 'DESC')
      .addOrderBy('payment.createdAt', 'DESC')
      .getMany();
  }

  /* =========================================================
     PAGINATION
  ========================================================= */
  async findAll(query: PaginationDto) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'id',
      order = 'DESC',
    } = query;

    const qb = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.project', 'project');

    qb.orderBy(`payment.${sortBy}`, order as 'ASC' | 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  /* =========================================================
     TEMP METHOD
  ========================================================= */
  async createContractorPayment(data: any) {
    return 'temporary test';
  }
}