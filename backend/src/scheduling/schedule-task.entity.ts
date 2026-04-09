import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Contractor } from '../contractor/contractor.entity';
import { ScheduleAssignment } from './schedule-assignment.entity';

@Entity()
export class ScheduleTask {

  @PrimaryGeneratedColumn()
  id: number;

  // ✅ NEW: LINK TO ASSIGNMENT (NOT SCHEDULE)
  @ManyToOne(() => ScheduleAssignment, (assignment) => assignment.tasks, {
    onDelete: 'CASCADE',
  })
  assignment: ScheduleAssignment;

  // ✅ KEEP THIS (VERY IMPORTANT)
  @ManyToOne(() => Contractor, contractor => contractor.tasks)
  contractor: Contractor;

  @Column()
  contractorId: number;

  @Column()
  title: string;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column({
    default: 'PLANNED',
  })
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}