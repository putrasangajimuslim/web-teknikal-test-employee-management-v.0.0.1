import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../../core/services/notification.service';
import { EMPLOYEE_GROUPS, EMPLOYEE_STATUSES, EmployeeStatus } from '../../../../shared/models/employee.model';
import { EmployeeService } from '../../services/employee.service';

const notFutureDate: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (!control.value) return null;
  return control.value > new Date().toISOString().slice(0, 10) ? { futureDate: true } : null;
};

@Component({
  selector: 'app-employee-add',
  standalone: true,
  imports: [FormsModule, NgIf, ReactiveFormsModule],
  templateUrl: './employee-add.component.html',
  styleUrl: './employee-add.component.scss'
})
export class EmployeeAddComponent {
  private readonly fb = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly statuses = EMPLOYEE_STATUSES;
  readonly groups = EMPLOYEE_GROUPS;
  readonly maxBirthDate = new Date().toISOString().slice(0, 10);
  readonly employeeForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.maxLength(50)]],
    firstName: ['', [Validators.required, Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]],
    birthDate: ['', [Validators.required, notFutureDate]],
    basicSalary: [0, [Validators.required, Validators.min(1000000)]],
    status: ['', Validators.required],
    group: ['', Validators.required],
    description: ['', [Validators.required, Validators.maxLength(500)]]
  });
  groupPickerOpen = false;
  groupSearch = '';
  editingEmployeeId: string | null = null;
  private salaryDigits = '';

  constructor() {
    const routePath = this.route.snapshot.routeConfig?.path;
    if (routePath !== 'edit/:id') return;

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.notificationService.error('No employee selected for editing.');
      void this.router.navigate(['/employees']);
      return;
    }
    const employee = this.employeeService.getById(id);
    if (!employee) {
      this.notificationService.error('Employee not found.');
      void this.router.navigate(['/employees']);
      return;
    }
    this.editingEmployeeId = id;
    this.employeeForm.patchValue({
      username: employee.username,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      birthDate: employee.birthDate,
      basicSalary: employee.basicSalary,
      status: employee.status,
      group: employee.group,
      description: employee.description
    });
    this.salaryDigits = this.digitsFromNumber(employee.basicSalary);
  }

  get filteredGroups(): readonly string[] { return this.groups.filter((group) => group.toLowerCase().includes(this.groupSearch.toLowerCase().trim())); }
  get selectedGroup(): string { return this.employeeForm.controls.group.value; }
  get isEditing(): boolean { return this.editingEmployeeId !== null; }

  get salaryDisplay(): string {
    return this.salaryDigits ? this.formatThousands(this.salaryDigits) : '';
  }

  onSalaryInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = this.normalizeDigits(input.value);
    const control = this.employeeForm.controls.basicSalary;

    this.salaryDigits = digits;
    control.setValue(digits ? Number(digits) : 0);
    control.markAsDirty();
    control.markAsTouched();
    input.value = this.salaryDisplay;
  }

  private normalizeDigits(value: string): string {
    return value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
  }

  private digitsFromNumber(value: number): string {
    return value.toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 0 });
  }

  private formatThousands(value: string): string {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  isInvalid(name: keyof typeof this.employeeForm.controls): boolean {
    const control = this.employeeForm.controls[name];
    return control.invalid && (control.dirty || control.touched);
  }

  errorMessage(name: keyof typeof this.employeeForm.controls, fallback: string): string {
    const control = this.employeeForm.controls[name];
    if (control.hasError('duplicate')) return 'This username is already in use.';
    if (control.hasError('futureDate')) return 'Birth date cannot be in the future.';
    return fallback;
  }

  selectGroup(group: string): void {
    this.employeeForm.controls.group.setValue(group);
    this.employeeForm.controls.group.markAsDirty();
    this.groupPickerOpen = false;
    this.groupSearch = '';
  }

  save(): void {
    this.employeeForm.markAllAsTouched();
    const usernameControl = this.employeeForm.controls.username;
    if (usernameControl.hasError('duplicate')) {
      const { duplicate: _duplicate, ...remainingErrors } = usernameControl.errors ?? {};
      usernameControl.setErrors(Object.keys(remainingErrors).length ? remainingErrors : null);
    }
    if (this.employeeService.usernameExists(usernameControl.value, this.editingEmployeeId ?? undefined)) usernameControl.setErrors({ ...usernameControl.errors, duplicate: true });
    if (this.employeeForm.invalid) {
      this.notificationService.warning('Please complete all required fields correctly.');
      return;
    }
    const value = this.employeeForm.getRawValue();
    const payload = { ...value, status: value.status as EmployeeStatus, basicSalary: Number(value.basicSalary) };
    const saved = this.editingEmployeeId ? this.employeeService.update(this.editingEmployeeId, payload) : this.employeeService.add(payload);
    if (!saved) {
      this.notificationService.error('Employee could not be saved.');
      return;
    }
    this.notificationService.success(this.isEditing ? 'Employee successfully updated.' : 'Employee successfully added.');
    void this.router.navigate(['/employees'], { queryParams: this.returnQueryParams });
  }

  cancel(): void {
    void this.router.navigate(['/employees'], { queryParams: this.returnQueryParams });
  }

  private get returnQueryParams(): Record<string, string | number> {
    const query = this.route.snapshot.queryParams;
    return Object.fromEntries(['username', 'email', 'page', 'pageSize', 'sort', 'direction'].filter((key) => query[key]).map((key) => [key, query[key]]));
  }
}
