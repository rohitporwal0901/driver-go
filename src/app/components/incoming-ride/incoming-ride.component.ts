import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification/notification.service';
import { RideService, RideRequest } from '../../services/ride/ride.service';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-incoming-ride',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="incoming-call-screen">
      <!-- Background Map Blur (Mock) -->
      <div class="bg-blur"></div>

      <div class="call-content">
        <div class="caller-info">
          <h2>New Ride Request</h2>
          <div class="route-info">
            <div class="dot green"></div>
            <span>{{ rideData?.pickupAddress || 'Pickup Location' }}</span>
          </div>
          <div class="route-info">
            <div class="dot red"></div>
            <span>{{ rideData?.dropAddress || 'Drop Location' }}</span>
          </div>
          <p class="est-distance">Distance: 4.5 km</p>
        </div>

        <div class="action-buttons">
          <button class="btn-decline" (click)="decline()">
            <span class="icon">✕</span>
            <span class="label">Decline</span>
          </button>
          <button class="btn-accept" (click)="accept()">
            <span class="icon">✓</span>
            <span class="label">Accept</span>
          </button>
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
      color: white;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      overflow: hidden;
    }
    .bg-blur {
      position: absolute;
      inset: 0;
      background: url('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png') center/cover;
      filter: blur(20px) brightness(0.4);
      z-index: 1;
    }
    .call-content {
      position: relative;
      z-index: 2;
      padding: 32px 24px max(40px, var(--safe-bottom));
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 40px;
    }
    .caller-info {
      text-align: center;
      width: 100%;
    }
    h2 {
      font-family: 'Outfit', sans-serif;
      font-size: 28px;
      margin: 0 0 24px;
      animation: pulseText 1.5s infinite;
    }
    @keyframes pulseText {
      0% { opacity: 1; }
      50% { opacity: 0.7; }
      100% { opacity: 1; }
    }
    .route-info {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
      background: rgba(255,255,255,0.1);
      padding: 12px 16px;
      border-radius: 12px;
      backdrop-filter: blur(10px);
      text-align: left;
    }
    .dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
    .dot.green { background: #22c55e; }
    .dot.red { background: #ef4444; }
    .route-info span { font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 500; }
    .est-distance { margin-top: 16px; font-size: 18px; font-weight: 700; color: #fde68a; }

    .action-buttons {
      display: flex;
      justify-content: space-around;
      width: 100%;
      padding: 0 20px;
    }
    button {
      background: none;
      border: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      cursor: pointer;
    }
    .icon {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: 800;
      color: white;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    }
    .label {
      font-family: 'Inter', sans-serif;
      font-size: 16px;
      font-weight: 600;
      color: white;
    }
    .btn-decline .icon { background: #ef4444; }
    .btn-accept .icon { background: #22c55e; animation: pulseRing 2s infinite; }
    
    @keyframes pulseRing {
      0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
      70% { box-shadow: 0 0 0 20px rgba(34, 197, 94, 0); }
      100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
    }
  `]
})
export class IncomingRideComponent implements OnInit {
  private notifService = inject(NotificationService);
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private router = inject(Router);

  rideData: any = null;
  audio = new Audio('assets/ringtone.mp3'); // Need to provide this asset

  ngOnInit() {
    this.audio.loop = true;
    this.audio.play().catch(e => console.log('Audio play blocked by browser', e));

    this.notifService.incomingRideSubject.subscribe(data => {
      if (data) {
        this.rideData = data;
      } else {
        // Fallback for testing
        this.rideData = { rideId: 'mock-id', pickupAddress: 'Vijay Nagar', dropAddress: 'Bhawarkua' };
      }
    });
  }

  decline() {
    this.audio.pause();
    this.router.navigate(['/driver-home']);
  }

  async accept() {
    this.audio.pause();
    if (!this.rideData?.rideId) {
      this.router.navigate(['/driver-home']);
      return;
    }

    try {
      const profile: any = await this.getCurrentProfile();
      const otp = Math.floor(1000 + Math.random() * 9000).toString(); // Generate 4 digit OTP

      // Update ride to accepted
      const docRef = doc(this.firestore, `rides/${this.rideData.rideId}`);
      await updateDoc(docRef, {
        status: 'accepted',
        driverId: profile.uid,
        otp: otp
      });

      // Navigate to driver's map tracking screen
      this.router.navigate(['/driver-tracking', this.rideData.rideId]);
    } catch (e) {
      console.error(e);
      this.router.navigate(['/driver-home']);
    }
  }

  private async getCurrentProfile() {
    let profile: any = null;
    this.authService.userProfile$.subscribe(p => profile = p).unsubscribe();
    return profile;
  }
}
