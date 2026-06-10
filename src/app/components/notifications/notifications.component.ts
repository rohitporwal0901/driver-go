import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications-screen">
      <!-- Header -->
      <div class="header">
        <button class="back-btn" id="back-btn" (click)="goBack()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </button>
        <h1>Notifications</h1>
      </div>

      <!-- Notifications List -->
      <div class="notif-list">
        <div class="notif-card unread" *ngFor="let n of notifications">
          <div class="notif-icon-wrap" [ngClass]="n.type">
            <span class="notif-icon">{{ n.icon }}</span>
          </div>
          <div class="notif-content">
            <strong>{{ n.title }}</strong>
            <p>{{ n.message }}</p>
            <span class="notif-time">{{ n.time }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notifications-screen {
      width: 100%; height: 100dvh; display: flex; flex-direction: column;
      background: var(--bg-color); overflow: hidden;
    }
    .header {
      padding: calc(16px + var(--safe-top)) 16px 16px;
      background: var(--surface); display: flex; align-items: center; gap: 16px;
      box-shadow: var(--shadow-sm); z-index: 10;
    }
    .back-btn {
      width: 40px; height: 40px; background: var(--bg-color); border: 1px solid var(--border-color);
      border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center;
      cursor: pointer; flex-shrink: 0; box-shadow: var(--shadow-sm);
    }
    .header h1 {
      font-family: 'Outfit', sans-serif; font-size: 20px; font-weight: 800;
      color: var(--text-primary); margin: 0;
    }
    .notif-list {
      flex: 1; padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px;
    }
    .notif-card {
      background: var(--surface); border-radius: var(--radius-md); padding: 16px;
      display: flex; align-items: flex-start; gap: 16px;
      box-shadow: var(--shadow-sm); border: 1px solid var(--border-color);
      position: relative;
    }
    .notif-card.unread::after {
      content: ''; position: absolute; top: 16px; right: 16px;
      width: 8px; height: 8px; background: var(--error); border-radius: 50%;
    }
    .notif-icon-wrap {
      width: 48px; height: 48px; border-radius: 50%; display: flex;
      align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;
    }
    .notif-icon-wrap.offer { background: #FEF3C7; color: #D97706; }
    .notif-icon-wrap.ride { background: #DBEAFE; color: #2563EB; }
    .notif-icon-wrap.system { background: var(--bg-color); color: var(--text-secondary); }
    
    .notif-content { flex: 1; min-width: 0; padding-right: 12px; }
    .notif-content strong {
      display: block; font-family: 'Outfit', sans-serif; font-size: 16px;
      font-weight: 700; color: var(--text-primary); margin-bottom: 4px;
    }
    .notif-content p {
      font-family: 'Inter', sans-serif; font-size: 13px; color: var(--text-secondary);
      line-height: 1.4; margin: 0 0 8px;
    }
    .notif-time {
      font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 600; color: var(--text-tertiary);
    }
  `]
})
export class NotificationsComponent {
  notifications = [
    {
      type: 'offer',
      icon: '🎉',
      title: '50% off on your next ride!',
      message: 'Use code RAPIDO50 to get a flat 50% discount on your next ride up to ₹50.',
      time: '10 mins ago'
    },
    {
      type: 'ride',
      icon: '🚗',
      title: 'Ride completed successfully',
      message: 'Your ride from Ujjain to Indore was completed. Hope you had a great trip!',
      time: '2 hours ago'
    },
    {
      type: 'system',
      icon: '👋',
      title: 'Welcome to DriveGo',
      message: 'Experience the fastest and safest rides. Start booking now!',
      time: '1 day ago'
    }
  ];

  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/home']);
  }
}
