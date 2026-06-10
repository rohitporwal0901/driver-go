import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RideStateService } from '../../services/ride-state.service';
import { Driver } from '../../models/ride.models';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="payment-screen">
      <!-- Header -->
      <div class="top-bar">
        <h2>Payment</h2>
      </div>

      <div class="payment-content">
        <!-- Ride Summary -->
        <div class="summary-card">
          <div class="summary-header">
            <h3>Ride Completed</h3>
            <span class="check-icon">✓</span>
          </div>
          
          <div class="driver-info">
            <div class="drv-avatar">{{ driver?.photo || '🧑‍✈️' }}</div>
            <div class="drv-details">
              <strong>{{ driver?.name || 'Driver' }}</strong>
              <small>{{ driver?.vehicle || 'Vehicle' }} • {{ driver?.licenseNo || 'XX 00 XX 0000' }}</small>
            </div>
          </div>
          
          <div class="fare-display">
            <span>Total Fare</span>
            <strong>₹{{ fare }}</strong>
          </div>
        </div>

        <!-- Payment Method -->
        <div class="payment-methods">
          <div class="method-title">Pay via UPI</div>
          
          <div class="qr-container">
            <!-- Dummy QR Code SVG -->
            <svg width="180" height="180" viewBox="0 0 100 100" class="qr-code">
              <rect width="100" height="100" fill="white" rx="10"/>
              <!-- Corner boxes -->
              <rect x="10" y="10" width="25" height="25" fill="none" stroke="var(--text-primary)" stroke-width="3"/>
              <rect x="15" y="15" width="15" height="15" fill="var(--text-primary)"/>
              
              <rect x="65" y="10" width="25" height="25" fill="none" stroke="var(--text-primary)" stroke-width="3"/>
              <rect x="70" y="15" width="15" height="15" fill="var(--text-primary)"/>
              
              <rect x="10" y="65" width="25" height="25" fill="none" stroke="var(--text-primary)" stroke-width="3"/>
              <rect x="15" y="70" width="15" height="15" fill="var(--text-primary)"/>
              
              <!-- Random dots for QR code data -->
              <rect x="40" y="10" width="10" height="10" fill="var(--text-primary)"/>
              <rect x="45" y="25" width="15" height="10" fill="var(--text-primary)"/>
              <rect x="10" y="40" width="15" height="15" fill="var(--text-primary)"/>
              <rect x="30" y="45" width="25" height="10" fill="var(--text-primary)"/>
              <rect x="65" y="40" width="15" height="20" fill="var(--text-primary)"/>
              <rect x="85" y="45" width="10" height="15" fill="var(--text-primary)"/>
              <rect x="40" y="65" width="20" height="10" fill="var(--text-primary)"/>
              <rect x="45" y="80" width="15" height="15" fill="var(--text-primary)"/>
              <rect x="70" y="70" width="25" height="10" fill="var(--text-primary)"/>
              <rect x="65" y="85" width="15" height="10" fill="var(--text-primary)"/>
              <rect x="85" y="85" width="10" height="10" fill="var(--text-primary)"/>
            </svg>
            <p>Scan to pay with any UPI app</p>
            <div class="upi-logos">
              <span>GPay</span>
              <span class="dot">•</span>
              <span>PhonePe</span>
              <span class="dot">•</span>
              <span>Paytm</span>
            </div>
          </div>
        </div>
      </div>

      <div class="bottom-action">
        <div class="swipe-container" [class.success]="paymentSuccess">
          <div class="swipe-text" *ngIf="!processing && !paymentSuccess">Swipe to Pay ₹{{ fare }}</div>
          <div class="swipe-text" *ngIf="processing && !paymentSuccess">Processing...</div>
          <div class="swipe-text success-text" *ngIf="paymentSuccess">Payment Successful! ✓</div>
          
          <div class="swipe-thumb" 
               *ngIf="!paymentSuccess && !processing"
               (touchstart)="onTouchStart($event)"
               (touchmove)="onTouchMove($event)"
               (touchend)="onTouchEnd($event)"
               (mousedown)="onMouseDown($event)"
               [style.transform]="'translateX(' + swipeX + 'px)'">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>
          </div>
          
          <div class="swipe-spinner" *ngIf="processing && !paymentSuccess"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .payment-screen {
      width: 100%; height: 100dvh; display: flex; flex-direction: column;
      background: var(--bg-color); overflow: hidden;
    }
    
    .top-bar {
      padding: calc(16px + var(--safe-top, 0px)) 20px 16px;
      background: var(--surface); box-shadow: var(--shadow-sm);
      display: flex; align-items: center; justify-content: center;
      z-index: 10;
    }
    .top-bar h2 { font-family: 'Outfit', sans-serif; font-size: 20px; font-weight: 700; color: var(--text-primary); margin: 0; }
    
    .payment-content {
      flex: 1; overflow-y: auto; padding: 24px 20px;
      display: flex; flex-direction: column; gap: 24px;
    }
    
    .summary-card {
      background: var(--surface); border-radius: var(--radius-lg); padding: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid var(--border-color);
    }
    .summary-header {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;
      padding-bottom: 16px; border-bottom: 1px solid var(--border-color);
    }
    .summary-header h3 { font-family: 'Outfit', sans-serif; font-size: 18px; font-weight: 700; color: var(--text-primary); margin: 0; }
    .check-icon {
      width: 28px; height: 28px; background: var(--success); color: white; border-radius: 50%;
      display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px;
    }
    
    .driver-info { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
    .drv-avatar {
      width: 48px; height: 48px; background: var(--bg-color); border-radius: 50%;
      display: flex; align-items: center; justify-content: center; font-size: 24px; border: 2px solid var(--border-color);
    }
    .drv-details { display: flex; flex-direction: column; }
    .drv-details strong { font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 700; color: var(--text-primary); }
    .drv-details small { font-family: 'Inter', sans-serif; font-size: 13px; color: var(--text-secondary); margin-top: 2px; }
    
    .fare-display {
      background: #FFFBEB; border: 1.5px dashed #FDE68A; border-radius: var(--radius-md);
      padding: 16px; display: flex; align-items: center; justify-content: space-between;
    }
    .fare-display span { font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 600; color: var(--text-secondary); }
    .fare-display strong { font-family: 'Outfit', sans-serif; font-size: 28px; font-weight: 800; color: var(--primary); }
    
    .payment-methods {
      background: var(--surface); border-radius: var(--radius-lg); padding: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid var(--border-color);
    }
    .method-title {
      font-family: 'Outfit', sans-serif; font-size: 18px; font-weight: 700; color: var(--text-primary);
      text-align: center; margin-bottom: 20px;
    }
    
    .qr-container { display: flex; flex-direction: column; align-items: center; gap: 16px; }
    .qr-code { padding: 10px; border-radius: var(--radius-md); border: 2px solid var(--border-color); }
    .qr-container p { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 500; color: var(--text-secondary); margin: 0; }
    
    .upi-logos { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
    .upi-logos span { font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 700; color: var(--text-primary); }
    .upi-logos .dot { color: var(--text-tertiary); font-size: 16px; }
    
    .bottom-action {
      background: var(--surface); padding: 20px 20px max(24px, var(--safe-bottom, 0px));
      box-shadow: 0 -4px 24px rgba(0,0,0,0.08); border-top: 1px solid var(--border-color);
    }
    .swipe-container {
      position: relative; width: 100%; height: 60px; background: #FFF3C4;
      border-radius: 30px; display: flex; align-items: center; justify-content: center;
      overflow: hidden; border: 1px solid #FDE68A; transition: all 0.3s ease;
    }
    .swipe-container.success { background: var(--success); border-color: var(--success); }
    
    .swipe-text {
      font-family: 'Outfit', sans-serif; font-size: 16px; font-weight: 700; color: #B45309;
      z-index: 1; pointer-events: none; transition: opacity 0.3s;
    }
    .success-text { color: white; animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    @keyframes popIn { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
    
    .swipe-thumb {
      position: absolute; left: 4px; top: 4px; bottom: 4px; width: 52px;
      background: var(--primary-gradient); border-radius: 26px; display: flex; align-items: center;
      justify-content: center; color: white; cursor: grab; z-index: 2;
      box-shadow: 0 4px 12px rgba(255, 184, 0, 0.4); transition: transform 0.1s linear; touch-action: none;
    }
    .swipe-thumb:active { cursor: grabbing; transition: none; }
    
    .swipe-spinner {
      position: absolute; right: 20px; width: 24px; height: 24px;
      border: 3px solid rgba(180, 83, 9, 0.2); border-top-color: #B45309;
      border-radius: 50%; animation: spin 1s linear infinite; z-index: 2;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class PaymentComponent implements OnInit {
  driver?: Driver;
  fare = 0;
  processing = false;
  paymentSuccess = false;
  swipeX = 0;
  startX = 0;
  maxSwipe = 0;
  isDragging = false;

  constructor(private router: Router, private rideState: RideStateService) {}

  ngOnInit(): void {
    this.driver = this.rideState.selectedDriver();
    this.fare = this.rideState.currentFare() || 250;
  }

  onTouchStart(e: TouchEvent) {
    this.isDragging = true;
    this.startX = e.touches[0].clientX - this.swipeX;
    const container = (e.target as HTMLElement).closest('.swipe-container') as HTMLElement;
    this.maxSwipe = container.offsetWidth - 60; // 60 is approx thumb width + padding
  }

  onTouchMove(e: TouchEvent) {
    if (!this.isDragging) return;
    const x = e.touches[0].clientX - this.startX;
    this.swipeX = Math.max(0, Math.min(x, this.maxSwipe));
  }

  onTouchEnd(e: TouchEvent) {
    this.isDragging = false;
    if (this.swipeX > this.maxSwipe * 0.8) {
      this.swipeX = this.maxSwipe;
      this.completePayment();
    } else {
      this.swipeX = 0;
    }
  }

  onMouseDown(e: MouseEvent) {
    this.isDragging = true;
    this.startX = e.clientX - this.swipeX;
    const container = (e.target as HTMLElement).closest('.swipe-container') as HTMLElement;
    this.maxSwipe = container.offsetWidth - 60;
    
    const onMouseMove = (ev: MouseEvent) => {
      if (!this.isDragging) return;
      const x = ev.clientX - this.startX;
      this.swipeX = Math.max(0, Math.min(x, this.maxSwipe));
    };
    
    const onMouseUp = () => {
      this.isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      
      if (this.swipeX > this.maxSwipe * 0.8) {
        this.swipeX = this.maxSwipe;
        this.completePayment();
      } else {
        this.swipeX = 0;
      }
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  completePayment() {
    this.processing = true;
    setTimeout(() => {
      this.processing = false;
      this.paymentSuccess = true;
      setTimeout(() => {
        this.router.navigate(['/ride-completed']);
      }, 1000); // Wait 1s for success animation to finish
    }, 1500); // Simulate network delay
  }
}
