import { Component, inject, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RideService } from '../../services/ride/ride.service';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-driver-tracking',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="driver-tracking-screen">
      <!-- Header -->
      <div class="top-bar">
        <h2>Heading to Pickup</h2>
      </div>

      <!-- Map -->
      <div class="map-container">
        <!-- Mocking Map background for driver -->
        <div class="bg-blur"></div>
      </div>

      <!-- Bottom Sheet -->
      <div class="driver-sheet">
        <div class="sheet-handle"></div>

        <div class="rider-row">
          <div class="drv-avatar-ring">
            <div class="drv-avatar">👤</div>
          </div>
          <div class="drv-info">
            <strong>Passenger</strong>
            <span class="rating">⭐ 4.8</span>
          </div>
          <div class="actions-row">
            <button class="act-btn"><span class="icon">📞</span></button>
            <button class="act-btn"><span class="icon">💬</span></button>
          </div>
        </div>

        <div class="address-box">
          <div class="loc-item">
            <div class="dot green"></div>
            <strong>{{ rideData?.pickupAddress || 'Pickup Location' }}</strong>
          </div>
        </div>

        <div class="btn-group">
          <button class="btn-arrive" *ngIf="!arrived" (click)="arrived = true">I have Arrived</button>
        </div>

        <!-- OTP Verification when arrived -->
        <div class="otp-section" *ngIf="arrived">
          <p>Ask rider for OTP to start trip</p>
          <div class="otp-inputs">
            <input type="text" maxlength="1" #otp1 (keyup)="onOtpInput(1, $event, otp2, null)" />
            <input type="text" maxlength="1" #otp2 (keyup)="onOtpInput(2, $event, otp3, otp1)" />
            <input type="text" maxlength="1" #otp3 (keyup)="onOtpInput(3, $event, otp4, otp2)" />
            <input type="text" maxlength="1" #otp4 (keyup)="onOtpInput(4, $event, null, otp3)" />
          </div>
          <div *ngIf="errorMsg" class="error-msg">{{ errorMsg }}</div>
          <button class="btn-start" (click)="verifyAndStart()">Start Trip</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .driver-tracking-screen { width:100%; height:100dvh; position:relative; overflow:hidden; background:var(--bg-color); }
    .top-bar {
      position:absolute; top:calc(16px + var(--safe-top)); left:16px; right:16px; z-index:2000;
      padding:16px; border-radius:var(--radius-md); background:var(--surface);
      display:flex; align-items:center; justify-content: center; box-shadow:var(--shadow-md);
    }
    .top-bar h2 { font-family:'Outfit',sans-serif; font-size:18px; font-weight:700; color:var(--text-primary); margin:0; }
    
    .map-container { position:absolute; inset:0; z-index:1; }
    .bg-blur {
      position: absolute; inset: 0;
      background: url('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png') center/cover;
      filter: blur(5px) brightness(0.8);
    }

    .driver-sheet {
      position:absolute; bottom:0; left:0; right:0; z-index:20;
      background:var(--surface); border-radius:var(--radius-lg) var(--radius-lg) 0 0;
      padding:var(--spacing-3) 20px max(var(--spacing-3), var(--safe-bottom));
      box-shadow:var(--shadow-sheet);
    }
    .sheet-handle { width:36px; height:4px; background:var(--border-color); border-radius:4px; margin:0 auto var(--spacing-2); }
    
    .rider-row { display:flex; align-items:center; margin-bottom:var(--spacing-3); }
    .drv-avatar-ring { padding:3px; border-radius:50%; background:var(--primary-gradient); margin-right:12px; }
    .drv-avatar { width:48px; height:48px; background:var(--surface); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:26px; }
    .drv-info { flex:1; display:flex; flex-direction:column; }
    .drv-info strong { font-family:'Outfit',sans-serif; font-size:17px; font-weight:800; color:var(--text-primary); }
    .actions-row { display:flex; gap:8px; }
    .act-btn { padding:10px; border-radius:50%; border:1px solid var(--border-color); background:var(--surface); cursor:pointer; }
    
    .address-box { background:var(--bg-color); border-radius:var(--radius-md); padding:16px; margin-bottom:20px; }
    .loc-item { display:flex; align-items:center; gap:12px; }
    .dot { width:12px; height:12px; border-radius:50%; flex-shrink:0; }
    .dot.green { background:#22c55e; }
    .loc-item strong { font-family:'Inter',sans-serif; font-size:14px; font-weight:600; color:var(--text-primary); }
    
    .btn-arrive, .btn-start {
      width:100%; padding:16px; height:56px; background:var(--primary-gradient);
      border:none; border-radius:var(--radius-md); font-family:'Outfit',sans-serif;
      font-size:18px; font-weight:800; color:#fff; cursor:pointer; margin-bottom: 8px;
    }
    
    .otp-section { text-align:center; border-top: 1px solid var(--border-color); padding-top: 16px; margin-top: 16px; }
    .otp-section p { font-family:'Inter',sans-serif; font-size:14px; font-weight:600; margin-bottom:12px; }
    .otp-inputs { display:flex; gap:12px; justify-content:center; margin-bottom:20px; }
    .otp-inputs input {
      width:50px; height:60px; border:2px solid var(--border-color); border-radius:var(--radius-md);
      font-family:'Outfit',sans-serif; font-size:24px; font-weight:800; text-align:center;
    }
    .otp-inputs input:focus { border-color:var(--primary); }
    .error-msg { color: #ef4444; font-size: 13px; margin-bottom: 12px; }
  `]
})
export class DriverTrackingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private firestore = inject(Firestore);

  rideId: string | null = null;
  rideData: any = null;
  arrived = false;
  otpValues = ['', '', '', ''];
  errorMsg = '';

  async ngOnInit() {
    this.rideId = this.route.snapshot.paramMap.get('rideId');
    if (this.rideId) {
      const docRef = doc(this.firestore, `rides/${this.rideId}`);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        this.rideData = snap.data();
      }
    }
  }

  onOtpInput(index: number, event: any, nextInput: any, prevInput: any) {
    const value = event.target.value;
    this.otpValues[index - 1] = value;
    if (value && nextInput) nextInput.focus();
    else if (!value && event.key === 'Backspace' && prevInput) prevInput.focus();
  }

  async verifyAndStart() {
    const enteredOtp = this.otpValues.join('');
    if (enteredOtp !== this.rideData?.otp) {
      this.errorMsg = 'Invalid OTP. Please check with rider.';
      return;
    }
    this.errorMsg = '';
    
    if (this.rideId) {
      const docRef = doc(this.firestore, `rides/${this.rideId}`);
      await updateDoc(docRef, { status: 'started' });
      this.router.navigate(['/on-ride']);
    }
  }
}
