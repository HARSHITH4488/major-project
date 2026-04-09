import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Project } from '../project/project.entity';
import { Contractor } from '../contractor/contractor.entity';

export enum UpdateStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  DELAYED = 'DELAYED',
}

@Entity('project_updates')
export class ProjectUpdate {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Project, { nullable: false, onDelete: 'CASCADE' })
  project: Project;

  @ManyToOne(() => Contractor, { nullable: false, onDelete: 'CASCADE' })
  contractor: Contractor;

  // OLD SYSTEM (keep for safety)
  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({
    type: 'enum',
    enum: UpdateStatus,
    default: UpdateStatus.IN_PROGRESS,
  })
  status: UpdateStatus;

  // ✅ NEW SYSTEM
  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ nullable: true })
photo: string;

  @CreateDateColumn()
  createdAt: Date;
}