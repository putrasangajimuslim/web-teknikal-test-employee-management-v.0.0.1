import { CurrencyPipe, DatePipe, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../../../core/services/notification.service';
import { Employee } from '../../../../shared/models/employee.model';
import { EmployeeService } from '../../services/employee.service';

type SortKey = 'username' | 'firstName' | 'lastName' | 'email' | 'basicSalary' | 'status' | 'group';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule, NgIf, RouterLink],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss'
})
export class EmployeeListComponent {
  private readonly employeeService = inject(EmployeeService);
  private readonly notificationService = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private allEmployees: Employee[] = [];
  usernameSearch = '';
  emailSearch = '';
  page = 1;
  pageSize = 5;
  sortKey: SortKey = 'username';
  sortDirection: SortDirection = 'asc';

  constructor() {
    this.route.queryParams.subscribe((params) => {
      this.usernameSearch = params['username'] ?? '';
      this.emailSearch = params['email'] ?? '';
      this.page = Math.max(1, Number(params['page'] ?? 1));
      this.pageSize = [5, 10, 25, 50, 100].includes(Number(params['pageSize'])) ? Number(params['pageSize']) : 5;
      this.sortKey = this.isSortKey(params['sort']) ? params['sort'] : 'username';
      this.sortDirection = params['direction'] === 'desc' ? 'desc' : 'asc';
    });
    this.employeeService.employees$.subscribe((employees) => { this.allEmployees = employees; if (this.page > this.totalPages) this.page = this.totalPages; });
  }

  get filteredEmployees(): Employee[] {
    const username = this.usernameSearch.trim().toLowerCase();
    const email = this.emailSearch.trim().toLowerCase();
    return [...this.allEmployees].filter((employee) => (!username || employee.username.toLowerCase().includes(username)) && (!email || employee.email.toLowerCase().includes(email))).sort((a, b) => {
      const left = a[this.sortKey]; const right = b[this.sortKey];
      const comparison = typeof left === 'number' && typeof right === 'number' ? left - right : String(left).localeCompare(String(right));
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }
  get totalPages(): number { return Math.max(1, Math.ceil(this.filteredEmployees.length / this.pageSize)); }
  get hasEmployees(): boolean { return this.allEmployees.length > 0; }
  get startIndex(): number { return (this.page - 1) * this.pageSize; }
  get endIndex(): number { return Math.min(this.startIndex + this.pageSize, this.filteredEmployees.length); }
  get pagedEmployees(): Employee[] { return this.filteredEmployees.slice(this.startIndex, this.endIndex); }
  get currentQueryParams(): Record<string, string | number> { return { username: this.usernameSearch || '', email: this.emailSearch || '', page: this.page, pageSize: this.pageSize, sort: this.sortKey, direction: this.sortDirection }; }
  applyFilters(): void { this.page = 1; this.updateUrl(); }
  resetFilters(): void { this.usernameSearch = ''; this.emailSearch = ''; this.page = 1; this.pageSize = 5; this.sortKey = 'username'; this.sortDirection = 'asc'; this.updateUrl(); }
  sortBy(key: SortKey): void { if (this.sortKey === key) this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc'; else { this.sortKey = key; this.sortDirection = 'asc'; } this.page = 1; this.updateUrl(); }
  sortIndicator(key: SortKey): string { return this.sortKey === key ? (this.sortDirection === 'asc' ? '↑' : '↓') : '↕'; }
  goToPage(page: number): void { this.page = Math.min(Math.max(1, page), this.totalPages); this.updateUrl(); }
  changePageSize(size: number): void { this.pageSize = Number(size); this.page = 1; this.updateUrl(); }
  initials(employee: Employee): string { return `${employee.firstName[0]}${employee.lastName[0]}`; }
  statusClass(status: string): string { return `status-badge--${status.toLowerCase()}`; }
  editEmployee(employee: Employee): void {
    void this.router.navigate(['/employees/edit', employee.id]);
  }
  deleteEmployee(employee: Employee): void { if (!window.confirm(`Delete ${employee.firstName} ${employee.lastName}? This action cannot be undone.`)) return; if (this.employeeService.delete(employee.id)) { this.notificationService.error(`${employee.firstName} ${employee.lastName} was deleted.`); if (this.page > this.totalPages) this.page = this.totalPages; this.updateUrl(); } }
  private updateUrl(): void { void this.router.navigate([], { relativeTo: this.route, queryParams: this.currentQueryParams, replaceUrl: true }); }
  private isSortKey(value: string | undefined): value is SortKey { return ['username', 'firstName', 'lastName', 'email', 'basicSalary', 'status', 'group'].includes(value ?? ''); }
}
