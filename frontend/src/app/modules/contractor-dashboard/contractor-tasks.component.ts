import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContractorService } from '../contractor/contractor.service';

@Component({
  selector: 'app-contractor-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],

  template: `

<div class="page">

  <!-- HEADER -->
  <div class="header">
    <h2>My Tasks</h2>
    <p>Manage and track your assigned tasks efficiently.</p>
  </div>

  <!-- DATE BUTTON (FIXED) -->
  <button class="date-btn" (click)="showDateFilter = !showDateFilter">
    View Tasks by Date
  </button>

  <!-- DATE BOX -->
  <div *ngIf="showDateFilter" class="date-box">

    <label>Select Date:</label>

    <input
      type="date"
      [(ngModel)]="selectedDate"
      (change)="filterByDate()"
    />

    <div *ngIf="selectedDate">

      <h4>Tasks on {{selectedDate}}</h4>

      <ul *ngIf="dateTasks.length > 0">
        <li *ngFor="let t of dateTasks">
          {{t.title}} — {{t.projectName}}
        </li>
      </ul>

      <p *ngIf="dateTasks.length === 0" class="free-day">
        No tasks on this day
      </p>

    </div>

  </div>

  <!-- TODAY TASK -->
  <div *ngIf="todaysTasks.length > 0" class="today-box">

    <h3>Today's Tasks</h3>

    <ul>
      <li *ngFor="let t of todaysTasks">
        {{t.title}} — {{t.projectName}}
      </li>
    </ul>

  </div>

  <!-- SUMMARY -->
  <div class="summary">

    <div class="card blue">
      <h3>{{totalTasks}}</h3>
      <p>Total Tasks</p>
    </div>

    <div class="card amber">
      <h3>{{inProgress}}</h3>
      <p>In Progress</p>
    </div>

    <div class="card emerald">
      <h3>{{completed}}</h3>
      <p>Completed</p>
    </div>

    <div class="card rose">
      <h3>{{overdue}}</h3>
      <p>Overdue</p>
    </div>

  </div>

  <!-- PROJECT FILTER (FIXED) -->
  <div class="filter-bar">

    <label>Project:</label>

    <select [(ngModel)]="selectedProject" (change)="filterTasks()">

      <option value="">All Projects</option>

      <option *ngFor="let p of projects" [value]="p">
        {{p}}
      </option>

    </select>

  </div>

  <!-- TABLE -->
  <div class="table-container">

    <table>

      <thead>
        <tr>
          <th>Task</th>
          <th>Project</th>
          <th>Start</th>
          <th>End</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>

        <tr *ngFor="let task of tasks">

          <td>{{task.title}}</td>
          <td>{{task.projectName}}</td>
          <td>{{ formatDate(task.startDate) }}</td>
          <td>{{ formatDate(task.endDate) }}</td>

          <td>
            <span
              class="status"
              [ngClass]="{
                planned: task.status === 'PLANNED',
                progress: task.status === 'IN_PROGRESS',
                completed: task.status === 'COMPLETED',
                overdue: isOverdue(task)
              }"
            >
              {{ isOverdue(task) ? 'OVERDUE' : task.status }}
            </span>
          </td>

          <td>

            <button
              *ngIf="task.status === 'PLANNED'"
              (click)="startTask(task.taskId)">
              Start
            </button>

            <button
              *ngIf="task.status === 'IN_PROGRESS'"
              (click)="finishTask(task.taskId)">
              Finish
            </button>

          </td>

        </tr>

      </tbody>

    </table>

  </div>

</div>
`
,  // ✅ IMPORTANT COMMA ADDED HERE

  styles: [`

.page{
  padding:30px;
  background:#f8fafc;
  min-height:100vh;
  font-family: 'Segoe UI', sans-serif;
  color:#1f2937;
}

/* HEADER */
.header{
  background:white;
  border-radius:14px;
  padding:20px 25px;
  margin-bottom:20px;
  box-shadow:0 4px 12px rgba(0,0,0,0.05);
}

.header h2{
  margin:0;
  font-size:22px;
  font-weight:600;
}

.header p{
  margin-top:5px;
  font-size:14px;
  color:#6b7280;
}

/* DATE BUTTON */
.date-btn{
  margin-top:10px;
  padding:10px 16px;
  background:#eef2ff;
  color:#3b82f6;
  border:none;
  border-radius:8px;
  cursor:pointer;
  font-weight:500;
}

.date-btn:hover{
  background:#e0e7ff;
}

/* DATE BOX */
.date-box{
  margin-top:15px;
  padding:15px;
  background:white;
  border-radius:10px;
  border:1px solid #e5e7eb;
}

/* TODAY */
.today-box{
  background:white;
  border:1px solid #e5e7eb;
  padding:15px;
  border-radius:10px;
  margin-top:20px;
}

/* SUMMARY */
.summary{
  display:flex;
  gap:20px;
  margin:25px 0;
  flex-wrap:wrap;
}

.card{
  flex:1;
  min-width:200px;
  padding:20px;
  border-radius:12px;
  background:white;
  border:1px solid #e5e7eb;
  text-align:center;
  transition:0.2s;
}

.card:hover{
  border-color:#3b82f6;
}

/* ONLY ONE COLOR ACCENT */
.card h3{
  font-size:28px;
  font-weight:600;
  color:#3b82f6;
}

.card p{
  color:#6b7280;
}

/* FILTER */
.filter-bar{
  margin-bottom:15px;
}

select{
  padding:8px 12px;
  border-radius:8px;
  border:1px solid #e5e7eb;
  background:white;
}

/* TABLE */
.table-container{
  background:white;
  border-radius:12px;
  overflow:hidden;
  border:1px solid #e5e7eb;
}

th{
  background:#f9fafb;
  padding:12px;
  font-weight:600;
  color:#374151;
}

td{
  padding:12px;
  border-top:1px solid #f1f5f9;
}

/* STATUS (SUBTLE) */
.status{
  padding:5px 10px;
  border-radius:6px;
  font-size:12px;
  font-weight:500;
}

.planned{
  background:#eef2ff;
  color:#3b82f6;
}

.progress{
  background:#f1f5f9;
  color:#6b7280;
}

.completed{
  background:#ecfdf5;
  color:#059669;
}

.status.overdue{
  background:#fef2f2;
  color:#dc2626;
}

/* BUTTON */
button{
  padding:6px 14px;
  background:#3b82f6;
  color:white;
  border:none;
  border-radius:6px;
  cursor:pointer;
  font-weight:500;
}

button:hover{
  background:#2563eb;
}

`]
})
export class ContractorTasksComponent implements OnInit {

