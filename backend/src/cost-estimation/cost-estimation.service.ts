import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CostEstimation } from './cost-estimation.entity';
import { EstimatedCostItem } from './estimated-cost-item.entity';
import { Project } from '../project/project.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class CostEstimationService {
  constructor(
    @InjectRepository(CostEstimation)
    private readonly estimationRepo: Repository<CostEstimation>,

    @InjectRepository(EstimatedCostItem)
    private readonly itemRepo: Repository<EstimatedCostItem>,

    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
  ) {}

  async createNewRevision(
    projectId: number,
    revisionReason?: string,
    copyPrevious = false,
  ) {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const latestRevision = await this.estimationRepo.findOne({
      where: { project: { id: projectId }, isActive: true },
      relations: ['project'],
    });

    // deactivate old revision
    if (latestRevision) {
      latestRevision.isActive = false;
      await this.estimationRepo.save(latestRevision);
    }

    const newRevisionNumber = latestRevision
      ? latestRevision.revisionNumber + 1
      : 1;

 const newEstimation = this.estimationRepo.create({
  project,
  revisionNumber: newRevisionNumber,
  revisionReason,
  isActive: true,
  totalEstimatedCost: latestRevision
    ? Number(latestRevision.totalEstimatedCost)
    : 0,
});


    const savedEstimation = await this.estimationRepo.save(newEstimation);

    // copy items if requested
   if (copyPrevious && latestRevision) {
  const oldItems = await this.itemRepo.find({
    where: { costEstimation: { id: latestRevision.id } },
  });

  let total = 0;

  const copiedItems = oldItems.map((item) => {
    total += Number(item.estimatedAmount);

    return this.itemRepo.create({
      costEstimation: savedEstimation,
      itemName: item.itemName,
      rateType: item.rateType,
      rate: item.rate,
      estimatedQuantity: item.estimatedQuantity,
      estimatedAmount: item.estimatedAmount,
    });
  });

  await this.itemRepo.save(copiedItems);

  // ✅ IMPORTANT: set correct total after copying
  savedEstimation.totalEstimatedCost = total;
  await this.estimationRepo.save(savedEstimation);
}


    return savedEstimation;
  }
    async addEstimationItem(
    estimationId: number,
    itemName: string,
    rateType: string,
    rate: number,
    estimatedQuantity: number,
  ) {
    const estimation = await this.estimationRepo.findOne({
      where: { id: estimationId },
    });

    if (!estimation) {
      throw new NotFoundException('Estimation revision not found');
    }

    const estimatedAmount = rate * estimatedQuantity;

    const item = this.itemRepo.create({
      costEstimation: estimation,
      itemName,
      rateType,
      rate,
      estimatedQuantity,
      estimatedAmount,
    });

    await this.itemRepo.save(item);

    // update total estimated cost
    estimation.totalEstimatedCost =
      Number(estimation.totalEstimatedCost) + estimatedAmount;

    await this.estimationRepo.save(estimation);

    return item;
  }
    async updateEstimationItem(
    itemId: number,
    newRate: number,
    newQuantity: number,
  ) {
    const item = await this.itemRepo.findOne({
      where: { id: itemId },
      relations: ['costEstimation'],
    });

    if (!item) {
      throw new NotFoundException('Estimation item not found');
    }

    const oldAmount = Number(item.estimatedAmount);

    item.rate = newRate;
    item.estimatedQuantity = newQuantity;
    item.estimatedAmount = newRate * newQuantity;

    await this.itemRepo.save(item);

    // update total cost of that revision
    const estimation = item.costEstimation;

    estimation.totalEstimatedCost =
      Number(estimation.totalEstimatedCost) -
      oldAmount +
      item.estimatedAmount;

    await this.estimationRepo.save(estimation);

    return item;
  }
  async findAll(query: PaginationDto) {
  const { page = 1, limit = 10, search, sortBy = 'id', order = 'DESC' } = query;

  const qb = this.estimationRepo
    .createQueryBuilder('estimation')
    .leftJoinAndSelect('estimation.project', 'project');

  if (search) {
    qb.where('project.projectName ILIKE :search', {
      search: `%${search}%`,
    });
  }

  const allowedSortFields = [
    'id',
    'revisionNumber',
    'totalEstimatedCost',
    'createdAt',
  ];

  if (!allowedSortFields.includes(sortBy)) {
    throw new BadRequestException('Invalid sort field');
  }

  qb.orderBy(`estimation.${sortBy}`, order);

  qb.skip((page - 1) * limit).take(limit);

  const [data, total] = await qb.getManyAndCount();

  return {
    data,
    total,
    page,
    lastPage: Math.ceil(total / limit),
  };
}
  
}
