import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RideStateService } from '../../services/ride-state.service';
import { MockDataService } from '../../services/mock-data.service';
import { MapService } from '../../services/map.service';
import { Driver } from '../../models/ride.models';

@Component({
  selector: 'app-ride-options',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="drivers-screen">
      <!-- Header -->
      <div class="top-bar">
        <button class="back-btn" id="back-btn" (click)="router.navigate(['/home'])">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </button>
        <div class="route-info">
          <span class="route-text">{{ fromName }} → {{ toName }}</span>
          <span class="route-meta">{{ distance }} km · ~{{ duration }} min</span>
        </div>
      </div>

      <!-- Map -->
      <div class="map-box">
        <div id="drivers-map" class="leaflet-map"></div>
      </div>

      <!-- Driver List -->
      <div class="driver-sheet">
        <div class="sheet-handle"></div>
        <div class="sheet-header">
          <h3>{{ availableDrivers.length }} Drivers Available</h3>
          <div class="filter-chips">
            <button *ngFor="let f of filters" class="filter-chip"
                    [class.active]="activeFilter===f.id"
                    (click)="activeFilter=f.id">{{ f.label }}</button>
          </div>
        </div>

        <div class="driver-list">
          <div class="driver-card" *ngFor="let d of filteredDrivers"
               [class.selected]="selectedDriver?.id===d.id"
               (click)="selectDriver(d)" [id]="'driver-' + d.id">
            <div class="driver-avatar">{{ d.photo }}</div>
            <div class="driver-info">
              <div class="driver-top">
                <strong>{{ d.name }}</strong>
                <span class="rating">⭐ {{ d.rating }}</span>
              </div>
              <div class="driver-meta">
                <span class="tag">{{ d.experience }}</span>
                <span class="tag">{{ d.totalTrips }} trips</span>
                <span class="tag" *ngFor="let s of d.specialties.slice(0,1)">{{ s }}</span>
              </div>
              <div class="driver-langs">
                <span class="lang" *ngFor="let l of d.languages">{{ l }}</span>
              </div>
            </div>
            <div class="driver-price">
              <span class="price">₹{{ calcFare(d) }}</span>
              <small>₹{{ d.pricePerKm }}/km</small>
              <div class="select-dot" [class.active]="selectedDriver?.id===d.id">
                <div class="inner"></div>
              </div>
            </div>
          </div>
        </div>

        <button class="btn-confirm" id="book-driver-btn"
                [disabled]="!selectedDriver" (click)="confirmBooking()">
          Book Selected Driver
        </button>
      </div>
    </div>
  `,
  styles: [`
    .drivers-screen { width:100%; height:100vh; display:flex; flex-direction:column; position:relative; }
    .top-bar {
      position:absolute; top:0; left:0; right:0; z-index:20;
      padding:44px 16px 12px; background:rgba(255,255,255,0.95);
      backdrop-filter:blur(8px); display:flex; align-items:center; gap:12px;
      box-shadow:0 2px 12px rgba(0,0,0,0.06);
    }
    .back-btn {
      width:40px; height:40px; background:#fff; border:1px solid #E5E7EB;
      border-radius:12px; display:flex; align-items:center; justify-content:center;
      cursor:pointer; flex-shrink:0; box-shadow:0 2px 8px rgba(0,0,0,0.06);
    }
    .route-info { flex:1; }
    .route-text { display:block; font-family:'Outfit',sans-serif; font-size:16px; font-weight:700; color:#111827; }
    .route-meta { font-family:'Inter',sans-serif; font-size:12px; color:#6B7280; }
    .map-box { height:42vh; }
    .leaflet-map { width:100%; height:100%; }
    .driver-sheet {
      flex:1; background:#fff; border-radius:24px 24px 0 0;
      padding:12px 16px 24px; overflow-y:auto;
      box-shadow:0 -4px 24px rgba(0,0,0,0.08);
    }
    .sheet-handle { width:36px; height:4px; background:#E5E7EB; border-radius:4px; margin:0 auto 12px; }
    .sheet-header { margin-bottom:12px; }
    .sheet-header h3 { font-family:'Outfit',sans-serif; font-size:18px; font-weight:700; color:#111827; margin:0 0 8px; }
    .filter-chips { display:flex; gap:8px; }
    .filter-chip {
      padding:6px 14px; border-radius:20px; border:1.5px solid #E5E7EB;
      background:#F9FAFB; font-family:'Inter',sans-serif; font-size:12px;
      font-weight:500; color:#6B7280; cursor:pointer; transition:all 0.2s;
    }
    .filter-chip.active { border-color:#FFB800; background:#FFFBEB; color:#D97706; }
    .driver-list { display:flex; flex-direction:column; gap:10px; margin-bottom:16px; }
    .driver-card {
      display:flex; align-items:flex-start; gap:12px; padding:14px;
      background:#FAFAFA; border-radius:16px; border:2px solid transparent;
      cursor:pointer; transition:all 0.2s;
    }
    .driver-card.selected { border-color:#FFB800; background:#FFFBEB; }
    .driver-card:hover:not(.selected) { border-color:#E5E7EB; }
    .driver-avatar {
      width:52px; height:52px; background:#FFF3CD; border-radius:50%;
      display:flex; align-items:center; justify-content:center; font-size:28px;
      border:2px solid #FFB800; flex-shrink:0;
    }
    .driver-info { flex:1; }
    .driver-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:4px; }
    .driver-top strong { font-family:'Outfit',sans-serif; font-size:15px; font-weight:700; color:#111827; }
    .rating { font-family:'Inter',sans-serif; font-size:13px; color:#374151; font-weight:600; }
    .driver-meta { display:flex; gap:5px; flex-wrap:wrap; margin-bottom:5px; }
    .tag {
      background:#F3F4F6; border-radius:6px; padding:2px 7px;
      font-family:'Inter',sans-serif; font-size:11px; color:#6B7280;
    }
    .driver-langs { display:flex; gap:4px; }
    .lang {
      background:#EFF6FF; border-radius:6px; padding:2px 7px;
      font-family:'Inter',sans-serif; font-size:11px; color:#2563EB; font-weight:500;
    }
    .driver-price { text-align:right; display:flex; flex-direction:column; align-items:flex-end; gap:4px; }
    .price { font-family:'Outfit',sans-serif; font-size:20px; font-weight:800; color:#111827; }
    .driver-price small { font-family:'Inter',sans-serif; font-size:11px; color:#9CA3AF; }
    .select-dot {
      width:20px; height:20px; border-radius:50%; border:2px solid #E5E7EB; margin-top:2px;
      display:flex; align-items:center; justify-content:center; transition:all 0.2s;
    }
    .select-dot.active { border-color:#FFB800; }
    .inner { width:10px; height:10px; border-radius:50%; background:transparent; transition:all 0.2s; }
    .select-dot.active .inner { background:#FFB800; }
    .btn-confirm {
      width:100%; padding:18px; background:linear-gradient(135deg,#FFB800,#FF8C00);
      border:none; border-radius:16px; font-family:'Outfit',sans-serif;
      font-size:18px; font-weight:700; color:#fff; cursor:pointer;
      box-shadow:0 8px 24px rgba(255,184,0,0.4); transition:all 0.2s;
    }
    .btn-confirm:disabled { opacity:0.4; cursor:not-allowed; box-shadow:none; }
    .btn-confirm:not(:disabled):active { transform:scale(0.97); }
  `]
})
export class RideOptionsComponent implements AfterViewInit, OnDestroy {
  availableDrivers: Driver[] = [];
  filteredDrivers: Driver[] = [];
  selectedDriver?: Driver;
  fromName = 'Ujjain';
  toName = 'Indore';
  distance = 55;
  duration = 66;
  activeFilter = 'all';
  filters = [
    { id: 'all', label: 'All' },
    { id: 'highway', label: '🛣️ Highway' },
    { id: 'top', label: '⭐ Top Rated' },
    { id: 'cheap', label: '💰 Budget' },
  ];

  private pickupPos?: [number, number];
  private dropPos?: [number, number];

  constructor(
    public router: Router,
    private rideState: RideStateService,
    private mockData: MockDataService,
    private mapSvc: MapService,
  ) {}

  ngAfterViewInit(): void {
    this.availableDrivers = this.mockData.getAvailableDrivers();
    this.filteredDrivers = [...this.availableDrivers];
    this.selectedDriver = this.availableDrivers[0];
    this.rideState.setDriver(this.selectedDriver);

    const p = this.rideState.pickupLocation();
    const d = this.rideState.dropLocation();
    if (p) { this.pickupPos = [p.lat, p.lng]; this.fromName = p.name || p.city || ''; }
    else { this.pickupPos = [23.1793, 75.7849]; }
    if (d) { this.dropPos = [d.lat, d.lng]; this.toName = d.name || d.city || ''; }
    else { this.dropPos = [22.7196, 75.8577]; }

    this.distance = this.rideState.distanceKm;
    this.duration = this.rideState.durationMin;

    const center: [number, number] = [
      (this.pickupPos[0] + this.dropPos[0]) / 2,
      (this.pickupPos[1] + this.dropPos[1]) / 2,
    ];

    setTimeout(() => {
      const map = this.mapSvc.createMap('drivers-map', center, 9);
      this.mapSvc.addDotMarker(map, 'pickup', this.pickupPos![0], this.pickupPos![1], '#22C55E', this.fromName);
      this.mapSvc.addDotMarker(map, 'drop', this.dropPos![0], this.dropPos![1], '#EF4444', this.toName);
      // Draw route
      const mid: [number, number] = [center[0] + 0.1, center[1]];
      this.mapSvc.drawRoute(map, 'route', [this.pickupPos!, mid, this.dropPos!], '#FFB800');
      // Show driver markers
      this.availableDrivers.forEach((drv, i) => {
        const lat = center[0] + (Math.random() - 0.5) * 0.4;
        const lng = center[1] + (Math.random() - 0.5) * 0.4;
        this.mapSvc.addEmojiMarker(map, 'drv-' + i, lat, lng, '🚗', 24, false);
      });
      this.mapSvc.fitBounds(map, [this.pickupPos!, this.dropPos!]);
    }, 100);
  }

  ngOnDestroy(): void { this.mapSvc.removeMap('drivers-map'); }

  calcFare(d: Driver): number { return this.mockData.calculateFare(d, this.distance); }

  applyFilter(f: string): void {
    this.activeFilter = f;
    switch (f) {
      case 'highway': this.filteredDrivers = this.availableDrivers.filter(d => d.specialties.includes('Highway')); break;
      case 'top': this.filteredDrivers = [...this.availableDrivers].sort((a, b) => b.rating - a.rating); break;
      case 'cheap': this.filteredDrivers = [...this.availableDrivers].sort((a, b) => a.pricePerKm - b.pricePerKm); break;
      default: this.filteredDrivers = [...this.availableDrivers];
    }
  }

  selectDriver(d: Driver): void {
    this.selectedDriver = d;
    this.rideState.setDriver(d);
    const map = this.mapSvc.getMap('drivers-map');
    if (map && this.pickupPos) this.mapSvc.panTo(map, d.lat, d.lng);
  }

  confirmBooking(): void { this.router.navigate(['/confirm-ride']); }
}
