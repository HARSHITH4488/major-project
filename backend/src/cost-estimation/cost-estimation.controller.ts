import {
  Controller,
  Post,
  Body,
} from '@nestjs/common';
import { CostEstimationService } from './cost-estimation.service';
import { Query, Get } from '@nestjs/common';
import { PaginationDto } from '../common/dto/pagination.dto';


@Controller('cost-estimation')
export class CostEstimationController {
  constructor(
    private readonly costEstimationService: CostEstimationService,
  ) {}

  @Post('revision')
  createRevision(
    @Body('projectId') projectId: number,
    @Body('revisionReason') revisionReason?: string,
    @Body('copyPrevious') copyPrevious?: boolean,
  ) {
    return this.costEstimationService.createNewRevision(
      projectId,
      revisionReason,
      copyPrevious,
    );
  }
    @Post('item')
  addItem(
    @Body('estimationId') estimationId: number,
    @Body('itemName') itemName: string,
    @Body('rateType') rateType: string,
    @Body('rate') rate: number,
    @Body('estimatedQuantity') estimatedQuantity: number,
  ) {
    return this.costEstimationService.addEstimationItem(
      estimationId,
      itemName,
      rateType,
      rate,
      estimatedQuantity,
    );
  }
    @Post('item/update')
  updateItem(
    @Body('itemId') itemId: number,
    @Body('newRate') newRate: number,
    @Body('newQuantity') newQuantity: number,
  ) {
    return this.costEstimationService.updateEstimationItem(
      itemId,
      newRate,
      newQuantity,
    );
  }
  @Get()
findAll(@Query() query: PaginationDto) {
  return this.costEstimationService.findAll(query);
}


}
