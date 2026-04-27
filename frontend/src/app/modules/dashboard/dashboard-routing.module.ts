import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminDashboardComponent } from '../admin/admin-dashboard/admin-dashboard.component';

// ✅ ADD THESE IMPORTS
import { ManageUsersComponent } from '../admin/users/manage-users/manage-users.component';
import { UserRequestsComponent } from '../admin/users/user-requests/user-requests.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: '',
        redirectTo: 'admin-dashboard',
        pathMatch: 'full'
      },
      {
        path: 'admin-dashboard',
        component: AdminDashboardComponent
      },
      {
        path: 'users',
        component: ManageUsersComponent   // ✅ ADDED
      },
      {
        path: 'requests',
        component: UserRequestsComponent  // ✅ ADDED
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}