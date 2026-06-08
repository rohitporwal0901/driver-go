import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MapService } from '../../services/map.service';
import { RideStateService } from '../../services/ride-state.service';
import { Driver } from '../../models/ride.models';

@Component({
  selector: 'app-driver-found',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="found-screen">
      <div class="map-box">
        <div id="found-map" class="leaflet-map"></div>
      </div>

      <div class="found-sheet">
        <div class="sheet-handle"></div>

        <!-- Confirmed Banner -->
        <div class="confirmed-badge">
          <div class="check-circle">✓</div>
          <div>
            <strong>Booking Confirmed!</strong>
            <span>Driver is on the way to you</span>
          </div>
        </div>

        <!-- Driver Card -->
        <div class="driver-card">
          <div class="drv-avatar">{{ driver?.photo }}</div>
          <div class="drv-info">
            <strong>{{ driver?.name }}</strong>
            <span>{{ driver?.experience }} · {{ driver?.totalTrips }} trips</span>
            <div class="lang-row">
              <span class="lang" *ngFor="let l of driver?.languages">{{ l }}</span>
            </div>
            <div class="specialties">
              <span class="spec" *ngFor="let s of driver?.specialties">{{ s }}</span>
            </div>
          </div>
          <div class="drv-right">
            <div class="rating">⭐ {{ driver?.rating }}</div>
            <div class="license">{{ driver?.licenseNo }}</div>
          </div>
        </div>

        <!-- Action Btns -->
        <div class="action-row">
          <button class="act-btn call-btn" id="call-driver-btn">
            <span class="act-icon">📞</span>
            <span>Call</span>
          </button>
          <button class="act-btn msg-btn" id="msg-driver-btn">
            <span class="act-icon">💬</span>
            <span>Message</span>
          </button>
          <button class="act-btn share-btn" id="share-btn">
            <span class="act-icon">🔗</span>
            <span>Share</span>
          </button>
        </div>

        <!-- Trip Summary Bar -->
        <div class="trip-summary">
          <div class="ts-item"><span>📏</span><span>{{ distance }} km</span></div>
          <div class="ts-sep"></div>
          <div class="ts-item"><span>⏱️</span><span>~{{ duration }} min</span></div>
          <div class="ts-sep"></div>
          <div class="ts-item"><span>💰</span><span>₹{{ fare }}</span></div>
        </div>

        <button class="btn-start" id="start-trip-btn" (click)="startTrip()">
          🚗 Start Trip
        </button>
      </div>
    </div>
  `,
  styles: [`
    .found-screen { width:100%; height:100vh; display:flex; flex-direction:column; }
    .map-box { height:45vh; }
    .leaflet-map { width:100%; height:100%; }
    .found-sheet {
      flex:1; background:#fff; border-radius:24px 24px 0 0;
      padding:12px 16px 32px; overflow-y:auto;
      box-shadow:0 -4px 24px rgba(0,0,0,0.08);
    }
    .sheet-handle { width:36px; height:4px; background:#E5E7EB; border-radius:4px; margin:0 auto 12px; }
    .confirmed-badge {
      display:flex; align-items:center; gap:12px; margin-bottom:12px;
      padding:12px 14px; background:linear-gradient(135deg,#ECFDF5,#D1FAE5);
      border-radius:14px; border:1px solid rgba(34,197,94,0.2);
    }
    .check-circle {
      width:36px; height:36px; background:#22C55E; border-radius:50%;
      display:flex; align-items:center; justify-content:center;
      font-size:18px; font-weight:700; color:#fff; flex-shrink:0;
    }
    .confirmed-badge strong { display:block; font-family:'Outfit',sans-serif; font-size:16px; font-weight:700; color:#111827; }
    .confirmed-badge span { font-family:'Inter',sans-serif; font-size:13px; color:#16A34A; }
    .driver-card {
      display:flex; align-items:flex-start; gap:12px;
      background:#FAFAFA; border-radius:16px; padding:14px; margin-bottom:12px;
      border:1px solid #F3F4F6;
    }
    .drv-avatar {
      width:56px; height:56px; background:#FFF3CD; border-radius:50%;
      display:flex; align-items:center; justify-content:center; font-size:30px;
      border:2px solid #FFB800; flex-shrink:0;
    }
    .drv-info { flex:1; }
    .drv-info strong { display:block; font-family:'Outfit',sans-serif; font-size:16px; font-weight:700; color:#111827; margin-bottom:2px; }
    .drv-info > span { font-family:'Inter',sans-serif; font-size:12px; color:#6B7280; }
    .lang-row,.specialties { display:flex; gap:4px; margin-top:4px; flex-wrap:wrap; }
    .lang {
      background:#EFF6FF; border-radius:6px; padding:2px 7px;
      font-family:'Inter',sans-serif; font-size:11px; color:#2563EB; font-weight:500;
    }
    .spec {
      background:#F0FDF4; border-radius:6px; padding:2px 7px;
      font-family:'Inter',sans-serif; font-size:11px; color:#16A34A; font-weight:500;
    }
    .drv-right { text-align:right; flex-shrink:0; }
    .rating { font-family:'Outfit',sans-serif; font-size:16px; font-weight:700; color:#111827; margin-bottom:4px; }
    .license { font-family:'Inter',sans-serif; font-size:10px; color:#9CA3AF; max-width:80px; text-align:right; }
    .action-row { display:flex; gap:8px; margin-bottom:12px; }
    .act-btn {
      flex:1; display:flex; flex-direction:column; align-items:center; gap:4px;
      padding:12px 8px; border-radius:14px; border:none; cursor:pointer; transition:all 0.2s;
    }
    .act-icon { font-size:22px; }
    .act-btn span:last-child { font-family:'Inter',sans-serif; font-size:11px; font-weight:600; }
    .call-btn { background:#ECFDF5; } .call-btn span:last-child{ color:#16A34A; }
    .msg-btn { background:#EFF6FF; } .msg-btn span:last-child{ color:#2563EB; }
    .share-btn { background:#F5F3FF; } .share-btn span:last-child{ color:#7C3AED; }
    .trip-summary {
      display:flex; align-items:center; justify-content:space-around;
      background:#FFFBEB; border-radius:14px; padding:12px; margin-bottom:12px;
      border:1px solid rgba(255,184,0,0.2);
    }
    .ts-item { display:flex; align-items:center; gap:5px; font-family:'Outfit',sans-serif; font-size:14px; font-weight:600; color:#374151; }
    .ts-sep { width:1px; height:20px; background:#FFD466; }
    .btn-start {
      width:100%; padding:18px; background:linear-gradient(135deg,#FFB800,#FF8C00);
      border:none; border-radius:16px; font-family:'Outfit',sans-serif;
      font-size:18px; font-weight:700; color:#fff; cursor:pointer;
      box-shadow:0 8px 24px rgba(255,184,0,0.4); transition:all 0.2s;
    }
    .btn-start:active{ transform:scale(0.97); }
  `]
})
export class DriverFoundComponent implements AfterViewInit, OnDestroy {
  driver?: Driver;
  distance = 0;
  duration = 0;
  fare = 0;

  constructor(public router: Router, private rideState: RideStateService, private mapSvc: MapService) {}

  ngAfterViewInit(): void {
    this.driver = this.rideState.selectedDriver();
    this.distance = this.rideState.distanceKm;
    this.duration = this.rideState.durationMin;
    this.fare = this.rideState.currentFare();

    const pickup = this.rideState.pickupLocation();
    const p: [number, number] = pickup ? [pickup.lat, pickup.lng] : [23.1793, 75.7849];

    setTimeout(() => {
      const map = this.mapSvc.createMap('found-map', p, 13);
      this.mapSvc.addDotMarker(map, 'fp', p[0], p[1], '#22C55E', 'Your Location');
      if (this.driver) {
        const driverStart: [number, number] = [p[0] + 0.03, p[1] - 0.02];
        this.mapSvc.addEmojiMarker(map, 'fdrv', driverStart[0], driverStart[1], this.driver.photo || '🚗', 34, true);
        this.mapSvc.drawRoute(map, 'farr', [driverStart, p], '#FFB800', true);
        // Animate driver approaching
        let step = 0;
        const steps = 15;
        const iv = setInterval(() => {
          step++;
          const t = step / steps;
          this.mapSvc.moveMarker('fdrv',
            driverStart[0] + (p[0] - driverStart[0]) * t,
            driverStart[1] + (p[1] - driverStart[1]) * t,
            800
          );
          if (step >= steps) clearInterval(iv);
        }, 800);
      }
    }, 100);
  }

  ngOnDestroy(): void { this.mapSvc.removeMap('found-map'); }

  startTrip(): void {
    this.rideState.setStatus('driver-arriving');
    this.router.navigate(['/live-tracking']);
  }
}
