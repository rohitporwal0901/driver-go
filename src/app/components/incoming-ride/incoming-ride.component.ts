import { Component, inject, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification/notification.service';
import { RideService, RideRequest } from '../../services/ride/ride.service';
import { Firestore, doc, updateDoc, arrayUnion } from '@angular/fire/firestore';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-incoming-ride',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="incoming-call-screen">
      <!-- Background Map (Mock) with Dark Overlay -->
      <div class="map-bg"></div>
      <div class="overlay"></div>

      <div class="bottom-sheet">
        <!-- Timer Progress Bar -->
        <div class="timer-bar">
          <div class="timer-progress"></div>
        </div>

        <div class="card-content">
          <!-- Header: Vehicle & Fare -->
          <div class="sheet-header">
            <div class="vehicle-info">
              <div class="vehicle-icon">🏍️</div>
              <div class="vehicle-text">
                <span class="v-type">Bike</span>
                <span class="v-time">2 min away</span>
              </div>
            </div>
            <div class="fare-info">
              <span class="fare-est">₹ 45</span>
              <span class="fare-label">Estimated</span>
            </div>
          </div>

          <div class="divider"></div>

          <!-- Locations -->
          <div class="locations">
            <div class="loc-row">
              <div class="node pickup"></div>
              <div class="loc-details">
                <p class="loc-title">PICKUP</p>
                <p class="loc-address">{{ rideData?.pickupAddress || 'Vijay Nagar Square' }}</p>
              </div>
            </div>
            <div class="route-line"></div>
            <div class="loc-row">
              <div class="node drop"></div>
              <div class="loc-details">
                <p class="loc-title">DROP</p>
                <p class="loc-address">{{ rideData?.dropAddress || 'Bhawarkua Main Road' }}</p>
              </div>
            </div>
          </div>

          <!-- Trip Stats -->
          <div class="trip-stats">
            <div class="stat-box">
              <span class="stat-val">4.5 km</span>
              <span class="stat-lbl">Distance</span>
            </div>
            <div class="stat-box">
              <span class="stat-val">Cash</span>
              <span class="stat-lbl">Payment</span>
            </div>
          </div>

          <!-- Swipe Action -->
          <div class="swipe-action-container">
            <div class="swipe-track" #track>
              <div class="swipe-bg decline-bg" [style.width]="getDeclineWidth()"></div>
              <div class="swipe-bg accept-bg" [style.width]="getAcceptWidth()"></div>
              
              <div class="swipe-labels">
                <span class="decline-label" [style.opacity]="getDeclineOpacity()">« DECLINE</span>
                <span class="accept-label" [style.opacity]="getAcceptOpacity()">ACCEPT »</span>
              </div>

              <div class="swipe-thumb"
                   (touchstart)="onTouchStart($event)"
                   (mousedown)="onTouchStart($event)"
                   [style.transform]="'translateX(' + currentX + 'px)'"
                   [class.animate]="isReturning">
                <div class="thumb-icon" [ngClass]="getThumbIconClass()">
                  <!-- SVG for better arrow -->
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="13 17 18 12 13 7"></polyline>
                    <polyline points="11 17 6 12 11 7"></polyline>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .incoming-call-screen {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: #111827;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      overflow: hidden;
    }
    
    .map-bg {
      position: absolute; inset: 0;
      background: url('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png') center/cover;
      filter: blur(10px) brightness(0.7);
      transform: scale(1.1);
      z-index: 0;
    }
    .overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to bottom, rgba(17,24,39,0.3) 0%, rgba(17,24,39,0.8) 100%);
      z-index: 1;
    }

    .bottom-sheet {
      position: relative;
      z-index: 10;
      background: #FFFFFF;
      border-radius: 28px 28px 0 0;
      box-shadow: 0 -8px 32px rgba(0,0,0,0.15);
      width: 100%;
      animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      overflow: hidden;
    }
    
    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }

    .timer-bar {
      height: 6px;
      background: #F1F5F9;
      width: 100%;
    }
    .timer-progress {
      height: 100%;
      background: #22C55E;
      width: 100%;
      animation: countdown 15s linear forwards;
    }
    @keyframes countdown {
      0% { width: 100%; background: #22C55E; }
      50% { background: #EAB308; }
      100% { width: 0%; background: #EF4444; }
    }

    .card-content {
      padding: 24px 20px max(32px, var(--safe-bottom));
    }

    .sheet-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .vehicle-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .vehicle-icon {
      width: 48px; height: 48px;
      background: #F8FAFC;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 24px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    .vehicle-text {
      display: flex; flex-direction: column; gap: 2px;
    }
    .v-type { font-family: 'Outfit', sans-serif; font-size: 20px; font-weight: 800; color: #1E293B; }
    .v-time { font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; color: #22C55E; }
    
    .fare-info {
      text-align: right;
      display: flex; flex-direction: column; gap: 2px;
    }
    .fare-est { font-family: 'Outfit', sans-serif; font-size: 26px; font-weight: 800; color: #1E293B; }
    .fare-label { font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.5px; }

    .divider {
      height: 1px; background: #F1F5F9; width: 100%; margin: 20px 0;
    }

    .locations {
      position: relative;
      margin-bottom: 24px;
      padding-left: 8px;
    }
    .loc-row {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      position: relative;
      z-index: 2;
    }
    .loc-row:not(:last-child) { margin-bottom: 24px; }
    
    .node {
      width: 14px; height: 14px; border-radius: 50%;
      margin-top: 4px; border: 3px solid #FFF; box-shadow: 0 0 0 1.5px #E2E8F0;
      background: white; flex-shrink: 0;
    }
    .node.pickup { background: #22C55E; box-shadow: 0 0 0 1.5px #22C55E; }
    .node.drop { background: #EF4444; box-shadow: 0 0 0 1.5px #EF4444; }
    
    .route-line {
      position: absolute;
      left: 14px; top: 18px; bottom: 18px;
      width: 2px; background: #E2E8F0;
      z-index: 1;
    }
    
    .loc-details { display: flex; flex-direction: column; gap: 4px; }
    .loc-title { font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 700; color: #94A3B8; margin: 0; letter-spacing: 0.5px; }
    .loc-address { font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 600; color: #1E293B; margin: 0; line-height: 1.4; }

    .trip-stats {
      display: flex;
      gap: 16px;
      margin-bottom: 32px;
    }
    .stat-box {
      flex: 1;
      background: #F8FAFC;
      border: 1px solid #F1F5F9;
      border-radius: 16px;
      padding: 12px 16px;
      display: flex; flex-direction: column; gap: 4px;
    }
    .stat-val { font-family: 'Outfit', sans-serif; font-size: 18px; font-weight: 800; color: #1E293B; }
    .stat-lbl { font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500; color: #64748B; }

    .swipe-action-container {
      width: 100%;
    }
    .swipe-track {
      position: relative;
      height: 64px;
      background: #111827; /* Dark Rapido track */
      border-radius: 32px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(17,24,39,0.15);
    }
    .swipe-labels {
      position: absolute;
      width: 100%;
      display: flex;
      justify-content: space-between;
      padding: 0 24px;
      pointer-events: none;
      font-family: 'Inter', sans-serif;
      font-weight: 800;
      font-size: 14px;
      color: rgba(255,255,255,0.6);
      z-index: 1;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .accept-label { color: #FACC15; } /* Yellow hint for accept */
    
    .swipe-bg {
      position: absolute;
      top: 0;
      height: 100%;
      z-index: 0;
      transition: width 0.1s;
    }
    .decline-bg { right: 50%; background: #EF4444; }
    .accept-bg { left: 50%; background: #22C55E; }
    
    .swipe-thumb {
      position: absolute;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #FACC15; /* Rapido Yellow */
      z-index: 2;
      cursor: grab;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(250,204,21,0.4);
      touch-action: none;
    }
    .swipe-thumb:active { cursor: grabbing; transform: scale(0.95); }
    .swipe-thumb.animate { transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    
    .thumb-icon {
      display: flex; align-items: center; justify-content: center;
      color: #111827; /* Black icon on yellow */
      transition: all 0.2s;
    }
    .thumb-icon.accept { color: #FFF; }
    .thumb-icon.decline { color: #FFF; }
  `]
})
export class IncomingRideComponent implements OnInit {
  private notifService = inject(NotificationService);
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private router = inject(Router);

  rideData: any = null;
  audio = new Audio('assets/ringtone.mp3');

  @ViewChild('track') trackElement!: ElementRef;

  currentX = 0;
  startX = 0;
  isDragging = false;
  isReturning = false;
  maxSwipe = 0;

  ngOnInit() {
    this.audio.loop = true;
    this.audio.play().catch(e => console.log('Audio play blocked by browser', e));

    this.notifService.incomingRideSubject.subscribe(data => {
      if (data) {
        this.rideData = data;
      } else {
        this.rideData = { rideId: 'mock-id', pickupAddress: 'Vijay Nagar Square', dropAddress: 'Bhawarkua Main Road' };
      }
    });
  }

  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:touchmove', ['$event'])
  onGlobalMove(e: TouchEvent | MouseEvent) {
    if (!this.isDragging) return;
    this.onTouchMove(e);
  }

  @HostListener('document:mouseup')
  @HostListener('document:touchend')
  onGlobalEnd() {
    if (!this.isDragging) return;
    this.onTouchEnd();
  }

  onTouchStart(e: TouchEvent | MouseEvent) {
    this.isDragging = true;
    this.isReturning = false;
    const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
    this.startX = clientX - this.currentX;

    if (this.trackElement) {
      const trackWidth = this.trackElement.nativeElement.offsetWidth;
      this.maxSwipe = (trackWidth / 2) - 28 - 4;
    } else {
      this.maxSwipe = (window.innerWidth - 40) / 2 - 32;
    }
  }

  onTouchMove(e: TouchEvent | MouseEvent) {
    if (!this.isDragging) return;

    if (e.cancelable) {
      e.preventDefault();
    }

    const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
    const x = clientX - this.startX;

    this.currentX = Math.max(-this.maxSwipe, Math.min(this.maxSwipe, x));
  }

  onTouchEnd() {
    if (!this.isDragging) return;
    this.isDragging = false;

    const threshold = this.maxSwipe * 0.75;

    if (this.currentX >= threshold) {
      this.currentX = this.maxSwipe;
      this.accept();
    } else if (this.currentX <= -threshold) {
      this.currentX = -this.maxSwipe;
      this.decline();
    } else {
      this.isReturning = true;
      this.currentX = 0;
    }
  }

  getAcceptWidth(): string {
    return this.currentX > 0 ? `${(this.currentX / this.maxSwipe) * 50}%` : '0%';
  }

  getDeclineWidth(): string {
    return this.currentX < 0 ? `${(-this.currentX / this.maxSwipe) * 50}%` : '0%';
  }

  getAcceptOpacity(): number {
    return this.currentX < 0 ? 0.3 : 1;
  }

  getDeclineOpacity(): number {
    return this.currentX > 0 ? 0.3 : 1;
  }

  getThumbIconClass(): string {
    if (this.currentX > 20) return 'accept';
    if (this.currentX < -20) return 'decline';
    return 'neutral';
  }

  async decline() {
    this.audio.pause();

    if (this.rideData?.rideId) {
      try {
        const profile: any = await this.getCurrentProfile();
        if (profile?.uid) {
          const docRef = doc(this.firestore, `rides/${this.rideData.rideId}`);
          
          if (this.rideData.requestedDriverId === profile.uid) {
            await updateDoc(docRef, {
              status: 'rejected',
              declinedBy: arrayUnion(profile.uid)
            });
          } else {
            await updateDoc(docRef, {
              declinedBy: arrayUnion(profile.uid)
            });
          }
        }
      } catch (e) {
        console.error('Error updating declined status:', e);
      }
    }

    setTimeout(() => {
      this.router.navigate(['/driver-home']);
    }, 200);
  }

  async accept() {
    this.audio.pause();
    if (!this.rideData?.rideId) {
      setTimeout(() => {
        this.router.navigate(['/driver-home']);
      }, 200);
      return;
    }

    try {
      const profile: any = await this.getCurrentProfile();
      const otp = Math.floor(1000 + Math.random() * 9000).toString();

      const docRef = doc(this.firestore, `rides/${this.rideData.rideId}`);
      await updateDoc(docRef, {
        status: 'accepted',
        driverId: profile.uid,
        otp: otp
      });

      setTimeout(() => {
        this.router.navigate(['/driver-tracking', this.rideData.rideId]);
      }, 200);
    } catch (e) {
      console.error(e);
      setTimeout(() => {
        this.router.navigate(['/driver-home']);
      }, 200);
    }
  }

  private async getCurrentProfile() {
    let profile: any = null;
    this.authService.userProfile$.subscribe(p => profile = p).unsubscribe();
    return profile;
  }
}
