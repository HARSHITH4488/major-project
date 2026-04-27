import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule],   // ⭐ IMPORTANT
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.scss']
})
export class ManageUsersComponent implements OnInit {

  users: any[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.authService.getUsers().subscribe((res: any) => {
      this.users = res.data;
    });
  }

  suspend(id: number) {
    this.authService.suspendUser(id).subscribe(() => {
      this.loadUsers();
    });
  }
  activate(id: number) {
  this.authService.activateUser(id).subscribe(() => {
    this.loadUsers();
  });
}

  delete(id: number) {
    this.authService.deleteUser(id).subscribe(() => {
      this.loadUsers();
    });
  }

}