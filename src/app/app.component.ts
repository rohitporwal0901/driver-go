import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationService } from './services/notification/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class AppComponent {
  private notificationService = inject(NotificationService);

  constructor() {
    this.notificationService.initPush();
  }
}
