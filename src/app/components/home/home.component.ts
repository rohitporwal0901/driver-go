import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RideStateService } from '../../services/ride-state.service';
import { MockDataService } from '../../services/mock-data.service';
import { MapService } from '../../services/map.service';
import { Location, CarType } from '../../models/ride.models';
import * as L from 'leaflet';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="home">
      <!-- Header -->
      <div class="header">
        <div class="header-left">
          <button class="menu-btn" id="menu-btn">
            <span></span><span></span><span></span>
          </button>
          <div class="greeting">
            <h1>Namaste, Rohit 👋</h1>
            <p>Aaj kahan jaana hai?</p>
          </div>
        </div>
        <button class="notif-btn" id="notif-btn">
          <span>🔔</span>
          <div class="badge">2</div>
        </button>
      </div>

      <!-- Map -->
      <div class="map-box">
        <div id="home-map" class="leaflet-map"></div>
        <div class="map-gradient"></div>
      </div>

      <!-- Search Sheet -->
      <div class="search-sheet">
        <div class="sheet-handle"></div>
        <!-- Trip Input -->
        <div class="trip-inputs" (click)="openSearch()">
          <div class="input-row from">
            <div class="dot green-dot"></div>
            <div class="input-fake">
              <small>From</small>
              <span [class.placeholder]="!fromCity">{{ fromCity || 'Pickup city / location' }}</span>
            </div>
          </div>
          <div class="input-divider">
            <div class="vline"></div>
            <button class="swap-btn" id="swap-btn" (click)="swap($event)">⇅</button>
          </div>
          <div class="input-row to">
            <div class="dot red-dot"></div>
            <div class="input-fake">
              <small>To</small>
              <span [class.placeholder]="!toCity">{{ toCity || 'Destination city / location' }}</span>
            </div>
          </div>
        </div>

        <!-- Car Type Selection -->
        <div class="section-title">Aapki Car Type</div>
        <div class="car-types">
          <button *ngFor="let c of carTypes"
                  class="car-chip" [class.selected]="selectedCar?.id===c.id"
                  [id]="'car-' + c.id"
                  (click)="selectCar(c)">
            <span>{{ c.icon }}</span>
            <span>{{ c.name }}</span>
          </button>
        </div>

        <!-- Popular Routes -->
        <div class="section-title">Popular Routes</div>
        <div class="routes-scroll">
          <div class="route-chip" *ngFor="let r of popularRoutes" (click)="selectRoute(r)">
            <span class="route-from">{{ r.from }}</span>
            <span class="arrow">→</span>
            <span class="route-to">{{ r.to }}</span>
            <span class="route-km">~{{ r.km }} km</span>
          </div>
        </div>

        <button class="btn-find" id="find-drivers-btn"
                (click)="findDrivers()" [disabled]="!pickupSet || !dropSet">
          🔍 Find Drivers
        </button>
      </div>
    </div>

    <!-- Location Overlay -->
    <div class="loc-overlay" *ngIf="showSearch">
      <div class="loc-sheet">
        <div class="loc-header">
          <button class="close-btn" (click)="showSearch=false">✕</button>
          <h3>Trip Details</h3>
        </div>

        <div class="loc-field">
          <div class="dot green-dot"></div>
          <div class="loc-input-wrap">
            <label>Pickup</label>
            <input #fromInput [(ngModel)]="fromQuery" (input)="onFrom()"
                   placeholder="From: Ujjain, Indore..." id="from-input" />
          </div>
        </div>
        <div class="field-divider"></div>
        <div class="loc-field">
          <div class="dot red-dot"></div>
          <div class="loc-input-wrap">
            <label>Destination</label>
            <input #toInput [(ngModel)]="toQuery" (input)="onTo()"
                   placeholder="To: Indore, Bhopal..." id="to-input" />
          </div>
        </div>

        <div class="suggestions" *ngIf="suggestions.length">
          <div class="sug-item" *ngFor="let s of suggestions" (click)="pickCity(s)">
            <span class="sug-icon">📍</span>
            <div>
              <strong>{{ s.name }}</strong>
              <small>{{ s.address }}</small>
            </div>
          </div>
        </div>

        <button class="btn-done" [disabled]="!pickupSet||!dropSet"
                (click)="confirmLoc()">
          Confirm Locations
        </button>
      </div>
    </div>
  `,
  styles: [`
    .home { width:100%; height:100vh; display:flex; flex-direction:column; position:relative; overflow:hidden; }
    .header {
      position:absolute; top:0; left:0; right:0; z-index:20;
      padding:44px 16px 12px;
      background:linear-gradient(180deg,rgba(255,255,255,0.98) 70%,transparent);
      display:flex; align-items:center; justify-content:space-between;
    }
    .header-left { display:flex; align-items:center; gap:10px; }
    .menu-btn {
      background:#fff; border:1px solid #E5E7EB; border-radius:12px;
      width:42px; height:42px; display:flex; flex-direction:column;
      align-items:center; justify-content:center; gap:5px; cursor:pointer;
      box-shadow:0 2px 8px rgba(0,0,0,0.06);
    }
    .menu-btn span { display:block; width:18px; height:2px; background:#374151; border-radius:2px; }
    .greeting h1 { font-family:'Outfit',sans-serif; font-size:18px; font-weight:700; color:#111827; margin:0; }
    .greeting p { font-family:'Inter',sans-serif; font-size:12px; color:#9CA3AF; margin:0; }
    .notif-btn {
      background:#fff; border:1px solid #E5E7EB; border-radius:12px;
      width:42px; height:42px; display:flex; align-items:center; justify-content:center;
      font-size:18px; cursor:pointer; position:relative; box-shadow:0 2px 8px rgba(0,0,0,0.06);
    }
    .badge {
      position:absolute; top:6px; right:6px;
      width:15px; height:15px; background:#EF4444; border-radius:50%;
      font-family:'Inter',sans-serif; font-size:9px; font-weight:700; color:#fff;
      display:flex; align-items:center; justify-content:center;
    }
    .map-box { height:50vh; position:relative; }
    .leaflet-map { width:100%; height:100%; }
    .map-gradient {
      position:absolute; bottom:0; left:0; right:0; height:80px;
      background:linear-gradient(0deg,#f9fafb,transparent);
    }
    .search-sheet {
      flex:1; background:#fff; border-radius:24px 24px 0 0;
      padding:12px 16px 24px; overflow-y:auto;
      box-shadow:0 -4px 24px rgba(0,0,0,0.08); z-index:5;
    }
    .sheet-handle { width:36px; height:4px; background:#E5E7EB; border-radius:4px; margin:0 auto 14px; }
    .trip-inputs {
      background:#F9FAFB; border-radius:16px; padding:12px; cursor:pointer;
      border:1.5px solid #E5E7EB; transition:all 0.2s; margin-bottom:14px;
    }
    .trip-inputs:active { border-color:#FFB800; }
    .input-row { display:flex; align-items:center; gap:10px; padding:6px 0; }
    .dot { width:12px; height:12px; border-radius:50%; flex-shrink:0; }
    .green-dot { background:#22C55E; box-shadow:0 0 0 3px rgba(34,197,94,0.2); }
    .red-dot { background:#EF4444; box-shadow:0 0 0 3px rgba(239,68,68,0.2); }
    .input-fake { flex:1; }
    .input-fake small { display:block; font-family:'Inter',sans-serif; font-size:10px; color:#9CA3AF; text-transform:uppercase; }
    .input-fake span { font-family:'Inter',sans-serif; font-size:14px; font-weight:500; color:#111827; }
    .input-fake .placeholder { color:#9CA3AF; font-weight:400; }
    .input-divider { display:flex; align-items:center; gap:8px; padding-left:6px; }
    .vline { width:1px; height:14px; background:#E5E7EB; }
    .swap-btn {
      background:#FFF3CD; border:none; border-radius:8px; padding:4px 8px;
      font-size:16px; cursor:pointer; color:#FFB800; font-weight:700;
    }
    .section-title {
      font-family:'Outfit',sans-serif; font-size:14px; font-weight:700;
      color:#374151; margin-bottom:10px; margin-top:4px;
    }
    .car-types { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:14px; }
    .car-chip {
      display:flex; align-items:center; gap:6px; padding:8px 14px;
      background:#F9FAFB; border-radius:20px; border:2px solid #E5E7EB;
      font-family:'Inter',sans-serif; font-size:13px; font-weight:500; color:#374151;
      cursor:pointer; transition:all 0.2s;
    }
    .car-chip.selected { border-color:#FFB800; background:#FFFBEB; color:#D97706; }
    .routes-scroll {
      display:flex; gap:8px; overflow-x:auto; margin-bottom:16px;
      padding-bottom:4px;
    }
    .routes-scroll::-webkit-scrollbar { height:0; }
    .route-chip {
      flex-shrink:0; display:flex; align-items:center; gap:5px;
      background:#F9FAFB; border:1.5px solid #E5E7EB; border-radius:20px;
      padding:8px 14px; cursor:pointer; transition:all 0.2s;
    }
    .route-chip:active { border-color:#FFB800; background:#FFFBEB; }
    .route-from,.route-to { font-family:'Inter',sans-serif; font-size:13px; font-weight:600; color:#111827; }
    .arrow { color:#9CA3AF; font-size:12px; }
    .route-km { font-family:'Inter',sans-serif; font-size:11px; color:#9CA3AF; }
    .btn-find {
      width:100%; padding:18px; background:linear-gradient(135deg,#FFB800,#FF8C00);
      border:none; border-radius:16px; font-family:'Outfit',sans-serif;
      font-size:18px; font-weight:700; color:#fff; cursor:pointer;
      box-shadow:0 8px 24px rgba(255,184,0,0.4); transition:all 0.2s;
    }
    .btn-find:disabled { opacity:0.4; cursor:not-allowed; box-shadow:none; }
    .btn-find:not(:disabled):active { transform:scale(0.97); }

    /* Overlay */
    .loc-overlay {
      position:fixed; inset:0; z-index:200;
      background:rgba(0,0,0,0.5); backdrop-filter:blur(4px);
      display:flex; align-items:flex-end;
    }
    .loc-sheet {
      width:100%; background:#fff; border-radius:24px 24px 0 0;
      padding:16px 20px 48px; max-height:82vh; overflow-y:auto;
      animation:slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1);
    }
    @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
    .loc-header { display:flex; align-items:center; gap:12px; margin-bottom:20px; }
    .close-btn {
      background:#F3F4F6; border:none; border-radius:10px; width:36px; height:36px;
      display:flex; align-items:center; justify-content:center; cursor:pointer;
      font-size:14px; color:#374151;
    }
    .loc-header h3 { font-family:'Outfit',sans-serif; font-size:20px; font-weight:700; color:#111827; margin:0; }
    .loc-field { display:flex; align-items:center; gap:12px; padding:10px 0; }
    .loc-input-wrap { flex:1; }
    .loc-input-wrap label { display:block; font-family:'Inter',sans-serif; font-size:11px; color:#9CA3AF; text-transform:uppercase; margin-bottom:3px; }
    .loc-input-wrap input {
      width:100%; border:none; outline:none; font-family:'Inter',sans-serif;
      font-size:16px; color:#111827; background:transparent;
    }
    .loc-input-wrap input::placeholder { color:#9CA3AF; }
    .field-divider { height:1px; background:#F3F4F6; margin:0 0 0 24px; }
    .suggestions { margin-top:12px; border-radius:14px; overflow:hidden; border:1px solid #F3F4F6; }
    .sug-item {
      display:flex; align-items:center; gap:12px; padding:14px 16px;
      cursor:pointer; border-bottom:1px solid #F9FAFB; transition:background 0.15s;
    }
    .sug-item:last-child{ border-bottom:none; }
    .sug-item:hover{ background:#FFFBEB; }
    .sug-icon{ font-size:16px; }
    .sug-item strong{ display:block; font-family:'Inter',sans-serif; font-size:14px; font-weight:600; color:#111827; }
    .sug-item small{ font-family:'Inter',sans-serif; font-size:12px; color:#9CA3AF; }
    .btn-done {
      width:100%; margin-top:16px; padding:16px;
      background:linear-gradient(135deg,#FFB800,#FF8C00);
      border:none; border-radius:14px; font-family:'Outfit',sans-serif;
      font-size:17px; font-weight:700; color:#fff; cursor:pointer;
      box-shadow:0 6px 20px rgba(255,184,0,0.35);
    }
    .btn-done:disabled{ opacity:0.4; cursor:not-allowed; box-shadow:none; }
  `]
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  showSearch = false;
  fromQuery = '';
  toQuery = '';
  fromCity = '';
  toCity = '';
  pickupSet = false;
  dropSet = false;
  activeField: 'from' | 'to' = 'from';
  suggestions: Location[] = [];
  selectedCar?: CarType;
  carTypes: CarType[] = [];

  popularRoutes = [
    { from: 'Ujjain', to: 'Indore', km: 55 },
    { from: 'Ujjain', to: 'Bhopal', km: 185 },
    { from: 'Indore', to: 'Mumbai', km: 570 },
    { from: 'Bhopal', to: 'Jabalpur', km: 290 },
    { from: 'Indore', to: 'Jaipur', km: 520 },
  ];

  private pickup?: Location;
  private drop?: Location;

  constructor(
    private router: Router,
    private rideState: RideStateService,
    private mockData: MockDataService,
    private mapSvc: MapService,
  ) {}

  ngAfterViewInit(): void {
    this.carTypes = this.mockData.CAR_TYPES;
    this.selectedCar = this.carTypes[1]; // default Sedan
    this.rideState.setCarType(this.selectedCar);

    setTimeout(() => {
      const map = this.mapSvc.createMap('home-map', [22.95, 75.82], 8);
      // Show MP area
      this.mapSvc.addDotMarker(map, 'ujjain', 23.1793, 75.7849, '#22C55E', 'Ujjain');
      this.mapSvc.addDotMarker(map, 'indore', 22.7196, 75.8577, '#EF4444', 'Indore');
      this.mapSvc.drawRoute(map, 'demo-route',
        [[23.1793, 75.7849], [22.95, 75.82], [22.7196, 75.8577]],
        '#FFB800', true
      );
      // Animate a dummy driver marker
      this.mapSvc.addEmojiMarker(map, 'demo-driver', 22.95, 75.82, '🚗', 28, true);
    }, 100);
  }

  ngOnDestroy(): void { this.mapSvc.removeMap('home-map'); }

  openSearch(): void {
    this.showSearch = true;
    this.suggestions = this.mockData.POPULAR_CITIES.slice(0, 6);
    this.activeField = this.pickupSet ? 'to' : 'from';
  }

  onFrom(): void {
    this.activeField = 'from';
    this.suggestions = this.mockData.filterCities(this.fromQuery);
  }

  onTo(): void {
    this.activeField = 'to';
    this.suggestions = this.mockData.filterCities(this.toQuery);
  }

  pickCity(loc: Location): void {
    if (this.activeField === 'from') {
      this.pickup = loc; this.fromQuery = loc.name || loc.city || '';
      this.fromCity = this.fromQuery; this.pickupSet = true;
      this.rideState.setPickup(loc);
      this.activeField = 'to';
    } else {
      this.drop = loc; this.toQuery = loc.name || loc.city || '';
      this.toCity = this.toQuery; this.dropSet = true;
      this.rideState.setDrop(loc);
    }
    this.suggestions = [];
  }

  confirmLoc(): void { this.showSearch = false; }

  swap(e: Event): void {
    e.stopPropagation();
    [this.fromCity, this.toCity] = [this.toCity, this.fromCity];
    [this.fromQuery, this.toQuery] = [this.toQuery, this.fromQuery];
    [this.pickup, this.drop] = [this.drop, this.pickup];
    if (this.pickup) this.rideState.setPickup(this.pickup);
    if (this.drop) this.rideState.setDrop(this.drop);
  }

  selectCar(c: CarType): void { this.selectedCar = c; this.rideState.setCarType(c); }

  selectRoute(r: { from: string; to: string; km: number }): void {
    const from = this.mockData.POPULAR_CITIES.find(c => c.name === r.from);
    const to = this.mockData.POPULAR_CITIES.find(c => c.name === r.to);
    if (from && to) {
      this.pickup = from; this.drop = to;
      this.fromCity = from.name || ''; this.toCity = to.name || '';
      this.pickupSet = true; this.dropSet = true;
      this.rideState.setPickup(from); this.rideState.setDrop(to);
    }
  }

  findDrivers(): void { this.router.navigate(['/ride-options']); }
}
