import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RideStateService } from '../../services/ride-state.service';
import { MapService } from '../../services/map.service';
import { Driver } from '../../models/ride.models';

@Component({
  selector: 'app-on-ride',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="onride-screen">
      <!-- Top Bar -->
      <div class="top-bar">
        <div class="trip-label">
          <span>🛣️ Trip in Progress</span>
          <span class="elapsed">{{ elapsedMin }} min elapsed</span>
        </div>
        <button class="sos-btn" id="sos-btn">🆘 SOS</button>
      </div>

      <!-- Map -->
      <div class="map-box">
        <div id="onride-map" class="leaflet-map"></div>
      </div>

      <!-- Ride Panel -->
      <div class="ride-panel">
        <div class="sheet-handle"></div>

        <!-- Driver -->
        <div class="driver-row">
          <div class="drv-av">{{ driver?.photo }}</div>
          <div class="drv-info">
            <strong>{{ driver?.name }}</strong>
            <span>Driving your car</span>
          </div>
          <div class="drv-right">
            <div class="rating">⭐ {{ driver?.rating }}</div>
            <div class="speed-badge">{{ currentSpeed }} km/h</div>
          </div>
        </div>

        <!-- Trip Progress -->
        <div class="trip-progress">
          <div class="prog-row">
            <span class="prog-label">Trip Progress</span>
            <span class="prog-pct">{{ tripProgress }}%</span>
          </div>
          <div class="prog-track">
            <div class="prog-fill" [style.width.%]="tripProgress">
              <div class="prog-car">🚗</div>
            </div>
          </div>
          <div class="prog-places">
            <span>{{ pickup?.city || 'Pickup' }}</span>
            <span>{{ drop?.city || 'Destination' }}</span>
          </div>
        </div>

        <!-- Locs -->
        <div class="loc-summary">
          <div class="loc-row"><div class="dot g"></div><span>{{ pickup?.address || '—' }}</span></div>
          <div class="loc-row"><div class="dot r"></div><span>{{ drop?.address || '—' }}</span></div>
        </div>

        <div class="fare-info">
          <span class="fare-lbl">Fare</span>
          <span class="fare-val">₹{{ fare }}</span>
        </div>

        <div class="actions">
          <button class="act-btn" id="call-btn">📞 Call</button>
          <button class="act-btn" id="chat-btn">💬 Chat</button>
          <button class="act-btn danger" id="end-trip-btn" (click)="endTrip()">🏁 End Trip</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .onride-screen { width:100%; height:100vh; display:flex; flex-direction:column; position:relative; }
    .top-bar {
      position:absolute; top:0; left:0; right:0; z-index:20;
      background:#fff; padding:44px 16px 10px;
      display:flex; align-items:center; justify-content:space-between;
      box-shadow:0 2px 10px rgba(0,0,0,0.06);
    }
    .trip-label span:first-child { display:block; font-family:'Outfit',sans-serif; font-size:18px; font-weight:700; color:#111827; }
    .elapsed { font-family:'Inter',sans-serif; font-size:12px; color:#9CA3AF; }
    .sos-btn {
      background:#EF4444; color:#fff; border:none; border-radius:20px;
      padding:8px 16px; font-family:'Outfit',sans-serif; font-size:14px; font-weight:700;
      cursor:pointer; animation:sosPulse 1.5s ease-in-out infinite;
    }
    @keyframes sosPulse { 0%,100%{box-shadow:0 4px 12px rgba(239,68,68,0.4)} 50%{box-shadow:0 4px 24px rgba(239,68,68,0.7)} }
    .map-box { flex:1; padding-top:88px; }
    .leaflet-map { width:100%; height:100%; }
    .ride-panel {
      background:#fff; border-radius:24px 24px 0 0;
      padding:12px 16px 28px; box-shadow:0 -4px 24px rgba(0,0,0,0.08);
    }
    .sheet-handle { width:36px; height:4px; background:#E5E7EB; border-radius:4px; margin:0 auto 12px; }
    .driver-row { display:flex; align-items:center; gap:12px; margin-bottom:12px; }
    .drv-av {
      width:48px; height:48px; background:#FFF3CD; border-radius:50%;
      display:flex; align-items:center; justify-content:center; font-size:24px;
      border:2px solid #FFB800; flex-shrink:0;
    }
    .drv-info { flex:1; }
    .drv-info strong { display:block; font-family:'Outfit',sans-serif; font-size:15px; font-weight:700; color:#111827; }
    .drv-info span { font-family:'Inter',sans-serif; font-size:12px; color:#6B7280; }
    .drv-right { text-align:right; }
    .rating { font-family:'Outfit',sans-serif; font-size:14px; font-weight:700; }
    .speed-badge {
      background:#FFFBEB; border:1px solid #FFD466; border-radius:8px;
      padding:3px 8px; font-family:'Outfit',sans-serif; font-size:12px; font-weight:700; color:#D97706;
      margin-top:3px;
    }
    .trip-progress { margin-bottom:12px; }
    .prog-row { display:flex; justify-content:space-between; margin-bottom:6px; }
    .prog-label { font-family:'Inter',sans-serif; font-size:13px; color:#6B7280; }
    .prog-pct { font-family:'Outfit',sans-serif; font-size:13px; font-weight:700; color:#FFB800; }
    .prog-track {
      height:18px; background:#F3F4F6; border-radius:10px; overflow:hidden;
      position:relative;
    }
    .prog-fill {
      height:100%; background:linear-gradient(90deg,#FFB800,#FF8C00);
      border-radius:10px; transition:width 1s ease; position:relative;
      display:flex; align-items:center; justify-content:flex-end;
    }
    .prog-car { font-size:14px; margin-right:2px; }
    .prog-places { display:flex; justify-content:space-between; margin-top:4px; }
    .prog-places span { font-family:'Inter',sans-serif; font-size:11px; color:#9CA3AF; }
    .loc-summary { background:#F9FAFB; border-radius:12px; padding:8px 12px; margin-bottom:8px; }
    .loc-row { display:flex; align-items:center; gap:8px; padding:3px 0; }
    .dot { width:9px; height:9px; border-radius:50%; flex-shrink:0; }
    .g { background:#22C55E; } .r { background:#EF4444; }
    .loc-row span { font-family:'Inter',sans-serif; font-size:12px; color:#374151; }
    .fare-info {
      display:flex; align-items:center; justify-content:space-between;
      padding:8px 0; border-top:1px solid #F3F4F6; margin-bottom:10px;
    }
    .fare-lbl { font-family:'Inter',sans-serif; font-size:14px; color:#6B7280; }
    .fare-val { font-family:'Outfit',sans-serif; font-size:22px; font-weight:800; color:#111827; }
    .actions { display:flex; gap:8px; }
    .act-btn {
      flex:1; padding:12px 8px; border-radius:12px; border:1.5px solid #E5E7EB;
      background:#F9FAFB; font-family:'Inter',sans-serif; font-size:12px;
      font-weight:600; color:#374151; cursor:pointer;
    }
    .act-btn.danger { background:#FEF2F2; border-color:#FECACA; color:#DC2626; }
  `]
})
export class OnRideComponent implements AfterViewInit, OnDestroy {
  driver?: Driver;
  pickup?: any;
  drop?: any;
  fare = 0;
  tripProgress = 5;
  elapsedMin = 0;
  currentSpeed = 62;

  private routePoints: [number, number][] = [];
  private routeIdx = 0;
  private moveInterval?: ReturnType<typeof setInterval>;
  private progressInterval?: ReturnType<typeof setInterval>;
  private elapsedInterval?: ReturnType<typeof setInterval>;
  private speedInterval?: ReturnType<typeof setInterval>;
  private navTimeout?: ReturnType<typeof setTimeout>;

  constructor(public router: Router, private rideState: RideStateService, private mapSvc: MapService) {}

  ngAfterViewInit(): void {
    this.driver = this.rideState.selectedDriver();
    this.pickup = this.rideState.pickupLocation();
    this.drop = this.rideState.dropLocation();
    this.fare = this.rideState.currentFare();

    const p: [number, number] = this.pickup ? [this.pickup.lat, this.pickup.lng] : [23.1793, 75.7849];
    const d: [number, number] = this.drop ? [this.drop.lat, this.drop.lng] : [22.7196, 75.8577];

    const steps = 30;
    this.routePoints = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      this.routePoints.push([
        p[0] + (d[0] - p[0]) * t + Math.sin(t * Math.PI) * 0.05,
        p[1] + (d[1] - p[1]) * t + Math.cos(t * Math.PI) * 0.03,
      ]);
    }

    setTimeout(() => {
      const map = this.mapSvc.createMap('onride-map', p, 10);
      this.mapSvc.addDotMarker(map, 'op', p[0], p[1], '#22C55E');
      this.mapSvc.addDotMarker(map, 'od', d[0], d[1], '#EF4444');
      this.mapSvc.drawRoute(map, 'or', this.routePoints, '#FFB800');
      this.mapSvc.addEmojiMarker(map, 'odrv', p[0], p[1], this.driver?.photo || '🚗', 36, false);

      this.moveInterval = setInterval(() => {
        if (this.routeIdx < this.routePoints.length - 1) {
          this.routeIdx++;
          const [lat, lng] = this.routePoints[this.routeIdx];
          this.mapSvc.moveMarker('odrv', lat, lng, 600);
          this.mapSvc.panTo(map, lat, lng);
        }
      }, 600);

      this.progressInterval = setInterval(() => {
        this.tripProgress = Math.min(98, Math.round((this.routeIdx / this.routePoints.length) * 100));
      }, 500);
    }, 100);

    this.elapsedInterval = setInterval(() => { this.elapsedMin++; }, 60000);
    this.speedInterval = setInterval(() => {
      this.currentSpeed = 55 + Math.floor(Math.random() * 20);
    }, 3000);

    this.navTimeout = setTimeout(() => {
      this.rideState.completeTrip();
      this.router.navigate(['/ride-completed']);
    }, 20000);
  }

  ngOnDestroy(): void {
    clearInterval(this.moveInterval);
    clearInterval(this.progressInterval);
    clearInterval(this.elapsedInterval);
    clearInterval(this.speedInterval);
    clearTimeout(this.navTimeout);
    this.mapSvc.removeMap('onride-map');
  }

  endTrip(): void {
    this.rideState.completeTrip();
    this.router.navigate(['/ride-completed']);
  }
}
