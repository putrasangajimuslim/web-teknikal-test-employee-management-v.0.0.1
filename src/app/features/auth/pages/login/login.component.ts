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
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
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