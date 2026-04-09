import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Delete,
  Patch,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ProjectService } from './project.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../auth/role.enum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CreateProjectDto } from './dto/create-project.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  /* =====================================================
     CREATE PROJECT (ADMIN & MANAGER)
  ===================================================== */
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @Post()
  createProject(
    @Body() dto: CreateProjectDto,
    @Req() req: Request,
  ) {
    const userId = (req as any).user.id;
    return this.projectService.createProject(dto, userId);
  }

  /* =====================================================
     UPDATE PROJECT (ADMIN & MANAGER)
  ===================================================== */
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @Patch(':id')
  updateProject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateProjectDto,
    @Req() req: Request,
  ) {
    const userId = (req as any).user.id;
    return this.projectService.updateProject(id, dto, userId);
  }

  /* =====================================================
     GET ALL PROJECTS (ALL ROLES)
  ===================================================== */
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.CONTRACTOR)
  @Get()
  getAllProjects(@Query() paginationDto: PaginationDto) {
    return this.projectService.getAllProjects(paginationDto);
  }

  /* =====================================================
     GET PROJECT BY ID (ALL ROLES)
  ===================================================== */
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.CONTRACTOR)
  @Get(':id')
  getProjectById(@Param('id', ParseIntPipe) id: number) {
    return this.projectService.getProjectById(id);
  }

  /* =====================================================
     DELETE PROJECT (ADMIN ONLY)
  ===================================================== */
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  deleteProject(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const userId = (req as any).user.id;
    return this.projectService.deleteProject(id, userId);
  }

  /* =====================================================
     RESTORE PROJECT (ADMIN ONLY)
  ===================================================== */
  @Roles(UserRole.ADMIN)
  @Patch('restore/:id')
  restoreProject(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const userId = (req as any).user.id;
    return this.projectService.restoreProject(id, userId);
  }

  /* =====================================================
     ASSIGN CONTRACTOR (ADMIN & MANAGER)
  ===================================================== */
  @Post(':projectId/assign')
assignContractor(
  @Param('projectId') projectId: number,
  @Body() body: { contractorId: number; contractAmount: number },
) {
  return this.projectService.assignContractor(
    Number(projectId),
    Number(body.contractorId),
    Number(body.contractAmount),
  );
}

  /* =====================================================
     REMOVE CONTRACTOR (ADMIN & MANAGER)
  ===================================================== */
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @Delete(':projectId/remove/:contractorId')
  removeContractor(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('contractorId', ParseIntPipe) contractorId: number,
  ) {
    return this.projectService.removeContractor(
      projectId,
      contractorId,
    );
  }

  /* =====================================================
     GET PROJECT CONTRACTORS (ALL ROLES)
  ===================================================== */
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.CONTRACTOR)
  @Get(':projectId/contractors')
  getProjectContractors(
    @Param('projectId', ParseIntPipe) projectId: number,
  ) {
    return this.projectService.getProjectContractors(projectId);
  }
}