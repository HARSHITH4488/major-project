import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../auth/role.enum';


@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
@Get('monthly-revenue')
getMonthlyRevenue() {
  return this.dashboardService.getMonthlyRevenue();
}
@Get('monthly-paid')
getMonthlyPaid() {
  return this.dashboardService.getMonthlyPaid();
}
@Get('status-distribution')
getProjectStatusDistribution() {
  return this.dashboardService.getProjectStatusDistribution();
}
@Get('top-projects')
getTopRevenueProjects() {
  return this.dashboardService.getTopRevenueProjects();
}
@Get('task-trend')
getTaskTrend() {
  return this.dashboardService.getTaskTrend();
}

}


