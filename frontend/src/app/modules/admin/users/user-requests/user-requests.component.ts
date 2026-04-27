import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-user-requests',
  standalone: true,
  imports: [CommonModule],   // ⭐ IMPORTANT
  templateUrl: './user-requests.component.html',
  styleUrls: ['./user-requests.component.scss']
})
export class UserRequestsComponent implements OnInit {

  pendingUsers: any[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
  this.authService.getPendingUsers().subscribe((res: any) => {
    this.pendingUsers = res.data;   // ⭐ FIX
  });
}

  approve(id: number) {
    this.authService.approveUser(id).subscribe(() => {
      this.loadRequests();
    });
  }

  reject(id: number) {
    this.authService.deleteUser(id).subscribe(() => {
      this.loadRequests();
    });
  }

}