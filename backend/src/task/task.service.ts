import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { Task } from './task.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  // ✅ CREATE TASK (Admin)


async createTask(data: {
  title: string;
  assignedTo: number;
  createdBy: number;
  startDate: Date;
  endDate: Date;
}) {
  const assignedTo = Number(data.assignedTo);

  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  // 🔴 VALIDATE DATE
  if (startDate > endDate) {
    throw new BadRequestException('Invalid date range');
  }

  

  const task = this.taskRepository.create({
    ...data,
    assignedTo, // ✅ FIXED
    startDate,
    endDate,
  });

  return this.taskRepository.save(task);
}

  // ✅ GET TODAY TASKS (Employee)
  async getMyTodayTasks(userId: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return this.taskRepository
    .createQueryBuilder('task')
    .where('task.assignedTo = :userId', { userId })
    .andWhere(':today BETWEEN task.startDate AND task.endDate', { today })
    .orderBy('task.startDate', 'ASC')
    .getMany();
}

  // ✅ MARK COMPLETE
  async markComplete(taskId: number) {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    task.isCompleted = true;
    return this.taskRepository.save(task);
  }

  // ✅ ADMIN SUMMARY (Today)
 async getTodaySummary() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tasks = await this.taskRepository
    .createQueryBuilder('task')
    .where(':today BETWEEN task.startDate AND task.endDate', { today })
    .getMany();

  const summary: any = {};

  tasks.forEach((task) => {
    if (!summary[task.assignedTo]) {
      summary[task.assignedTo] = {
        total: 0,
        completed: 0,
      };
    }

    summary[task.assignedTo].total++;

    if (task.isCompleted) {
      summary[task.assignedTo].completed++;
    }
  });

  return summary;
}
  // ✅ GET ALL TASKS
async getAllTasks() {
  return this.taskRepository.find({
    relations: ['user'],
    order: { startDate: 'DESC' },
  });
}
// ✅ DELETE TASK
async deleteTask(id: number) {
  return this.taskRepository.delete(id);
}
}