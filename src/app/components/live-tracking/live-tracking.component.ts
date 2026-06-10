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
      <!-- Top Pill -->
      <div class="eta-pill">
        <span class="pill-dot"></span>
        <span>{{ statusLabel }}: <strong>{{ etaMin }} min</strong></span>
        <span class="status-icon">{{ statusEmoji }}</span>
      </div>

      <!-- Map -->
      <div class="map-container">
        <div id="track-map" class="leaflet-map"></div>
      </div>

    <!-- Bottom Sheet -->
      <div class="driver-sheet">
        <div class="sheet-handle"></div>

        <div class="otp-box">
          <span class="otp-label">Share OTP to start ride</span>
          <div class="otp-code">5 9 2 4</div>
        </div>

        <div class="driver-row">
          <div class="drv-avatar-ring">
            <div class="drv-avatar">{{ driver?.photo }}</div>
          </div>
          <div class="drv-info">
            <strong>{{ driver?.name }}</strong>
            <span class="rating">⭐ {{ driver?.rating }}</span>
          </div>
          <div class="drv-vehicle">
            <div class="drv-plate">{{ driver?.licenseNo }}</div>
            <span class="drv-model">White Swift Dzire</span>
          </div>
        </div>

        <div class="eta-large">
           <span class="eta-val">{{ etaMin }}</span><span class="eta-unit">min</span>
        </div>
        <div class="eta-sub">{{ statusLabel }}</div>

        <div class="progress-container">
          <div class="prog-track">
            <div class="prog-fill" [style.width.%]="arrivalProgress">
              <div class="prog-car">🚗</div>
            </div>
          </div>
        </div>

        <div class="actions-row">
          <button class="act-btn"><span class="icon">📞</span> Call</button>
          <button class="act-btn"><span class="icon">💬</span> Chat</button>
          <button class="act-btn danger">Cancel</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tracking-screen { width:100%; height:100dvh; position:relative; overflow:hidden; }
    .map-container { position:absolute; inset:0; z-index:1; }
    .leaflet-map { width:100%; height:100%; }
    
    .eta-pill {
      position:absolute; top: calc(16px + var(--safe-top)); left:50%; transform:translateX(-50%);
      background:var(--text-primary); color:var(--bg-color); border-radius:30px; padding:10px 16px;
      display:flex; align-items:center; gap:8px; z-index:20;
      box-shadow:var(--shadow-sm); font-family:'Inter',sans-serif; font-size:14px;
      white-space:nowrap;
    }
    .pill-dot { width:8px; height:8px; border-radius:50%; background:var(--success); animation:blink 1.5s infinite; }
    @keyframes blink { 0%,100%{opacity:0.3} 50%{opacity:1} }
    .eta-pill strong { color:var(--primary); font-weight:700; }
    .status-icon { margin-left:4px; font-size:16px; }
    
    .driver-sheet {
      position:absolute; bottom:0; left:0; right:0; z-index:20;
      background:var(--surface); border-radius:var(--radius-lg) var(--radius-lg) 0 0;
      padding:var(--spacing-3) 20px max(var(--spacing-3), var(--safe-bottom));
      box-shadow:var(--shadow-sheet);
    }
    .sheet-handle { width:36px; height:4px; background:var(--border-color); border-radius:4px; margin:0 auto var(--spacing-2); }
    
    .otp-box {
      background: var(--bg-color); border-radius: var(--radius-md); padding: 12px 20px;
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: var(--spacing-3); border: 1px dashed var(--border-color);
    }
    .otp-label { font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; color: var(--text-secondary); }
    .otp-code { font-family: 'Outfit', sans-serif; font-size: 22px; font-weight: 800; color: var(--text-primary); letter-spacing: 4px; }
    
    .driver-row { display:flex; align-items:center; margin-bottom:var(--spacing-3); }
    .drv-avatar-ring {
      padding:3px; border-radius:50%; background:var(--primary-gradient);
      margin-right:12px; display:flex; align-items:center; justify-content:center; flex-shrink: 0;
    }
    .drv-avatar {
      width:48px; height:48px; background:var(--surface); border-radius:50%;
      display:flex; align-items:center; justify-content:center; font-size:26px; border:2px solid var(--surface);
    }
    .drv-info { flex:1; display:flex; flex-direction:column; min-width:0; }
    .drv-info strong { font-family:'Outfit',sans-serif; font-size:17px; font-weight:800; color:var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .rating { font-family:'Inter',sans-serif; font-size:13px; font-weight:600; color:var(--text-secondary); }
    
    .drv-vehicle { display: flex; flex-direction: column; align-items: flex-end; flex-shrink: 0; margin-left: 8px; }
    .drv-plate {
      background:var(--bg-color); border:1px solid var(--border-color); border-radius:var(--radius-sm);
      padding:4px 8px; font-family:'Inter',sans-serif; font-size:13px;
      font-weight:800; color:var(--text-primary); letter-spacing:0.5px; margin-bottom: 2px;
    }
    .drv-model { font-family: 'Inter', sans-serif; font-size: 11px; color: var(--text-secondary); font-weight: 500; }
    
    .eta-large { text-align:center; font-family:'Outfit',sans-serif; margin-bottom:4px; }
    .eta-val { font-size:36px; font-weight:800; color:var(--text-primary); line-height:1; }
    .eta-unit { font-size:16px; font-weight:600; color:var(--text-secondary); margin-left:4px; }
    .eta-sub { text-align:center; font-family:'Inter',sans-serif; font-size:14px; color:var(--success); font-weight:600; margin-bottom:var(--spacing-3); }
    
    .progress-container { margin-bottom:var(--spacing-3); padding:0 10px; }
    .prog-track { position:relative; height:4px; background:var(--border-color); border-radius:2px; margin: 20px 0; }
    .prog-fill { position:absolute; top:0; left:0; height:100%; background:var(--primary); border-radius:2px; transition:width 1s linear; }
    .prog-car {
      position:absolute; top:50%; transform:translate(50%, -50%) scaleX(-1);
      right:0; font-size:24px; transition:right 1s linear; z-index:2; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.1));
    }
    
    .actions-row { display:flex; gap:12px; }
    .act-btn {
      flex:1; padding:14px 0; border-radius:var(--radius-sm); border:1.5px solid var(--border-color); background:var(--surface);
      font-family:'Inter',sans-serif; font-size:14px; font-weight:700; color:var(--text-primary);
      display:flex; align-items:center; justify-content:center; gap:6px; cursor:pointer;
      box-shadow: var(--shadow-sm); transition: all 0.2s ease;
    }
    .act-btn .icon { font-size: 16px; }
    .act-btn:active { background:var(--bg-color); transform:scale(0.98); }
    .act-btn.danger { color:var(--error); background:#FEF2F2; border-color:#FECACA; }
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
