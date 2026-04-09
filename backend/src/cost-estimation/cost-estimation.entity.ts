import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Project } from '../project/project.entity';

@Entity()
export class CostEstimation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Project, { nullable: false })
  project: Project;

  @Column()
  revisionNumber: number;

  @Column({ nullable: true })
  revisionReason: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalEstimatedCost: number;

  @CreateDateColumn()
  createdAt: Date;
}
