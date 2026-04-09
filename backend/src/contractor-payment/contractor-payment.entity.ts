import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

import { Contractor } from '../contractor/contractor.entity';
import { Project } from '../project/project.entity';

@Entity()
export class ContractorPayment {

  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;

  @Column()
  paymentType: string;

  @Column({ type: 'date' })
  paymentDate: Date;

  @Column({ nullable: true })
  notes: string;

  @ManyToOne(() => Contractor, { onDelete: 'CASCADE' })
  contractor: Contractor;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  project: Project;

  @CreateDateColumn()
  createdAt: Date;
}