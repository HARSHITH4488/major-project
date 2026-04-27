import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contractor-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contractor-register.component.html',
  styleUrls: ['./contractor-register.component.scss']
})
export class ContractorRegisterComponent {

  registerForm: FormGroup;

  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {

    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

  }

  onRegister() {

    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(this.registerForm.value).subscribe({

      next: (res: any) => {

        this.successMessage =
          'Registration successful. Awaiting admin approval.';

        this.registerForm.reset();
        this.isLoading = false;

      },

      error: (err) => {

        this.errorMessage =
          err?.error?.message || 'Registration failed';

        this.isLoading = false;

      }

    });

  }

}