import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  template: `
    <main class="auth-page">
      <section class="auth-panel">
        <div class="auth-form-wrap">
          <div class="prix-logo"><span class="prix-logo__mark"></span><strong>PRIX</strong></div>
          <div class="auth-form-heading">
            <h2>Sign In</h2>
          </div>
          <form [formGroup]="loginForm" (ngSubmit)="submit()" novalidate>
            <div class="form-field">
              <label for="username">Email</label>
              <input id="username" type="text" formControlName="username" autocomplete="username" placeholder="Enter your email" [class.input--invalid]="isInvalid('username')" />
              <small class="field-error" *ngIf="isInvalid('username')">Email is required.</small>
            </div>
            <div class="form-field">
              <label for="password">Password</label>
              <div class="password-field">
                <input id="password" [type]="showPassword ? 'text' : 'password'" formControlName="password" autocomplete="current-password" placeholder="Enter your password" [class.input--invalid]="isInvalid('password')" />
                <button type="button" class="password-toggle" (click)="showPassword = !showPassword" [attr.aria-label]="showPassword ? 'Hide password' : 'Show password'">{{ showPassword ? 'Hide' : 'Show' }}</button>
              </div>
              <small class="field-error" *ngIf="isInvalid('password')">Password is required.</small>
            </div>
            <button class="button button--primary button--full" type="submit" [disabled]="loading"><span *ngIf="loading" class="spinner"></span>{{ loading ? 'Signing in...' : 'Sign In' }}</button>
          </form>
          <div class="demo-hint"><span>Demo:</span><code>admin</code><span>/</span><code>admin123</code></div>
          <small class="auth-copyright">Copyright 2025 Prix Proseguidos Internacional. All rights reserved.</small>
        </div>
      </section>
      <section class="auth-visual">
        <div class="auth-visual__content">
          <div class="brand brand--light"><div class="brand__mark">P</div><div><strong>PRIX</strong><span>Employee management</span></div></div>
          <div class="auth-visual__copy"><span class="eyebrow eyebrow--light">The International Account that connects you with the world</span><h1>Manage your team<br /><em>from one place.</em></h1><p>With Prix, manage your payments simply, quickly, and efficiently.</p><a class="visual-link" href="#" (click)="$event.preventDefault()">Get Started <span>></span></a></div>
          <div class="auth-visual__art"><div class="scene-glow scene-glow--one"></div><div class="scene-glow scene-glow--two"></div><div class="scene-window"></div><div class="scene-person"><div class="scene-person__head"></div><div class="scene-person__body"></div></div><div class="art-card"><div class="art-card__bar"></div><div class="art-card__row"><span></span><span></span><span></span></div><div class="art-card__row"><span></span><span></span><span></span></div><div class="art-card__row"><span></span><span></span><span></span></div></div></div>
          <small class="auth-visual__copyright">© 2025 Prix. All rights reserved.</small>
        </div>
      </section>
    </main>
  `
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  readonly loginForm = this.fb.nonNullable.group({ username: ['', Validators.required], password: ['', Validators.required] });
  showPassword = false;
  loading = false;

  isInvalid(field: 'username' | 'password'): boolean {
    const control = this.loginForm.controls[field];
    return control.invalid && (control.dirty || control.touched);
  }

  socialLogin(provider: string): void { this.notificationService.info(`Sign in with ${provider} will be available soon.`); }

  submit(): void {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid || this.loading) return;
    this.loading = true;
    window.setTimeout(() => {
      const { username, password } = this.loginForm.getRawValue();
      if (this.authService.login(username, password)) {
        this.notificationService.success('Signed in successfully.');
        void this.router.navigate(['/employees']);
      } else {
        this.notificationService.error('Invalid username or password.');
      }
      this.loading = false;
    }, 650);
  }
}