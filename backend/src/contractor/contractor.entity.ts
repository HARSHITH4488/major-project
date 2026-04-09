import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { ProjectContractor } from '../project-contractor/project-contractor.entity';
import { Schedule } from '../scheduling/scheduling.entity';
import { User } from '../auth/user.entity';
import { DocumentContractor } from '../document/document-contractor.entity';
import { ScheduleTask } from '../scheduling/schedule-task.entity'; // ✅ ADD THIS

@Entity()
export class Contractor {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  companyName: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  natureOfWork: string;

  @Column({ nullable: true })
  specialization: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  remarks: string;

  @OneToMany(
    () => ProjectContractor,
    (projectContractor) => projectContractor.contractor,
  )
  projectAssignments: ProjectContractor[];

  
  schedules: Schedule[];

  // ✅ NEW: LINK TASKS DIRECTLY
  @OneToMany(
    () => ScheduleTask,
    (task) => task.contractor
  )
  tasks: ScheduleTask[];

  @OneToMany(
    () => DocumentContractor,
    (dc) => dc.contractor
  )
  documentLinks: DocumentContractor[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}