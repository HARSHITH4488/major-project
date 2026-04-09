import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

import { ProjectService } from '../../../services/project.service';

@Component({
  selector: 'app-schedule-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schedule-create.component.html',
  styleUrls: ['./schedule-create.component.scss']
})
export class ScheduleCreateComponent implements OnInit {

  projectId!: number;

  scheduleData = {
    workName: '',
    startDate: '',
    endDate: '',
    reminderDaysBefore: 1,
    description: ''
  };

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('projectId'));
  }

  createSchedule() {

    if (!this.scheduleData.workName ||
        !this.scheduleData.startDate ||
        !this.scheduleData.endDate) {

      Swal.fire({
        icon: 'warning',
        title: 'Please fill all required fields'
      });

      return;
    }

    const payload = {
      projectId: this.projectId,
      workName: this.scheduleData.workName,
      startDate: this.scheduleData.startDate,
      endDate: this.scheduleData.endDate,
      reminderDaysBefore: this.scheduleData.reminderDaysBefore
    };

    this.projectService.createSchedule(payload)
      .subscribe({

        next: () => {

          Swal.fire({
            icon: 'success',
            title: 'Work scheduled successfully',
            timer: 1500,
            showConfirmButton: false
          });

          this.scheduleData = {
            workName: '',
            startDate: '',
            endDate: '',
            reminderDaysBefore: 1,
            description: ''
          };

        },

        error: (err) => {

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err?.error?.message || 'Failed to schedule work'
          });

        }

      });
  }
}

