import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DriverService } from '../../services/driver/driver.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-driver-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="driver-screen" [class.is-online]="isOnline">
      <!-- Background Elements -->
      <div class="bg-pattern"></div>
      <div class="glow-orb"></div>

      <!-- Top Navigation -->
      <div class="top-nav">
        <div class="driver-profile">
          <div class="avatar-ring" [class.active]="isOnline">
            <div class="avatar">🧑‍✈️</div>
          </div>
          <div class="profile-info">
            <span class="greeting">Hello, Partner</span>
            <div class="stats">
              <span class="rating">⭐ 4.8</span>
              <span class="dot">•</span>
              <span class="trips">120 Trips</span>
            </div>
          </div>
        </div>
        
        <button class="icon-btn logout" (click)="logout()" title="Logout">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
      
      <!-- Center Content -->
      <div class="main-content">
        <div class="status-visual">
          <div class="radar-container" *ngIf="isOnline">
            <div class="radar-ring r1"></div>
            <div class="radar-ring r2"></div>
            <div class="radar-ring r3"></div>
          </div>
          <div class="center-orb" [class.online]="isOnline">
            <svg *ngIf="!isOnline" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
            <svg *ngIf="isOnline" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
        </div>
        
        <div class="status-text">
          <h2 class="status-title">{{ isOnline ? 'You are Online' : 'You are Offline' }}</h2>
          <p class="status-subtitle">{{ isOnline ? 'Searching for nearby ride requests...' : 'Go online to start earning.' }}</p>
        </div>
      </div>

      <!-- Bottom Action Card -->
      <div class="bottom-card">
        <div class="swipe-container" [class.online-state]="isOnline">
          <div class="swipe-text">{{ isOnline ? 'Swipe to Go Offline' : 'Swipe to Go Online' }}</div>
          
          <div class="swipe-thumb" 
               (touchstart)="onTouchStart($event)"
               (touchmove)="onTouchMove($event)"
               (touchend)="onTouchEnd($event)"
               (mousedown)="onMouseDown($event)"
               [style.transform]="'translateX(' + swipeX + 'px)'">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .driver-screen {
      position: relative;
      min-height: 100dvh;
      background: #F8FAFC;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: background 0.5s ease;
    }
    
    .driver-screen.is-online { background: #111827; }

    /* Background Aesthetics */
    .bg-pattern {
      position: absolute; inset: 0; opacity: 0.4; z-index: 0;
      background-image: radial-gradient(#CBD5E1 1px, transparent 1px);
      background-size: 24px 24px; transition: opacity 0.5s;
    }
    .driver-screen.is-online .bg-pattern {
      opacity: 0.1; background-image: radial-gradient(#4B5563 1px, transparent 1px);
    }
    .glow-orb {
      position: absolute; top: -100px; right: -100px; width: 300px; height: 300px;
      background: radial-gradient(circle, rgba(217,119,6,0.15) 0%, transparent 70%);
      border-radius: 50%; z-index: 0; filter: blur(20px); transition: all 0.8s ease;
    }
    .driver-screen.is-online .glow-orb {
      top: 20%; left: 50%; transform: translateX(-50%); width: 400px; height: 400px;
      background: radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%);
    }

    /* Top Navigation */
    .top-nav {
      position: relative; z-index: 10;
      display: flex; justify-content: space-between; align-items: center;
      padding: calc(16px + var(--safe-top)) 20px 16px;
    }
    .driver-profile { display: flex; align-items: center; gap: 12px; }
    .avatar-ring {
      width: 50px; height: 50px; border-radius: 50%; background: #fff;
      display: flex; align-items: center; justify-content: center;
      border: 2px solid #E2E8F0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      transition: all 0.3s;
    }
    .avatar-ring.active { border-color: var(--success); box-shadow: 0 0 16px rgba(34,197,94,0.3); }
    .avatar { font-size: 24px; }
    
    .profile-info { display: flex; flex-direction: column; gap: 4px; }
    .greeting { font-family: 'Outfit', sans-serif; font-size: 18px; font-weight: 800; color: #1E293B; letter-spacing: -0.3px; transition: color 0.3s; }
    .driver-screen.is-online .greeting { color: #F8FAFC; }
    
    .stats { display: flex; align-items: center; gap: 6px; font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600; color: #64748B; }
    .driver-screen.is-online .stats { color: #94A3B8; }
    .dot { font-size: 8px; opacity: 0.5; }
    
    .icon-btn {
      width: 44px; height: 44px; border-radius: 12px; border: 1.5px solid #E2E8F0;
      background: #fff; display: flex; align-items: center; justify-content: center;
      color: #64748B; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    .driver-screen.is-online .icon-btn {
      background: #1F2937; border-color: #374151; color: #94A3B8;
    }
    .icon-btn:active { transform: scale(0.95); }

    /* Center Content */
    .main-content {
      flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
      position: relative; z-index: 10; padding: 20px;
    }
    .status-visual {
      position: relative; width: 160px; height: 160px; display: flex; align-items: center; justify-content: center; margin-bottom: 32px;
    }
    
    .center-orb {
      width: 80px; height: 80px; border-radius: 50%;
      background: #fff; color: #94A3B8; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 12px 32px rgba(0,0,0,0.08); transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 2; position: relative; border: 4px solid #F1F5F9;
    }
    .center-orb.online {
      background: var(--success); color: #fff; border-color: rgba(34,197,94,0.2);
      box-shadow: 0 12px 32px rgba(34,197,94,0.3); transform: scale(1.1);
    }
    
    /* Radar Animation */
    .radar-container { position: absolute; inset: -40px; display: flex; align-items: center; justify-content: center; z-index: 1; }
    .radar-ring {
      position: absolute; width: 100%; height: 100%; border-radius: 50%;
      border: 2px solid var(--success); opacity: 0;
      animation: ripple 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    }
    .r2 { animation-delay: 0.8s; }
    .r3 { animation-delay: 1.6s; }
    
    @keyframes ripple {
      0% { transform: scale(0.5); opacity: 0.8; border-width: 4px; }
      100% { transform: scale(1.5); opacity: 0; border-width: 1px; }
    }

    .status-text { text-align: center; }
    .status-title {
      font-family: 'Outfit', sans-serif; font-size: 28px; font-weight: 800; color: #1E293B;
      margin: 0 0 12px; transition: color 0.3s; letter-spacing: -0.5px;
    }
    .driver-screen.is-online .status-title { color: #fff; }
    .status-subtitle {
      font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 500; color: #64748B; margin: 0; transition: color 0.3s;
    }
    .driver-screen.is-online .status-subtitle { color: #94A3B8; }

    /* Bottom Action Card & Swiper */
    .bottom-card {
      position: relative; z-index: 10; margin: 0 16px max(24px, var(--safe-bottom));
      background: transparent; border-radius: 24px; padding: 0;
      transition: all 0.4s ease;
    }

    .swipe-container {
      position: relative; width: 100%; height: 68px; background: #FFFBEB;
      border-radius: 34px; display: flex; align-items: center; justify-content: center;
      overflow: hidden; border: 2px solid #FDE68A; transition: all 0.3s ease;
      box-shadow: 0 10px 40px rgba(217,119,6,0.15);
    }
    .swipe-container.online-state { background: #FEF2F2; border-color: #FECACA; box-shadow: 0 10px 40px rgba(239,68,68,0.15); }
    
    .swipe-text {
      font-family: 'Outfit', sans-serif; font-size: 17px; font-weight: 800; color: #D97706;
      z-index: 1; pointer-events: none; transition: opacity 0.3s; letter-spacing: 0.5px;
    }
    .swipe-container.online-state .swipe-text { color: #EF4444; }
    
    .swipe-thumb {
      position: absolute; left: 4px; top: 4px; bottom: 4px; width: 60px;
      background: var(--primary-gradient); border-radius: 30px; display: flex; align-items: center;
      justify-content: center; color: white; cursor: grab; z-index: 2;
      box-shadow: 0 4px 16px rgba(217, 119, 6, 0.4); transition: transform 0.1s linear; touch-action: none;
    }
    .swipe-container.online-state .swipe-thumb {
      background: #EF4444; box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4);
    }
    .swipe-thumb:active { cursor: grabbing; transition: none; }
  `]
})
export class DriverHomeComponent implements OnInit {
  private driverService = inject(DriverService);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  isOnline = false;
  
  swipeX = 0;
  startX = 0;
  maxSwipe = 0;
  isDragging = false;

  ngOnInit() {
    this.driverService.isOnline$.subscribe(status => {
      this.isOnline = status;
    });
  }

  onTouchStart(e: TouchEvent) {
    this.isDragging = true;
    this.startX = e.touches[0].clientX - this.swipeX;
    const container = (e.target as HTMLElement).closest('.swipe-container') as HTMLElement;
    this.maxSwipe = container.offsetWidth - 68; // thumb width + padding
  }

  onTouchMove(e: TouchEvent) {
    if (!this.isDragging) return;
    const x = e.touches[0].clientX - this.startX;
    this.swipeX = Math.max(0, Math.min(x, this.maxSwipe));
  }

  onTouchEnd(e: TouchEvent) {
    this.isDragging = false;
    if (this.swipeX > this.maxSwipe * 0.8) {
      this.swipeX = 0; // reset visually
      this.toggleStatus();
    } else {
      this.swipeX = 0;
    }
  }

  onMouseDown(e: MouseEvent) {
    this.isDragging = true;
    this.startX = e.clientX - this.swipeX;
    const container = (e.target as HTMLElement).closest('.swipe-container') as HTMLElement;
    this.maxSwipe = container.offsetWidth - 68;
    
    const onMouseMove = (ev: MouseEvent) => {
      if (!this.isDragging) return;
      const x = ev.clientX - this.startX;
      this.swipeX = Math.max(0, Math.min(x, this.maxSwipe));
    };
    
    const onMouseUp = () => {
      this.isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      
      if (this.swipeX > this.maxSwipe * 0.8) {
        this.swipeX = 0; // reset visually
        this.toggleStatus();
      } else {
        this.swipeX = 0;
      }
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  toggleStatus() {
    this.driverService.toggleOnlineStatus(!this.isOnline);
  }

  logout() {
    this.driverService.toggleOnlineStatus(false); // Go offline before logout
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
