import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContractorService } from '../contractor/contractor.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-contractor-updates',
  standalone: true,
  imports: [CommonModule, FormsModule],

  template: `
<div class="page">

  <h2 class="page-title">📊 Updates & Documents</h2>

  <!-- TABS -->
  <div class="tabs">
    <button [class.active]="activeTab==='updates'" (click)="activeTab='updates'">
      Project Updates
    </button>

    <button [class.active]="activeTab==='documents'" (click)="activeTab='documents'">
      Shared Documents
    </button>
  </div>

  <!-- ================= UPDATES ================= -->
  <div *ngIf="activeTab==='updates'" class="card">

    <h3>📸 Upload Project Update</h3>

    <label>Select Project</label>
    <select [(ngModel)]="selectedProjectId">
      <option value="">Select Project</option>
      <option *ngFor="let p of projects" [value]="p.id">
        {{p.projectName}}
      </option>
    </select>

    <label>Upload Photo</label>
    <input type="file" (change)="onFilesSelected($event)" />

    <label>Notes</label>
    <textarea [(ngModel)]="note"></textarea>

    <button class="btn-primary" (click)="submitUpdate()">
      Submit Update
    </button>

  </div>

  <!-- ================= DOCUMENTS ================= -->
  <div *ngIf="activeTab==='documents'" class="card">

    <div class="doc-header">
      <h3>📂 Documents</h3>

      <div class="toggle">
        <button [class.active]="mode==='upload'" (click)="mode='upload'">Upload</button>
        <button [class.active]="mode==='view'" (click)="mode='view'">View</button>
      </div>
    </div>

    <!-- UPLOAD -->
    <div *ngIf="mode==='upload'">

      <label>Project</label>
      <select [(ngModel)]="docProjectId">
        <option value="">Select Project</option>
        <option *ngFor="let p of projects" [value]="p.id">
          {{p.projectName}}
        </option>
      </select>

      <label>File</label>
      <input type="file" (change)="onDocumentSelected($event)" />

      <label>Description</label>
      <textarea [(ngModel)]="description"></textarea>

      <button class="btn-primary full" (click)="uploadDocument()">
        Upload Document
      </button>

    </div>

    <!-- VIEW -->
    <div *ngIf="mode==='view'">

      <label>Select Project</label>
      <select [(ngModel)]="docProjectId" (change)="loadDocuments()">
        <option value="">Select Project</option>
        <option *ngFor="let p of projects" [value]="p.id">
          {{p.projectName}}
        </option>
      </select>

      <table *ngIf="documents.length > 0" class="doc-table">

        <thead>
          <tr>
            <th>File</th>
            <th>Category</th>
            <th>Uploaded By</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr *ngFor="let doc of documents">

            <td>📄 {{doc.fileName}}</td>
            <td>{{doc.category}}</td>
            <td>👷 {{doc.uploadedByName}}</td>
            <td>{{doc.uploadedAt | date:'mediumDate'}}</td>

            <td class="action-cell">

              <button class="btn-view" (click)="view(doc)">
                👁
              </button>

              <button class="btn-download" (click)="download(doc.id)">
                ⬇
              </button>

              <button class="btn-delete" (click)="delete(doc)">
                🗑
              </button>

            </td>

          </tr>
        </tbody>

      </table>

      <div *ngIf="documents.length === 0" class="empty">
        No documents found
      </div>

    </div>

  </div>

</div>
`,

  styles: [`
.page { padding:20px; }

.page-title { margin-bottom:20px; font-weight:600; }

.tabs { display:flex; gap:10px; margin-bottom:20px; }

.tabs button {
  padding:10px 16px;
  border:none;
  border-radius:8px;
  background:#e2e8f0;
  cursor:pointer;
}

.tabs button.active {
  background:#2563eb;
  color:white;
}

.card {
  background:white;
  padding:20px;
  border-radius:10px;
  box-shadow:0 4px 12px rgba(0,0,0,0.08);
  max-width:700px;
}

label { display:block; margin-top:10px; font-weight:500; }

select, textarea, input {
  width:100%;
  padding:10px;
  margin-top:6px;
  border-radius:8px;
  border:1px solid #cbd5e1;
}

.btn-primary {
  margin-top:15px;
  padding:10px;
  background:#2563eb;
  color:white;
  border:none;
  border-radius:8px;
}

.full { width:100%; }

.doc-header {
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:15px;
}

.toggle button {
  margin-left:5px;
  padding:6px 12px;
  border:none;
  border-radius:6px;
  background:#e2e8f0;
}

.toggle .active {
  background:#2563eb;
  color:white;
}

.doc-table {
  width:100%;
  margin-top:10px;
  border-collapse:collapse;
}

.doc-table td, .doc-table th {
  padding:10px;
  border-bottom:1px solid #eee;
}

.action-cell {
  display:flex;
  gap:6px;
}

.btn-view {
  background:#2563eb;
  color:white;
  border:none;
  padding:6px 8px;
  border-radius:6px;
  cursor:pointer;
}

.btn-download {
  background:#16a34a;
  color:white;
  border:none;
  padding:6px 8px;
  border-radius:6px;
  cursor:pointer;
}

.btn-delete {
  background:#dc2626;
  color:white;
  border:none;
  padding:6px 8px;
  border-radius:6px;
  cursor:pointer;
}

.empty {
  text-align:center;
  margin-top:15px;
  color:#64748b;
}
`]
})
export class ContractorUpdatesComponent implements OnInit {

