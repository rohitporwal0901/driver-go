import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RideStateService } from '../../services/ride-state.service';
import { MapService } from '../../services/map.service';
import { Driver } from '../../models/ride.models';

@Component({
  selector: 'app-confirm-ride',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="confirm-screen">
      <div class="top-bar">
        <button class="back-btn" (click)="router.navigate(['/ride-options'])">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </button>
        <h2>Confirm Booking</h2>
      </div>

      <!-- Map -->
      <div class="map-box">
        <div id="confirm-map" class="leaflet-map"></div>
      </div>

      <!-- Booking Card -->
      <div class="booking-sheet">
        <div class="sheet-handle"></div>

        <!-- Driver Summary -->
        <div class="driver-row">
          <div class="drv-avatar-wrap">
            <div class="drv-avatar">{{ driver?.photo || '🧑‍✈️' }}</div>
          </div>
          <div class="drv-info">
            <strong>{{ driver?.name || 'Driver Name' }}</strong>
            <span class="drv-license">{{ driver?.licenseNo || 'MP09-2012-0001234' }}</span>
            <div class="exp-badge">{{ driver?.experience || '12 years' }} exp</div>
          </div>
          <div class="drv-rating">⭐ {{ driver?.rating || '4.95' }}</div>
        </div>

        <div class="divider"></div>

        <!-- Trip Info -->
        <div class="trip-row">
          <div class="loc-item">
            <small>PICKUP</small>
            <strong>{{ pickup?.address || pickup?.name || 'Udaipur, Rajasthan' }}</strong>
          </div>
          <div class="loc-item">
            <small>DESTINATION</small>
            <strong>{{ drop?.address || drop?.name || 'Indore, Madhya Pradesh' }}</strong>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Details -->
        <div class="meta-row">
          <div class="meta-left">
            <span class="meta-icon">{{ car?.icon || '🚗' }}</span>
            <span class="meta-label">Your Car</span>
          </div>
          <span class="meta-val">{{ car?.name || 'Sedan' }}</span>
        </div>
        <div class="meta-row">
          <div class="meta-left">
            <span class="meta-icon">📏</span>
            <span class="meta-label">Distance</span>
          </div>
          <span class="meta-val">{{ distance }} km</span>
        </div>
        <div class="meta-row">
          <div class="meta-left">
            <span class="meta-icon">⏱️</span>
            <span class="meta-label">Est. Duration</span>
          </div>
          <span class="meta-val">~{{ duration }} min</span>
        </div>

        <div class="divider"></div>

        <!-- Payment -->
        <div class="meta-row">
          <div class="meta-left">
            <span class="meta-icon">💳</span>
            <span class="meta-label">Payment</span>
          </div>
          <button class="change-btn" (click)="cyclePayment()">{{ paymentMethod }} ▾</button>
        </div>

        <!-- Notes -->
        <div class="notes-row">
          <input type="text" [(ngModel)]="notes" placeholder="Any notes for driver? (optional)"
                 class="notes-input" id="notes-input" />
        </div>

        <!-- Fare Box -->
        <div class="fare-box">
          <div class="fare-breakdown">
            <span>Base Charge</span>
            <span>₹{{ driver?.baseCharge || 250 }}</span>
          </div>
          <div class="fare-breakdown">
            <span>₹{{ driver?.pricePerKm || 14 }}/km × {{ distance }} km</span>
            <span>₹{{ perKmTotal }}</span>
          </div>
          <div class="fare-total-row">
            <span>Total Driver Fare</span>
            <span class="total-amt">₹{{ fare }}</span>
          </div>
        </div>

        <button class="btn-confirm" id="confirm-booking-btn" (click)="confirm()">
          Confirm & Book Driver
        </button>
      </div>
    </div>
  `,
  styles: [`
    .confirm-screen { width:100%; height:100dvh; display:flex; flex-direction:column; position:relative; overflow:hidden;}
    .top-bar {
      position:absolute; top:calc(16px + var(--safe-top)); left:16px; right:16px; z-index:2000;
      padding:16px; border-radius:var(--radius-md); background:var(--surface);
      display:flex; align-items:center; gap:12px; box-shadow:var(--shadow-md);
    }
    .back-btn {
      width:40px; height:40px; background:var(--bg-color); border:1px solid var(--border-color);
      border-radius:12px; display:flex; align-items:center; justify-content:center;
      cursor:pointer; box-shadow:var(--shadow-sm); flex-shrink: 0;
    }
    .top-bar h2 { font-family:'Outfit',sans-serif; font-size:18px; font-weight:700; color:var(--text-primary); margin:0; }
    .map-box { height:40vh; position:relative; z-index:1; }
    .leaflet-map { width:100%; height:100%; }
    .booking-sheet {
      flex:1; background:var(--surface); border-radius:var(--radius-lg) var(--radius-lg) 0 0;
      padding:var(--spacing-3) var(--spacing-3) max(var(--spacing-4), var(--safe-bottom)); overflow-y:auto;
      box-shadow:var(--shadow-sheet); z-index: 10;
    }
    .sheet-handle { width:40px; height:4px; background:var(--border-color); border-radius:4px; margin:0 auto var(--spacing-2); }
    
    .driver-row { display:flex; align-items:center; gap:16px; margin-bottom:var(--spacing-2); }
    .drv-avatar-wrap {
      width:60px; height:60px; border-radius:50%; border:2.5px solid var(--primary);
      display:flex; align-items:center; justify-content:center; flex-shrink:0;
      padding: 3px;
    }
    .drv-avatar {
      width:100%; height:100%; background:#FFFBEB; border-radius:50%;
      display:flex; align-items:center; justify-content:center; font-size:32px;
    }
    .drv-info { flex:1; }
    .drv-info strong { display:block; font-family:'Outfit',sans-serif; font-size:17px; font-weight:800; color:var(--text-primary); letter-spacing:-0.2px; }
    .drv-license { display:block; font-family:'Inter',sans-serif; font-size:12px; font-weight:500; color:var(--text-tertiary); margin-bottom:6px; }
    .exp-badge {
      display:inline-block; background:#ECFDF5; color:var(--success);
      border-radius:6px; padding:4px 10px; font-family:'Inter',sans-serif;
      font-size:12px; font-weight:700;
    }
    .drv-rating { font-family:'Outfit',sans-serif; font-size:16px; font-weight:800; color:var(--text-primary); }
    
    .divider { height:1px; background:var(--border-color); margin:16px 0; }
    
    .trip-row { display:flex; flex-direction:column; gap:14px; }
    .loc-item { display:flex; flex-direction:column; gap:4px; }
    .loc-item small { font-family:'Inter',sans-serif; font-size:10px; font-weight:700; color:var(--text-tertiary); text-transform:uppercase; letter-spacing:0.5px; }
    .loc-item strong { font-family:'Inter',sans-serif; font-size:14px; color:var(--text-primary); font-weight:700; }
    
    .meta-row { display:flex; align-items:center; justify-content:space-between; padding:8px 0; }
    .meta-left { display:flex; align-items:center; gap:12px; }
    .meta-icon { font-size:18px; width:24px; text-align:center; }
    .meta-label { font-family:'Inter',sans-serif; font-size:14px; font-weight:600; color:var(--text-secondary); }
    .meta-val { font-family:'Inter',sans-serif; font-size:14px; font-weight:700; color:var(--text-primary); }
    
    .change-btn {
      background:var(--surface); border:1.5px solid var(--primary); border-radius:var(--radius-sm);
      padding:6px 14px; font-family:'Inter',sans-serif; font-size:13px;
      font-weight:700; color:#D97706; cursor:pointer;
    }
    
    .notes-row { margin:16px 0 20px; }
    .notes-input {
      width:100%; border:1.5px solid var(--border-color); border-radius:var(--radius-sm);
      padding:14px 16px; font-family:'Inter',sans-serif; font-size:14px; color:var(--text-primary);
      outline:none; transition:border-color 0.2s; box-sizing:border-box;
      background: var(--bg-color); height: 48px;
    }
    .notes-input:focus { border-color:var(--primary); background: var(--surface); }
    .notes-input::placeholder { color:var(--text-tertiary); }
    
    .fare-box {
      background:#FFFBEB; border-radius:var(--radius-md); padding:20px; margin-bottom:24px; border:1px solid #FDE68A;
    }
    .fare-breakdown { display:flex; justify-content:space-between; margin-bottom:10px; }
    .fare-breakdown span { font-family:'Inter',sans-serif; font-size:13px; font-weight:500; color:var(--text-secondary); }
    .fare-total-row {
      display:flex; justify-content:space-between; align-items:center;
      border-top:1px dashed rgba(217,119,6,0.3); padding-top:14px; margin-top:14px;
    }
    .fare-total-row span:first-child { font-family:'Outfit',sans-serif; font-size:16px; font-weight:800; color:var(--text-primary); }
    .total-amt { font-family:'Outfit',sans-serif; font-size:28px; font-weight:800; color:#D97706; letter-spacing:-0.5px; }
    
    .btn-confirm {
      width:100%; padding:16px; height:56px; background:var(--primary-gradient);
      border:none; border-radius:var(--radius-md); font-family:'Outfit',sans-serif;
      font-size:18px; font-weight:800; color:#fff; cursor:pointer;
      transition:all 0.2s; box-shadow: 0 8px 24px rgba(255, 184, 0, 0.35);
    }
    .btn-confirm:active { transform:scale(0.98); box-shadow: 0 4px 12px rgba(255, 184, 0, 0.2); }
  `]
})
export class ConfirmRideComponent implements AfterViewInit, OnDestroy {
  driver?: Driver;
  pickup?: any;
  drop?: any;
  car?: any;
  distance = 0;
  duration = 0;
  fare = 0;
  perKmTotal = 0;
  paymentMethod = 'Cash';
  notes = '';
  paymentMethods = ['Cash', 'UPI', 'Card', 'Wallet'];

  constructor(public router: Router, private rideState: RideStateService, private mapSvc: MapService) {}

  ngAfterViewInit(): void {
    this.driver = this.rideState.selectedDriver();
    this.pickup = this.rideState.pickupLocation();
    this.drop = this.rideState.dropLocation();
    this.car = this.rideState.selectedCar();
    this.distance = this.rideState.distanceKm;
    this.duration = this.rideState.durationMin;
    this.fare = this.rideState.currentFare();
    if (this.driver) this.perKmTotal = Math.round(this.driver.pricePerKm * this.distance);

    const p: [number, number] = this.pickup ? [this.pickup.lat, this.pickup.lng] : [23.1793, 75.7849];
    const d: [number, number] = this.drop ? [this.drop.lat, this.drop.lng] : [22.7196, 75.8577];
    const center: [number, number] = [(p[0] + d[0]) / 2, (p[1] + d[1]) / 2];

    setTimeout(() => {
      const map = this.mapSvc.createMap('confirm-map', center, 9);
      this.mapSvc.addDotMarker(map, 'cp', p[0], p[1], '#22C55E');
      this.mapSvc.addDotMarker(map, 'cd', d[0], d[1], '#EF4444');
      this.mapSvc.drawRoute(map, 'cr', [p, center, d], '#111111');
      if (this.driver) {
        this.mapSvc.addEmojiMarker(map, 'cdrv', this.driver.lat, this.driver.lng, this.driver.photo || '🚗', 30, true);
      }
      this.mapSvc.fitBounds(map, [p, d]);
    }, 100);
  }

  ngOnDestroy(): void { this.mapSvc.removeMap('confirm-map'); }

  cyclePayment(): void {
    const i = this.paymentMethods.indexOf(this.paymentMethod);
    this.paymentMethod = this.paymentMethods[(i + 1) % this.paymentMethods.length];
    this.rideState.setPaymentMethod(this.paymentMethod);
  }

  confirm(): void {
    this.rideState.setStatus('searching');
    this.router.navigate(['/searching-driver']);
  }
}
