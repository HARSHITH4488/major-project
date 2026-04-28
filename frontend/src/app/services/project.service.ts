import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private api = environment.apiUrl + '/project';

  constructor(private http: HttpClient) {}

  /* ===============================
     PROJECT CRUD
  =================================*/

  getAll(page: number = 1, limit: number = 10) {
    return this.http.get(
      `${environment.apiUrl}/projects?page=${page}&limit=${limit}`
    );
  }

  getById(id: number) {
    return this.http.get(`${environment.apiUrl}/projects/${id}`);
  }

  create(data: any) {
    return this.http.post(`${environment.apiUrl}/projects`, data);
  }

  update(id: number, data: any) {
    return this.http.patch(`${environment.apiUrl}/projects/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete(`${environment.apiUrl}/projects/${id}`);
  }

  /* ===============================
     PROJECT PAYMENT
  =================================*/

  // ✅ FIXED: project-payments (plural)

  addPayment(projectId: number, data: any) {
    return this.http.post(
      `${environment.apiUrl}/project-payments/${projectId}`,
      data
    );
  }

  getPayments(projectId: number) {
    return this.http.get(
      `${environment.apiUrl}/project-payments/project/${projectId}`
    );
  }

  deletePayment(paymentId: number) {
    return this.http.delete(
      `${environment.apiUrl}/project-payments/${paymentId}`
    );
  }

  /* ===============================
     CONTRACTOR ASSIGNMENT
  =================================*/

  getProjectContractors(projectId: number) {
    return this.http.get(
      `${environment.apiUrl}/projects/${projectId}/contractors`
    );
  }

  // ===============================
// PROJECT CONTRACTOR ASSIGNMENT (OLD - KEEP)
// ===============================
assignContractor(projectId: number, data: any) {
  return this.http.post(
    `${environment.apiUrl}/projects/${projectId}/assign`,
    data
  );
}

// ===============================
// SCHEDULE CONTRACTOR ASSIGNMENT (NEW 🔥)
// ===============================
assignContractorToSchedule(scheduleId: number, data: any) {
  return this.http.post(
    `${environment.apiUrl}/schedules/${scheduleId}/assign-contractor`,
    data
  );
}

  removeContractor(projectId: number, contractorId: number) {
    return this.http.delete(
      `${environment.apiUrl}/projects/${projectId}/remove/${contractorId}`
    );
  }
  /* ===============================
   SCHEDULING
=================================*/

createSchedule(data: any) {
  return this.http.post(
    `${environment.apiUrl}/schedules`,
    data
  );
}

getSchedulesByProject(projectId: number) {
  return this.http.get(
    `${environment.apiUrl}/schedules/project/${projectId}`
  );
}
/* ===============================
   SCHEDULE EDIT / DELETE
=================================*/

updateSchedule(scheduleId: number, data: any) {
  return this.http.patch(
    `${environment.apiUrl}/schedules/${scheduleId}`,
    data
  );
}

deleteSchedule(scheduleId: number) {
  return this.http.delete(
    `${environment.apiUrl}/schedules/${scheduleId}`
  );
}
/* ===============================
   PROJECT UPDATES
=================================*/

getProjectUpdates(projectId: number) {
  return this.http.get(
    `${environment.apiUrl}/project-updates/project/${projectId}`
  );
}

createProjectUpdate(data: any) {
  return this.http.post(
    `${environment.apiUrl}/project-updates`,
    data
  );
}
updateScheduleStatus(scheduleId: number, status: string) {
  return this.http.patch(
    `${environment.apiUrl}/schedules/${scheduleId}/status`,
    { status }
  );
}
/* ===============================
   SCHEDULE TASKS
=================================*/

// create new task inside schedule
createScheduleTask(data: any) {
  return this.http.post(
    `${environment.apiUrl}/schedule-tasks`,
    data
  );
}

// get tasks for a schedule
getScheduleTasks(scheduleId: number) {
  return this.http.get(
    `${environment.apiUrl}/schedule-tasks/schedule/${scheduleId}`
  );
}

// update task status (START / COMPLETE)
updateTaskStatus(taskId: number, status: string) {
  return this.http.patch(
    `${environment.apiUrl}/schedule-tasks/${taskId}/status`,
    { status }
  );
}

// edit task
updateScheduleTask(taskId: number, data: any) {
  return this.http.patch(
    `${environment.apiUrl}/schedule-tasks/${taskId}`,
    data
  );
}

// delete task
deleteScheduleTask(taskId: number) {
  return this.http.delete(
    `${environment.apiUrl}/schedule-tasks/${taskId}`
  );
}
getTodayReminders() {
  return this.http.get(
    `${environment.apiUrl}/schedules/today-reminders`
  );
}
// ===============================
// DASHBOARD ANALYTICS
// ===============================
getProjectStatus() {
  return this.http.get(
    `${environment.apiUrl}/dashboard/status-distribution`
  );
}

}