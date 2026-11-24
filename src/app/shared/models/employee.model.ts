export type EmployeeStatus = 'Permanent' | 'Contract' | 'Probation' | 'Internship';

export interface Employee {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  basicSalary: number;
  status: EmployeeStatus;
  group: string;
  description: string;
}

export const EMPLOYEE_STATUSES: readonly EmployeeStatus[] = [
  'Permanent',
  'Contract',
  'Probation',
  'Internship'
];

export const EMPLOYEE_GROUPS: readonly string[] = [
  'Engineering',
  'Human Resources',
  'Finance',
  'Marketing',
  'Sales',
  'Operations',
  'Product',
  'Customer Support',
  'Information Technology',
  'Administration'
];
