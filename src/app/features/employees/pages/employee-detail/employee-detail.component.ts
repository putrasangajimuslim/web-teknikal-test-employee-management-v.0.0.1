import { CurrencyPipe, DatePipe, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Employee } from '../../../../shared/models/employee.model';
import { EmployeeService } from '../../services/employee.service';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, NgIf],
  template: `
    <section class="page-heading page-heading--compact"><div><div class="breadcrumbs"><span>Employees</span><span>/</span><strong>Employee detail</strong></div><h1>Employee detail</h1><p>Review the complete employee record.</p></div><button class="button button--ghost" type="button" (click)="back()">← Back to employees</button></section>
    <ng-container *ngIf="employee; else missingEmployee">
      <section class="detail-hero content-card"><div class="detail-identity"><div class="avatar avatar--hero">{{ initials }}</div><div><span class="eyebrow">Employee profile</span><h2>{{ employee.firstName }} {{ employee.lastName }}</h2><p>@{{ employee.username }} · {{ groupValue }}</p></div></div><span class="status-badge" [class]="statusClass"><span></span>{{ employee.status }}</span></section>
      <section class="content-card detail-card">
        <div class="detail-card__heading"><div><h2>Personal information</h2><p>Identity and contact details for this employee.</p></div><button type="button" class="button button--secondary" (click)="back()">OK</button></div>
        <div class="detail-grid"><div class="detail-item"><span>Username</span><strong>{{ employee.username }}</strong></div><div class="detail-item"><span>Email address</span><strong>{{ employee.email }}</strong></div><div class="detail-item"><span>First name</span><strong>{{ employee.firstName }}</strong></div><div class="detail-item"><span>Last name</span><strong>{{ employee.lastName }}</strong></div><div class="detail-item"><span>Birth date</span><strong>{{ employee.birthDate | date:'dd MMMM yyyy' }}</strong></div></div>
        <div class="detail-divider"></div>
        <div class="detail-card__heading"><div><h2>Employment details</h2><p>Current compensation and team information.</p></div></div>
        <div class="detail-grid detail-grid--employment"><div class="detail-item"><span>Basic salary</span><strong class="detail-item__salary">{{ salaryValue | currency:'IDR':'symbol':'1.2-2':'id-ID' }}</strong></div><div class="detail-item"><span>Status</span><strong><span class="status-badge" [class]="statusClass"><span></span>{{ employee.status }}</span></strong></div><div class="detail-item"><span>Group</span><strong class="detail-item__group">{{ groupValue }}</strong></div></div>
        <div class="detail-divider"></div><div class="detail-description"><span>Description</span><p>{{ employee.description }}</p></div>
      </section>
    </ng-container>
    <ng-template #missingEmployee><section class="content-card empty-state empty-state--detail"><div class="empty-state__icon">?</div><h2>Employee not found</h2><p>This employee may have been removed or the link is invalid.</p><button class="button button--primary" type="button" (click)="back()">Return to employees</button></section></ng-template>
  `
})
export class EmployeeDetailComponent {
  private readonly employeeService = inject(EmployeeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  employee: Employee | undefined;

  constructor() {
    this.route.paramMap.subscribe((params) => { this.employee = this.employeeService.getById(params.get('id') ?? ''); });
  }

  get initials(): string { return this.employee ? `${this.employee.firstName[0]}${this.employee.lastName[0]}` : '?'; }
  get statusClass(): string { return this.employee ? `status-badge--${this.employee.status.toLowerCase()}` : ''; }
  get salaryValue(): number { return Number(this.employee?.basicSalary ?? 0); }
  get groupValue(): string { return this.employee?.group?.trim() || 'Not assigned'; }

  back(): void {
    const query = this.route.snapshot.queryParams;
    const params = Object.fromEntries(['username', 'email', 'page', 'pageSize', 'sort', 'direction'].filter((key) => query[key]).map((key) => [key, query[key]]));
    void this.router.navigate(['/employees'], { queryParams: params });
  }
}