  constructor(
    private contractorService: ContractorService,
    private http: HttpClient
  ) {}

  activeTab = 'updates';
  mode = 'upload';

  projects: any[] = [];
  documents: any[] = [];

  selectedProjectId: any = '';
  selectedFiles: File[] = [];
  note = '';

  contractorId!: number;
  contractorName: string = '';

  docProjectId: any = '';
  selectedDoc: File | null = null;
  description = '';

  ngOnInit() {
    const userId = Number(sessionStorage.getItem('userId'));

    this.contractorService.getContractorByUser(userId)
      .subscribe((res: any) => {

        const contractor = res.data.data;

        this.contractorId = contractor.id;
        this.contractorName = contractor.name;

        this.contractorService
          .getContractorProjects(this.contractorId)
          .subscribe((projRes: any) => {
            this.projects = projRes.data.data;
          });

      });
  }

  onFilesSelected(event: any) {
    this.selectedFiles = Array.from(event.target.files);
  }

  submitUpdate() {
    const formData = new FormData();

    formData.append('projectId', this.selectedProjectId.toString());
    formData.append('contractorId', this.contractorId.toString());
    formData.append('note', this.note || 'Site update');
    formData.append('photo', this.selectedFiles[0]);

    this.contractorService.uploadProjectUpdate(formData)
      .subscribe(() => {
        alert('Update uploaded successfully');
        this.note = '';
        this.selectedFiles = [];
      });
  }

  onDocumentSelected(event: any) {
    this.selectedDoc = event.target.files[0];
  }

  uploadDocument() {
    const formData = new FormData();

    formData.append('file', this.selectedDoc!);
    formData.append('category', this.description || 'General');
    formData.append('uploadedByName', this.contractorName);
    formData.append('uploadedByRole', 'CONTRACTOR');

    this.http.post(`http://localhost:3000/document/${this.docProjectId}`, formData)
      .subscribe(() => {
        alert('Document uploaded successfully');
        this.mode = 'view';
        this.loadDocuments();
      });
  }

  loadDocuments() {
    this.http.get(
      `http://localhost:3000/document/contractor/${this.contractorId}/project/${this.docProjectId}`
    ).subscribe((res: any) => {
      this.documents = res.data || res;
    });
  }

  view(doc: any) {
    const url = `http://localhost:3000/document/download/${doc.id}`;
    window.open(url, '_blank');
  }

  download(id: number) {
    window.open(`http://localhost:3000/document/download/${id}`, '_blank');
  }

  delete(doc: any) {
    if (!confirm('Delete this document?')) return;

    this.http.delete(`http://localhost:3000/document/${doc.id}`)
      .subscribe(() => {
        this.documents = this.documents.filter(d => d.id !== doc.id);
        alert('Deleted successfully');
      });
  }
}
