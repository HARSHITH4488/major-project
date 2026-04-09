import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Delete,
  Patch,
  Param,
  ParseIntPipe
} from '@nestjs/common';
import { ContractorService } from './contractor.service';
import { Contractor } from './contractor.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('contractors')
export class ContractorController {
  constructor(private readonly contractorService: ContractorService) {}

  // ✅ CREATE CONTRACTOR
  @Post()
  async createContractor(@Body() data: Partial<Contractor>) {
    return this.contractorService.createContractor(data);
  }

  // ✅ GET ALL CONTRACTORS
  @Get()
  getAllContractors(@Query() paginationDto: PaginationDto) {
    return this.contractorService.getAllContractors(paginationDto);
  }

  // 🔥 GET CONTRACTOR BY USER ID (VERY IMPORTANT)
  @Get('by-user/:userId')
  getByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.contractorService.getContractorByUserId(userId);
  }

  // 🔥 SUMMARY
  @Get(':id/summary')
  getContractorSummary(@Param('id', ParseIntPipe) id: number) {
    return this.contractorService.getContractorSummary(id);
  }

  // 🔥 PROJECT FINANCIALS
  @Get(':id/projects-financials')
  getProjectFinancials(@Param('id', ParseIntPipe) id: number) {
    return this.contractorService.getContractorProjectsWithFinancials(id);
  }

  // 🔥 PAYMENTS
  @Get(':id/payments')
  getContractorPayments(@Param('id', ParseIntPipe) id: number) {
    return this.contractorService.getContractorPayments(id);
  }

  // 🔥 PROJECTS
  @Get(':id/projects')
  getContractorProjects(@Param('id', ParseIntPipe) id: number) {
    return this.contractorService.getContractorProjects(id);
  }

  // ✅ GET BY ID
  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.contractorService.getContractorById(id);
  }

  // ✅ UPDATE
  @Patch(':id')
  updateContractor(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<Contractor>
  ) {
    return this.contractorService.updateContractor(id, data);
  }

  // ✅ DELETE
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.contractorService.deleteContractor(id);
  }

  // ✅ RESTORE
  @Patch('restore/:id')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.contractorService.restoreContractor(id);
  }
}

