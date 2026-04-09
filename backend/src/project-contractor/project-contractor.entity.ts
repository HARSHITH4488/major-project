import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

import { Project } from '../project/project.entity';
import { Contractor } from '../contractor/contractor.entity';
import { ProjectPayment } from '../project-payment/project-payment.entity';

@Entity()
export class ProjectContractor {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => Project,
    (project) => project.projectAssignments,
    { onDelete: 'CASCADE' }
  )
  project: Project;

  @ManyToOne(
    () => Contractor,
    (contractor) => contractor.projectAssignments,
    { onDelete: 'CASCADE' }
  )
  contractor: Contractor;

  @Column()
  role: string;

  @Column('decimal', { precision: 15, scale: 2 })
  contractAmount: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  totalPaid: number;

  @Column('decimal', { precision: 15, scale: 2 })
  remainingAmount: number;

  @Column({ type: 'date' })
  assignedDate: Date;

  @Column({ default: 'ACTIVE' })
  status: 'ACTIVE' | 'COMPLETED';

  @Column({ nullable: true })
  notes: string;

  /* ================= PAYMENTS ================= */

  @OneToMany(
    () => ProjectPayment,
    (payment) => payment.projectContractor
  )
  payments: ProjectPayment[];

  @CreateDateColumn()
  createdAt: Date;
}