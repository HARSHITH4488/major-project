import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';

import { SchedulingService } from './scheduling.service';

@Controller('schedule-tasks')
export class ScheduleTaskController {

  constructor(
    private readonly schedulingService: SchedulingService,
  ) {}

  /* ===============================
     CREATE TASK (FIXED)
  =================================*/

  @Post()
  createTask(
    @Body('scheduleId') scheduleId: number,
    @Body('contractorId') contractorId: number, // ✅ FIX
    @Body('title') title: string,
    @Body('startDate') startDate: string,
    @Body('endDate') endDate: string,
  ) {
    return this.schedulingService.createTask(
      scheduleId,
      contractorId, // ✅ FIX
      title,
      startDate,
      endDate,
    );
  }

  /* ===============================
     GET TASKS BY SCHEDULE
  =================================*/

  @Get('schedule/:scheduleId')
  getTasksBySchedule(
    @Param('scheduleId') scheduleId: string,
  ) {
    return this.schedulingService.getTasksBySchedule(
      Number(scheduleId),
    );
  }

  /* ===============================
     UPDATE TASK STATUS
  =================================*/

  @Patch(':id/status')
  updateTaskStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.schedulingService.updateTaskStatus(
      Number(id),
      status,
    );
  }

  /* ===============================
     DELETE TASK
  =================================*/

  @Delete(':id')
  deleteTask(@Param('id') id: string) {
    return this.schedulingService.deleteTask(
      Number(id),
    );
  }

  /* ===============================
     UPDATE TASK
  =================================*/

  @Patch(':id')
  updateTask(
    @Param('id') id: string,
    @Body('title') title: string,
    @Body('startDate') startDate: string,
    @Body('endDate') endDate: string,
  ) {
    return this.schedulingService.updateTask(
      Number(id),
      title,
      startDate,
      endDate,
    );
  }
}