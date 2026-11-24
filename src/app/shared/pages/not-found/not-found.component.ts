import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="center-page"><div class="not-found"><span class="eyebrow">Error 404</span><h1>Page not found</h1><p>The page you are looking for does not exist or has moved.</p><a class="button button--primary" routerLink="/employees">Back to employees</a></div></main>
  `
})
export class NotFoundComponent {}
