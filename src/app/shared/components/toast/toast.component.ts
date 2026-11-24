import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../models/notification.model';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [AsyncPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss'
})
export class ToastComponent {
  private readonly notificationService = inject(NotificationService);
  readonly notifications$ = this.notificationService.notifications$;

  dismiss(id: number): void { this.notificationService.dismiss(id); }

  iconFor(toast: Notification): string {
    return toast.type === 'success' ? '✓' : toast.type === 'error' ? '!' : toast.type === 'warning' ? '⚠' : 'i';
  }
}
