import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TaskService } from '../../../services/task.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-daily-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './daily-tasks.component.html',
  styleUrls: ['./daily-tasks.component.scss'] // ✅ TEMP FIX (no css error)
})
export class DailyTasksComponent implements OnInit {

  filteredTasks: any[] = [];

  employees: any[] = [];
  tasks: any[] = [];

  selectedUserId: number | null = null;
  taskTitle: string = '';

  taskDate: string = '';

  constructor(
    private taskService: TaskService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadEmployees();
    this.loadAllTasks();
  }

  loadEmployees() {
  this.authService.getUsers().subscribe((res: any) => {
    const users = res?.data || res || [];

    // ✅ FILTER ONLY EMPLOYEES
    this.employees = users.filter(
      (u: any) => u.role === 'EMPLOYEE'
    );
  });
}

  loadAllTasks() {
  this.taskService.getAllTasks().subscribe((res: any) => {
    this.tasks = res?.data || res || [];
    this.filteredTasks = [...this.tasks]; // 👈 IMPORTANT
  });
}

  assignTask() {

  if (!this.selectedUserId || !this.taskTitle || !this.taskDate) return;

  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  this.taskService.createTask({
    title: this.taskTitle,
    assignedTo: this.selectedUserId,
    createdBy: user.id,
    startDate: this.taskDate,   // ✅ USER SELECTED DATE
    endDate: this.taskDate
  }).subscribe(() => {
    this.taskTitle = '';
    this.selectedUserId = null;
    this.taskDate = '';   // ✅ reset
    this.loadAllTasks();
  });
}

  deleteTask(id: number) {
    this.taskService.deleteTask(id).subscribe(() => {
      this.loadAllTasks();
    });
  }

  filterTasks() {
  if (!this.selectedUserId) {
    this.filteredTasks = [...this.tasks];
    return;
  }

  this.filteredTasks = this.tasks.filter(
    (task: any) => task.assignedTo == this.selectedUserId
  );
}

}
