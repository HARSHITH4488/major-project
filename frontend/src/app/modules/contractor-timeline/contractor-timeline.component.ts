import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContractorService } from '../contractor/contractor.service';

@Component({
  selector: 'app-contractor-timeline',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="page">

    <h2>My Timeline</h2>

    <div *ngIf="tasks.length === 0" class="empty">
      No scheduled work
    </div>

    <div class="timeline">

      <div *ngFor="let task of tasks" class="timeline-item">

        <div class="timeline-dot"></div>

        <div class="timeline-content">

          <div class="timeline-header">
            <h3>{{task.title}}</h3>

            <span
              class="status"
              [ngClass]="{
                planned: task.status === 'PLANNED',
                progress: task.status === 'IN_PROGRESS',
                completed: task.status === 'COMPLETED'
              }"
            >
              {{task.status}}
            </span>
          </div>

          <p class="project">
            Project: <strong>{{task.projectName}}</strong>
          </p>

          <div class="dates">
            📅 {{ formatDate(task.startDate) }} → {{ formatDate(task.endDate) }}
          </div>

        </div>

      </div>

    </div>

  </div>
  `,
  styles: [`

  .page{
    padding:20px;
  }

  .timeline{
    position:relative;
    margin-top:30px;
    padding-left:40px;
  }

  .timeline::before{
    content:'';
    position:absolute;
    left:10px;
    top:0;
    bottom:0;
    width:3px;
    background:#1976d2;
  }

  .timeline-item{
    position:relative;
    margin-bottom:25px;
  }

  .timeline-dot{
    position:absolute;
    left:-2px;
    top:10px;
    width:16px;
    height:16px;
    background:#1976d2;
    border-radius:50%;
  }

  .timeline-content{
    background:white;
    padding:15px 20px;
    border-radius:8px;
    box-shadow:0 2px 8px rgba(0,0,0,0.08);
  }

  .timeline-header{
    display:flex;
    justify-content:space-between;
    align-items:center;
  }

  .timeline-header h3{
    margin:0;
  }

  .project{
    margin:6px 0;
    color:#555;
  }

  .dates{
    font-size:14px;
    color:#666;
  }

  .status{
    padding:4px 10px;
    border-radius:6px;
    font-size:12px;
    color:white;
  }

  .planned{
    background:#1976d2;
  }

  .progress{
    background:#ff9800;
  }

  .completed{
    background:#4caf50;
  }

  .empty{
    margin-top:20px;
    color:#777;
  }

  `]
})
export class ContractorTimelineComponent implements OnInit {

  tasks:any[] = [];

  constructor(private contractorService: ContractorService) {}

  ngOnInit() {
    this.loadTimeline();
  }

  loadTimeline(){

    const userId = Number(sessionStorage.getItem('userId'));

    this.contractorService
      .getMyTasks(userId)
      .subscribe((res:any)=>{

        this.tasks = res.data || [];

      });

  }

  /* ---------- DATE FORMATTER ---------- */

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

    return `${day}${suffix} ${formatted}`;
  }

  getOrdinal(day: number): string {

    if (day > 3 && day < 21) return 'th';

    switch (day % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }

  }

}