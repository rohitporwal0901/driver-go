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
        <button class="sos-btn" id="sos-btn">🚨 SOS</button>
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
          <button class="act-btn" id="call-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            Call
          </button>
          <button class="act-btn" id="chat-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            Chat
          </button>
          <button class="act-btn danger" id="end-trip-btn" (click)="endTrip()">🏁 End Trip</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .onride-screen { width:100%; height:100dvh; display:flex; flex-direction:column; position:relative; }
    .top-bar {
      position:absolute; top:40px; left:16px; right:16px; z-index:20;
      background:rgba(255,255,255,0.95); backdrop-filter:blur(8px);
      padding:12px 16px; border-radius:16px; border:1px solid #F3F4F6;
      display:flex; align-items:center; justify-content:space-between;
      box-shadow:0 4px 16px rgba(0,0,0,0.06);
    }
    .trip-label span:first-child { display:block; font-family:'Outfit',sans-serif; font-size:16px; font-weight:800; color:#111827; }
    .elapsed { font-family:'Inter',sans-serif; font-size:12px; font-weight:500; color:#6B7280; }
    .sos-btn {
      background:#EF4444; color:#fff; border:none; border-radius:20px;
      padding:8px 14px; font-family:'Outfit',sans-serif; font-size:14px; font-weight:800;
      cursor:pointer; animation:sosPulse 1.5s ease-in-out infinite;
      display:flex; align-items:center; gap:4px;
    }
    @keyframes sosPulse { 0%,100%{box-shadow:0 4px 12px rgba(239,68,68,0.3)} 50%{box-shadow:0 4px 20px rgba(239,68,68,0.6)} }
    
    .map-box { flex:1; }
    .leaflet-map { width:100%; height:100%; }
    
    .ride-panel {
      background:#fff; border-radius:24px 24px 0 0;
      padding:20px 20px 28px; box-shadow:0 -4px 24px rgba(0,0,0,0.06); z-index:5;
    }
    .sheet-handle { width:40px; height:4px; background:#E5E7EB; border-radius:4px; margin:0 auto 16px; }
    
    .driver-row { display:flex; align-items:center; gap:16px; margin-bottom:20px; }
    .drv-av {
      width:52px; height:52px; background:#FFFBEB; border-radius:50%;
      display:flex; align-items:center; justify-content:center; font-size:28px;
      border:2px solid #FFB800; flex-shrink:0;
    }
    .drv-info { flex:1; }
    .drv-info strong { display:block; font-family:'Outfit',sans-serif; font-size:16px; font-weight:800; color:#111827; }
    .drv-info span { font-family:'Inter',sans-serif; font-size:13px; font-weight:500; color:#6B7280; }
    .drv-right { text-align:right; }
    .rating { font-family:'Outfit',sans-serif; font-size:15px; font-weight:800; }
    .speed-badge {
      background:#FFFBEB; border:1px solid #FFD466; border-radius:8px;
      padding:4px 8px; font-family:'Outfit',sans-serif; font-size:12px; font-weight:800; color:#D97706;
      margin-top:4px; display:inline-block;
    }
    
    .trip-progress { margin-bottom:16px; }
    .prog-row { display:flex; justify-content:space-between; margin-bottom:12px; }
    .prog-label { font-family:'Inter',sans-serif; font-size:13px; font-weight:600; color:#6B7280; }
    .prog-pct { font-family:'Outfit',sans-serif; font-size:14px; font-weight:800; color:#F59E0B; }
    .prog-track {
      height:8px; background:#F3F4F6; border-radius:4px;
      position:relative; margin-bottom:6px;
    }
    .prog-fill {
      height:100%; background:linear-gradient(90deg,#FCD34D,#F59E0B);
      border-radius:4px; transition:width 1s linear; position:relative;
    }
    .prog-car {
      position:absolute; right:-12px; top:-10px;
      font-size:22px; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.15));
      transform: scaleX(-1);
    }
    .prog-places { display:flex; justify-content:space-between; }
    .prog-places span { font-family:'Inter',sans-serif; font-size:11px; font-weight:600; color:#9CA3AF; }
    
    .loc-summary { background:#FAFAFA; border:1px solid #F3F4F6; border-radius:12px; padding:12px; margin-bottom:12px; }
    .loc-row { display:flex; align-items:center; gap:10px; padding:4px 0; }
    .dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
    .g { background:#10B981; } .r { background:#EF4444; }
    .loc-row span { font-family:'Inter',sans-serif; font-size:13px; font-weight:500; color:#374151; }
    
    .fare-info {
      display:flex; align-items:center; justify-content:space-between;
      padding:12px 0; border-top:1px solid #F3F4F6; margin-bottom:12px;
    }
    .fare-lbl { font-family:'Inter',sans-serif; font-size:14px; font-weight:600; color:#6B7280; }
    .fare-val { font-family:'Outfit',sans-serif; font-size:22px; font-weight:800; color:#111827; letter-spacing:-0.5px; }
    
    .actions { display:flex; gap:12px; }
    .act-btn {
      flex:1; padding:12px 0; border-radius:14px; border:1.5px solid #E5E7EB;
      background:#fff; font-family:'Inter',sans-serif; font-size:13px;
      font-weight:700; color:#111827; cursor:pointer;
      display:flex; align-items:center; justify-content:center; gap:6px; transition:all 0.2s;
    }
    .act-btn:active { background:#F9FAFB; transform:scale(0.98); }
    .act-btn.danger { background:#FEF2F2; border-color:#FECACA; color:#DC2626; }
    .act-btn.danger:active { background:#FEE2E2; }
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
