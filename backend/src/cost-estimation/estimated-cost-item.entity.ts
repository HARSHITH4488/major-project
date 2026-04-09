import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { CostEstimation } from './cost-estimation.entity';

@Entity()
export class EstimatedCostItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CostEstimation, { nullable: false, onDelete: 'CASCADE' })
  costEstimation: CostEstimation;

  @Column()
  itemName: string;

  @Column()
  rateType: string; 
  // sqft / unit / material

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  rate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  estimatedQuantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  estimatedAmount: number;
}
