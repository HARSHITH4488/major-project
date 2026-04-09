import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Document } from './document.entity';
import { Contractor } from '../contractor/contractor.entity';

@Entity('document_contractors')
export class DocumentContractor {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Document, (document) => document.sharedWith, {
    onDelete: 'CASCADE',
  })
  document: Document;

  @ManyToOne(() => Contractor, (contractor) => contractor.documentLinks, {
    onDelete: 'CASCADE',
  })
  contractor: Contractor;
}