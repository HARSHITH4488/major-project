import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../services/auth.service';
import { TaskService } from '../../../services/task.service';
import { filter } from 'rxjs/operators';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  users: any[] = [];
  pendingUsers: any[] = [];

  view: 'dashboard' | 'requests' | 'users' | null = null;

  userRole: string = '';
  userName: string = '';
  greeting: string = '';
  isEmployee: boolean = false;

  // ✅ EMPLOYEE TASKS
  tasks: any[] = [];
  userId: number = 0;

  constructor(
    private authService: AuthService,
    private router: Router,
    private taskService: TaskService
  ) {}

  ngOnInit() {
  this.userRole = sessionStorage.getItem('userRole') || '';

  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  this.userName = user?.name || 'User';
  this.userId = user?.id || 0;

  this.isEmployee = this.userRole === 'EMPLOYEE';

  const hour = new Date().getHours();
  if (hour < 12) this.greeting = 'Good Morning';
  else if (hour < 18) this.greeting = 'Good Afternoon';
  else this.greeting = 'Good Evening';

  // ✅ ADMIN DEFAULT VIEW
 if (this.userRole === 'ADMIN') {
  this.view = 'dashboard';   // ✅ default admin landing
}

  // ✅ EMPLOYEE TASKS
  if (this.isEmployee && this.userId) {
    this.loadTasks();
  }
  this.router.events
  .pipe(filter(event => event instanceof NavigationEnd))
  .subscribe(() => {
    const url = this.router.url;

    this.hideHeader =
      url.includes('/dashboard/users') ||
      url.includes('/dashboard/requests');
  });
}
  // =====================
  // EMPLOYEE TASKS
  // =====================

  loadTasks() {
    this.taskService.getMyTasks(this.userId).subscribe((res: any) => {
      this.tasks = res?.data || [];
    });
  }

  markComplete(taskId: number) {
    this.taskService.markComplete(taskId).subscribe(() => {
      this.loadTasks();
    });
  }

  // =====================
  // ADMIN USER LOADING
  // =====================

  loadUsers() {
    this.authService.getUsers()
      .subscribe((res: any) => {
        this.users = res?.data || res || [];
      });
  }

  showUsers() {
    if (this.userRole !== 'ADMIN') return;

    this.view = 'users';

    this.authService.getUsers()
      .subscribe((res: any) => {
        this.users = res?.data || res || [];
      });
  }

  showRequests() {
    if (this.userRole !== 'ADMIN') return;

    this.view = 'requests';

    this.authService.getPendingUsers()
      .subscribe((res: any) => {
        this.pendingUsers = res?.data || res || [];
      });
  }

  approve(id: number) {
    if (this.userRole !== 'ADMIN') return;

    this.authService.approveUser(id)
      .subscribe(() => this.showRequests());
  }

  reject(id: number) {
    if (this.userRole !== 'ADMIN') return;

    this.authService.deleteUser(id)
      .subscribe(() => this.showRequests());
  }

  suspend(id: number) {
    if (this.userRole !== 'ADMIN') return;

    this.authService.suspendUser(id)
      .subscribe(() => this.showUsers());
  }
  
  

  delete(id: number) {
    if (this.userRole !== 'ADMIN') return;

    this.authService.deleteUser(id)
      .subscribe(() => this.showUsers());
  }
  toggleUser(user: any) {
  if (user.status === 'ACTIVE') {
    this.suspend(user.id);
  } else {
    this.activate(user.id);
  }
}
activate(id: number) {
  if (this.userRole !== 'ADMIN') return;

  this.authService.activateUser(id)
    .subscribe(() => this.showUsers());
}
showDashboard() {
  this.view = 'dashboard';
}
hideHeader = false;
  

  // =====================
  // LOGOUT
  // =====================

  logout() {
    this.authService.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

}