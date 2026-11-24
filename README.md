# Teknikaltest Employee Management

A responsive Angular backoffice for managing employee records. The application is fully client-side: demo employee data and application state are persisted in the browser with `localStorage`, so no external backend or database is required.

## Features

- Credential-based login with route guards and persisted authentication.
- Starts with an empty employee list so records can be added intentionally.
- Employee table with username/email AND search, reset, sorting, and pagination.
- Page sizes of 5, 10, 25, 50, and 100 records.
- Add employee form using Angular Reactive Forms and complete validation.
- Searchable group picker with exactly 10 predefined groups.
- Employee detail page with localized date and Indonesian Rupiah formatting.
- Delete confirmation and edit-action warning notification.
- Reusable toast notifications with automatic and manual dismissal.
- Responsive sidebar, table scrolling, form layout, and mobile navigation.
- Filter, sort, and pagination state preserved through route query parameters.

## Technology Stack

- Angular standalone components (v20)
- TypeScript with strict compiler options
- SCSS
- Angular Router and Reactive Forms
- RxJS
- Browser `localStorage`
- npm

## Requirements

- Node.js 20.19+ (Node.js 24 is also supported)
- npm 10+
- A modern browser

## Installation and Development Setup

From this project root directory:

```bash
npm install
npm start
```

Open the local development server shown by Angular CLI, normally `http://localhost:4200/`.

This project does not use Docker, a backend server, or an external database.

## Login Credentials

| Username | Password |
| --- | --- |
| `admin` | `admin123` |

## Folder Structure

```text
src/app/
├── core/
│   ├── guards/          # Authentication route guards
│   └── services/        # Auth and notification services
├── features/
│   ├── auth/pages/login/
│   └── employees/
│       ├── pages/       # List, add, and detail pages
│       └── services/    # Employee localStorage data service
└── shared/
    ├── components/      # Shell and toast UI
    ├── models/          # Employee and notification interfaces
    └── pages/           # Shared not-found page
```

## Employee Data Model

```ts
interface Employee {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  basicSalary: number;
  status: 'Permanent' | 'Contract' | 'Probation' | 'Internship';
  group: string;
  description: string;
}
```

## Available Routes

- `/login` — sign in
- `/employees` — employee list
- `/employees/add` — add an employee
- `/employees/:id` — employee details

Employee routes require authentication. A wildcard route displays a not-found page.

## Data Persistence

Employee records are stored under `employee-backoffice-employees-v4`. Authentication is stored under `employee-backoffice-authenticated`. The employee list starts empty and new records are persisted in the browser. Clearing browser storage clears employee records and signs out the user.

## Build and Testing

```bash
npm run build
npm test
```

The production build is emitted to `dist/teknikaltest-employee-management`.
