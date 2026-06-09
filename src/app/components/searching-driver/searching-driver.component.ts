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
          <h3>Searching for driver</h3>
          <p>Please wait while we find you the best driver<br/>nearby.</p>
          <div class="graphic-container">
            <img [src]="'/assets/cars/city_car_front_graphic.png'" alt="City Skyline with Car" class="city-car-img" />
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
    h3 { font-family:'Outfit',sans-serif; font-size:18px; font-weight:700; color:#111827; margin:0 0 8px; }
    p { font-family:'Inter',sans-serif; font-size:13px; color:#6B7280; margin:0; text-align:center; line-height:1.4; }
    .graphic-container { margin-top: auto; margin-bottom: 20px; width: 100%; display: flex; justify-content: center; }
    .city-car-img { width: 100%; max-width: 260px; object-fit: contain; }
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
  statusMsg = 'Sending request to driver...';
  private statusMsgs = [
    'Sending request to driver...',
    'Driver reviewing your trip...',
    'Driver accepted! Confirming...',
    'Booking confirmed! 🎉',
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
