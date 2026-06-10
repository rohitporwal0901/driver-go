import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RideStateService } from '../../services/ride-state.service';

@Component({
  selector: 'app-ride-completed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="completed">
      <div class="success-section">
        <div class="success-ring r3"></div>
        <div class="success-ring r2"></div>
        <div class="success-ring r1"></div>
        <div class="success-circle" [class.pop]="popped">
          <span>✓</span>
        </div>
      </div>

      <div class="content">
        <h2>Trip Completed! 🎉</h2>
        <p class="sub">Safe journey complete. Thank you for using DriverSaab!</p>

        <!-- Route recap -->
        <div class="route-recap">
          <div class="recap-city">
            <div class="city-dot green"></div>
            <span>{{ pickup?.city || 'Ujjain' }}</span>
          </div>
          <div class="recap-arrow">──── 🛣️ ────</div>
          <div class="recap-city">
            <div class="city-dot red"></div>
            <span>{{ drop?.city || 'Indore' }}</span>
          </div>
        </div>

        <!-- Fare Summary -->
        <div class="summary-card">
          <div class="sum-row">
            <span>Driver</span>
            <span class="sum-val">{{ driver?.name }}</span>
          </div>
          <div class="sum-row">
            <span>Distance</span>
            <span class="sum-val">{{ distance }} km</span>
          </div>
          <div class="sum-row">
            <span>Duration</span>
            <span class="sum-val">~{{ duration }} min</span>
          </div>
          <div class="sum-divider"></div>
          <div class="sum-row">
            <span class="fare-label">Total Driver Fare</span>
            <span class="fare-val">₹{{ fare }}</span>
          </div>
          <div class="sum-row">
            <span>Payment</span>
            <span class="sum-val">{{ paymentMethod }}</span>
          </div>
        </div>

        <!-- Rate Driver -->
        <div class="rate-card">
          <div class="rate-header">
            <div class="rate-avatar">{{ driver?.photo }}</div>
            <div>
              <h4>Rate {{ driver?.name }}</h4>
              <p>How was your experience?</p>
            </div>
          </div>
          <div class="stars">
            <button *ngFor="let s of [1,2,3,4,5]"
                    class="star" [class.lit]="rating >= s"
                    (click)="setRating(s)" [id]="'star-' + s">★</button>
          </div>
          <textarea [(ngModel)]="review"
                    placeholder="Aapka experience kaisa raha? (optional)"
                    class="review-area" rows="2" id="review-input"></textarea>
        </div>

        <button class="btn-submit" id="submit-btn" (click)="submit()">Submit Review</button>
        <button class="btn-new" (click)="newTrip()">Book Another Driver</button>
      </div>
    </div>
  `,
  styles: [`
    .completed {
      width:100%; height:100dvh;
      background:linear-gradient(180deg,#FFFBEB 0%,var(--bg-color) 35%);
      display:flex; flex-direction:column; overflow-y:auto;
    }
    .success-section {
      height:200px; display:flex; align-items:center; justify-content:center;
      position:relative;
    }
    .success-circle {
      width:90px; height:90px; background:var(--success); border-radius:50%;
      display:flex; align-items:center; justify-content:center;
      font-size:42px; color:#fff; font-weight:700; position:relative; z-index:3;
      transform:scale(0); transition:transform 0.7s cubic-bezier(0.34,1.56,0.64,1);
    }
    .success-circle.pop { transform:scale(1); }
    .success-ring {
      position:absolute; border-radius:50%;
      border:3px solid rgba(34,197,94,0.25);
      animation:ringOut 2s ease-out infinite;
    }
    .r1 { width:120px; height:120px; animation-delay:0.2s; }
    .r2 { width:160px; height:160px; animation-delay:0.5s; }
    .r3 { width:200px; height:200px; animation-delay:0.8s; }
    @keyframes ringOut { 0%{transform:scale(0.8);opacity:0.8} 100%{transform:scale(1.4);opacity:0} }
    .content { padding:var(--spacing-1) 20px 48px; }
    h2 { font-family:'Outfit',sans-serif; font-size:28px; font-weight:800; color:var(--text-primary); margin:0 0 6px; text-align:center; }
    .sub { font-family:'Inter',sans-serif; font-size:14px; color:var(--text-secondary); text-align:center; margin:0 0 16px; }
    .route-recap {
      display:flex; align-items:center; justify-content:center; gap:8px;
      background:var(--bg-color); border-radius:var(--radius-md); padding:12px 16px; margin-bottom:14px;
      border:1px solid var(--border-color);
    }
    .recap-city { display:flex; align-items:center; gap:6px; }
    .city-dot { width:10px; height:10px; border-radius:50%; }
    .green { background:var(--success); }
    .red { background:var(--error); }
    .recap-city span { font-family:'Outfit',sans-serif; font-size:15px; font-weight:700; color:var(--text-primary); }
    .recap-arrow { font-family:'Inter',sans-serif; font-size:12px; color:var(--text-tertiary); }
    .summary-card {
      background:var(--surface); border-radius:var(--radius-lg); padding:16px 18px; margin-bottom:14px;
      box-shadow:var(--shadow-sm); border:1px solid var(--border-color);
    }
    .sum-row { display:flex; justify-content:space-between; align-items:center; padding:5px 0; }
    .sum-row > span:first-child { font-family:'Inter',sans-serif; font-size:13px; color:var(--text-tertiary); }
    .sum-val { font-family:'Inter',sans-serif; font-size:13px; font-weight:600; color:var(--text-primary); }
    .sum-divider { height:1px; background:var(--border-color); margin:8px 0; }
    .fare-label { font-family:'Outfit',sans-serif; font-size:15px; font-weight:700; color:var(--text-primary); }
    .fare-val { font-family:'Outfit',sans-serif; font-size:24px; font-weight:800; color:#D97706; }
    .rate-card {
      background:var(--surface); border-radius:var(--radius-lg); padding:16px 18px; margin-bottom:14px;
      box-shadow:var(--shadow-sm); border:1px solid var(--border-color);
    }
    .rate-header { display:flex; align-items:center; gap:12px; margin-bottom:14px; }
    .rate-avatar {
      width:48px; height:48px; background:#FFF3CD; border-radius:50%;
      display:flex; align-items:center; justify-content:center; font-size:26px;
      border:2px solid var(--primary); flex-shrink:0;
    }
    .rate-header h4 { font-family:'Outfit',sans-serif; font-size:16px; font-weight:700; color:var(--text-primary); margin:0; }
    .rate-header p { font-family:'Inter',sans-serif; font-size:12px; color:var(--text-secondary); margin:0; }
    .stars { display:flex; gap:6px; justify-content:center; margin-bottom:14px; }
    .star { background:none; border:none; font-size:38px; color:var(--border-color); cursor:pointer; transition:all 0.15s; }
    .star.lit { color:var(--primary); }
    .star:hover { transform:scale(1.2); }
    .review-area {
      width:100%; border:1.5px solid var(--border-color); border-radius:var(--radius-sm);
      padding:10px 12px; font-family:'Inter',sans-serif; font-size:14px; color:var(--text-primary);
      resize:none; outline:none; transition:border 0.2s; box-sizing:border-box; background: var(--bg-color);
    }
    .review-area:focus { border-color:var(--primary); background: var(--surface); }
    .review-area::placeholder { color:var(--text-tertiary); }
    .btn-submit {
      width:100%; padding:18px; margin-bottom:10px; height: 56px;
      background:var(--primary-gradient);
      border:none; border-radius:var(--radius-md); font-family:'Outfit',sans-serif;
      font-size:18px; font-weight:700; color:#fff; cursor:pointer;
      box-shadow:0 8px 24px rgba(255,184,0,0.4); transition:all 0.2s;
    }
    .btn-submit:active { transform:scale(0.97); box-shadow:0 4px 12px rgba(255,184,0,0.2); }
    .btn-new {
      width:100%; padding:14px; background:none; border:2px solid var(--border-color);
      border-radius:var(--radius-sm); font-family:'Outfit',sans-serif; font-size:16px;
      font-weight:600; color:var(--text-primary); cursor:pointer; transition:all 0.2s;
    }
    .btn-new:hover { border-color:var(--primary); color:#D97706; }
  `]
})
export class RideCompletedComponent implements OnInit {
  driver?: any;
  pickup?: any;
  drop?: any;
  distance = 0;
  duration = 0;
  fare = 0;
  paymentMethod = 'Cash';
  rating = 0;
  review = '';
  popped = false;

  constructor(public router: Router, private rideState: RideStateService) { }

  ngOnInit(): void {
    this.driver = this.rideState.selectedDriver();
    this.pickup = this.rideState.pickupLocation();
    this.drop = this.rideState.dropLocation();
    this.distance = this.rideState.distanceKm;
    this.duration = this.rideState.durationMin;
    this.fare = this.rideState.currentFare();
    setTimeout(() => (this.popped = true), 300);
  }

  setRating(r: number): void { this.rating = r; }

  submit(): void {
    this.rideState.setRating(this.rating, this.review);
    this.newTrip();
  }

  newTrip(): void {
    this.rideState.reset();
    this.router.navigate(['/home']);
  }
}
