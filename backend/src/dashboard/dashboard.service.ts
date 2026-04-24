import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../project/project.entity';
import { Task } from '../task/task.entity'; // ✅ adjust path if needed

@Injectable()
export class DashboardService {
  constructor(
  @InjectRepository(Project)
  private readonly projectRepository: Repository<Project>,

  @InjectRepository(Task)   // ✅ ADD THIS
  private readonly taskRepository: Repository<Task>,
) {}

  async getSummary() {
    const totalProjects = await this.projectRepository.count({
      where: { deletedAt: null },
    });

    const planningProjects = await this.projectRepository.count({
      where: { status: 'PLANNING', deletedAt: null },
    });

    const completedProjects = await this.projectRepository.count({
      where: { status: 'COMPLETED', deletedAt: null },
    });

    const pendingProjects = await this.projectRepository.count({
      where: { paymentStatus: 'PENDING', deletedAt: null },
    });

    const totals = await this.projectRepository
      .createQueryBuilder('project')
      .select('SUM(project.totalAmount)', 'totalRevenue')
      .addSelect('SUM(project.totalPaidAmount)', 'totalPaid')
      .addSelect('SUM(project.balanceAmount)', 'totalPendingAmount')
      .where('project.deletedAt IS NULL')
      .getRawOne();
      

    return {
      totalProjects,
      planningProjects,
      completedProjects,
      pendingProjects,
      totalRevenue: totals.totalRevenue || 0,
      totalPaid: totals.totalPaid || 0,
      totalPendingAmount: totals.totalPendingAmount || 0,
    };
  }
  async getMonthlyRevenue() {
  const result = await this.projectRepository
    .createQueryBuilder('project')
    .select(`TO_CHAR(project.createdAt, 'YYYY-MM')`, 'month')
    .addSelect('SUM(project.totalAmount)', 'totalRevenue')
    .where('project.deletedAt IS NULL')
    .groupBy(`TO_CHAR(project.createdAt, 'YYYY-MM')`)
    .orderBy(`TO_CHAR(project.createdAt, 'YYYY-MM')`, 'ASC')
    .getRawMany();

  return result.map(item => ({
    month: item.month,
    totalRevenue: item.totalRevenue || 0,
  }));
}
async getMonthlyPaid() {
  const result = await this.projectRepository
    .createQueryBuilder('project')
    .select(
      `TO_CHAR(project.createdAt, 'YYYY-MM')`,
      'month',
    )
    .addSelect(
      'SUM(project.totalPaidAmount)',
      'totalPaid',
    )
    .where('project.deletedAt IS NULL')
    .groupBy(`TO_CHAR(project.createdAt, 'YYYY-MM')`)
    .orderBy('month', 'ASC')
    .getRawMany();

  return result;
}
async getProjectStatusDistribution() {
  const result = await this.projectRepository
    .createQueryBuilder('project')
    .select('project.status', 'status')
    .addSelect('COUNT(project.id)', 'count')
    .where('project.deletedAt IS NULL')
    .groupBy('project.status')
    .orderBy('project.status', 'ASC')
    .getRawMany();

  return result;
}
async getTopRevenueProjects() {
  const result = await this.projectRepository
    .createQueryBuilder('project')
    .select([
      'project.id',
      'project.projectName',
      'project.totalAmount',
    ])
    .where('project.deletedAt IS NULL')
    .orderBy('project.totalAmount', 'DESC')
    .limit(5)
    .getMany();

  return result;
}
async getTaskTrend() {
  const result = await this.taskRepository.query(`
    SELECT 
      TO_CHAR("createdAt", 'Dy') as day,
      COUNT(*) as count
    FROM tasks
    WHERE "createdAt" >= NOW() - INTERVAL '7 days'
    GROUP BY day
    ORDER BY MIN("createdAt")
  `);

  return result;
}


}

