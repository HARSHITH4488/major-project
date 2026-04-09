import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContractorService {

  private baseUrl = 'http://localhost:3000/contractors';

  // ✅ CORRECT — use contractor-payments module
  private paymentUrl = 'http://localhost:3000/contractor-payments';
  private scheduleUrl = 'http://localhost:3000/schedules';

  constructor(private http: HttpClient) {}

  // ===============================
  // BASIC CRUD
  // ===============================

  getAll(page: number = 1, limit: number = 10, search: string = '') {
    return this.http.get<any>(
      `${this.baseUrl}?page=${page}&limit=${limit}&search=${search}`
    );
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  create(data: any): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }

  update(id: number, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  // ===============================
  // FINANCIAL SUMMARY
  // ===============================

  getContractorSummary(userId:number){
  return this.http.get(
    `http://localhost:3000/schedules/contractor-summary/${userId}`
  );
}

  getProjectFinancials(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}/projects-financials`);
  }

  // ====================================================
  // 🔥 CONTRACTOR PAYMENT HISTORY
  // ====================================================

  getPaymentsByContractor(contractorId: number): Observable<any> {
    return this.http.get<any>(
      `${this.paymentUrl}/contractor/${contractorId}`
    );
  }

  // ====================================================
  // 🔥 CREATE CONTRACTOR PAYMENT
  // ====================================================

  createContractorPayment(data: any) {
  return this.http.post(
    'http://localhost:3000/contractor-payments',
    data
  );
}

  // ====================================================
  // DELETE CONTRACTOR PAYMENT
  // ====================================================

  deleteContractorPayment(paymentId: number): Observable<any> {
    return this.http.delete<any>(
      `${this.paymentUrl}/${paymentId}`
    );
  }
  // =======================================
// GET APPROVED REGISTERED CONTRACTORS
// =======================================

getApprovedContractors(): Observable<any> {
  return this.http.get('http://localhost:3000/users/approved-contractors');
}
/// =======================================
// CONTRACTOR TASKS
// =======================================

getMyTasks(userId:number){
  return this.http.get(
    `http://localhost:3000/schedules/tasks/user/${userId}`
  );
}

startTask(taskId: number): Observable<any> {
  return this.http.patch<any>(
    `${this.scheduleUrl}/task/${taskId}/start`,
    {}
  );
}

finishTask(taskId: number): Observable<any> {
  return this.http.patch<any>(
    `${this.scheduleUrl}/task/${taskId}/finish`,
    {}
  );
}
// =======================================
// 🔥 CONTRACTOR MAPPING (IMPORTANT)
// =======================================

getContractorByUser(userId: number): Observable<any> {
  return this.http.get(
    `http://localhost:3000/contractors/by-user/${userId}`
  );
}

getContractorProjects(contractorId: number): Observable<any> {
  return this.http.get(
    `http://localhost:3000/contractors/${contractorId}/projects`
  );
}
// =======================================
// 🔥 PROJECT UPDATES (UPLOAD)
// =======================================

uploadProjectUpdate(formData: FormData): Observable<any> {
  return this.http.post(
    'http://localhost:3000/project-updates',
    formData
  );
}
}