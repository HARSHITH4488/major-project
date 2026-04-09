import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { Schedule } from './scheduling.entity';
import { Contractor } from '../contractor/contractor.entity';
import { ScheduleTask } from './schedule-task.entity';

@Entity()
export class ScheduleAssignment {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Schedule, { onDelete: 'CASCADE' })
  schedule: Schedule;

  @ManyToOne(() => Contractor, { onDelete: 'CASCADE' })
  contractor: Contractor;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @OneToMany(() => ScheduleTask, (task) => task.assignment)
  tasks: ScheduleTask[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}