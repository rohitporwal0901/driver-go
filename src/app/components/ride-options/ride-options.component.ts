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
          <h3>{{ filteredDrivers.length }} Drivers Available</h3>
          <div class="filter-chips">
            <button *ngFor="let f of filters" class="filter-chip"
                    [class.active]="activeFilter===f.id"
                    (click)="applyFilter(f.id)">{{ f.label }}</button>
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
    .drivers-screen { width:100%; height:100dvh; display:flex; flex-direction:column; position:relative; overflow:hidden; }
    .top-bar {
      position:absolute; top:calc(16px + var(--safe-top)); left:16px; right:16px; z-index:2000;
      padding:16px; border-radius:var(--radius-md); background:var(--surface);
      display:flex; align-items:center; gap:12px; box-shadow:var(--shadow-md);
    }
    .back-btn {
      width:40px; height:40px; background:var(--bg-color); border:1px solid var(--border-color);
      border-radius:12px; display:flex; align-items:center; justify-content:center;
      cursor:pointer; flex-shrink:0; box-shadow:var(--shadow-sm);
    }
    .route-info { flex:1; }
    .route-text { display:block; font-family:'Outfit',sans-serif; font-size:16px; font-weight:700; color:var(--text-primary); }
    .route-meta { font-family:'Inter',sans-serif; font-size:12px; color:var(--text-secondary); }
    .map-box { height:45dvh; position:relative; }
    .leaflet-map { width:100%; height:100%; }
    .driver-sheet {
      flex:1; background:var(--surface); border-radius:var(--radius-lg) var(--radius-lg) 0 0;
      padding:var(--spacing-3) 16px max(var(--spacing-3), var(--safe-bottom)); overflow-y:auto;
      box-shadow:var(--shadow-sheet); z-index: 10;
    }
    .sheet-handle { width:40px; height:4px; background:var(--border-color); border-radius:4px; margin:0 auto var(--spacing-2); }
    .sheet-header { margin-bottom:var(--spacing-2); }
    .sheet-header h3 { font-family:'Outfit',sans-serif; font-size:18px; font-weight:800; color:var(--text-primary); margin:0 0 12px; }
    .filter-chips { display:flex; gap:10px; overflow-x:auto; padding-bottom:4px; scrollbar-width:none; -webkit-overflow-scrolling: touch; }
    .filter-chips::-webkit-scrollbar { display:none; }
    .filter-chip {
      flex-shrink:0; padding:8px 16px; border-radius:20px; border:1.5px solid var(--border-color);
      background:var(--surface); font-family:'Inter',sans-serif; font-size:13px;
      font-weight:600; color:var(--text-secondary); cursor:pointer; transition:all 0.2s;
    }
    .filter-chip.active { border-color:var(--primary); color:#D97706; background:#FFFBEB; }
    
    .driver-list { display:flex; flex-direction:column; gap:12px; margin-bottom:var(--spacing-3); }
    .driver-card {
      display:flex; align-items:flex-start; gap:12px; padding:var(--spacing-2);
      background:var(--surface); border-radius:var(--radius-md); border:2px solid transparent;
      cursor:pointer; transition:all 0.2s; box-shadow:var(--shadow-sm);
    }
    .driver-card:not(.selected) { border-color:var(--border-color); background:var(--bg-color); }
    .driver-card.selected { border-color:var(--primary); background:var(--surface); box-shadow:0 4px 16px rgba(255,184,0,0.1); }
    
    .driver-avatar {
      width:50px; height:50px; background:#FFFBEB; border-radius:50%;
      display:flex; align-items:center; justify-content:center; font-size:28px;
      border:2px solid var(--primary); flex-shrink:0;
    }
    .driver-info { flex:1; min-width: 0; }
    .driver-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
    .driver-top strong { font-family:'Outfit',sans-serif; font-size:15px; font-weight:800; color:var(--text-primary); letter-spacing:-0.2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .rating { font-family:'Inter',sans-serif; font-size:12px; color:var(--text-primary); font-weight:700; flex-shrink: 0; margin-left: 4px; }
    
    .driver-meta { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:8px; }
    .tag {
      background:var(--border-color); border-radius:4px; padding:4px 6px;
      font-family:'Inter',sans-serif; font-size:10px; font-weight:500; color:var(--text-secondary);
    }
    .driver-langs { display:flex; gap:6px; flex-wrap: wrap; }
    .lang {
      background:#EFF6FF; border-radius:4px; padding:4px 6px;
      font-family:'Inter',sans-serif; font-size:10px; font-weight:600; color:#2563EB;
    }
    
    .driver-price { text-align:right; display:flex; flex-direction:column; align-items:flex-end; gap:4px; flex-shrink: 0; margin-left: 8px; }
    .price { font-family:'Outfit',sans-serif; font-size:18px; font-weight:800; color:var(--text-primary); letter-spacing:-0.5px; }
    .driver-price small { font-family:'Inter',sans-serif; font-size:10px; font-weight:500; color:var(--text-tertiary); }
    
    .select-dot {
      width:20px; height:20px; border-radius:50%; border:2px solid #D1D5DB; margin-top:6px;
      display:flex; align-items:center; justify-content:center; transition:all 0.2s; background:var(--surface);
    }
    .select-dot.active { border-color:var(--primary); }
    .inner { width:10px; height:10px; border-radius:50%; background:transparent; transition:all 0.2s; }
    .select-dot.active .inner { background:var(--primary); }
    
    .btn-confirm {
      width:100%; padding:16px; height:56px;
      background:var(--primary-gradient);
      border:none; border-radius:var(--radius-md); font-family:'Outfit',sans-serif;
      font-size:18px; font-weight:800; color:#ffffff; cursor:pointer;
      box-shadow: 0 8px 24px rgba(255, 184, 0, 0.35); transition:all 0.2s;
    }
    .btn-confirm:disabled { background: #FCD34D; color: rgba(255,255,255,0.8); cursor:not-allowed; box-shadow:none; }
    .btn-confirm:not(:disabled):active { transform:scale(0.97); box-shadow: 0 4px 12px rgba(255, 184, 0, 0.2); }
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
