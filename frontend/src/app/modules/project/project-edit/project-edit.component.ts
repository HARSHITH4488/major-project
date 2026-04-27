import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../../services/project.service';
import { ToastComponent } from '../../../shared/toast/toast.component';

@Component({
  selector: 'app-project-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastComponent],
  templateUrl: './project-edit.component.html',
  styleUrls: ['./project-edit.component.scss']
})
export class ProjectEditComponent implements OnInit {

  projectForm!: FormGroup;
  loading = false;
  updating = false;
  projectId!: number;
  errorMessage = '';

  // ✅ Toast state
  toastMessage = '';
  showToast = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    this.initForm();
    this.loadProject();
  }

  initForm() {
    this.projectForm = this.fb.group({
      projectName: ['', [Validators.required, Validators.minLength(3)]],
      projectType: ['', Validators.required],
      clientName: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: [''],
      totalAmount: ['', [Validators.required, Validators.min(1)]],
      status: ['', Validators.required],
      description: ['']
    });
  }

  loadProject() {
    this.loading = true;

    this.projectService.getById(this.projectId).subscribe({
      next: (res: any) => {
        const project = res.data;

        this.projectForm.patchValue({
          projectName: project.projectName,
          projectType: project.projectType,
          clientName: project.clientName,
          startDate: this.formatDate(project.startDate),
          endDate: project.endDate ? this.formatDate(project.endDate) : '',
          totalAmount: project.totalAmount,
          status: project.status,
          description: project.description
        });

        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load project';
        this.loading = false;
      }
    });
  }

  updateProject() {
    if (this.projectForm.invalid) return;

    this.updating = true;

    const payload = {
      ...this.projectForm.value,
      totalAmount: Number(this.projectForm.value.totalAmount)
    };

    this.projectService.update(this.projectId, payload).subscribe({
      next: () => {
        this.updating = false;

        // ✅ Show toast
        this.toastMessage = 'Project updated successfully!';
        this.showToast = true;

        setTimeout(() => {
          this.router.navigate(['/projects']);
        }, 1200);
      },
      error: () => {
        this.errorMessage = 'Failed to update project';
        this.updating = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['/projects']);
  }

  private formatDate(date: string): string {
    return new Date(date).toISOString().split('T')[0];
  }
}