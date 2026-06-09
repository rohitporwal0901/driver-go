import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MapService } from '../../services/map.service';
import { RideStateService } from '../../services/ride-state.service';
import { MockDataService } from '../../services/mock-data.service';

@Component({
  selector: 'app-searching-driver',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="search-screen">
      <!-- Map with animated car -->
      <div class="map-box">
        <div id="search-map" class="leaflet-map"></div>
      </div>

      <!-- Searching Sheet -->
      <div class="search-sheet">
        <div class="sheet-handle"></div>
        <div class="anim-section">
          <h3>{{ statusMsg }}</h3>
          <p>Sending to 3 nearby drivers...</p>
          <div class="radar-box">
             <div class="radar"></div>
             <div class="radar-dot" style="top: 20%; left: 30%;"></div>
             <div class="radar-dot" style="top: 70%; left: 80%; animation-delay: 1s;"></div>
             <div class="radar-dot" style="top: 50%; left: 20%; animation-delay: 1.5s;"></div>
             <img [src]="'/assets/cars/city_car_front_graphic.png'" alt="Car" class="center-car-img" />
          </div>
        </div>
        <button class="btn-cancel" id="cancel-btn" (click)="cancel()">Cancel</button>
      </div>
    </div>
  `,
  styles: [`
    .search-screen { width:100%; height:100vh; height:100dvh; display:flex; flex-direction:column; background-color:#fff; }
    .map-box { flex:1; position:relative; }
    .leaflet-map { width:100%; height:100%; }
    .search-sheet {
      background:#fff; border-radius:24px 24px 0 0;
      padding:12px 24px 24px; display:flex; flex-direction:column;
      box-shadow:0 -4px 24px rgba(0,0,0,0.08); z-index: 1000;
    }
    .sheet-handle { width:36px; height:4px; background:#E5E7EB; border-radius:4px; margin:0 auto 16px; flex-shrink:0; }
    .anim-section { display:flex; flex-direction:column; align-items:center; justify-content:flex-start; padding-top:10px; }
    h3 { font-family:'Outfit',sans-serif; font-size:18px; font-weight:700; color:#111827; margin:0 0 8px; text-align:center; min-height: 24px; }
    p { font-family:'Inter',sans-serif; font-size:13px; color:#6B7280; margin:0; text-align:center; line-height:1.4; }
    
    .radar-box { position: relative; width: 140px; height: 140px; margin: 30px auto 40px; display: flex; align-items: center; justify-content: center; }
    .radar {
      position: absolute; width: 100%; height: 100%; border-radius: 50%;
      background: rgba(255, 184, 0, 0.1); border: 2px solid rgba(255, 184, 0, 0.3);
      animation: pulse 1.8s infinite cubic-bezier(0.4, 0, 0.2, 1);
    }
    .center-car { font-size: 40px; z-index: 2; }
    .center-car-img { width: 60px; height: auto; z-index: 2; }
    .radar-dot {
      position: absolute; width: 10px; height: 10px; border-radius: 50%;
      background: #10B981; box-shadow: 0 0 8px #10B981;
      animation: blink 2s infinite; opacity: 0;
    }
    @keyframes pulse {
      0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(255, 184, 0, 0.4); }
      70% { transform: scale(1.6); box-shadow: 0 0 0 40px rgba(255, 184, 0, 0); }
      100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(255, 184, 0, 0); }
    }
    @keyframes blink { 0%, 100% { opacity: 0; transform: scale(0.5); } 50% { opacity: 1; transform: scale(1.2); } }
    .btn-cancel {
      width:100%; padding:14px; background:#fff; border:1px solid #E5E7EB;
      border-radius:12px; font-family:'Outfit',sans-serif; font-size:15px;
      font-weight:600; color:#374151; cursor:pointer; transition:all 0.2s;
    }
    .btn-cancel:hover { border-color:#EF4444; color:#EF4444; background:#FEF2F2; }
  `]
})
export class SearchingDriverComponent implements AfterViewInit, OnDestroy {
  progress = 0;
  driverEmoji = '🚗';
  statusMsg = 'Searching for drivers...';
  private statusMsgs = [
    'Searching for drivers...',
    'Contacting 3 nearby drivers...',
    'Waiting for driver confirmation...',
    'Driver found! Confirming details...',
  ];
  private progInterval?: ReturnType<typeof setInterval>;
  private msgTimeout?: ReturnType<typeof setTimeout>;
  private navTimeout?: ReturnType<typeof setTimeout>;
  private carInterval?: ReturnType<typeof setInterval>;

  constructor(
    private router: Router,
    private rideState: RideStateService,
    private mock: MockDataService,
    private mapSvc: MapService,
  ) { }

  ngAfterViewInit(): void {
    const pickup = this.rideState.pickupLocation();
    const center: [number, number] = pickup ? [pickup.lat, pickup.lng] : [23.1793, 75.7849];

    setTimeout(() => {
      const map = this.mapSvc.createMap('search-map', center, 11);
      this.mapSvc.addDotMarker(map, 'sp', center[0], center[1], '#22C55E', 'Your Location');
      // Add nearby driver markers moving around
      const drivers = this.mock.getAvailableDrivers().slice(0, 3);
      drivers.forEach((d, i) => {
        const lat = center[0] + (Math.random() - 0.5) * 0.08;
        const lng = center[1] + (Math.random() - 0.5) * 0.08;
        this.mapSvc.addEmojiMarker(map, 'sd-' + i, lat, lng, '🚗', 26, i === 0);
      });

      // Animate drivers converging to pickup
      let tick = 0;
      this.carInterval = setInterval(() => {
        tick++;
        drivers.forEach((d, i) => {
          const factor = tick * 0.08;
          const lat = center[0] + (0.08 - factor * 0.02) * Math.cos(i * 2.1);
          const lng = center[1] + (0.08 - factor * 0.02) * Math.sin(i * 2.1);
          if (lat && lng && isFinite(lat) && isFinite(lng)) {
            this.mapSvc.moveMarker('sd-' + i, lat, lng, 800);
          }
        });
      }, 1000);
    }, 100);

    this.progInterval = setInterval(() => {
      this.progress = Math.min(100, this.progress + 2.5);
    }, 100);

    let msgIdx = 0;
    const updateMsg = () => {
      this.statusMsg = this.statusMsgs[msgIdx % this.statusMsgs.length];
      msgIdx++;
      this.msgTimeout = setTimeout(updateMsg, 1000);
    };
    updateMsg();

    this.navTimeout = setTimeout(() => {
      this.rideState.setStatus('driver-found');
      this.router.navigate(['/driver-found']);
    }, 4500);
  }

  ngOnDestroy(): void {
    clearInterval(this.progInterval);
    clearInterval(this.carInterval);
    clearTimeout(this.msgTimeout);
    clearTimeout(this.navTimeout);
    this.mapSvc.removeMap('search-map');
  }

  cancel(): void {
    this.rideState.setStatus('idle');
    this.router.navigate(['/home']);
  }
}
