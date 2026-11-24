import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Notification, NotificationType } from '../../shared/models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly notificationsSubject = new BehaviorSubject<Notification[]>([]);
  readonly notifications$ = this.notificationsSubject.asObservable();
  private nextId = 1;

  show(message: string, type: NotificationType = 'info', duration = 4000): void {
    const notification: Notification = { id: this.nextId++, type, message };
    this.notificationsSubject.next([...this.notificationsSubject.value, notification]);
    window.setTimeout(() => this.dismiss(notification.id), duration);
  }

  success(message: string): void { this.show(message, 'success'); }
  error(message: string): void { this.show(message, 'error'); }
  warning(message: string): void { this.show(message, 'warning'); }
  info(message: string): void { this.show(message, 'info'); }

  dismiss(id: number): void {
    this.notificationsSubject.next(this.notificationsSubject.value.filter((item) => item.id !== id));
  }
}
