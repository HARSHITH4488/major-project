import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  Delete,
  Patch,
} from '@nestjs/common';

import { SchedulingService } from './scheduling.service';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('schedules')
export class SchedulingController {
  constructor(
    private readonly schedulingService: SchedulingService,
  ) {}

  /* =========================================================
     CREATE SCHEDULE
  ========================================================= */

  @Post()
createSchedule(
  @Body('projectId') projectId: number,
  @Body('workName') workName: string,   // ✅ NEW
  @Body('startDate') startDate: string,
  @Body('endDate') endDate: string,
  @Body('reminderDaysBefore') reminderDaysBefore: number,
) {
  return this.schedulingService.createSchedule(
    projectId,
    workName,   // ✅ NEW
    startDate,
    endDate,
    reminderDaysBefore,
  );
}

  /* =========================================================
     🔥 CREATE TASK (FIXED)
  ========================================================= */

  @Post('schedule-tasks')
  createTask(@Body() body: any) {
    return this.schedulingService.createTask(
      body.scheduleId,
      body.contractorId, // ✅ IMPORTANT
      body.title,
      body.startDate,
      body.endDate
    );
  }

  /* =========================================================
     GET ALL SCHEDULES (PAGINATION)
  ========================================================= */

  @Get()
  findAll(@Query() query: PaginationDto) {
    return this.schedulingService.findAll(query);
  }

  /* =========================================================
     GET SCHEDULES BY PROJECT
  ========================================================= */

  @Get('project/:projectId')
  getSchedulesByProject(@Param('projectId') projectId: string) {
    return this.schedulingService.getSchedulesByProject(
      Number(projectId),
    );
  }

  /* =========================================================
     DELETE SCHEDULE
  ========================================================= */

  @Delete(':id')
  deleteSchedule(@Param('id') id: string) {
    return this.schedulingService.deleteSchedule(Number(id));
  }

  /* =========================================================
     UPDATE SCHEDULE STATUS
  ========================================================= */

  @Patch(':id/status')
  updateScheduleStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.schedulingService.updateScheduleStatus(
      Number(id),
      status,
    );
  }

  /* =========================================================
     UPDATE SCHEDULE DATES
  ========================================================= */

  @Patch(':id')
  updateSchedule(
    @Param('id') id: string,
    @Body('startDate') startDate: string,
    @Body('endDate') endDate: string,
  ) {
    return this.schedulingService.updateSchedule(
      Number(id),
      startDate,
      endDate,
    );
  }

  /* =========================================================
     GET TASKS BY CONTRACTOR
  ========================================================= */

  @Get('contractor/:contractorId/tasks')
  async getTasksByContractor(@Param('contractorId') contractorId: string) {
    const tasks = await this.schedulingService.getTasksByContractor(
      Number(contractorId)
    );

    return {
      success: true,
      message: 'Request successful',
      data: tasks
    };
  }

  /* =========================================================
     GET TASKS BY USER (LOGIN)
  ========================================================= */

  @Get('tasks/user/:userId')
  getTasksByUser(@Param('userId') userId: string) {
    return this.schedulingService.getTasksByUser(Number(userId));
  }

  /* =========================================================
     START TASK
  ========================================================= */

  @Patch('task/:taskId/start')
  startTask(@Param('taskId') taskId: string) {
    return this.schedulingService.updateTaskStatus(
      Number(taskId),
      'IN_PROGRESS',
    );
  }

  /* =========================================================
     FINISH TASK
  ========================================================= */

  @Patch('task/:taskId/finish')
  finishTask(@Param('taskId') taskId: string) {
    return this.schedulingService.updateTaskStatus(
      Number(taskId),
      'COMPLETED',
    );
  }

  /* =========================================================
     CONTRACTOR DASHBOARD SUMMARY
  ========================================================= */

  @Get('contractor-summary/:userId')
  getContractorSummary(@Param('userId') userId: string) {
    return this.schedulingService.getContractorTaskSummary(
      Number(userId)
    );
  }
  /* =========================================================
   ASSIGN CONTRACTOR TO WORK (NEW 🔥)
========================================================= */

@Post(':scheduleId/assign-contractor')
assignContractorToSchedule(
  @Param('scheduleId') scheduleId: string,
  @Body() body: any
) {
  return this.schedulingService.assignContract(
    Number(scheduleId),
    body.contractorId,
    body.startDate,
    body.endDate
  );
}
}