import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

import { ProjectPayment } from '../project-payment/project-payment.entity';
import { Document } from '../document/document.entity';
import { ProjectContractor } from '../project-contractor/project-contractor.entity';
import { Schedule } from '../scheduling/scheduling.entity';
@Entity()
export class Project {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  projectName: string;

  @Column()
  projectType: string;

  @Column()
  clientName: string;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date', nullable: true })
  endDate: string;

  @Column({ default: 'PLANNING' })
  status: string;

  /* ===============================
     FINANCIAL COLUMNS (REVENUE SIDE)
  =================================*/

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalAmount: number; // Total project value agreed with client

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalPaidAmount: number; // Total paid by client

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  balanceAmount: number; // Remaining from client

  @Column({ default: 'PENDING' })
  paymentStatus: string;

  /* ===============================
     RELATIONS
  =================================*/

  // ✅ Client Payments (Revenue Side)
  @OneToMany(
    () => ProjectPayment,
    (payment) => payment.project,
  )
  payments: ProjectPayment[];

  @OneToMany(() => Document, document => document.project)
  documents: Document[];

  // 🔵 Expense Side (Contractors)
  @OneToMany(
    () => ProjectContractor,
    (projectContractor) => projectContractor.project,
  )
  projectAssignments: ProjectContractor[];
  /* ===============================
   SCHEDULING
=================================*/

@OneToMany(
  () => Schedule,
  (schedule) => schedule.project
)
schedules: Schedule[];

  /* ===============================
     AUDIT COLUMNS
  =================================*/

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: number;

  @Column({ nullable: true })
  updatedBy: number;

  @Column({ nullable: true })
  deletedBy: number;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column({ nullable: true })
  description: string;
}
