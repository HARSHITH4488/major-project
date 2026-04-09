import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {}

  private apiUrl = environment.apiUrl;

  // =========================
  // AUTH
  // =========================

  login(credentials: any) {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials);
  }

  register(data: any) {
    return this.http.post(`${this.apiUrl}/auth/register`, data);
  }

  // ✅ TOKEN
  saveToken(token: string) {
    sessionStorage.setItem('token', token);
  }

  getToken() {
    return sessionStorage.getItem('token');
  }

  // ✅ USER
  saveUser(user: any) {
    sessionStorage.setItem('user', JSON.stringify(user));
    sessionStorage.setItem('userId', user.id);
    sessionStorage.setItem('userRole', user.role);
  }

  getUser() {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getUserId() {
    return sessionStorage.getItem('userId');
  }

  getUserRole() {
    return sessionStorage.getItem('userRole');
  }

  logout() {
    sessionStorage.clear(); // 🔥 clears only this tab
  }

  // =========================
  // ADMIN USER MANAGEMENT
  // =========================

  getUsers() {
    return this.http.get(`${this.apiUrl}/users`);
  }

  getPendingUsers() {
    return this.http.get(`${this.apiUrl}/users/pending`);
  }

  approveUser(id: number) {
    return this.http.patch(`${this.apiUrl}/users/${id}/approve`, {});
  }

  suspendUser(id: number) {
    return this.http.patch(`${this.apiUrl}/users/${id}/suspend`, {});
  }

  deleteUser(id: number) {
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }

  // =========================
// ROLE HELPERS (SAFE ADD)
// =========================

isEmployee(): boolean {
  return this.getUserRole() === 'EMPLOYEE';
}

isAdmin(): boolean {
  return this.getUserRole() === 'ADMIN';
}

isManager(): boolean {
  return this.getUserRole() === 'MANAGER'; // optional (future safe)
}
activateUser(id: number) {
  return this.http.patch(`http://localhost:3000/users/${id}/activate`, {});
}
}
