import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

import { Project } from '../project/project.entity';
import { ProjectContractor } from '../project-contractor/project-contractor.entity';

@Entity()
export class ProjectPayment {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column()
  paymentType: string;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  paymentDate: Date;

  @Column({ nullable: true })
  remarks: string;

  @Column({ nullable: true })
  paymentMode: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  /* ✅ LINK TO PROJECT */
  @ManyToOne(() => Project, (project) => project.payments, {
    onDelete: 'CASCADE',
  })
  project: Project;

  /* ✅ LINK TO PROJECT CONTRACTOR (IMPORTANT) */
  @ManyToOne(
    () => ProjectContractor,
    (pc) => pc.payments,
    { onDelete: 'CASCADE' }
  )
  projectContractor: ProjectContractor;

  @CreateDateColumn()
  createdAt: Date;
}