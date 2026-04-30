import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

import { ProjectService } from '../../../services/project.service';

@Component({
selector: 'app-schedule-tasks',
standalone: true,
imports: [CommonModule, FormsModule],
templateUrl: './schedule-tasks.component.html',
styleUrls: ['./schedule-tasks.component.scss']
})
export class ScheduleTasksComponent implements OnInit {

projectId!: number;

scheduleId!: number;

schedules:any=[];
scheduleTasks:any=[];

selectedSchedule:any=null;
selectedContractorId: number | null = null;
contractors: any[] = [];
selectedScheduleId!: number;

newTask={
title:'',
startDate:'',
endDate:''
};

isEditingTask=false;
editingTaskId:number|null=null;

constructor(
private route:ActivatedRoute,
private projectService:ProjectService
){}

ngOnInit() {
  this.projectId = Number(this.route.snapshot.paramMap.get('projectId'));

  this.route.queryParams.subscribe(params => {
    this.scheduleId = Number(params['scheduleId']);
  });

  this.loadContractors(); // 👈 this will now call schedules internally
}
loadContractors() {
  this.projectService.getProjectContractors(this.projectId)
    .subscribe((res: any) => {

      console.log('Contractor API:', res);

      // ✅ CORRECT PATH
      const contractorArray = res?.data?.data;

      if (Array.isArray(contractorArray)) {
        this.contractors = contractorArray.map((c: any) => ({
  id: c.contractor?.id,
  name: c.contractor?.name
}));
      } else {
        this.contractors = [];
      }

      this.loadSchedules();
    });
}

loadSchedules() {

  this.projectService.getSchedulesByProject(this.projectId)
    .subscribe((res:any)=>{

      this.schedules = res?.data || res || [];

      // 👇 auto select schedule from timeline
      if (this.scheduleId) {
        const found = this.schedules.find((s:any) => s.id === this.scheduleId);

        if (found) {
          this.openSchedule(found);
        }
      }

    });

}

openSchedule(schedule: any) {

  // ✅ ALWAYS RESET STATE (VERY IMPORTANT)
  this.selectedSchedule = schedule;
  this.selectedScheduleId = schedule.id;

  this.selectedContractorId = null;   // 🔥 FIX
  this.newTask = {
    title: '',
    startDate: '',
    endDate: ''
  };

  this.isEditingTask = false;
  this.editingTaskId = null;

  this.projectService.getScheduleTasks(schedule.id)
    .subscribe((res: any) => {

      let tasks = res?.data || res || [];

// ✅ SORT BY START DATE (ASCENDING)
tasks = tasks.sort((a: any, b: any) => {
  return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
});

this.scheduleTasks = tasks.map((task: any) => ({
  ...task,
  contractorName: Array.isArray(this.contractors)
  ? this.contractors.find(c => c.id === task.contractorId)?.name || '—'
  : '—'
}));

    });

}

addTask(){

  if (!this.selectedScheduleId) {
    Swal.fire('Error', 'No schedule selected', 'error');
    return;
  }

  if (!this.selectedContractorId) {
    Swal.fire('Error', 'Select contractor', 'error');
    return;
  }

  // 🔥 ALWAYS REFRESH CURRENT SCHEDULE FIRST
  this.projectService.getSchedulesByProject(this.projectId)
    .subscribe((res: any) => {

      this.schedules = res?.data || res || [];

      const freshSchedule = this.schedules.find(
        (s: any) => s.id === this.selectedScheduleId
      );

      if (!freshSchedule) {
        Swal.fire('Error', 'Schedule not found', 'error');
        return;
      }

      this.selectedSchedule = freshSchedule;

     const assignment = this.selectedSchedule.assignments?.find(
  (a: any) => a.contractor?.id === this.selectedContractorId
);

      if (!assignment) {

        const today = new Date().toISOString().split('T')[0];

        this.projectService.assignContractorToSchedule(
          this.selectedScheduleId,
          {
            contractorId: this.selectedContractorId,
            startDate: today,
            endDate: this.newTask.endDate || today
          }
        ).subscribe((res: any) => {

          // 🔥 PUSH NEW ASSIGNMENT
          if (!this.selectedSchedule.assignments) {
            this.selectedSchedule.assignments = [];
          }

          this.selectedSchedule.assignments.push(res);

          this.createTaskWithAssignment(res.id);

        });

      } else {
        this.createTaskWithAssignment(assignment.id);
      }

    });

}

updateTaskStatus(task:any,status:string){

this.projectService.updateTaskStatus(task.id,status)
  .subscribe(()=>{

    this.openSchedule(this.selectedSchedule);

  });
  


}

deleteTask(taskId:number){


Swal.fire({
  title:'Delete Task?',
  icon:'warning',
  showCancelButton:true
}).then((result)=>{

  if(result.isConfirmed){

    this.projectService.deleteScheduleTask(taskId)
      .subscribe(()=>{

        this.openSchedule(this.selectedSchedule);

      });

  }

});


}

editTask(task:any){


this.newTask={
  title:task.title,
  startDate:task.startDate,
  endDate:task.endDate
};

this.isEditingTask=true;
this.editingTaskId=task.id;


}
createTaskWithAssignment(assignmentId: number) {

 const payload = {
  scheduleId: this.selectedScheduleId,
  contractorId: Number(this.selectedContractorId), // ✅ FIXED
  title: this.newTask.title,
  startDate: this.newTask.startDate,
  endDate: this.newTask.endDate
};

  if (this.isEditingTask && this.editingTaskId) {

    this.projectService.updateScheduleTask(this.editingTaskId, payload)
  .subscribe({
    next: () => {
      this.openSchedule(this.selectedSchedule);
      this.isEditingTask = false;
      this.editingTaskId = null;
    },
    error: (err) => {
      Swal.fire(
        'Error',
        err.error?.message || 'Something went wrong',
        'error'
      );
    }
  });

  } else {

    this.projectService.createScheduleTask(payload)
  .subscribe({
    next: () => {
      this.openSchedule(this.selectedSchedule);
    },
    error: (err) => {
      Swal.fire(
        'Error',
        err.error?.message || 'Something went wrong',
        'error'
      );
    }
  });

  }

  this.newTask = {
    title: '',
    startDate: '',
    endDate: ''
  };
}
getScheduleProgress(): number {

  if (!this.scheduleTasks || this.scheduleTasks.length === 0) {
    return 0;
  }

  const completed = this.scheduleTasks.filter(
  (t: any) => t.status === 'COMPLETED'
).length;

  return Math.round((completed / this.scheduleTasks.length) * 100);
}
isOverdue(task: any): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const end = new Date(task.endDate);
  end.setHours(0, 0, 0, 0);

  return end < today && task.status !== 'COMPLETED';
}

}

