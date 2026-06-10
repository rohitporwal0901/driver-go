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

        <!-- Driver Card -->
        <div class="driver-card">
          <div class="drv-avatar">{{ driver?.photo || '🧑‍✈️' }}</div>
          <div class="drv-info">
            <div class="drv-top">
              <strong>{{ driver?.name || 'David Smith' }}</strong>
              <span class="rating">⭐ {{ driver?.rating || '4.8' }}</span>
            </div>
            <div class="drv-sub">{{ driver?.experience || '5 years' }} experience</div>
            <div class="drv-badge">{{ driver?.licenseNo || 'MH 01 AB 1234' }}</div>
          </div>
        </div>

        <!-- Locations -->
        <div class="loc-section">
          <div class="loc-line"></div>
          <div class="loc-row">
            <div class="loc-icon green">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            </div>
            <div class="loc-text" [title]="pickupName">{{ pickupName }}</div>
          </div>
          <div class="loc-row">
            <div class="loc-icon red">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            </div>
            <div class="loc-text" [title]="dropName">{{ dropName }}</div>
          </div>
        </div>

        <!-- Fare -->
        <div class="fare-row">
          <span>Fare</span>
          <strong>₹{{ fare }}</strong>
        </div>

        <!-- Action Btns -->
        <div class="action-row">
          <button class="act-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            Call
          </button>
          <button class="act-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            Chat
          </button>
          <button class="act-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
            Share Trip
          </button>
        </div>

        <button class="btn-start" id="start-trip-btn" (click)="startTrip()">
          Start Trip
        </button>
      </div>
    </div>
  `,
  styles: [`
    .found-screen { width:100%; height:100dvh; display:flex; flex-direction:column; overflow: hidden; }
    .map-box { height:45dvh; min-height: 300px; padding-top: var(--safe-top); box-sizing: border-box; }
    .leaflet-map { width:100%; height:100%; }
    .found-sheet {
      flex:1; background:var(--surface); border-radius:var(--radius-lg) var(--radius-lg) 0 0;
      padding:var(--spacing-3) var(--spacing-3) max(var(--spacing-4), var(--safe-bottom)); overflow-y:auto;
      box-shadow:var(--shadow-sheet); z-index: 10;
    }
    .sheet-handle { width:32px; height:4px; background:var(--border-color); border-radius:4px; margin:0 auto var(--spacing-3); }
    
    .driver-card {
      display:flex; align-items:flex-start; gap:16px; margin-bottom:var(--spacing-3);
    }
    .drv-avatar {
      width:56px; height:56px; background:var(--bg-color); border-radius:50%;
      display:flex; align-items:center; justify-content:center; font-size:32px; flex-shrink:0; border: 2px solid var(--primary);
    }
    .drv-info { flex:1; display:flex; flex-direction:column; gap:4px; min-width: 0; }
    .drv-top { display:flex; align-items:center; justify-content:space-between; }
    .drv-top strong { font-family:'Inter',sans-serif; font-size:16px; font-weight:700; color:var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .rating { font-family:'Inter',sans-serif; font-size:13px; font-weight:600; color:var(--text-secondary); flex-shrink: 0; margin-left: 8px; }
    .drv-sub { font-family:'Inter',sans-serif; font-size:13px; color:var(--text-secondary); font-weight:500; }
    .drv-badge { 
      display: inline-block; padding: 2px 8px; border-radius: 4px; background: var(--bg-color);
      border: 1px solid var(--border-color); font-family: 'Inter', sans-serif; font-size: 11px;
      font-weight: 700; color: var(--text-secondary); letter-spacing: 0.5px; width: max-content;
    }
    
    .loc-section {
      position:relative; padding-left:4px; margin-bottom:var(--spacing-3);
    }
    .loc-row { display:flex; align-items:center; gap:16px; margin:16px 0; }
    .loc-icon { font-size:16px; display:flex; align-items:center; justify-content:center; background:var(--surface); z-index:2; position:relative; }
    .green { color:var(--success); }
    .red { color:var(--error); }
    .loc-line {
      position:absolute; left:11px; top:24px; bottom:24px; width:0px;
      border-left:2px dotted var(--border-color); z-index:1;
    }
    .loc-text { flex: 1; font-family:'Inter',sans-serif; font-size:14px; color:var(--text-primary); font-weight:500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    
    .fare-row {
      display:flex; justify-content:space-between; align-items:center;
      margin-bottom:24px; padding-top:20px; border-top:1px solid var(--border-color);
    }
    .fare-row span { font-family:'Inter',sans-serif; font-size:14px; color:var(--text-secondary); font-weight:600; }
    .fare-row strong { font-family:'Inter',sans-serif; font-size:18px; font-weight:800; color:var(--text-primary); }
    
    .action-row { display:flex; gap:12px; margin-bottom:var(--spacing-3); }
    .act-btn {
      flex:1; display:flex; align-items:center; justify-content:center; gap:6px;
      padding:14px 0; border-radius:var(--radius-sm); border:1.5px solid var(--border-color); background:var(--surface);
      font-family:'Inter',sans-serif; font-size:14px; font-weight:700; color:var(--text-primary); cursor:pointer;
      box-shadow: var(--shadow-sm); transition: all 0.2s ease;
    }
    .act-btn:active { background:var(--bg-color); transform:scale(0.98); }
    
    .btn-start {
      width:100%; padding:16px; height:56px; background:var(--primary-gradient);
      border:none; border-radius:var(--radius-md); font-family:'Outfit',sans-serif;
      font-size:18px; font-weight:800; color:#ffffff; cursor:pointer;
      box-shadow: 0 8px 24px rgba(255, 184, 0, 0.35); transition:all 0.2s ease;
    }
    .btn-start:active{ transform:scale(0.98); box-shadow: 0 4px 12px rgba(255, 184, 0, 0.2); }
  `]
})
export class DriverFoundComponent implements AfterViewInit, OnDestroy {
  driver?: Driver;
  distance = 0;
  duration = 0;
  fare = 0;
  pickupName = '123, Main Street, City';
  dropName = '456, Park Avenue, City';

  constructor(public router: Router, private rideState: RideStateService, private mapSvc: MapService) {}

  ngAfterViewInit(): void {
    this.driver = this.rideState.selectedDriver();
    this.distance = this.rideState.distanceKm;
    this.duration = this.rideState.durationMin;
    this.fare = this.rideState.currentFare();

    const pickup = this.rideState.pickupLocation();
    if (pickup) this.pickupName = pickup.address || pickup.name || this.pickupName;
    const drop = this.rideState.dropLocation();
    if (drop) this.dropName = drop.address || drop.name || this.dropName;
    
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
