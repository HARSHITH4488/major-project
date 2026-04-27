import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectUpdatesService {

  private baseUrl = 'http://localhost:3000/project-updates';

  constructor(private http: HttpClient) {}

  getUpdatesByProject(projectId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/project/${projectId}`
    );
  }
  // src/app/services/project-updates.service.ts

deleteUpdate(id: number) {
  return this.http.delete(`http://localhost:3000/project-updates/${id}`);
}
}