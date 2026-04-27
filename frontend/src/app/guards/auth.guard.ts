import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const AuthGuard: CanActivateFn = () => {
  const router = inject(Router);

  console.log('AuthGuard running');

  const userId = sessionStorage.getItem('userId'); // ✅ FIXED
  console.log('userId:', userId);

  if (!userId) {
    console.log('Redirecting to login');
    router.navigate(['/login']);
    return false;
  }

  console.log('Access granted');
  return true;
};