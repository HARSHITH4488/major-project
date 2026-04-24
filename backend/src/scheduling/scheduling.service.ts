import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Schedule } from './scheduling.entity';
import { ScheduleTask } from './schedule-task.entity';

import { Project } from '../project/project.entity';
import { Contractor } from '../contractor/contractor.entity';

import { PaginationDto } from '../common/dto/pagination.dto';
import { ScheduleAssignment } from './schedule-assignment.entity';


@Injectable()
export class SchedulingService {

  constructor(

    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,

    @InjectRepository(ScheduleTask)
    private readonly taskRepo: Repository<ScheduleTask>,
    

    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,

    @InjectRepository(Contractor)
    private readonly contractorRepo: Repository<Contractor>,

    @InjectRepository(ScheduleAssignment)
private readonly assignmentRepo: Repository<ScheduleAssignment>,

  ) {}
  async getTodayReminders() {
  const today = new Date().toISOString().split('T')[0];

  const reminders = await this.scheduleRepo.find({
    where: {
      reminderDate: today,
      deletedAt: null,
    },
    relations: ['project'],
  });

  return reminders;
}

  /* =========================================================
     CREATE SCHEDULE
  ========================================================= */

 async createSchedule(
  projectId: number,
  workName: string,
  startDate: string,
  endDate: string,
  reminderDaysBefore: number,
) {

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start >= end) {
    throw new BadRequestException(
      'Start date must be before end date',
    );
  }

  const project = await this.projectRepo.findOne({
    where: { id: projectId },
  });

  if (!project) {
    throw new NotFoundException('Project not found');
  }

  let reminderDate: string | null = null;

  if (reminderDaysBefore) {
    const reminder = new Date(end);
    reminder.setDate(reminder.getDate() - reminderDaysBefore);
    reminderDate = reminder.toISOString().split('T')[0];
  }

  const schedule = this.scheduleRepo.create({
    project,
    workName,
    startDate,
    endDate,
    reminderDate,
    status: 'PLANNED',
  });

