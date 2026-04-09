import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Project } from '../project/project.entity';
import { Contractor } from '../contractor/contractor.entity';

@Entity()
export class ProjectPayment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Project, { nullable: false })
  project: Project;

  @ManyToOne(() => Contractor, { nullable: true })
  contractor: Contractor;

  @Column()
  paymentType: string;
  // ADVANCE_RECEIVED | PAYMENT_TO_CONTRACTOR

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @CreateDateColumn()
  paymentDate: Date;

  @Column({ nullable: true })
  remarks: string;
}
