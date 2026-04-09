import { Controller, Post, Body, Get, Query, Patch, Param } from '@nestjs/common';
import { TaskService } from './task.service';
import { Delete } from '@nestjs/common'; // add this at top

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  // ✅ CREATE TASK (Admin)
  @Post()
createTask(
  @Body('title') title: string,
  @Body('assignedTo') assignedTo: number,
  @Body('createdBy') createdBy: number,
  @Body('startDate') startDate: Date,
  @Body('endDate') endDate: Date,
) {
  return this.taskService.createTask({
    title,
    assignedTo,
    createdBy,
    startDate,
    endDate,
  });
}

  // ✅ GET TODAY TASKS (Employee)
  @Get('my-today')
  getMyTasks(@Query('userId') userId: number) {
    return this.taskService.getMyTodayTasks(Number(userId));
  }

  // ✅ MARK COMPLETE
  @Patch(':id/complete')
  markComplete(@Param('id') id: number) {
    return this.taskService.markComplete(Number(id));
  }

  // ✅ ADMIN SUMMARY
  @Get('today-summary')
  getSummary() {
    return this.taskService.getTodaySummary();
  }
  // ✅ GET ALL TASKS (ADMIN)
@Get()
getAllTasks() {
  return this.taskService.getAllTasks();
}
// ✅ DELETE TASK


@Delete(':id')
deleteTask(@Param('id') id: number) {
  return this.taskService.deleteTask(Number(id));
}
}