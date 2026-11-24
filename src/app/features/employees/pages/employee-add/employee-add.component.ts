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
  template: `
    <section class="page-heading page-heading--compact"><div><div class="breadcrumbs"><span>Employees</span><span>/</span><strong>{{ isEditing ? 'Edit employee' : 'Add employee' }}</strong></div><h1>{{ isEditing ? 'Edit employee' : 'Add employee' }}</h1><p>{{ isEditing ? 'Update the employee record and save your changes.' : 'Create a new employee record for your organization.' }}</p></div></section>
    <form class="form-layout" [formGroup]="employeeForm" (ngSubmit)="save()" novalidate>
      <section class="content-card form-card"><div class="form-card__heading"><div class="section-icon">✦</div><div><h2>Personal information</h2><p>Basic identity and contact details.</p></div></div><div class="form-grid"><div class="form-field"><label for="username">Username <span>*</span></label><input id="username" formControlName="username" placeholder="e.g. jane.smith" [class.input--invalid]="isInvalid('username')" /><small class="field-error" *ngIf="isInvalid('username')">{{ errorMessage('username', 'Username is required.') }}</small></div><div class="form-field"><label for="email">Email <span>*</span></label><input id="email" type="email" formControlName="email" placeholder="name@company.com" [class.input--invalid]="isInvalid('email')" /><small class="field-error" *ngIf="isInvalid('email')">{{ errorMessage('email', 'Enter a valid email address.') }}</small></div><div class="form-field"><label for="firstName">First name <span>*</span></label><input id="firstName" formControlName="firstName" placeholder="Jane" [class.input--invalid]="isInvalid('firstName')" /><small class="field-error" *ngIf="isInvalid('firstName')">First name is required.</small></div><div class="form-field"><label for="lastName">Last name <span>*</span></label><input id="lastName" formControlName="lastName" placeholder="Smith" [class.input--invalid]="isInvalid('lastName')" /><small class="field-error" *ngIf="isInvalid('lastName')">Last name is required.</small></div><div class="form-field"><label for="birthDate">Birth date <span>*</span></label><input id="birthDate" type="date" [max]="maxBirthDate" formControlName="birthDate" [class.input--invalid]="isInvalid('birthDate')" /><small class="field-error" *ngIf="isInvalid('birthDate')">{{ errorMessage('birthDate', 'Birth date is required.') }}</small></div></div></section>
      <section class="content-card form-card"><div class="form-card__heading"><div class="section-icon section-icon--purple">◉</div><div><h2>Employment details</h2><p>Role, compensation, and team assignment.</p></div></div><div class="form-grid"><div class="form-field"><label for="basicSalary">Basic salary <span>*</span></label><div class="input-prefix"><span>Rp</span><input id="basicSalary" type="number" min="1" formControlName="basicSalary" placeholder="0" [class.input--invalid]="isInvalid('basicSalary')" /></div><small class="field-error" *ngIf="isInvalid('basicSalary')">Basic salary must be greater than zero.</small></div><div class="form-field"><label for="status">Status <span>*</span></label><select id="status" formControlName="status" [class.input--invalid]="isInvalid('status')"><option value="">Select status</option>@for (status of statuses; track status) {<option [value]="status">{{ status }}</option>}</select><small class="field-error" *ngIf="isInvalid('status')">Status is required.</small></div><div class="form-field form-field--wide"><label for="group">Group <span>*</span></label><div class="group-picker" [class.group-picker--open]="groupPickerOpen"><button type="button" class="select-trigger" (click)="groupPickerOpen = !groupPickerOpen" [class.input--invalid]="isInvalid('group')"><span>{{ selectedGroup || 'Select a group' }}</span><span>⌄</span></button>@if (groupPickerOpen) {<div class="group-options"><input type="search" placeholder="Search groups..." [(ngModel)]="groupSearch" [ngModelOptions]="{ standalone: true }" (click)="$event.stopPropagation()" />@for (group of filteredGroups; track group) {<button type="button" (click)="selectGroup(group)">{{ group }}</button>}@if (!filteredGroups.length) {<span class="group-options__empty">No groups found.</span>}</div>}</div><small class="field-error" *ngIf="isInvalid('group')">Group is required.</small></div><div class="form-field form-field--wide"><label for="description">Description <span>*</span></label><textarea id="description" rows="4" formControlName="description" placeholder="Add a short description about this employee..." [class.input--invalid]="isInvalid('description')"></textarea><small class="field-hint">{{ employeeForm.controls.description.value.length }}/500 characters</small><small class="field-error" *ngIf="isInvalid('description')">Description is required.</small></div></div></section>
      <div class="form-actions"><button type="button" class="button button--ghost" (click)="cancel()">Cancel</button><button type="submit" class="button button--primary">{{ isEditing ? 'Save changes' : 'Save employee' }} <span>→</span></button></div>
    </form>
  `
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
    basicSalary: [0, [Validators.required, Validators.min(1)]],
    status: ['', Validators.required],
    group: ['', Validators.required],
    description: ['', [Validators.required, Validators.maxLength(500)]]
  });
  groupPickerOpen = false;
  groupSearch = '';
  editingEmployeeId: string | null = null;

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
  }

  get filteredGroups(): readonly string[] { return this.groups.filter((group) => group.toLowerCase().includes(this.groupSearch.toLowerCase().trim())); }
  get selectedGroup(): string { return this.employeeForm.controls.group.value; }
  get isEditing(): boolean { return this.editingEmployeeId !== null; }

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
