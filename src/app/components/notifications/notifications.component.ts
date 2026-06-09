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
      background: #FAFAFA; overflow: hidden;
    }
    .header {
      padding: calc(16px + env(safe-area-inset-top, 0px)) 16px 16px;
      background: #ffffff; display: flex; align-items: center; gap: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04); z-index: 10;
    }
    .back-btn {
      width: 40px; height: 40px; background: #F9FAFB; border: 1px solid #E5E7EB;
      border-radius: 12px; display: flex; align-items: center; justify-content: center;
      cursor: pointer; flex-shrink: 0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }
    .header h1 {
      font-family: 'Outfit', sans-serif; font-size: 20px; font-weight: 800;
      color: #111827; margin: 0;
    }
    .notif-list {
      flex: 1; padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px;
    }
    .notif-card {
      background: #ffffff; border-radius: 16px; padding: 16px;
      display: flex; align-items: flex-start; gap: 16px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.03); border: 1px solid #F3F4F6;
      position: relative;
    }
    .notif-card.unread::after {
      content: ''; position: absolute; top: 16px; right: 16px;
      width: 8px; height: 8px; background: #EF4444; border-radius: 50%;
    }
    .notif-icon-wrap {
      width: 48px; height: 48px; border-radius: 50%; display: flex;
      align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;
    }
    .notif-icon-wrap.offer { background: #FEF3C7; color: #D97706; }
    .notif-icon-wrap.ride { background: #DBEAFE; color: #2563EB; }
    .notif-icon-wrap.system { background: #F3F4F6; color: #4B5563; }
    
    .notif-content { flex: 1; min-width: 0; padding-right: 12px; }
    .notif-content strong {
      display: block; font-family: 'Outfit', sans-serif; font-size: 16px;
      font-weight: 700; color: #111827; margin-bottom: 4px;
    }
    .notif-content p {
      font-family: 'Inter', sans-serif; font-size: 13px; color: #6B7280;
      line-height: 1.4; margin: 0 0 8px;
    }
    .notif-time {
      font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 600; color: #9CA3AF;
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