  return await this.scheduleRepo.save(schedule);
}

  /* =========================================================
     GET SCHEDULES BY PROJECT
  ========================================================= */

  async getSchedulesByProject(projectId: number) {

  const schedules = await this.scheduleRepo.find({
    where: {
      project: { id: projectId },
      deletedAt: null,
    },
    relations: [
      'project',
      'assignments',
      'assignments.contractor',
      'assignments.tasks'
    ],
    order: { startDate: 'ASC' },
  });

  return schedules;
}

  /* =========================================================
     GET ALL SCHEDULES WITH PAGINATION
  ========================================================= */

  async findAll(query: PaginationDto) {

    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'id',
      order = 'DESC',
    } = query;

    const qb = this.scheduleRepo
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.project', 'project')
      .leftJoinAndSelect('schedule.project', 'project')
      .where('schedule.deletedAt IS NULL');

    if (search) {
      qb.andWhere(
        '(project.projectName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const allowedSortFields = [
      'id',
      'startDate',
      'endDate',
      'createdAt',
    ];

    if (!allowedSortFields.includes(sortBy)) {
      throw new BadRequestException('Invalid sort field');
    }

    qb.orderBy(`schedule.${sortBy}`, order as 'ASC' | 'DESC');

    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  /* =========================================================
     DELETE SCHEDULE
  ========================================================= */

  async deleteSchedule(id: number) {

    const schedule = await this.scheduleRepo.findOne({
      where: { id },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    await this.scheduleRepo.softRemove(schedule);

    return {
      message: 'Schedule deleted successfully',
    };
  }

 async createTask(
  scheduleId: number,
  contractorId: number,
  title: string,
  startDate: string,
  endDate: string,
) {

  // 🔥 FIND CORRECT ASSIGNMENT HERE (NOT FRONTEND)
  let assignment = await this.assignmentRepo.findOne({
    where: {
      schedule: { id: scheduleId },
      contractor: { id: contractorId }
    },
    relations: ['schedule']
  });

  // ✅ CREATE IF NOT EXISTS
  if (!assignment) {

    const schedule = await this.scheduleRepo.findOne({
      where: { id: scheduleId }
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    assignment = this.assignmentRepo.create({
      schedule,
      contractor: { id: contractorId },
      startDate,
      endDate
    });

    assignment = await this.assignmentRepo.save(assignment);
  }

  // ✅ VALIDATE DATES
  const taskStart = new Date(startDate);
  const taskEnd = new Date(endDate);

  const scheduleStart = new Date(assignment.schedule.startDate);
  const scheduleEnd = new Date(assignment.schedule.endDate);
  const start = new Date(startDate).toISOString().split('T')[0];
const end = new Date(endDate).toISOString().split('T')[0];

const conflict = await this.taskRepo
  .createQueryBuilder('task')
  .where('task.contractorId = :contractorId', { contractorId }) // ✅ FIX
  .andWhere(
    `task."startDate" <= :end AND task."endDate" >= :start`,
    {
      start,
      end,
    },
  )
  .getOne();

console.log('Conflict:', conflict);

if (conflict) {
  throw new BadRequestException(
    'Contractor already assigned for these dates',
  );
}

  if (taskStart < scheduleStart || taskEnd > scheduleEnd) {
    throw new BadRequestException(
      'Task must be within work schedule dates'
    );
  }

  const task = this.taskRepo.create({
    title,
    startDate,
    endDate,
    assignment,
    contractor: { id: contractorId },
    status: 'PLANNED',
  });

  return this.taskRepo.save(task);
}

  /* =========================================================
     GET TASKS BY SCHEDULE
  ========================================================= */

  async getTasksBySchedule(scheduleId: number) {

  return this.taskRepo
    .createQueryBuilder('task')
    .leftJoinAndSelect('task.assignment', 'assignment')
    .leftJoinAndSelect('assignment.schedule', 'schedule')
    .leftJoinAndSelect('task.contractor', 'contractor')
    .where('schedule.id = :scheduleId', { scheduleId })
    .orderBy('task.startDate', 'ASC')
    .getMany();

}

  /* =========================================================
     UPDATE TASK STATUS
  ========================================================= */

  async updateTaskStatus(taskId: number, status: string) {

    const task = await this.taskRepo.findOne({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    task.status = status as any;

    return this.taskRepo.save(task);
  }

  /* =========================================================
     DELETE TASK
  ========================================================= */

  async deleteTask(taskId: number) {

    const task = await this.taskRepo.findOne({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.taskRepo.remove(task);

    return {
      message: 'Task deleted successfully',
    };

  }
  async updateScheduleStatus(id: number, status: string) {

  const schedule = await this.scheduleRepo.findOne({
    where: { id },
  });

  if (!schedule) {
    throw new NotFoundException('Schedule not found');
  }

  schedule.status = status as any;

  return this.scheduleRepo.save(schedule);
}
async updateTask(
  taskId: number,
  title: string,
  startDate: string,
  endDate: string,
) {

  const task = await this.taskRepo.findOne({
    where: { id: taskId },
    relations: ['assignment', 'assignment.schedule']

  });

  if (!task) {
    throw new NotFoundException('Task not found');
  }

 const schedule = task.assignment.schedule;
  const taskStart = new Date(startDate);
  const taskEnd = new Date(endDate);

  const scheduleStart = new Date(schedule.startDate);
  const scheduleEnd = new Date(schedule.endDate);

  if (taskStart < scheduleStart || taskEnd > scheduleEnd) {
    throw new BadRequestException(
      'Task must be within schedule date range'
    );
  }

  task.title = title;
  task.startDate = startDate;
  task.endDate = endDate;

  return this.taskRepo.save(task);
}
async updateSchedule(
  scheduleId: number,
  startDate: string,
  endDate: string,
) {

  const schedule = await this.scheduleRepo.findOne({
    where: { id: scheduleId },
  });

  if (!schedule) {
    throw new NotFoundException('Schedule not found');
  }

  if (new Date(startDate) >= new Date(endDate)) {
    throw new BadRequestException(
      'Start date must be before end date'
    );
  }

  schedule.startDate = startDate;
  schedule.endDate = endDate;

  return this.scheduleRepo.save(schedule);
}
async getTasksByContractor(contractorId: number) {

  const tasks = await this.taskRepo.find({
    where: {
      contractor: { id: contractorId } // ✅ FIXED (RELATION BASED)
    },
    relations: ['assignment', 'assignment.schedule', 'assignment.schedule.project'],
    order: { startDate: 'ASC' }
  });

  console.log("Tasks found:", tasks);

  return tasks.map(task => ({
    taskId: task.id,
    title: task.title,
    startDate: task.startDate,
    endDate: task.endDate,
    status: task.status,
    projectName: task.assignment.schedule.project.projectName,
scheduleId: task.assignment.schedule.id
  }));
}
async getTasksByUser(userId: number) {

  const contractor = await this.contractorRepo.findOne({
    where: {
      user: { id: userId }
    },
    relations: ['user']
  });

  if (!contractor) {
    return [];
  }

  const tasks = await this.taskRepo.find({
    where: {
      contractor: { id: contractor.id }
    },
    relations: ['assignment', 'assignment.schedule', 'assignment.schedule.project'],
    order: { startDate: 'ASC' }
  });

  return tasks.map(task => ({
    taskId: task.id,
    title: task.title,
    startDate: task.startDate,
    endDate: task.endDate,
    status: task.status,
   projectName: task.assignment.schedule.project.projectName,
scheduleId: task.assignment.schedule.id
  }));
}
async getContractorTaskSummary(userId: number) {

  const contractor = await this.contractorRepo.findOne({
    where: {
      user: {
        id: userId
      }
    },
    relations: ['user']
  });

  if (!contractor) {
    return {
      pending: 0,
      inProgress: 0,
      completed: 0,
      overdue: 0
    };
  }

  const tasks = await this.taskRepo.find({
    where: {
      contractor: { id: contractor.id } // ✅ FIXED
    },
    relations: ['assignment'],
  });

  const today = new Date();

  const pending = tasks.filter(t => t.status === 'PLANNED').length;

  const inProgress = tasks.filter(
    t => t.status === 'IN_PROGRESS'
  ).length;

  const completed = tasks.filter(
    t => t.status === 'COMPLETED'
  ).length;

  const overdue = tasks.filter(
    t =>
      t.status !== 'COMPLETED' &&
      new Date(t.endDate) < today
  ).length;

  return {
    pending,
    inProgress,
    completed,
    overdue
  };
}
async assignContract(
  scheduleId: number,
  contractorId: number,
  startDate: string,
  endDate: string,
) {

  const schedule = await this.scheduleRepo.findOne({
    where: { id: scheduleId },
  });

  if (!schedule) {
    throw new Error('Schedule not found');
  }

  const contractor = await this.contractorRepo.findOne({
    where: { id: contractorId },
  });

  if (!contractor) {
    throw new Error('Contractor not found');
  }

  const existing = await this.assignmentRepo.findOne({
    where: {
      schedule: { id: scheduleId },
      contractor: { id: contractorId }
    }
  });

  if (existing) {
    return existing; // ✅ return existing instead of error
  }

  const assignment = this.assignmentRepo.create({
    schedule,
    contractor,
    startDate,
    endDate
  });

  const saved = await this.assignmentRepo.save(assignment);

  // 🔥 VERY IMPORTANT: return FULL RELATION
  return this.assignmentRepo.findOne({
    where: { id: saved.id },
    relations: ['schedule', 'contractor']
  });
}
// ✅ DELAYED SCHEDULE TASKS
async getDelayedSchedules() {
  return this.taskRepo
    .createQueryBuilder('task')

    // ✅ contractor
    .leftJoinAndSelect('task.contractor', 'contractor')

    // 🔥 ADD THIS
    .leftJoinAndSelect('task.assignment', 'assignment')

    // 🔥 ADD THIS
    .leftJoinAndSelect('assignment.schedule', 'schedule')

    // 🔥 MOST IMPORTANT
    .leftJoinAndSelect('schedule.project', 'project')

    .where('task.endDate < CURRENT_DATE')
    .andWhere("task.status != 'COMPLETED'")
    .orderBy('task.endDate', 'ASC')
    .getMany();
}

// ✅ CONTRACTOR DELAY RANKING
async getScheduleDelayRanking() {
  const tasks = await this.taskRepo
    .createQueryBuilder('task')
    .leftJoinAndSelect('task.contractor', 'contractor')
    .where('task.endDate < CURRENT_DATE')
    .andWhere("task.status != 'COMPLETED'")
    .getMany();

  const rankingMap: Record<string, number> = {};

  tasks.forEach(task => {
    const name = task.contractor?.name || 'Unknown';

    if (!rankingMap[name]) {
      rankingMap[name] = 0;
    }

    rankingMap[name]++;
  });

  return Object.keys(rankingMap)
    .map(name => ({
      contractor: name,
      delayedTasks: rankingMap[name]
    }))
    .sort((a, b) => b.delayedTasks - a.delayedTasks);
}

}