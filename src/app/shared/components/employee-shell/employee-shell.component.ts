import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-employee-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './employee-shell.component.html',
  styleUrl: './employee-shell.component.scss'
})
export class EmployeeShellComponent {
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  menuOpen = false;

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );

  readonly breadcrumb = computed(() => {
    const url = this.currentUrl().split('?')[0].replace(/\/+$/, '');

    if (url.endsWith('/employees/add')) {
      return 'Add employee';
    }

    if (url.includes('/employees/edit/')) {
      return 'Edit employee';
    }

    if (url === '/employees' || url.endsWith('/employees')) {
      return 'Employee List';
    }

    if (url.includes('/employees/')) {
      return 'Employee detail';
    }

    return 'Employee List';
  });

  logout(): void {
    this.authService.logout();
    this.notificationService.info('You have been signed out.');
    void this.router.navigate(['/login']);
  }
}
