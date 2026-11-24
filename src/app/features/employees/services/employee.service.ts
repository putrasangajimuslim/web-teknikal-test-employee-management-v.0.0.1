import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { Employee } from '../../../shared/models/employee.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  // Versioned key prevents malformed records from an older local development build
  // from reappearing after the application has been repaired.
  private readonly storageKey = 'employee-backoffice-employees-v4';
  private readonly employeesSubject = new BehaviorSubject<Employee[]>(this.loadEmployees());
  readonly employees$ = this.employeesSubject.asObservable().pipe(
    map((employees) => employees.filter((employee) => this.isValidEmployee(employee)))
  );

  getAll(): Employee[] {
    return this.employeesSubject.value.filter((employee) => this.isValidEmployee(employee));
  }

  getById(id: string): Employee | undefined {
    return this.getAll().find((employee) => employee.id === id);
  }

  usernameExists(username: string, exceptId?: string): boolean {
    return this.getAll().some(
      (employee) => employee.username.toLowerCase() === username.trim().toLowerCase() && employee.id !== exceptId
    );
  }

  add(employee: Omit<Employee, 'id'>): Employee {
    const created: Employee = {
      ...employee,
      id: this.createId(),
      username: employee.username.trim(),
      firstName: employee.firstName.trim(),
      lastName: employee.lastName.trim(),
      email: employee.email.trim(),
      birthDate: employee.birthDate.trim(),
      basicSalary: Number(employee.basicSalary),
      group: employee.group.trim(),
      description: employee.description.trim()
    };
    this.save([...this.getAll(), created]);
    return created;
  }

  update(id: string, employee: Omit<Employee, 'id'>): Employee | undefined {
    const existing = this.getById(id);
    if (!existing) return undefined;
    const updated: Employee = {
      ...employee,
      id,
      username: employee.username.trim(),
      firstName: employee.firstName.trim(),
      lastName: employee.lastName.trim(),
      email: employee.email.trim(),
      birthDate: employee.birthDate.trim(),
      basicSalary: Number(employee.basicSalary),
      group: employee.group.trim(),
      description: employee.description.trim()
    };
    this.save(this.getAll().map((item) => item.id === id ? updated : item));
    return updated;
  }

  delete(id: string): boolean {
    const existing = this.getById(id);
    if (!existing) return false;
    this.save(this.getAll().filter((employee) => employee.id !== id));
    return true;
  }

  private loadEmployees(): Employee[] {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const validEmployees = parsed.filter((employee): employee is Employee => this.isValidEmployee(employee));
          if (validEmployees.length === parsed.length) return validEmployees;

          // Older or interrupted localStorage writes can leave partial rows behind.
          // Preserve only complete records and discard malformed rows.
          localStorage.setItem(this.storageKey, JSON.stringify(validEmployees));
          return validEmployees;
        }
      } catch {
        localStorage.removeItem(this.storageKey);
      }
    }
    const initial: Employee[] = [];
    for (const legacyKey of ['employee-backoffice-employees', 'employee-backoffice-employees-v2', 'employee-backoffice-employees-v3']) {
      localStorage.removeItem(legacyKey);
    }
    localStorage.setItem(this.storageKey, JSON.stringify(initial));
    return initial;
  }

  private save(employees: Employee[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(employees));
    this.employeesSubject.next(employees);
  }

  private createId(): string {
    return `emp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private isValidEmployee(value: unknown): value is Employee {
    if (!value || typeof value !== 'object') return false;
    const employee = value as Record<string, unknown>;
    const isNonEmptyText = (key: string): boolean =>
      typeof employee[key] === 'string' && (employee[key] as string).trim().length > 0;
    return isNonEmptyText('id')
      && isNonEmptyText('username')
      && isNonEmptyText('firstName')
      && isNonEmptyText('lastName')
      && isNonEmptyText('email')
      && isNonEmptyText('birthDate')
      && typeof employee['basicSalary'] === 'number'
      && Number(employee['basicSalary']) > 0
      && isNonEmptyText('status')
      && isNonEmptyText('group')
      && isNonEmptyText('description');
  }

}
