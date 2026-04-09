import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  entity: string; // e.g. 'Project'

  @Column()
  entityId: number;

  @Column()
  action: string; // CREATE / UPDATE / DELETE / RESTORE

  @Column({ nullable: true })
performedBy: number;

  @Column({ type: 'jsonb', nullable: true })
oldData: any;

@Column({ type: 'jsonb', nullable: true })
newData: any;

  @CreateDateColumn()
  createdAt: Date;
}
