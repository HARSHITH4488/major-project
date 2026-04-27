import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  users: any[] = [];
  loading = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;

    this.authService.getUsers().subscribe({
      next: (res: any) => {
        this.users = res.data || res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  approve(id: number) {
    this.authService.approveUser(id).subscribe(() => {
      this.loadUsers();
    });
  }

  suspend(id: number) {
    this.authService.suspendUser(id).subscribe(() => {
      this.loadUsers();
    });
  }

  delete(id: number) {
    if (!confirm('Delete this user?')) return;

    this.authService.deleteUser(id).subscribe(() => {
      this.loadUsers();
    });
  }

}