import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup
} from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectService } from '../../../services/project.service';
import { ToastComponent } from '../../../shared/toast/toast.component';

@Component({
  selector: 'app-project-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastComponent],
  templateUrl: './project-create.component.html',
  styleUrls: ['./project-create.component.scss']
})
export class ProjectCreateComponent {

  loading = false;
  submitted = false;
  serverError = '';

  toastMessage = '';
  showToast = false;

  projectForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private router: Router
  ) {
    this.projectForm = this.fb.group(
      {
        projectName: ['', [Validators.required, Validators.minLength(3)]],
        projectType: ['', Validators.required],
        clientName: ['', Validators.required],
        startDate: ['', Validators.required],
        endDate: [''],
        totalAmount: ['', [Validators.required, Validators.min(1)]],
        status: ['ACTIVE', Validators.required],
        description: ['', [Validators.maxLength(500)]]
      },
      { validators: this.dateValidator }
    );
  }

  private dateValidator(group: FormGroup) {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;

    if (!start || !end) return null;

    return new Date(end) > new Date(start)
      ? null
      : { invalidDateRange: true };
  }

  get f() {
    return this.projectForm.controls as any;
  }

  // ✅ BACK FUNCTION (NEW)
  goBack() {
    this.router.navigate(['/projects']);
  }

  onSubmit() {
    this.submitted = true;
    this.serverError = '';

    if (this.projectForm.invalid) return;

    this.loading = true;

    const {
      projectName,
      projectType,
      clientName,
      startDate,
      endDate,
      totalAmount,
      status,
      description
    } = this.projectForm.value;

    const payload = {
      projectName,
      projectType,
      clientName,
      startDate,
      endDate,
      totalAmount: Number(totalAmount),
      status,
      description
    };

    this.projectService.create(payload).subscribe({
      next: () => {
        this.loading = false;

        this.toastMessage = 'Project created successfully!';
        this.showToast = true;

        setTimeout(() => {
          this.router.navigate(['/projects']);
        }, 1000);
      },
      error: (err: any) => {
        this.loading = false;
        this.serverError = err?.error?.message || 'Something went wrong';
      }
    });
  }
}