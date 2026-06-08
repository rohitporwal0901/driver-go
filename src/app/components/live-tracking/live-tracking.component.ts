import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RideStateService } from '../../services/ride-state.service';
import { MapService } from '../../services/map.service';
import { Driver } from '../../models/ride.models';

@Component({
  selector: 'app-live-tracking',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tracking-screen">
      <!-- Status Banner -->
      <div class="status-banner">
        <div class="status-left">
          <span class="status-label">{{ statusLabel }}</span>
          <span class="eta-text">Arriving in <strong>{{ etaMin }} min</strong></span>
        </div>
        <div class="status-icon">{{ statusEmoji }}</div>
      </div>

      <!-- Map -->
      <div class="map-box">
        <div id="track-map" class="leaflet-map"></div>
      </div>

      <!-- Driver Panel -->
      <div class="driver-panel">
        <div class="sheet-handle"></div>
        <div class="driver-row">
          <div class="drv-avatar">{{ driver?.photo }}</div>
          <div class="drv-info">
            <strong>{{ driver?.name }}</strong>
            <span>{{ driver?.vehicle }}</span>
            <span class="plate">{{ driver?.licenseNo }}</span>
          </div>
          <div class="right-col">
            <div class="rating">⭐ {{ driver?.rating }}</div>
            <button class="call-mini" id="track-call-btn">📞</button>
          </div>
        </div>

        <div class="loc-summary">
          <div class="loc-row">
            <div class="dot green"></div>
            <span>{{ pickup?.address || '—' }}</span>
          </div>
          <div class="loc-row">
            <div class="dot red"></div>
            <span>{{ drop?.address || '—' }}</span>
          </div>
        </div>

        <div class="eta-bar">
          <div class="eta-progress" [style.width.%]="arrivalProgress"></div>
        </div>

        <div class="actions-row">
          <button class="act" id="track-msg-btn">💬 Message</button>
          <button class="act danger" id="track-sos-btn">🆘 SOS</button>
          <button class="act" id="track-share-btn">🔗 Share</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tracking-screen { width:100%; height:100dvh; display:flex; flex-direction:column; position:relative; }
    .status-banner {
      position:absolute; top:0; left:0; right:0; z-index:20;
      background:#fff; padding:44px 16px 12px;
      display:flex; align-items:center; justify-content:space-between;
      box-shadow:0 2px 12px rgba(0,0,0,0.06);
    }
    .status-label { display:block; font-family:'Outfit',sans-serif; font-size:18px; font-weight:700; color:#111827; }
    .eta-text { font-family:'Inter',sans-serif; font-size:13px; color:#6B7280; }
    .eta-text strong { color:#FFB800; }
    .status-icon { font-size:32px; animation:statusBounce 1.5s ease-in-out infinite; }
    @keyframes statusBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
    .map-box { flex:1; padding-top:90px; }
    .leaflet-map { width:100%; height:100%; }
    .driver-panel {
      background:#fff; border-radius:24px 24px 0 0;
      padding:12px 16px 32px; box-shadow:0 -4px 24px rgba(0,0,0,0.08);
    }
    .sheet-handle { width:36px; height:4px; background:#E5E7EB; border-radius:4px; margin:0 auto 12px; }
    .driver-row { display:flex; align-items:center; gap:12px; margin-bottom:10px; }
    .drv-avatar {
      width:50px; height:50px; background:#FFF3CD; border-radius:50%;
      display:flex; align-items:center; justify-content:center; font-size:26px;
      border:2px solid #FFB800; flex-shrink:0;
    }
    .drv-info { flex:1; }
    .drv-info strong { display:block; font-family:'Outfit',sans-serif; font-size:15px; font-weight:700; color:#111827; }
    .drv-info span { display:block; font-family:'Inter',sans-serif; font-size:12px; color:#6B7280; }
    .plate { font-weight:600 !important; color:#374151 !important; }
    .right-col { display:flex; flex-direction:column; align-items:flex-end; gap:6px; }
    .rating { font-family:'Outfit',sans-serif; font-size:15px; font-weight:700; }
    .call-mini {
      background:#ECFDF5; border:none; border-radius:10px; padding:6px 10px;
      font-size:16px; cursor:pointer;
    }
    .loc-summary { background:#F9FAFB; border-radius:12px; padding:10px 12px; margin-bottom:10px; }
    .loc-row { display:flex; align-items:center; gap:10px; padding:3px 0; }
    .dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
    .green { background:#22C55E; }
    .red { background:#EF4444; }
    .loc-row span { font-family:'Inter',sans-serif; font-size:12px; color:#374151; }
    .eta-bar { height:4px; background:#F3F4F6; border-radius:4px; overflow:hidden; margin-bottom:12px; }
    .eta-progress { height:100%; background:linear-gradient(90deg,#FFB800,#FF8C00); transition:width 1s ease; }
    .actions-row { display:flex; gap:8px; }
    .act {
      flex:1; padding:10px; background:#F9FAFB; border:1.5px solid #E5E7EB;
      border-radius:12px; font-family:'Inter',sans-serif; font-size:12px;
      font-weight:600; color:#374151; cursor:pointer; transition:all 0.2s;
    }
    .act.danger { background:#FEF2F2; border-color:#FECACA; color:#EF4444; }
    .act:active { opacity:0.7; }
  `]
})
export class LiveTrackingComponent implements AfterViewInit, OnDestroy {
  driver?: Driver;
  pickup?: any;
  drop?: any;
  etaMin = 8;
  arrivalProgress = 0;
  statusLabel = 'Driver En Route';
  statusEmoji = '🚗';

  private moveInterval?: ReturnType<typeof setInterval>;
  private etaInterval?: ReturnType<typeof setInterval>;
  private navTimeout?: ReturnType<typeof setTimeout>;
  private routePoints: [number, number][] = [];
  private routeIdx = 0;

  constructor(public router: Router, private rideState: RideStateService, private mapSvc: MapService) {}

  ngAfterViewInit(): void {
    this.driver = this.rideState.selectedDriver();
    this.pickup = this.rideState.pickupLocation();
    this.drop = this.rideState.dropLocation();

    const p: [number, number] = this.pickup ? [this.pickup.lat, this.pickup.lng] : [23.1793, 75.7849];
    const d: [number, number] = this.drop ? [this.drop.lat, this.drop.lng] : [22.7196, 75.8577];
    const driverStart: [number, number] = [p[0] + 0.04, p[1] - 0.03];

    // Build route: driver → pickup → drop
    const steps = 24;
    this.routePoints = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      // First half: driver to pickup, second half: pickup to drop
      if (t <= 0.4) {
        const tt = t / 0.4;
        this.routePoints.push([
          driverStart[0] + (p[0] - driverStart[0]) * tt,
          driverStart[1] + (p[1] - driverStart[1]) * tt,
        ]);
      } else {
        const tt = (t - 0.4) / 0.6;
        this.routePoints.push([
          p[0] + (d[0] - p[0]) * tt,
          p[1] + (d[1] - p[1]) * tt,
        ]);
      }
    }

    setTimeout(() => {
      const map = this.mapSvc.createMap('track-map', driverStart, 10);
      this.mapSvc.addDotMarker(map, 'tp', p[0], p[1], '#22C55E', 'Pickup');
      this.mapSvc.addDotMarker(map, 'td', d[0], d[1], '#EF4444', 'Drop');
      this.mapSvc.drawRoute(map, 'troute', [driverStart, p, d], '#FFB800');
      this.mapSvc.addEmojiMarker(map, 'tdrv', driverStart[0], driverStart[1], this.driver?.photo || '🚗', 36, true);

      // Animate driver along route
      this.moveInterval = setInterval(() => {
        if (this.routeIdx < this.routePoints.length - 1) {
          this.routeIdx++;
          const [lat, lng] = this.routePoints[this.routeIdx];
          this.mapSvc.moveMarker('tdrv', lat, lng, 700);
          this.mapSvc.panTo(map, lat, lng);
          this.arrivalProgress = (this.routeIdx / this.routePoints.length) * 100;

          // Update status
          if (this.routeIdx === Math.floor(this.routePoints.length * 0.4)) {
            this.statusLabel = 'Driver Arrived at Pickup!';
            this.statusEmoji = '📍';
            this.etaMin = 0;
          } else if (this.routeIdx > Math.floor(this.routePoints.length * 0.4)) {
            this.statusLabel = 'Trip in Progress';
            this.statusEmoji = '🛣️';
          }
        }
      }, 700);

      this.etaInterval = setInterval(() => {
        if (this.etaMin > 0) this.etaMin--;
      }, 5000);
    }, 100);

    this.navTimeout = setTimeout(() => {
      this.rideState.startTrip();
      this.router.navigate(['/on-ride']);
    }, 18000);
  }

  ngOnDestroy(): void {
    clearInterval(this.moveInterval);
    clearInterval(this.etaInterval);
    clearTimeout(this.navTimeout);
    this.mapSvc.removeMap('track-map');
  }
}
