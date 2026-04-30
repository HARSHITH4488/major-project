import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { ProjectService } from '../../../services/project.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-schedule-timeline',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schedule-timeline.component.html',
  styleUrls: ['./schedule-timeline.component.scss']
})

export class ScheduleTimelineComponent implements OnInit {
  projectEndDate!: Date;
totalDays!: number;

  projectId!: number;

  schedules: any[] = [];

  selectedSchedule: any = null;
  showTaskPanel = false;

  contractors: any[] = [];

  selectedContractorId: number | null = null;
  assignStartDate = '';
  assignEndDate = '';

  newTask = {
    title: '',
    startDate: '',
    endDate: ''
  };

  editingSchedule: any = null;

  scheduleForm = {
    startDate: '',
    endDate: ''
  };

  toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true
  });

  projectStartDate!: Date;
  timelineDays: Date[] = [];

  constructor(
  private route: ActivatedRoute,
  private projectService: ProjectService,
  private router: Router
) {}

  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('projectId'));
    this.loadSchedules();
    this.loadContractors();
    this.generateTimelineDays();
  }

  /* ===============================
     LOAD DATA
  =================================*/

  loadSchedules() {
    this.projectService.getSchedulesByProject(this.projectId)
      .subscribe((res: any) => {
        this.schedules = res?.data || res || [];

        if (this.schedules.length > 0) {

  const startDates = this.schedules.map(s => new Date(s.startDate).getTime());
  const endDates = this.schedules.map(s => new Date(s.endDate).getTime());

  const minDate = Math.min(...startDates);
  const maxDate = Math.max(...endDates);

  this.projectStartDate = new Date(minDate);
  this.projectEndDate = new Date(maxDate);

  this.totalDays =
    (maxDate - minDate) / (1000 * 60 * 60 * 24) + 1;
}
      });
  }

  loadContractors() {
    this.projectService.getProjectContractors(this.projectId)
      .subscribe((res: any) => {
        this.contractors = res?.data || res || [];
      });
  }

  /* ===============================
     TIMELINE CALC
  =================================*/

  getScheduleDuration(schedule: any): number {
  const start = new Date(schedule.startDate).getTime();
  const end = new Date(schedule.endDate).getTime();

  const days =
    (end - start) / (1000 * 60 * 60 * 24) + 1;

  return (days / this.totalDays) * 100; // ✅ %
}

  getScheduleOffset(schedule: any): number {
  const start = new Date(schedule.startDate).getTime();
  const projectStart = new Date(this.projectStartDate).getTime();

  const days =
    (start - projectStart) / (1000 * 60 * 60 * 24);

  return (days / this.totalDays) * 100; // ✅ %
}

  /* ===============================
     OPEN WORK
  =================================*/

  openSchedule(schedule: any) {
    this.selectedSchedule = schedule;
    this.showTaskPanel = true;
  }

  /* ===============================
     ASSIGN CONTRACTOR
  =================================*/

  assignContractor(scheduleId: number) {

    if (!this.selectedContractorId || !this.assignStartDate || !this.assignEndDate) {
      this.toast.fire({
        icon: 'warning',
        title: 'Fill all fields'
      });
      return;
    }

    this.projectService.assignContractorToSchedule(
  this.selectedSchedule.id,
  {
    contractorId: this.selectedContractorId,
    startDate: this.assignStartDate,
    endDate: this.assignEndDate
  }
).subscribe(() => {

  this.loadSchedules();

});
  }

  /* ===============================
     ADD TASK
  =================================*/

  addTask(assignmentId: number, contractorId: number) {

    if (!this.newTask.title || !this.newTask.startDate || !this.newTask.endDate) {
      this.toast.fire({
        icon: 'warning',
        title: 'Please fill all fields'
      });
      return;
    }

    const payload = {
      assignmentId: assignmentId,
      contractorId: contractorId,
      title: this.newTask.title,
      startDate: this.newTask.startDate,
      endDate: this.newTask.endDate
    };

    this.projectService.createScheduleTask(payload)
      .subscribe(() => {

        this.toast.fire({
          icon: 'success',
          title: 'Task added'
        });

        this.loadSchedules();

        this.newTask = {
          title: '',
          startDate: '',
          endDate: ''
        };

      });
  }

  /* ===============================
     EDIT SCHEDULE
  =================================*/

  editSchedule(schedule: any) {
    this.editingSchedule = schedule;

    this.scheduleForm = {
      startDate: schedule.startDate,
      endDate: schedule.endDate
    };
  }

  updateSchedule() {

    this.projectService.updateSchedule(this.editingSchedule.id, this.scheduleForm)
      .subscribe(() => {

        this.toast.fire({
          icon: 'success',
          title: 'Schedule updated'
        });

        this.editingSchedule = null;
        this.loadSchedules();

      });
  }

  /* ===============================
     DELETE SCHEDULE
  =================================*/

  deleteSchedule(id: number) {

    Swal.fire({
      title: 'Delete schedule?',
      text: 'This action cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Delete'
    }).then((result) => {

      if (result.isConfirmed) {

        this.projectService.deleteSchedule(id)
          .subscribe(() => {

            this.toast.fire({
              icon: 'success',
              title: 'Schedule deleted'
            });

            this.loadSchedules();

          });

      }

    });
  }

  /* ===============================
     TIMELINE
  =================================*/

  generateTimelineDays() {

    const today = new Date();
    const daysToShow = 20;

    this.timelineDays = [];

    for (let i = 0; i < daysToShow; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      this.timelineDays.push(d);
    }

  }
  goToTasks(scheduleId: number) {
  this.router.navigate(['/schedule/tasks', this.projectId], {
    queryParams: { scheduleId }
  });
}

}