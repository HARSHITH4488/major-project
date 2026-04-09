import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

import { Project } from '../project/project.entity';
import { DocumentContractor } from './document-contractor.entity';

@Entity('documents')
export class Document {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fileName: string;

  @Column()
  fileType: string;

  @Column()
  filePath: string;

  @Column()
  fileSize: number;

  @Column({ type: 'text', nullable: true })
  category: string;

  @Column({ nullable: true })
  uploadedByName: string;

  @Column({
    type: 'enum',
    enum: ['ADMIN', 'EMPLOYEE', 'CONTRACTOR'],
    nullable: true,
  })
  uploadedByRole: string;

  @Column({ default: false })
  visibleToContractor: boolean;

  @OneToMany(
    () => DocumentContractor,
    (dc) => dc.document,
  )
  sharedWith: DocumentContractor[];

  @CreateDateColumn()
  uploadedAt: Date;

  @ManyToOne(() => Project, (project) => project.documents, {
    onDelete: 'CASCADE',
  })
  project: Project;
}