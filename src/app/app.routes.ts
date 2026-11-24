import { Routes } from '@angular/router';
import { authGuard, loginRedirectGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { EmployeeAddComponent } from './features/employees/pages/employee-add/employee-add.component';
import { EmployeeDetailComponent } from './features/employees/pages/employee-detail/employee-detail.component';
import { EmployeeListComponent } from './features/employees/pages/employee-list/employee-list.component';
import { EmployeeShellComponent } from './shared/components/employee-shell/employee-shell.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [loginRedirectGuard] },
  {
    path: 'employees',
    component: EmployeeShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: EmployeeListComponent, title: 'Employee List - Teknikaltest' },
      { path: 'add', component: EmployeeAddComponent, title: 'Add employee - Teknikaltest' },
      { path: 'edit/:id', component: EmployeeAddComponent, title: 'Edit employee - Teknikaltest' },
      { path: ':id', component: EmployeeDetailComponent, title: 'Employee detail - Teknikaltest' }
    ]
  },
  { path: '', pathMatch: 'full', redirectTo: 'employees' },
  {
    path: '**',
    loadComponent: () => import('./shared/pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
    title: 'Page not found - Teknikaltest'
  }
];
