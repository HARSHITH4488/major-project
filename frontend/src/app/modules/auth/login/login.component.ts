import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  loginForm: FormGroup;
  registerForm: FormGroup;

  selectedRole: 'ADMIN' | 'EMPLOYEE' | 'CONTRACTOR' = 'ADMIN';
  mode: 'login' | 'register' = 'login';

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

  }

  setMode(mode: 'login' | 'register') {
    this.mode = mode;
    this.errorMessage = '';
    this.successMessage = '';
  }

  selectRole(role: 'ADMIN' | 'EMPLOYEE' | 'CONTRACTOR') {
    this.selectedRole = role;
    this.errorMessage = '';
  }

  // LOGIN
  onLogin() {

    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({

      next: (res: any) => {

  const token = res.data.accessToken;
  const user = res.data.user;

  // 🔥 SAVE TOKEN (THIS WAS MISSING)
  this.authService.saveToken(token);

  if (user.role !== this.selectedRole) {
    this.errorMessage = `You are not authorized to login as ${this.selectedRole}`;
    this.isLoading = false;
    return;
  }

  sessionStorage.setItem('user', JSON.stringify(user));
  sessionStorage.setItem('userId', user.id);
  sessionStorage.setItem('userRole', user.role);

  // ✅ ROLE BASED NAVIGATION (SAFE FIX)

if (user.role === 'ADMIN') {
  this.router.navigate(['/dashboard']);
}

else if (user.role === 'EMPLOYEE') {
  this.router.navigate(['/dashboard']); // ✅ SAME ROUTE but different UI later
}

else if (user.role === 'CONTRACTOR') {
  this.router.navigate(['/contractor/dashboard']);
}
      },

      error: (err) => {

        this.errorMessage =
          err?.error?.message ||
          'Login failed. Please check your credentials.';

        this.isLoading = false;
      }

    });

  }

  // REGISTER
  onRegister() {

    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = {
      ...this.registerForm.value,
      role: this.selectedRole
    };

    this.authService.register(payload).subscribe({
      

      next: () => {

        this.successMessage =
          'Registration submitted. Await admin approval.';

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