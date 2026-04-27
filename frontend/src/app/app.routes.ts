import { Routes } from '@angular/router';
import { LoginComponent } from './modules/auth/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { UserRequestsComponent } from './modules/admin/users/user-requests/user-requests.component';
import { ManageUsersComponent } from './modules/admin/users/manage-users/manage-users.component';


export const routes: Routes = [

  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },

  {
    path: '',
    loadComponent: () =>
      import('./layouts/layout.component')
        .then(m => m.LayoutComponent),
    canActivate: [AuthGuard],
    children: [

      // ================= DASHBOARD =================
      {
  path: 'dashboard',
  loadChildren: () =>
    import('./modules/dashboard/dashboard.module')
      .then(m => m.DashboardModule)
},

      
      // ================= PROJECTS =================
      {
        path: 'projects',
        children: [

          {
            path: '',
            loadComponent: () =>
              import('./modules/project/project-list/project-list.component')
                .then(m => m.ProjectListComponent)
          },

          {
            path: 'create',
            loadComponent: () =>
              import('./modules/project/project-create/project-create.component')
                .then(m => m.ProjectCreateComponent)
          },

          {
            path: 'edit/:id',
            loadComponent: () =>
              import('./modules/project/project-edit/project-edit.component')
                .then(m => m.ProjectEditComponent)
          },

          // ✅ NEW ROUTE (IMPORTANT)
          {
  path: ':id/contractor-documents',
  loadComponent: () =>
    import('./modules/documents/contractor-documents.component')
      .then(m => m.ContractorDocumentsComponent)
},

          // ⚠️ KEEP THIS LAST
          {
            path: ':id',
            loadComponent: () =>
              import('./modules/project/project-detail/project-detail.component')
                .then(m => m.ProjectDetailComponent)
          }

        ]
      },

      // ================= SCHEDULE =================
      {
        path: 'schedule',
        children: [
          {
            path: 'create/:projectId',
            loadComponent: () =>
              import('./modules/schedule/schedule-create/schedule-create.component')
                .then(m => m.ScheduleCreateComponent)
          },
          {
            path: 'timeline/:projectId',
            loadComponent: () =>
              import('./modules/schedule/schedule-timeline/schedule-timeline.component')
                .then(m => m.ScheduleTimelineComponent)
          },
          {
            path: 'tasks/:projectId',
            loadComponent: () =>
              import('./modules/schedule/schedule-tasks/schedule-tasks.component')
                .then(m => m.ScheduleTasksComponent)
          }
        ]
      },

      // ================= CONTRACTORS (ADMIN SIDE) =================
      {
        path: 'contractors',
        children: [
          {
            path: 'create',
            loadComponent: () =>
              import('./modules/contractor/contractor-form.component')
                .then(m => m.ContractorFormComponent)
          },
          {
            path: 'edit/:id',
            loadComponent: () =>
              import('./modules/contractor/contractor-form.component')
                .then(m => m.ContractorFormComponent)
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./modules/contractor/contractor-detail/contractor-detail.component')
                .then(m => m.ContractorDetailComponent)
          },
          {
            path: '',
            pathMatch: 'full',
            loadComponent: () =>
              import('./modules/contractor/contractor-list.component')
                .then(m => m.ContractorListComponent)
          }
        ]
      },

      // ================= USERS =================
      {
        path: 'users',
        loadComponent: () =>
          import('./modules/admin/users/users.component')
            .then(m => m.UsersComponent)
      },

      // ================= ADMIN TASKS =================
{
  path: 'admin/tasks',
  loadComponent: () =>
    import('./modules/admin/daily-tasks/daily-tasks.component')
      .then(m => m.DailyTasksComponent)
},

      // ================= CONTRACTOR =================
      {
        path: 'contractor',
        canActivate: [AuthGuard],
        children: [

          {
            path: 'dashboard',
            loadComponent: () =>
              import('./modules/contractor-dashboard/contractor-dashboard.component')
                .then(m => m.ContractorDashboardComponent)
          },

          {
            path: 'tasks',
            loadComponent: () =>
              import('./modules/contractor-dashboard/contractor-tasks.component')
                .then(m => m.ContractorTasksComponent)
          },

          {
            path: 'timeline',
            loadComponent: () =>
              import('./modules/contractor-timeline/contractor-timeline.component')
                .then(m => m.ContractorTimelineComponent)
          },

          {
            path: 'updates',
            loadComponent: () =>
              import('./modules/contractor-dashboard/contractor-updates.component')
                .then(m => m.ContractorUpdatesComponent)
          }

        ]
      }

    ]
  },
  
  

  { path: '**', redirectTo: 'login' }

];