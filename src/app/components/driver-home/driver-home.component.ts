import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DriverService } from '../../services/driver/driver.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-driver-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="driver-screen">
      <div class="header">
        <h2>Driver Dashboard</h2>
        <button class="logout-btn" (click)="logout()">Logout</button>
      </div>
      
      <div class="status-card" [class.online]="isOnline">
        <div class="status-indicator"></div>
        <h3>{{ isOnline ? 'You are Online' : 'You are Offline' }}</h3>
        <p>{{ isOnline ? 'Waiting for ride requests...' : 'Go online to start receiving rides.' }}</p>
        
        <button class="toggle-btn" (click)="toggleStatus()">
          {{ isOnline ? 'Go Offline' : 'Go Online' }}
        </button>
      </div>

      <!-- We will show incoming rides here later -->
    </div>
  `,
  styles: [`
    .driver-screen {
      padding: var(--safe-top) 16px max(24px, var(--safe-bottom));
      min-height: 100dvh;
      background: var(--bg-color);
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 16px;
    }
    h2 {
      font-family: 'Outfit', sans-serif;
      font-size: 24px;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
    }
    .logout-btn {
      background: none;
      border: none;
      color: var(--danger, #ff4d4f);
      font-weight: 600;
      cursor: pointer;
    }
    .status-card {
      background: var(--surface);
      border-radius: var(--radius-lg);
      padding: 32px 24px;
      text-align: center;
      box-shadow: var(--shadow-md);
      border: 2px solid transparent;
      transition: all 0.3s ease;
    }
    .status-card.online {
      border-color: var(--success, #52c41a);
      background: rgba(82, 196, 26, 0.05);
    }
    .status-indicator {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: var(--text-tertiary);
      margin: 0 auto 16px;
      transition: background 0.3s ease;
    }
    .status-card.online .status-indicator {
      background: var(--success, #52c41a);
      box-shadow: 0 0 15px rgba(82, 196, 26, 0.4);
    }
    h3 {
      font-family: 'Outfit', sans-serif;
      font-size: 20px;
      margin: 0 0 8px;
    }
    p {
      color: var(--text-secondary);
      font-size: 14px;
      margin: 0 0 24px;
    }
    .toggle-btn {
      width: 100%;
      padding: 16px;
      border-radius: var(--radius-md);
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      background: var(--primary);
      color: #fff;
      transition: opacity 0.2s;
    }
    .status-card.online .toggle-btn {
      background: var(--danger, #ff4d4f);
    }
  `]
})
export class DriverHomeComponent implements OnInit {
  private driverService = inject(DriverService);
  private authService = inject(AuthService);
  
  isOnline = false;

  ngOnInit() {
    this.driverService.isOnline$.subscribe(status => {
      this.isOnline = status;
    });
  }

  toggleStatus() {
    this.driverService.toggleOnlineStatus(!this.isOnline);
  }

  logout() {
    this.driverService.toggleOnlineStatus(false); // Go offline before logout
    this.authService.logout();
  }
}
