import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authKey = 'employee-backoffice-authenticated';
  private readonly username = 'admin';
  private readonly password = 'admin123';

  isAuthenticated(): boolean {
    return localStorage.getItem(this.authKey) === 'true';
  }

  login(username: string, password: string): boolean {
    const valid = username.trim() === this.username && password === this.password;
    if (valid) {
      localStorage.setItem(this.authKey, 'true');
    }
    return valid;
  }

  logout(): void {
    localStorage.removeItem(this.authKey);
  }
}