  tasks: any[] = [];
  allTasks: any[] = [];

  todaysTasks: any[] = [];
  dateTasks: any[] = [];

  projects: string[] = [];
  selectedProject: string = '';

  selectedDate: string = '';
  showDateFilter = false;

  totalTasks = 0;
  inProgress = 0;
  completed = 0;
  overdue = 0;

  constructor(private contractorService: ContractorService) {}

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks(){

  const userId = Number(sessionStorage.getItem('userId'));

  this.contractorService
    .getMyTasks(userId)
    .subscribe((res:any)=>{

      console.log("API Response:", res);

      this.allTasks = res.data || []; // ✅ FINAL FIX
      this.tasks = [...this.allTasks];

      this.projects = [
        ...new Set(this.allTasks.map(t => t.projectName))
      ];

      this.calculateStats();
      this.calculateTodayTasks();

    });

}

  filterTasks(){

    if(!this.selectedProject){
      this.tasks = [...this.allTasks];
      return;
    }

    this.tasks = this.allTasks.filter(
      t => t.projectName === this.selectedProject
    );

  }

  filterByDate(){

    if(!this.selectedDate){
      this.dateTasks = [];
      return;
    }

    const selected = new Date(this.selectedDate);

    this.dateTasks = this.allTasks.filter(task => {

      const start = new Date(task.startDate);
      const end = new Date(task.endDate);

      return selected >= start && selected <= end;

    });

  }

  calculateStats(){

    const today = new Date();

    this.totalTasks = this.allTasks.length;

    this.inProgress = this.allTasks.filter(
      t => t.status === 'IN_PROGRESS'
    ).length;

    this.completed = this.allTasks.filter(
      t => t.status === 'COMPLETED'
    ).length;

    this.overdue = this.allTasks.filter(t => {

      const end = new Date(t.endDate);

      return end < today && t.status !== 'COMPLETED';

    }).length;

  }

  calculateTodayTasks(){

    const today = new Date();

    this.todaysTasks = this.allTasks.filter(task => {

      const start = new Date(task.startDate);
      const end = new Date(task.endDate);

      return today >= start && today <= end && task.status !== 'COMPLETED';

    });

  }

  isOverdue(task:any){

    const today = new Date();
    const end = new Date(task.endDate);

    return end < today && task.status !== 'COMPLETED';

  }

  startTask(taskId:number){

    this.contractorService
      .startTask(taskId)
      .subscribe(()=>{
        this.loadTasks();
      });

  }

  finishTask(taskId:number){

    this.contractorService
      .finishTask(taskId)
      .subscribe(()=>{
        this.loadTasks();
      });

  }

  formatDate(dateStr: string): string {

    const date = new Date(dateStr);

    const day = date.getDate();
    const suffix = this.getOrdinal(day);

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      year: 'numeric'
    };

    const formatted = date.toLocaleDateString('en-US', options);

    return day + suffix + ' ' + formatted;
  }

  getOrdinal(day: number): string {

    if (day > 3 && day < 21) return 'th';

    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }

  }

}