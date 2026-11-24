import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-employee-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-shell" [class.app-shell--menu-open]="menuOpen">
      <div class="sidebar-backdrop" (click)="menuOpen = false"></div>
      <aside class="sidebar" aria-label="Main navigation">
        <div class="brand">
          <div class="brand__mark">P</div>
          <div><strong>PinPrix</strong><span>Employee management</span></div>
          <button class="icon-button sidebar__close" type="button" aria-label="Close menu" (click)="menuOpen = false">×</button>
        </div>
        <nav class="sidebar__nav">
          <span class="nav-label">Menu</span>
          <a routerLink="/employees" routerLinkActive="nav-item--active" [routerLinkActiveOptions]="{ exact: true }" class="nav-item" (click)="menuOpen = false"><span class="nav-item__icon">▦</span><span>Employee List</span></a>
        </nav>
        <div class="sidebar__footer">
          <div class="profile-mini"><div class="avatar avatar--small">AD</div><div><strong>Admin User</strong><span>Administrator</span></div><button class="icon-button" type="button" aria-label="Log out" (click)="logout()">↪</button></div>
        </div>
      </aside>
      <main class="main-content">
        <header class="topbar">
          <button class="icon-button topbar__menu" type="button" aria-label="Open menu" (click)="menuOpen = true">☰</button>
          <div class="topbar__context"><span>Workspace</span><span>/</span><strong>Employee List</strong></div>
          <div class="topbar__actions"><span class="topbar__bell">♧</span><div class="avatar">AD</div><span class="topbar__username">Admin</span></div>
        </header>
        <div class="page-container"><router-outlet /></div>
      </main>
    </div>
  `
})
export class EmployeeShellComponent {
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  menuOpen = false;

  logout(): void {
    this.authService.logout();
    this.notificationService.info('You have been signed out.');
    void this.router.navigate(['/login']);
  }
}
