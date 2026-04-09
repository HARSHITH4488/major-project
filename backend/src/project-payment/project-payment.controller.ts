import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Body,
  Query,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';

import { ProjectPaymentService } from './project-payment.service';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('project-payments')
export class ProjectPaymentController {
  constructor(
    private readonly projectPaymentService: ProjectPaymentService,
  ) {}

  /* =========================================================
     CONTRACTOR PAYMENT (Create via Contractor View)
  ========================================================= */

  @Post('contractor')
  createContractorPayment(@Body() body: any) {
    const contractorId = Number(body.contractorId);
    const projectId = Number(body.projectId);
    const amount = Number(body.amount);

    if (isNaN(contractorId) || isNaN(projectId) || isNaN(amount)) {
      throw new BadRequestException('Invalid numeric values');
    }

    return this.projectPaymentService.createContractorPayment({
      contractorId,
      projectId,
      amount,
      paymentType: body.paymentType,
      paymentDate: body.paymentDate,
      paymentMode: body.paymentMode,
      remarks: body.remarks,
      notes: body.notes,
    });
  }

  /* =========================================================
     🔥 GET PAYMENTS BY CONTRACTOR (Finance View)
  ========================================================= */

  @Get('contractor/:contractorId')
  getPaymentsByContractor(
    @Param('contractorId', ParseIntPipe)
    contractorId: number,
  ) {
    return this.projectPaymentService.getPaymentsByContractor(
      contractorId,
    );
  }

  /* =========================================================
     ADD PAYMENT BY PROJECT
  ========================================================= */

  @Post(':projectId')
  addPayment(
    @Param('projectId', ParseIntPipe)
    projectId: number,
    @Body() body: any,
  ) {
    return this.projectPaymentService.addPayment(
      projectId,
      body,
    );
  }

  /* =========================================================
     DELETE PAYMENT
  ========================================================= */

  @Delete(':paymentId')
  deletePayment(
    @Param('paymentId', ParseIntPipe)
    paymentId: number,
  ) {
    return this.projectPaymentService.deletePayment(
      paymentId,
    );
  }

  /* =========================================================
     GET PAYMENTS BY PROJECT
  ========================================================= */

  @Get('project/:projectId')
  getPaymentsByProject(
    @Param('projectId', ParseIntPipe)
    projectId: number,
  ) {
    return this.projectPaymentService.getPaymentsByProject(
      projectId,
    );
  }

  /* =========================================================
     PAGINATION (Admin / Global View)
  ========================================================= */

  @Get()
  findAll(@Query() query: PaginationDto) {
    return this.projectPaymentService.findAll(query);
  }
}