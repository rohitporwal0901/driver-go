import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
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
            <p *ngIf="!loadingLocation">Aaj kahan jaana hai?</p>
            <p *ngIf="loadingLocation" class="gps-loading">
               <span class="spinner"></span> Finding location...
            </p>
          </div>
        </div>
        <button class="notif-btn" id="notif-btn" (click)="goToNotifications()">
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
          <div class="trip-connector"></div>
          <button class="swap-btn" id="swap-btn" (click)="swap($event)">⇅</button>

          <div class="input-row from">
            <div class="dot green-dot"></div>
            <div class="input-fake">
              <small>FROM</small>
              <span [class.placeholder]="!fromCity">{{ fromCity || 'Pickup city / location' }}</span>
            </div>
          </div>
          <div class="input-row to">
            <div class="dot red-dot"></div>
            <div class="input-fake">
              <small>TO</small>
              <span [class.placeholder]="!toCity">{{ toCity || 'Destination city / location' }}</span>
            </div>
          </div>
        </div>

        <!-- Car Type Selection -->
        <div class="section-title">Selecting Car Type</div>
        <div class="car-types">
          <button *ngFor="let c of carTypes"
                  class="car-card" [class.selected]="selectedCar?.id===c.id"
                  [id]="'car-' + c.id"
                  (click)="selectCar(c)">
            <!-- Use real image or fallback to icon if image missing -->
            <img [src]="'/assets/cars/' + c.id + '.png'" class="car-img" alt="{{c.name}}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
            <span class="car-icon-fallback" style="display:none">{{ c.icon }}</span>
            
            <span class="car-name">{{ c.name }}</span>
            <span class="car-price" *ngIf="distance">₹{{ getEstimatedFare(c) }}</span>
            <span class="car-price-placeholder" *ngIf="!distance">--</span>
          </button>
        </div>

        <!-- Transmission Selection -->
        <div class="section-title">Transmission</div>
        <div class="transmission-options">
          <button class="trans-btn" [class.active]="transmission === 'manual'" (click)="transmission = 'manual'">
            ⚙️ Manual
          </button>
          <button class="trans-btn" [class.active]="transmission === 'auto'" (click)="transmission = 'auto'">
            🔄 Automatic
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
          <span *ngIf="!distance">🔍 Find Drivers</span>
          <span *ngIf="distance" style="display:flex; justify-content:space-between; width:100%; padding: 0 10px;">
             <span>🔍 Find Drivers</span>
             <span>{{ distance }} km • ₹{{ fare }}</span>
          </span>
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
    .home { width:100%; height:100dvh; display:flex; flex-direction:column; position:relative; overflow:hidden; }
    .header {
      position:absolute; top:calc(16px + env(safe-area-inset-top, 0px)); left:16px; right:16px; z-index:2000;
      padding:16px; border-radius:16px;
      background: #ffffff;
      display:flex; align-items:center; justify-content:space-between;
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    }
    .header-left { display:flex; align-items:center; gap:12px; }
    .menu-btn {
      background:#F9FAFB; border:1px solid #E5E7EB; border-radius:12px;
      width:42px; height:42px; display:flex; flex-direction:column;
      align-items:center; justify-content:center; gap:5px; cursor:pointer;
      box-shadow:0 2px 4px rgba(0,0,0,0.02);
    }
    .menu-btn span { display:block; width:18px; height:2px; background:#374151; border-radius:2px; }
    .greeting h1 { font-family:'Outfit',sans-serif; font-size:18px; font-weight:700; color:#111827; margin:0; }
    .greeting p { font-family:'Inter',sans-serif; font-size:12px; color:#9CA3AF; margin:0; display:flex; align-items:center; gap:6px;}
    .gps-loading { color: #D97706 !important; font-weight: 500; }
    .spinner { width:12px; height:12px; border:2px solid #FDE68A; border-top-color:#D97706; border-radius:50%; animation:spin 1s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }
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
    .map-box { height:45dvh; min-height: 300px; position:relative; }
    .leaflet-map { width:100%; height:100%; }
    .map-gradient {
      position:absolute; bottom:0; left:0; right:0; height:80px;
      background:linear-gradient(0deg,#f9fafb,transparent);
    }
    .search-sheet {
      flex:1; background:#fff; border-radius:20px 20px 0 0;
      padding:20px 20px 30px; overflow-y:auto;
      box-shadow:0 -4px 24px rgba(0,0,0,0.06); z-index:5;
    }
    .sheet-handle { width:36px; height:4px; background:#E5E7EB; border-radius:4px; margin:0 auto 20px; }
    
    .trip-inputs {
      position: relative;
      background:#F9FAFB; border-radius:16px; padding:16px 20px; cursor:pointer;
      border:1px solid #F3F4F6; transition:all 0.2s; margin-bottom:24px;
    }
    .trip-inputs:active { border-color:#FFB800; }
    
    .trip-connector {
      position: absolute; top: 34px; bottom: 34px; left: 14px; width: 1px; background: #E5E7EB; z-index: 1;
    }
    .swap-btn {
      position: absolute; left: 0px; top: 50%; transform: translateY(-50%); z-index: 3;
      background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 50%; width: 28px; height: 28px;
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; cursor: pointer; color: #D97706; font-weight: bold;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .input-row { display:flex; align-items:center; gap:12px; position: relative; z-index: 2; margin-left: 18px; }
    .input-row.from { margin-bottom: 24px; }
    
    .dot { width:14px; height:14px; border-radius:50%; flex-shrink:0; box-sizing: border-box; }
    .green-dot { background:#22C55E; border: 3px solid #BBF7D0; margin-left: -7px; }
    .red-dot { background:#EF4444; border: 3px solid #FECACA; margin-left: -7px; }
    
    .input-fake { flex:1; display: flex; flex-direction: column; gap: 2px; overflow:hidden; }
    .input-fake small { font-family:'Inter',sans-serif; font-size:10px; color:#9CA3AF; text-transform:uppercase; font-weight:600; letter-spacing:0.5px; }
    .input-fake span { font-family:'Inter',sans-serif; font-size:15px; font-weight:500; color:#374151; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; display:block; width:100%; }
    .input-fake .placeholder { color:#9CA3AF; }

    .section-title {
      font-family:'Outfit',sans-serif; font-size:16px; font-weight:800;
      color:#1F2937; margin-bottom:14px; margin-top:8px;
    }
    .car-types { 
      display:flex; gap:12px; margin-bottom:24px; overflow-x:auto; padding-bottom:4px;
      scrollbar-width: none; /* Hide scrollbar */
    }
    .car-types::-webkit-scrollbar { display: none; }
    
    .car-card {
      flex-shrink:0; display:flex; flex-direction:column; align-items:center; justify-content:center;
      width: 90px; height: 105px; padding: 10px;
      background:#ffffff; border-radius:16px; border:1.5px solid #E5E7EB;
      cursor:pointer; transition:all 0.2s;
      box-shadow: 0 2px 8px rgba(0,0,0,0.02);
    }
    .car-card.selected { 
      border-color:#F59E0B; background:#FFFBEB; border-width: 2px;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(245, 158, 11, 0.15);
    }
    .car-img { height:40px; object-fit:contain; margin-bottom: 6px; }
    .car-icon-fallback { font-size: 28px; margin-bottom: 6px; }
    .car-name { font-family:'Inter',sans-serif; font-size:12px; font-weight:700; color:#374151; }
    .car-price { font-family:'Inter',sans-serif; font-size:12px; font-weight:600; color:#111827; margin-top: 2px; }
    .car-price-placeholder { font-family:'Inter',sans-serif; font-size:12px; color:#9CA3AF; margin-top: 2px; }
    
    .transmission-options { display: flex; gap: 12px; margin-bottom: 24px; }
    .trans-btn {
      flex: 1; padding: 12px; background: #ffffff; border: 1.5px solid #E5E7EB; border-radius: 12px;
      font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; color: #374151;
      cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .trans-btn.active { border-color: #F59E0B; background: #FFFBEB; color: #D97706; }

    .routes-scroll {
      display:flex; gap:10px; overflow-x:auto; margin-bottom:28px;
      padding-bottom:4px; scrollbar-width: none;
    }
    .routes-scroll::-webkit-scrollbar { display: none; }
    .route-chip {
      flex-shrink:0; display:flex; align-items:center; gap:5px;
      background:#ffffff; border:1.5px solid #E5E7EB; border-radius:24px;
      padding:10px 16px; cursor:pointer; transition:all 0.2s;
    }
    .route-chip:active { border-color:#FFB800; }
    .route-from,.route-to { font-family:'Inter',sans-serif; font-size:13px; font-weight:700; color:#111827; }
    .arrow { color:#9CA3AF; font-size:12px; }
    .route-km { font-family:'Inter',sans-serif; font-size:12px; font-weight:500; color:#9CA3AF; }
    
    .btn-find {
      width:100%; padding:18px; 
      background:#F59E0B; /* Amber-500, much more visible */
      border:none; border-radius:14px; font-family:'Outfit',sans-serif;
      font-size:18px; font-weight:800; color:#ffffff; cursor:pointer;
      text-shadow: 0 1px 2px rgba(0,0,0,0.1);
      transition:all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .btn-find:disabled { background: #FCD34D; color: rgba(255,255,255,0.8); cursor:not-allowed; }
    .btn-find:not(:disabled):active { transform:scale(0.98); }

    /* Overlay */
    .loc-overlay {
      position:fixed; inset:0; z-index:200;
      background:rgba(0,0,0,0.5); backdrop-filter:blur(4px);
      display:flex; align-items:flex-end;
    }
    .loc-sheet {
      width:100%; background:#fff; border-radius:24px 24px 0 0;
      padding:16px 20px max(48px, env(safe-area-inset-bottom)); max-height:82dvh; overflow-y:auto;
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
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  showSearch = false;
  fromQuery = '';
  toQuery = '';
  fromCity = '';
  toCity = '';
  pickupSet = false;
  dropSet = false;
  activeField: 'from' | 'to' = 'from';
  suggestions: any[] = [];
  selectedCar?: CarType;
  carTypes: CarType[] = [];
  transmission: 'manual' | 'auto' = 'manual';
  
  distance: number | null = null;
  fare: number | null = null;
  loadingLocation = false;
  private searchSubject = new Subject<{ field: 'from' | 'to', query: string }>();

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

  ngOnInit() {
    this.carTypes = this.mockData.CAR_TYPES;
    this.selectedCar = this.carTypes[1]; // default Sedan
    this.rideState.setCarType(this.selectedCar);

    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged((prev, curr) => prev.query === curr.query)
    ).subscribe(data => {
      this.fetchPlaces(data.query);
    });
  }

  ngAfterViewInit(): void {

    setTimeout(async () => {
      const map = this.mapSvc.createMap('home-map', [22.95, 75.82], 8);
      
      this.loadingLocation = true;
      try {
        const position = await this.mapSvc.getCurrentLocation();
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        this.mapSvc.panTo(map, lat, lng, 13);
        this.mapSvc.addDotMarker(map, 'my-loc', lat, lng, '#3B82F6', 'You');

        const geoInfo = await this.mapSvc.reverseGeocode(lat, lng);
        if (geoInfo) {
          const loc: Location = {
            lat, lng,
            address: geoInfo.display_name,
            name: geoInfo.display_name.split(',')[0] || 'Current Location'
          };
          this.pickup = loc;
          this.fromQuery = loc.address || loc.name || '';
          this.fromCity = this.fromQuery;
          this.pickupSet = true;
          this.rideState.setPickup(loc);
          this.activeField = 'to'; // Move to next field
        }
      } catch(e) {
        console.warn("Could not get location automatically:", e);
        // Fallback demo pins
        this.mapSvc.addDotMarker(map, 'ujjain', 23.1793, 75.7849, '#22C55E', 'Ujjain');
        this.mapSvc.addDotMarker(map, 'indore', 22.7196, 75.8577, '#EF4444', 'Indore');
      } finally {
        this.loadingLocation = false;
      }
    }, 100);
  }

  ngOnDestroy(): void { 
    this.mapSvc.removeMap('home-map'); 
  }

  cancelSearch() {
    this.showSearch = false;
  }

  goToNotifications() {
    this.router.navigate(['/notifications']);
  }

  openSearch(): void {
    this.showSearch = true;
    this.suggestions = this.mockData.POPULAR_CITIES.slice(0, 8); // Show default cities initially
    this.activeField = this.pickupSet ? 'to' : 'from';
  }

  onFrom(): void {
    this.activeField = 'from';
    this.searchSubject.next({ field: 'from', query: this.fromQuery });
  }

  onTo(): void {
    this.activeField = 'to';
    this.searchSubject.next({ field: 'to', query: this.toQuery });
  }

  async fetchPlaces(query: string) {
    if (!query || query.length < 2) {
      this.suggestions = this.mockData.filterCities(query);
      return;
    }
    
    // 1. Get local suggestions
    const local = this.mockData.filterCities(query);
    
    // 2. Fetch remote from Nominatim for real places
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5`;
      const res = await fetch(url);
      const data = await res.json();
      
      const remote = data.map((item: any) => ({
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        name: item.display_name.split(',')[0],
        address: item.display_name
      }));
      
      // Filter out remote duplicates that have the same name as local
      const remoteFiltered = remote.filter((r: any) => !local.find(l => (l.name || '').toLowerCase() === (r.name || '').toLowerCase()));
      
      this.suggestions = [...local, ...remoteFiltered].slice(0, 8);
    } catch (e) {
      this.suggestions = local;
    }
  }

  async pickCity(loc: any): Promise<void> {
    const finalLoc: Location = loc;

    if (this.activeField === 'from') {
      this.pickup = finalLoc; 
      this.fromQuery = finalLoc.address || finalLoc.name || '';
      this.fromCity = this.fromQuery; 
      this.pickupSet = true;
      this.rideState.setPickup(finalLoc);
      this.activeField = 'to';
    } else {
      this.drop = finalLoc; 
      this.toQuery = finalLoc.address || finalLoc.name || '';
      this.toCity = this.toQuery; 
      this.dropSet = true;
      this.rideState.setDrop(finalLoc);
    }
    this.suggestions = [];

    if (this.pickup && this.drop) {
      await this.calculateRoute();
    }
  }

  async confirmLoc(): Promise<void> { 
    this.showSearch = false; 
    if (this.pickup && this.drop) {
      await this.calculateRoute();
    }
  }

  async swap(e: Event): Promise<void> {
    e.stopPropagation();
    [this.fromCity, this.toCity] = [this.toCity, this.fromCity];
    [this.fromQuery, this.toQuery] = [this.toQuery, this.fromQuery];
    [this.pickup, this.drop] = [this.drop, this.pickup];
    if (this.pickup) this.rideState.setPickup(this.pickup);
    if (this.drop) this.rideState.setDrop(this.drop);
    if (this.pickup && this.drop) {
      await this.calculateRoute();
    }
  }

  selectCar(c: CarType): void { 
    this.selectedCar = c; 
    this.rideState.setCarType(c); 
    // Recalculate fare when car changes
    if (this.distance) {
       this.fare = this.getEstimatedFare(c);
    }
  }

  getEstimatedFare(c: CarType): number {
    if (!this.distance) return 0;
    const base = 200;
    let rate = 12;
    if (c.id === 'sedan') rate = 14;
    if (c.id === 'suv') rate = 18;
    if (c.id === 'luxury') rate = 25;
    return Math.round(base + (this.distance * rate));
  }

  async selectRoute(r: { from: string; to: string; km: number }): Promise<void> {
    const from = this.mockData.POPULAR_CITIES.find(c => c.name === r.from);
    const to = this.mockData.POPULAR_CITIES.find(c => c.name === r.to);
    if (from && to) {
      this.pickup = from; this.drop = to;
      this.fromCity = from.name || ''; this.toCity = to.name || '';
      this.pickupSet = true; this.dropSet = true;
      this.rideState.setPickup(from); this.rideState.setDrop(to);
      await this.calculateRoute();
    }
  }

  async calculateRoute() {
    if (!this.pickup || !this.drop) return;
    const map = this.mapSvc.getMap('home-map');
    if (!map) return;
    
    // add markers
    this.mapSvc.addDotMarker(map, 'pickup', this.pickup.lat, this.pickup.lng, '#22C55E', 'Pickup');
    this.mapSvc.addDotMarker(map, 'drop', this.drop.lat, this.drop.lng, '#EF4444', 'Drop');

    const result = await this.mapSvc.getRouteDistance(
      [this.pickup.lat, this.pickup.lng],
      [this.drop.lat, this.drop.lng]
    );

    if (result) {
      this.distance = Math.round(result.distanceKm);
      this.fare = this.getEstimatedFare(this.selectedCar!);
      
      this.mapSvc.drawRoute(map, 'route', result.routePoints, '#FFB800', false);
      this.mapSvc.fitBounds(map, result.routePoints);
    } else {
      // Fallback
      this.distance = Math.round(this.mockData.calculateDistance(this.pickup, this.drop));
      this.fare = this.getEstimatedFare(this.selectedCar!);
      
      this.mapSvc.drawRoute(map, 'route', [[this.pickup.lat, this.pickup.lng], [this.drop.lat, this.drop.lng]], '#FFB800', true);
      this.mapSvc.fitBounds(map, [[this.pickup.lat, this.pickup.lng], [this.drop.lat, this.drop.lng]]);
    }
  }

  findDrivers(): void { this.router.navigate(['/ride-options']); }
}
