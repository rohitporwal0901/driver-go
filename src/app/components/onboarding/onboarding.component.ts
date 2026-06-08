import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="onboard">
      <div class="slides">
        <div class="slide" *ngFor="let s of slides; let i=index" [class.active]="idx===i">
          <div class="slide-art">
            <div class="art-circle">
              <span class="art-emoji">{{ s.emoji }}</span>
            </div>
          </div>
          <div class="slide-text">
            <h2>{{ s.title }}</h2>
            <p>{{ s.body }}</p>
          </div>
        </div>
      </div>

      <div class="dots">
        <span *ngFor="let s of slides; let i=index"
              [class.active]="idx===i" (click)="idx=i"></span>
      </div>

      <div class="actions">
        <button class="btn-next" (click)="next()">
          {{ idx < slides.length-1 ? 'Next →' : 'Get Started' }}
        </button>
        <button class="btn-skip" *ngIf="idx<slides.length-1" (click)="skip()">Skip</button>
      </div>
    </div>
  `,
  styles: [`
    .onboard {
      width:100%; height:100vh;
      background:#fff;
      display:flex; flex-direction:column;
      align-items:center; overflow:hidden;
    }
    .slides { flex:1; width:100%; position:relative; }
    .slide {
      position:absolute; inset:0;
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      padding: 40px 28px;
      opacity:0; transform:translateX(50px);
      transition:all 0.5s cubic-bezier(0.34,1.56,0.64,1);
      pointer-events:none;
    }
    .slide.active { opacity:1; transform:translateX(0); pointer-events:all; }
    .slide-art {
      flex:1; display:flex; align-items:center; justify-content:center;
      width:100%;
      background: linear-gradient(180deg,#FFF8E7 0%,#FFFBF0 100%);
      border-radius: 0 0 60% 60% / 0 0 40px 40px;
      margin:-40px -28px 32px;
      padding-top:40px;
    }
    .art-circle {
      width:140px; height:140px;
      background:linear-gradient(135deg,#FFB800,#FF8C00);
      border-radius:50%;
      display:flex; align-items:center; justify-content:center;
      font-size:72px;
      box-shadow:0 16px 48px rgba(255,184,0,0.4);
      animation:bounce 2s ease-in-out infinite;
    }
    @keyframes bounce {
      0%,100%{ transform:translateY(0); }
      50%{ transform:translateY(-16px); }
    }
    .slide-text { text-align:center; }
    .slide-text h2 {
      font-family:'Outfit',sans-serif; font-size:26px; font-weight:800;
      color:#111827; margin:0 0 12px; line-height:1.25;
    }
    .slide-text p {
      font-family:'Inter',sans-serif; font-size:15px; color:#6B7280; line-height:1.65;
    }
    .dots { display:flex; gap:8px; margin-bottom:20px; }
    .dots span {
      width:8px; height:8px; border-radius:4px; background:#E5E7EB;
      transition:all 0.3s; cursor:pointer;
    }
    .dots span.active { width:28px; background:#FFB800; }
    .actions { width:100%; padding:0 24px 48px; display:flex; flex-direction:column; gap:10px; }
    .btn-next {
      width:100%; padding:18px;
      background:linear-gradient(135deg,#FFB800,#FF8C00);
      border:none; border-radius:16px;
      font-family:'Outfit',sans-serif; font-size:18px; font-weight:700; color:#fff;
      cursor:pointer; box-shadow:0 8px 24px rgba(255,184,0,0.4);
      transition:all 0.2s;
    }
    .btn-next:active{ transform:scale(0.97); }
    .btn-skip {
      background:none; border:none;
      font-family:'Inter',sans-serif; font-size:15px; color:#9CA3AF; cursor:pointer;
    }
  `]
})
export class OnboardingComponent {
  idx = 0;
  slides = [
    { emoji: '🚗', title: 'Aapki Car, Hamare Driver', body: 'Aapke paas apni car hai? Bas ek professional driver hire karo aur aaram se safar karo.' },
    { emoji: '🛣️', title: 'Ujjain se Indore, Kahi bhi', body: 'City trip ho ya outstation — hum trusted, verified drivers provide karte hain har route ke liye.' },
    { emoji: '🔒', title: 'Safe & Verified Drivers', body: 'Saare drivers police-verified hain, experienced hain, aur aapki safety hamare liye #1 priority hai.' },
  ];
  constructor(private router: Router) {}
  next() { this.idx < this.slides.length-1 ? this.idx++ : this.router.navigate(['/login']); }
  skip() { this.router.navigate(['/login']); }
}
