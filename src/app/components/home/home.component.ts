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
      <div class="map-box" [class.full-screen]="isMapPicking">
        <div id="home-map" class="leaflet-map"></div>
        <div class="map-gradient" *ngIf="!isMapPicking"></div>
        
        <!-- Center Pin for Picker -->
        <div class="center-pin" *ngIf="isMapPicking">📍</div>
      </div>

      <!-- Search Sheet -->
      <div class="search-sheet">
        <div class="sheet-handle"></div>
        
        <!-- Trip Input -->
        <div class="trip-inputs">
          <div class="trip-connector"></div>
          <button class="swap-btn" id="swap-btn" (click)="swap($event)">⇅</button>

          <div class="input-row from">
            <div class="dot green-dot"></div>
            <div class="search-input-wrap">
              <input [(ngModel)]="fromQuery" (input)="onFrom()" (focus)="enterSearchMode('from')" placeholder="Pickup location" />
            </div>
          </div>
          <div class="input-row to">
            <div class="dot red-dot"></div>
            <div class="search-input-wrap">
              <input [(ngModel)]="toQuery" (input)="onTo()" (focus)="enterSearchMode('to')" placeholder="Drop location" />
            </div>
          </div>
        </div>

        <!-- Search Mode Views -->
        <ng-container *ngIf="isSearchMode">
          <div class="quick-actions">
            <button class="action-chip" (click)="useCurrentLocation()"><span class="icon">🎯</span> Current Location</button>
            <button class="action-chip" (click)="enableMapPicker()"><span class="icon">🗺️</span> Locate on Map</button>
          </div>

          <div class="suggestions-list" *ngIf="suggestions.length && !isSearchingLoc">
            <div class="sug-item" *ngFor="let s of suggestions" (click)="pickCity(s)">
              <span class="sug-icon">📍</span>
              <div>
                <strong>{{ s.name }}</strong>
                <small>{{ s.address }}</small>
              </div>
            </div>
          </div>

          <div class="searching-loader" *ngIf="isSearchingLoc">
            <div class="spinner"></div>
            <span>Searching...</span>
          </div>
        </ng-container>

        <!-- Ride Options (Hidden while searching) -->
        <ng-container *ngIf="!isSearchMode">
          <!-- Car Type Selection -->
          <div class="section-title">Selecting Car Type</div>
          <div class="car-types">
            <button *ngFor="let c of carTypes"
                    class="car-card" [class.selected]="selectedCar?.id===c.id"
                    [id]="'car-' + c.id"
                    (click)="selectCar(c)">
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

          <button class="btn-find" id="find-drivers-btn"
                  (click)="findDrivers()" [disabled]="!pickupSet || !dropSet">
            <span *ngIf="!distance">🔍 Find Drivers</span>
            <span *ngIf="distance" style="display:flex; justify-content:space-between; width:100%; padding: 0 10px;">
               <span>🔍 Find Drivers</span>
               <span>{{ distance }} km • ₹{{ fare }}</span>
            </span>
          </button>
        </ng-container>
      </div>
    </div>

    <!-- Map Picker Overlay UI (Header and Bottom Sheet) -->
    <div class="map-picker-ui" *ngIf="isMapPicking">
       <!-- Back button at top -->
       <div class="picker-header">
          <button class="back-btn" (click)="cancelMapPicker()">←</button>
          <span>Select {{ activeField === 'from' ? 'Pickup' : 'Drop' }} Location</span>
       </div>

       <!-- Bottom Sheet -->
       <div class="picker-bottom-sheet">
          <div class="picker-address" *ngIf="pickerLoading">
             <div class="spinner"></div> <span>Fetching address...</span>
          </div>
          <div class="picker-address" *ngIf="!pickerLoading">
             <h3>{{ pickerLocationName }}</h3>
             <p>{{ pickerAddress }}</p>
          </div>
          <button class="btn-done" [disabled]="pickerLoading" (click)="confirmMapPick()">
            Confirm Location
          </button>
       </div>
    </div>
  `,
  styles: [`
    .home { width:100%; height:100dvh; display:flex; flex-direction:column; position:relative; overflow:hidden; }
    .header {
      position:absolute; top:calc(16px + var(--safe-top)); left:16px; right:16px; z-index:2000;
      padding:16px; border-radius:var(--radius-md);
      background: var(--surface);
      display:flex; align-items:center; justify-content:space-between;
      box-shadow: var(--shadow-md);
    }
    .header-left { display:flex; align-items:center; gap:12px; }
    .menu-btn {
      background:var(--bg-color); border:1px solid var(--border-color); border-radius:12px;
      width:42px; height:42px; display:flex; flex-direction:column;
      align-items:center; justify-content:center; gap:5px; cursor:pointer;
      box-shadow:var(--shadow-sm);
    }
    .menu-btn span { display:block; width:18px; height:2px; background:var(--text-primary); border-radius:2px; }
    .greeting h1 { font-family:'Outfit',sans-serif; font-size:18px; font-weight:700; color:var(--text-primary); margin:0; }
    .greeting p { font-family:'Inter',sans-serif; font-size:12px; color:var(--text-secondary); margin:0; display:flex; align-items:center; gap:6px;}
    .gps-loading { color: var(--primary) !important; font-weight: 500; }
    .spinner { width:12px; height:12px; border:2px solid #FDE68A; border-top-color:var(--primary); border-radius:50%; animation:spin 1s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }
    .notif-btn {
      background:var(--surface); border:1px solid var(--border-color); border-radius:12px;
      width:42px; height:42px; display:flex; align-items:center; justify-content:center;
      font-size:18px; cursor:pointer; position:relative; box-shadow:var(--shadow-sm);
    }
    .badge {
      position:absolute; top:6px; right:6px;
      width:15px; height:15px; background:var(--error); border-radius:50%;
      font-family:'Inter',sans-serif; font-size:9px; font-weight:700; color:#fff;
      display:flex; align-items:center; justify-content:center;
    }
    .map-box { height:45dvh; min-height: 300px; position:relative; transition: all 0.3s; }
    .map-box.full-screen {
       height: 100dvh;
       position: absolute;
       inset: 0;
       z-index: 2500;
    }
    .leaflet-map { width:100%; height:100%; }
    .map-gradient {
      position:absolute; bottom:0; left:0; right:0; height:80px;
      background:linear-gradient(0deg,var(--surface),transparent);
      z-index: 4;
      pointer-events: none;
    }
    .center-pin {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -100%);
      font-size: 40px; z-index: 3000; pointer-events: none;
      filter: drop-shadow(0 4px 4px rgba(0,0,0,0.3));
      animation: bounce 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    @keyframes bounce { 0% { transform: translate(-50%, -150%); } 100% { transform: translate(-50%, -100%); } }
    .search-sheet {
      flex:1; background:var(--surface); border-radius:var(--radius-lg) var(--radius-lg) 0 0;
      padding:24px 20px max(32px, var(--safe-bottom)); overflow-y:auto;
      box-shadow:var(--shadow-sheet); z-index:5;
    }
    .sheet-handle { width:40px; height:4px; background:var(--border-color); border-radius:4px; margin:0 auto 24px; }
    
    .trip-inputs {
      position: relative;
      background:var(--surface); border-radius:var(--radius-md); padding:16px 20px;
      border:1.5px solid var(--border-color); transition:all 0.2s; margin-bottom:24px;
    }
    .trip-inputs:focus-within { border-color:var(--primary); }
    
    .trip-connector {
      position: absolute; top: 34px; bottom: 34px; left: 14px; width: 1.5px; background: var(--border-color); z-index: 1;
    }
    .swap-btn {
      position: absolute; left: 0px; top: 50%; transform: translateY(-50%); z-index: 3;
      background: #FFFBEB; border: 1.5px solid #FDE68A; border-radius: 50%; width: 28px; height: 28px;
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; cursor: pointer; color: #D97706; font-weight: bold;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .input-row { display:flex; align-items:center; gap:12px; position: relative; z-index: 2; margin-left: 18px; }
    .input-row.from { margin-bottom: 24px; }
    
    .dot { width:14px; height:14px; border-radius:50%; flex-shrink:0; box-sizing: border-box; }
    .green-dot { background:var(--success); border: 3px solid #BBF7D0; margin-left: -7px; }
    .red-dot { background:var(--error); border: 3px solid #FECACA; margin-left: -7px; }
    
    .search-input-wrap { flex:1; }
    .search-input-wrap input {
      width:100%; border:none; outline:none; font-family:'Inter',sans-serif;
      font-size:15px; font-weight:500; color:var(--text-primary); background:transparent;
      padding: 8px 0;
    }
    .search-input-wrap input::placeholder { color:var(--text-tertiary); font-weight: 400; }

    .quick-actions { display:flex; gap:12px; margin-bottom: 16px; }
    .action-chip { 
      flex: 1; padding: 12px; background: var(--bg-color); border: 1.5px solid var(--border-color);
      border-radius: var(--radius-sm); font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600;
      color: var(--text-primary); display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer;
    }
    .action-chip:active { border-color: var(--primary); background: #FFFBEB; }

    .section-title {
      font-family:'Outfit',sans-serif; font-size:16px; font-weight:800;
      color:var(--text-primary); margin-bottom:14px; margin-top:8px;
    }
    .car-types { 
      display:flex; gap:12px; margin-bottom:24px; overflow-x:auto; padding-bottom:4px;
      scrollbar-width: none; /* Hide scrollbar */
    }
    .car-types::-webkit-scrollbar { display: none; }
    
    .car-card {
      flex-shrink:0; display:flex; flex-direction:column; align-items:center; justify-content:center;
      width: 90px; height: 105px; padding: 10px;
      background:var(--surface); border-radius:var(--radius-md); border:1.5px solid var(--border-color);
      cursor:pointer; transition:all 0.2s;
      box-shadow: var(--shadow-sm);
    }
    .car-card.selected { 
      border-color:var(--primary); background:#FFFBEB; border-width: 2px;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(255, 184, 0, 0.15);
    }
    .car-img { height:40px; object-fit:contain; margin-bottom: 6px; }
    .car-icon-fallback { font-size: 28px; margin-bottom: 6px; }
    .car-name { font-family:'Inter',sans-serif; font-size:12px; font-weight:700; color:var(--text-primary); }
    .car-price { font-family:'Inter',sans-serif; font-size:12px; font-weight:600; color:var(--text-primary); margin-top: 2px; }
    .car-price-placeholder { font-family:'Inter',sans-serif; font-size:12px; color:var(--text-tertiary); margin-top: 2px; }
    
    .transmission-options { display: flex; gap: 12px; margin-bottom: 24px; }
    .trans-btn {
      flex: 1; padding: 14px; background: var(--surface); border: 1.5px solid var(--border-color); border-radius: var(--radius-sm);
      font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; color: var(--text-primary);
      cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .trans-btn.active { border-color: var(--primary); background: #FFFBEB; color: #D97706; }

    .routes-scroll {
      display:flex; gap:10px; overflow-x:auto; margin-bottom:28px;
      padding-bottom:4px; scrollbar-width: none;
    }
    .routes-scroll::-webkit-scrollbar { display: none; }
    .route-chip {
      flex-shrink:0; display:flex; align-items:center; gap:5px;
      background:var(--surface); border:1.5px solid var(--border-color); border-radius:24px;
      padding:10px 16px; cursor:pointer; transition:all 0.2s;
    }
    .route-chip:active { border-color:var(--primary); }
    .route-from,.route-to { font-family:'Inter',sans-serif; font-size:13px; font-weight:700; color:var(--text-primary); }
    .arrow { color:var(--text-tertiary); font-size:12px; }
    .route-km { font-family:'Inter',sans-serif; font-size:12px; font-weight:500; color:var(--text-tertiary); }
    
    .btn-find {
      width:100%; padding:18px; height:56px;
      background:var(--primary-gradient);
      border:none; border-radius:var(--radius-md); font-family:'Outfit',sans-serif;
      font-size:18px; font-weight:700; color:#ffffff; cursor:pointer;
      box-shadow: 0 8px 24px rgba(255, 184, 0, 0.35);
      transition:all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .btn-find:disabled { background: #FCD34D; color: rgba(255,255,255,0.8); cursor:not-allowed; box-shadow:none; }
    .btn-find:not(:disabled):active { transform:scale(0.98); box-shadow: 0 4px 12px rgba(255, 184, 0, 0.2); }

    .suggestions-list { background:var(--surface); }
    .sug-item {
      display:flex; align-items:center; gap:16px; padding:16px;
      cursor:pointer; border-bottom:1px solid var(--border-color);
    }
    .sug-item:hover { background: var(--bg-color); }
    .sug-icon { font-size:20px; color:var(--text-secondary); }
    .sug-item strong { display:block; font-family:'Inter',sans-serif; font-size:15px; font-weight:500; color:var(--text-primary); }
    .sug-item small { font-family:'Inter',sans-serif; font-size:13px; color:var(--text-secondary); display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }

    .searching-loader { display:flex; align-items:center; justify-content:center; gap:12px; padding:24px; color:var(--text-secondary); font-family:'Inter',sans-serif; }

    /* Map Picker Overlay */
    .map-picker-ui { z-index: 3000; }
    .picker-header {
      position: absolute; top: calc(16px + var(--safe-top, 0px)); left: 16px; right: 16px;
      background: var(--surface); border-radius: var(--radius-md); padding: 12px 16px;
      display: flex; align-items: center; gap: 16px; box-shadow: var(--shadow-md); z-index: 3000;
      font-family: 'Outfit', sans-serif; font-size: 16px; font-weight: 600;
    }
    .picker-bottom-sheet {
      position: absolute; bottom: 0; left: 0; right: 0; z-index: 3000;
      background: var(--surface); border-radius: var(--radius-lg) var(--radius-lg) 0 0;
      padding: 24px 20px max(24px, var(--safe-bottom, 0px)); box-shadow: 0 -4px 24px rgba(0,0,0,0.1);
      animation: slideUp 0.3s ease-out;
    }
    .picker-address { margin-bottom: 20px; display: flex; flex-direction: column; gap: 4px; min-height: 60px; justify-content: center; }
    .picker-address h3 { font-family: 'Outfit', sans-serif; font-size: 18px; font-weight: 700; margin: 0; color: var(--text-primary); }
    .picker-address p { font-family: 'Inter', sans-serif; font-size: 14px; color: var(--text-secondary); margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .picker-address .spinner { width: 20px; height: 20px; border: 3px solid #FDE68A; border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; }
  `]
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  showSearch = false;
  isSearchMode = false;
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
  isSearchingLoc = false;
  
  // Map Picker State
  isMapPicking = false;
  pickerLoading = false;
  pickerLocationName = '';
  pickerAddress = '';
  pickerLat = 0;
  pickerLng = 0;
  private mapMoveEndHandler = () => this.onMapMoveEnd();

  private searchSubject = new Subject<{ field: 'from' | 'to', query: string }>();

  public pickup?: Location;
  public drop?: Location;

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
        this.mapSvc.addDotMarker(map, 'my-loc', lat, lng, '#22C55E', 'You');

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
    this.isSearchMode = false;
  }

  goToNotifications() {
    this.router.navigate(['/notifications']);
  }

  enterSearchMode(field: 'from' | 'to'): void {
    this.isSearchMode = true;
    this.activeField = field;
    if (field === 'from' && this.fromQuery.length < 2) this.suggestions = [];
    if (field === 'to' && this.toQuery.length < 2) this.suggestions = [];
  }

  onFrom(): void {
    this.isSearchMode = true;
    this.activeField = 'from';
    this.searchSubject.next({ field: 'from', query: this.fromQuery });
  }

  onTo(): void {
    this.isSearchMode = true;
    this.activeField = 'to';
    this.searchSubject.next({ field: 'to', query: this.toQuery });
  }

  async useCurrentLocation() {
    this.isSearchMode = false;
    
    // Attempt to get fresh location or fallback to pickup if set
    this.loadingLocation = true;
    try {
      const position = await this.mapSvc.getCurrentLocation();
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const geoInfo = await this.mapSvc.reverseGeocode(lat, lng);
      
      if (geoInfo) {
        const loc: Location = {
          lat, lng,
          address: geoInfo.display_name,
          name: geoInfo.display_name.split(',')[0] || 'Current Location'
        };
        await this.pickCity(loc);
      }
    } catch(e) {
      if (this.pickup) {
        await this.pickCity(this.pickup);
      }
    } finally {
      this.loadingLocation = false;
    }
  }

  // Map Picker Logic
  enableMapPicker() {
    this.isSearchMode = false;
    this.isMapPicking = true;
    
    setTimeout(() => {
       const map = this.mapSvc.getMap('home-map');
       if (map) {
         map.invalidateSize();
         // Pan to current location or default
         if (this.pickup) map.panTo([this.pickup.lat, this.pickup.lng]);
         
         map.on('moveend', this.mapMoveEndHandler);
         this.onMapMoveEnd(); // trigger once for current center
       }
    }, 100);
  }

  cancelMapPicker() {
    this.isMapPicking = false;
    this.isSearchMode = true; 
    const map = this.mapSvc.getMap('home-map');
    if (map) {
       map.off('moveend', this.mapMoveEndHandler);
       setTimeout(() => map.invalidateSize(), 100);
    }
  }

  async onMapMoveEnd() {
    if (!this.isMapPicking) return;
    const map = this.mapSvc.getMap('home-map');
    if (!map) return;
    
    const center = map.getCenter();
    this.pickerLat = center.lat;
    this.pickerLng = center.lng;
    
    this.pickerLoading = true;
    const geoInfo = await this.mapSvc.reverseGeocode(center.lat, center.lng);
    this.pickerLoading = false;
    
    if (geoInfo) {
      this.pickerLocationName = geoInfo.display_name.split(',')[0] || 'Selected Location';
      this.pickerAddress = geoInfo.display_name;
    } else {
      this.pickerLocationName = 'Unknown Location';
      this.pickerAddress = 'Move map to fetch address';
    }
  }

  async confirmMapPick() {
     const loc: Location = {
       lat: this.pickerLat,
       lng: this.pickerLng,
       name: this.pickerLocationName,
       address: this.pickerAddress
     };
     
     this.isMapPicking = false;
     this.isSearchMode = false;
     const map = this.mapSvc.getMap('home-map');
     if (map) {
       map.off('moveend', this.mapMoveEndHandler);
       setTimeout(() => map.invalidateSize(), 100);
     }
     
     await this.pickCity(loc);
  }

  async fetchPlaces(query: string) {
    if (!query || query.length < 2) {
      this.suggestions = [];
      this.isSearchingLoc = false;
      return;
    }
    
    this.isSearchingLoc = true;
    
    // Fetch remote from Nominatim for real places
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5`;
      const res = await fetch(url, {
        headers: {
          'Accept-Language': 'en-US,en;q=0.9',
          'User-Agent': 'DriveGoApp/1.0 (rohitporwal0901@gmail.com)' // Added User-Agent for Nominatim
        }
      });
      const data = await res.json();
      
      const remote = data.map((item: any) => ({
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        name: item.display_name.split(',')[0],
        address: item.display_name
      }));
      
      this.suggestions = remote.slice(0, 8);
    } catch (e) {
      this.suggestions = [];
    } finally {
      this.isSearchingLoc = false;
    }
  }

  async pickCity(loc: any): Promise<void> {
    const finalLoc: Location = loc;

    if (this.activeField === 'from') {
      this.pickup = finalLoc; 
      this.fromQuery = finalLoc.address || finalLoc.name || '';
      this.fromCity = finalLoc.name || this.fromQuery; 
      this.pickupSet = true;
      this.rideState.setPickup(finalLoc);
      
      // If drop is not set, move to 'to'. If drop is set, exit search mode.
      if (!this.dropSet) {
         this.activeField = 'to';
         this.suggestions = []; // Reset suggestions for 'to'
      } else {
         this.isSearchMode = false;
         await this.calculateRoute();
      }
    } else {
      this.drop = finalLoc; 
      this.toQuery = finalLoc.address || finalLoc.name || '';
      this.toCity = finalLoc.name || this.toQuery; 
      this.dropSet = true;
      this.rideState.setDrop(finalLoc);
      
      // Close search mode after picking drop
      this.isSearchMode = false;
      if (this.pickup && this.drop) {
        await this.calculateRoute();
      }
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
    // Deprecated: Popular Routes were removed from UI.
  }

  async calculateRoute() {
    if (!this.pickup || !this.drop) return;
    const map = this.mapSvc.getMap('home-map');
    if (!map) return;
    
    // add markers
    this.mapSvc.addDotMarker(map, 'pickup', this.pickup.lat, this.pickup.lng, '#22C55E', this.pickup.name || 'Pickup');
    this.mapSvc.addDotMarker(map, 'drop', this.drop.lat, this.drop.lng, '#EF4444', this.drop.name || 'Drop');

    const result = await this.mapSvc.getRouteDistance(
      [this.pickup.lat, this.pickup.lng],
      [this.drop.lat, this.drop.lng]
    );

    if (result) {
      this.distance = Math.round(result.distanceKm);
      this.fare = this.getEstimatedFare(this.selectedCar!);
      
      this.mapSvc.drawRoute(map, 'route', result.routePoints, '#111111', false);
      this.mapSvc.fitBounds(map, result.routePoints);
    } else {
      // Fallback
      this.distance = Math.round(this.mockData.calculateDistance(this.pickup, this.drop));
      this.fare = this.getEstimatedFare(this.selectedCar!);
      
      this.mapSvc.drawRoute(map, 'route', [[this.pickup.lat, this.pickup.lng], [this.drop.lat, this.drop.lng]], '#111111', true);
      this.mapSvc.fitBounds(map, [[this.pickup.lat, this.pickup.lng], [this.drop.lat, this.drop.lng]]);
    }
  }

  findDrivers(): void { this.router.navigate(['/ride-options']); }
}
