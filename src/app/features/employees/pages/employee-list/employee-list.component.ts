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
  template: `
    <section class="page-heading">
      <div><div class="breadcrumbs"><span>Workspace</span><span>/</span><strong>Employee List</strong></div><h1>Employee List</h1><p>Manage your team members and their employment information.</p></div>
      <a class="button button--primary" [routerLink]="['/employees/add']" [queryParams]="currentQueryParams">+ Add employee</a>
    </section>
    <section class="content-card">
      <div class="card-toolbar"><div><h2>All employees</h2><p>{{ filteredEmployees.length }} {{ filteredEmployees.length === 1 ? 'employee' : 'employees' }} found</p></div><div class="toolbar-meta"><span class="live-dot"></span>Data saved locally</div></div>
      <div class="filter-panel"><div class="filter-field"><label for="search-username">Username</label><div class="input-with-icon"><span>⌕</span><input id="search-username" type="search" placeholder="Search username" [(ngModel)]="usernameSearch" (ngModelChange)="applyFilters()" /></div></div><div class="filter-field"><label for="search-email">Email</label><div class="input-with-icon"><span>⌕</span><input id="search-email" type="search" placeholder="Search email" [(ngModel)]="emailSearch" (ngModelChange)="applyFilters()" /></div></div><button type="button" class="button button--ghost filter-reset" (click)="resetFilters()">↻ Reset filters</button></div>
      <div class="table-wrapper" *ngIf="filteredEmployees.length; else emptyState">
        <table><thead><tr><th><button class="sort-button" (click)="sortBy('username')">Username <span>{{ sortIndicator('username') }}</span></button></th><th><button class="sort-button" (click)="sortBy('firstName')">First name <span>{{ sortIndicator('firstName') }}</span></button></th><th><button class="sort-button" (click)="sortBy('lastName')">Last name <span>{{ sortIndicator('lastName') }}</span></button></th><th><button class="sort-button" (click)="sortBy('email')">Email <span>{{ sortIndicator('email') }}</span></button></th><th><button class="sort-button" (click)="sortBy('basicSalary')">Basic salary <span>{{ sortIndicator('basicSalary') }}</span></button></th><th>Birth date</th><th><button class="sort-button" (click)="sortBy('status')">Status <span>{{ sortIndicator('status') }}</span></button></th><th><button class="sort-button" (click)="sortBy('group')">Group <span>{{ sortIndicator('group') }}</span></button></th><th class="action-column">Action</th></tr></thead>
          <tbody>@for (employee of pagedEmployees; track employee.id) {<tr><td><div class="person-cell"><div class="avatar avatar--table">{{ initials(employee) }}</div><strong>{{ employee.username }}</strong></div></td><td>{{ employee.firstName }}</td><td>{{ employee.lastName }}</td><td class="muted-cell">{{ employee.email }}</td><td class="salary-cell">{{ employee.basicSalary | currency:'IDR':'symbol':'1.2-2':'id-ID' }}</td><td>{{ employee.birthDate | date:'dd MMM yyyy' }}</td><td><span class="status-badge" [class]="statusClass(employee.status)"><span></span>{{ employee.status }}</span></td><td><span class="group-chip">{{ employee.group }}</span></td><td><div class="action-buttons"><a class="row-action row-action--view" [routerLink]="['/employees', employee.id]" [queryParams]="currentQueryParams" aria-label="View employee">↗</a><button type="button" class="row-action" (click)="editEmployee(employee)" aria-label="Edit employee">✎</button><button type="button" class="row-action row-action--delete" (click)="deleteEmployee(employee)" aria-label="Delete employee">⌫</button></div></td></tr>}</tbody>
        </table>
      </div>
      <ng-template #emptyState><div class="empty-state"><div class="empty-state__icon">▦</div><h3>{{ hasEmployees ? 'No employees found' : 'No employees yet' }}</h3><p>{{ hasEmployees ? 'Try adjusting your search or reset the filters to see everyone.' : 'Start by adding your first employee to the directory.' }}</p><a class="button button--secondary" [routerLink]="['/employees/add']" [queryParams]="currentQueryParams">+ Add employee</a></div></ng-template>
      <div class="pagination" *ngIf="filteredEmployees.length"><div class="pagination__summary">Showing <strong>{{ startIndex + 1 }}–{{ endIndex }}</strong> of <strong>{{ filteredEmployees.length }}</strong></div><div class="pagination__controls"><label for="page-size">Rows per page</label><select id="page-size" [(ngModel)]="pageSize" (ngModelChange)="changePageSize($event)"><option [ngValue]="5">5</option><option [ngValue]="10">10</option><option [ngValue]="25">25</option><option [ngValue]="50">50</option><option [ngValue]="100">100</option></select><label class="page-label" for="page-number">Page</label><input id="page-number" class="page-input" type="number" min="1" [max]="totalPages" [ngModel]="page" (ngModelChange)="goToPage($event)" aria-label="Page number" /><span class="pagination__of">of {{ totalPages }}</span><button class="page-button" type="button" [disabled]="page === 1" (click)="goToPage(page - 1)" aria-label="Previous page">‹</button><button class="page-button" type="button" [disabled]="page === totalPages" (click)="goToPage(page + 1)" aria-label="Next page">›</button></div></div>
    </section>
  `
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
