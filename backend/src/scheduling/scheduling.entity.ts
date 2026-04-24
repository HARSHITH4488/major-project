import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

import { Project } from '../project/project.entity';
import { OneToMany } from 'typeorm';
import { ScheduleAssignment } from './schedule-assignment.entity';
import { ScheduleTask } from './schedule-task.entity';


@Entity()
export class Schedule {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Project, { nullable: false, onDelete: 'CASCADE' })
  project: Project;

  // ✅ NEW (replace workType)
  @Column()
  workName: string;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column({ default: 'PLANNED' })
  status: 'PLANNED' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';

  @Column({ type: 'date', nullable: true })
  reminderDate: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
  @OneToMany(() => ScheduleAssignment, (assignment) => assignment.schedule)
assignments: ScheduleAssignment[];
@OneToMany(() => ScheduleTask, (task) => task.schedule)
tasks: ScheduleTask[];
progress: number;

}

