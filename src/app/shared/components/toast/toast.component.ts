import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../models/notification.model';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [AsyncPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast-stack" aria-live="polite" aria-atomic="true">
      @for (toast of notifications$ | async; track toast.id) {
        <div class="toast" [class]="'toast--' + toast.type" role="status">
          <span class="toast__icon" aria-hidden="true">{{ iconFor(toast) }}</span>
          <span class="toast__message">{{ toast.message }}</span>
          <button class="toast__close" type="button" aria-label="Close notification" (click)="dismiss(toast.id)">×</button>
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  private readonly notificationService = inject(NotificationService);
  readonly notifications$ = this.notificationService.notifications$;

  dismiss(id: number): void { this.notificationService.dismiss(id); }

  iconFor(toast: Notification): string {
    return toast.type === 'success' ? '✓' : toast.type === 'error' ? '!' : toast.type === 'warning' ? '⚠' : 'i';
  }
}
