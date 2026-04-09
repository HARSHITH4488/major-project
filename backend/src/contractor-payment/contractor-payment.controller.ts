import { Controller, Post, Get, Delete, Body, Param } from '@nestjs/common';
import { ContractorPaymentService } from './contractor-payment.service';

@Controller('contractor-payments')
export class ContractorPaymentController {
  constructor(
    private readonly contractorPaymentService: ContractorPaymentService,
  ) {}

  @Post()
  create(@Body() body: any) {
    return this.contractorPaymentService.create(body);
  }

  @Get('contractor/:id')
  findByContractor(@Param('id') id: number) {
    return this.contractorPaymentService.findByContractor(+id);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.contractorPaymentService.delete(+id);
  }
}
