import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  private api = environment.apiUrl + '/document';

  constructor(private http: HttpClient) {}

  // ================= UPLOAD =================
  uploadDocument(
    projectId: number,
    file: File,
    category: string,
    uploadedByName: string,
    uploadedByRole: string
  ) {
    const formData = new FormData();

    formData.append('file', file);
    formData.append('category', category);
    formData.append('uploadedByName', uploadedByName);
    formData.append('uploadedByRole', uploadedByRole);

    return this.http.post(`${this.api}/${projectId}`, formData);
  }

  // ================= GET PROJECT DOCS =================
  getProjectDocuments(projectId: number) {
    return this.http.get(`${this.api}/project/${projectId}`);
  }

  // ================= GET CONTRACTOR DOCS =================
  getContractorDocuments(projectId: number) {
    return this.http.get(`${this.api}/project/${projectId}/contractor`);
  }

  // ================= DOWNLOAD =================
  downloadDocument(id: number) {
    return `${this.api}/download/${id}`;
  }

  // ================= DELETE =================
  deleteDocument(id: number) {
    return this.http.delete(`${this.api}/${id}`);
  }

  // ================= SHARE (UPDATED ✅) =================
  shareDocument(documentId: number, contractorIds: number[]) {
    return this.http.patch(
      `${this.api}/share/${documentId}`,
      { contractorIds }
    );
  }

}