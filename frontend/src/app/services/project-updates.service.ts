import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ProjectUpdatesService {

  private baseUrl = `${environment.apiUrl}/project-updates`;

  constructor(private http: HttpClient) {}

  getUpdatesByProject(projectId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/project/${projectId}`
    );
  }
  // src/app/services/project-updates.service.ts

deleteUpdate(id: number) {
  return this.http.delete(`${this.baseUrl}/${id}`);
}
}