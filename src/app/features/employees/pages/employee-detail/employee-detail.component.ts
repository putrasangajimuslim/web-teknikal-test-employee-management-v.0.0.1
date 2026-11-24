import { CurrencyPipe, DatePipe, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Employee } from '../../../../shared/models/employee.model';
import { EmployeeService } from '../../services/employee.service';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, NgIf],
  templateUrl: './employee-detail.component.html',
  styleUrl: './employee-detail.component.scss'
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
