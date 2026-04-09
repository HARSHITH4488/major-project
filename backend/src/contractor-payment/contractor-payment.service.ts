import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { ContractorPayment } from './contractor-payment.entity';
import { Contractor } from '../contractor/contractor.entity';
import { Project } from '../project/project.entity';
import { ProjectContractor } from '../project-contractor/project-contractor.entity';

@Injectable()
export class ContractorPaymentService {
  constructor(
    @InjectRepository(ContractorPayment)
    private readonly contractorPaymentRepo: Repository<ContractorPayment>,

    @InjectRepository(Contractor)
    private readonly contractorRepo: Repository<Contractor>,

    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,

    @InjectRepository(ProjectContractor)
    private readonly projectContractorRepo: Repository<ProjectContractor>,

    private readonly dataSource: DataSource,
  ) {}

  /* ======================================================
     CREATE CONTRACTOR PAYMENT
  ====================================================== */
  async create(data: any) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const contractor = await queryRunner.manager.findOne(Contractor, {
        where: { id: data.contractorId },
      });

      if (!contractor) {
        throw new NotFoundException('Contractor not found');
      }

      const project = await queryRunner.manager.findOne(Project, {
        where: { id: data.projectId },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      const assignment = await queryRunner.manager.findOne(ProjectContractor, {
        where: {
          contractor: { id: data.contractorId },
          project: { id: data.projectId },
        },
      });

      if (!assignment) {
        throw new NotFoundException('Project assignment not found');
      }

      const newTotalPaid =
        Number(assignment.totalPaid) + Number(data.amount);

      // 🔥 Prevent Overpayment
      if (newTotalPaid > Number(assignment.contractAmount)) {
        throw new BadRequestException(
          `Cannot pay ₹${data.amount}. Remaining amount is ₹${assignment.remainingAmount}`
        );
      }

      // 1️⃣ Save payment
      const payment = queryRunner.manager.create(ContractorPayment, {
        amount: data.amount,
        paymentType: data.paymentType,
        paymentDate: data.paymentDate,
        notes: data.notes,
        contractor,
        project,
      });

      await queryRunner.manager.save(payment);

      // 2️⃣ Update totals
      assignment.totalPaid = newTotalPaid;
      assignment.remainingAmount =
        Number(assignment.contractAmount) - newTotalPaid;

      await queryRunner.manager.save(assignment);

      await queryRunner.commitTransaction();

      return payment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /* ======================================================
     GET PAYMENTS BY CONTRACTOR
  ====================================================== */
  async findByContractor(contractorId: number) {
    return this.contractorPaymentRepo.find({
      where: { contractor: { id: contractorId } },
      relations: ['project'],
      order: {
        paymentDate: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  /* ======================================================
     DELETE CONTRACTOR PAYMENT (SAFE REVERSE LOGIC)
  ====================================================== */
  async delete(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const payment = await queryRunner.manager.findOne(ContractorPayment, {
        where: { id },
        relations: ['contractor', 'project'],
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      const assignment = await queryRunner.manager.findOne(ProjectContractor, {
        where: {
          contractor: { id: payment.contractor.id },
          project: { id: payment.project.id },
        },
      });

      if (!assignment) {
        throw new NotFoundException('Project assignment not found');
      }

      // 🔁 Reverse totals safely
      assignment.totalPaid =
        Number(assignment.totalPaid) - Number(payment.amount);

      if (assignment.totalPaid < 0) {
        assignment.totalPaid = 0;
      }

      assignment.remainingAmount =
        Number(assignment.contractAmount) - Number(assignment.totalPaid);

      await queryRunner.manager.save(assignment);

      // 🗑 Delete payment
      await queryRunner.manager.delete(ContractorPayment, id);

      await queryRunner.commitTransaction();

      return { message: 'Payment deleted successfully' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
