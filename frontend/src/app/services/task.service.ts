import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  // ✅ SINGLE SOURCE OF TRUTH
  private api = environment.apiUrl + '/tasks';

  constructor(private http: HttpClient) {}

  /* ===============================
     TASKS (DAILY COMMUNICATION)
  =================================*/

  // ✅ Get today's tasks for employee
  getMyTasks(userId: number) {
    return this.http.get(
      `${this.api}/my-today?userId=${userId}`
    );
  }

  // ✅ Mark task as complete
  markComplete(taskId: number) {
    return this.http.patch(
      `${this.api}/${taskId}/complete`,
      {}
    );
  }

  // ✅ Create task (Admin)
  createTask(data: any) {
    return this.http.post(
      `${this.api}`,
      data
    );
  }

  // ✅ Admin summary
  getSummary() {
    return this.http.get(
      `${this.api}/today-summary`
    );
  }

  // ✅ GET ALL TASKS (ADMIN)
  getAllTasks() {
    return this.http.get(`${this.api}`);
  }

  // ✅ DELETE TASK
  deleteTask(id: number) {
    return this.http.delete(`${this.api}/${id}`);
  }
  
getDelayedSchedules() {
  return this.http.get(`${environment.apiUrl}/schedules/delayed`);
}
getDelayRanking() {
  return this.http.get(`${environment.apiUrl}/schedules/delay-ranking`);
}

// ✅ TASK TREND (Analytics)
getTaskTrend() {
  return this.http.get(
    `${environment.apiUrl}/dashboard/task-trend`
  );
}
}