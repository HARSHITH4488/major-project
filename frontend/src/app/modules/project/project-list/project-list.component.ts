import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ProjectService } from '../../../services/project.service';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent implements OnInit {

  projects: any[] = [];
  loading = false;

  // Pagination state
  currentPage: number = 1;
  totalPages: number = 1;
  totalRecords: number = 0;
  pageSize: number = 10;

  // Delete modal state
  showDeleteModal = false;
  selectedProjectId: number | null = null;

  constructor(
    private projectService: ProjectService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  /* ===============================
     LOAD PROJECTS
  =================================*/

 loadProjects(page: number = 1) {
  this.loading = true;
  this.currentPage = page;

  this.projectService.getAll(page, this.pageSize).subscribe({
    next: (res: any) => {

      console.log('API RESPONSE:', res);

      // ✅ Correct mapping based on your real response
      this.projects = res?.data?.data || [];
      this.totalRecords = res?.data?.total || 0;
      this.totalPages = res?.data?.totalPages || 1;

      this.loading = false;
    },
    error: (err: any) => {
      console.error(err);
      this.loading = false;
    }
  });
}

  /* ===============================
     VIEW PROJECT
  =================================*/

  viewProject(id: number) {
    this.router.navigate(['/projects', id]);
  }

  /* ===============================
     DELETE MODAL
  =================================*/

 openDeleteModal(id: number) {
  console.log('Delete clicked with ID:', id); // 👈 ADD THIS
  this.selectedProjectId = id;
  this.showDeleteModal = true;
}

  closeModal() {
    this.showDeleteModal = false;
    this.selectedProjectId = null;
  }

  confirmDelete() {
    if (!this.selectedProjectId) return;

    this.projectService.delete(this.selectedProjectId).subscribe({
      next: () => {

        this.closeModal();

        // ✅ Smart page adjustment after delete
        if (this.projects.length === 1 && this.currentPage > 1) {
          this.loadProjects(this.currentPage - 1);
        } else {
          this.loadProjects(this.currentPage);
        }
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  /* ===============================
     PAGINATION
  =================================*/

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.loadProjects(this.currentPage + 1);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.loadProjects(this.currentPage - 1);
    }
  }

}