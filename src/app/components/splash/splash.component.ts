import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="splash">
      <!-- Full Background Image -->
      <div class="splash-bg">
        <img src="assets/splash-bg.png" alt="Highway" class="bg-img" />
        <div class="bg-overlay"></div>
      </div>

      <!-- Content -->
      <div class="splash-content" [class.show]="show">
        <!-- Logo -->
        <div class="logo-section">
          <div class="logo-pin">
            <div class="pin-outer">
              <div class="pin-inner">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
                  <circle cx="24" cy="24" r="22" stroke="#1a1a2e" stroke-width="3"/>
                  <circle cx="24" cy="24" r="12" fill="#1a1a2e"/>
                  <!-- Steering wheel -->
                  <circle cx="24" cy="24" r="8" stroke="#FFB800" stroke-width="2.5" fill="none"/>
                  <line x1="24" y1="16" x2="24" y2="32" stroke="#FFB800" stroke-width="2.5" stroke-linecap="round"/>
                  <line x1="16" y1="24" x2="32" y2="24" stroke="#FFB800" stroke-width="2.5" stroke-linecap="round"/>
                  <line x1="18.3" y1="18.3" x2="29.7" y2="29.7" stroke="#FFB800" stroke-width="2" stroke-linecap="round"/>
                  <line x1="29.7" y1="18.3" x2="18.3" y2="29.7" stroke="#FFB800" stroke-width="2" stroke-linecap="round"/>
                  <circle cx="24" cy="24" r="3" fill="#FFB800"/>
                </svg>
              </div>
            </div>
          </div>
          <h1 class="brand-name">DriveGo</h1>
          <p class="brand-tagline">Your Ride, Your Way</p>
        </div>
      </div>

      <!-- Bottom Progress -->
      <div class="bottom-section" [class.show]="show">
        <div class="progress-track">
          <div class="progress-fill"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .splash {
      width: 100%;
      height: 100vh;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    /* Background */
    .splash-bg {
      position: absolute;
      inset: 0;
      z-index: 0;
    }
    .bg-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      display: block;
    }
    .bg-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        180deg,
        rgba(10, 15, 30, 0.55) 0%,
        rgba(10, 15, 30, 0.35) 30%,
        rgba(10, 15, 30, 0.45) 65%,
        rgba(10, 15, 30, 0.85) 100%
      );
    }

    /* Content Layer */
    .splash-content {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0;
      opacity: 0;
      transform: translateY(28px) scale(0.92);
      transition: all 1s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .splash-content.show {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    /* Logo pin icon */
    .logo-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    .logo-pin {
      position: relative;
    }
    .pin-outer {
      width: 90px;
      height: 90px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      background: linear-gradient(135deg, #FFB800, #FFDB4D);
      box-shadow: 0 0 50px rgba(255, 184, 0, 0.6), 0 0 100px rgba(255, 184, 0, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: pinFloat 3s ease-in-out infinite;
    }
    .pin-inner {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, #FFB800, #FF8C00);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: rotate(45deg);
    }
    @keyframes pinFloat {
      0%, 100% { transform: rotate(-45deg) translateY(0); }
      50% { transform: rotate(-45deg) translateY(-8px); }
    }

    .brand-name {
      font-family: 'Outfit', sans-serif;
      font-size: 46px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -1px;
      margin: 0;
      text-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
    }
    .brand-tagline {
      font-family: 'Inter', sans-serif;
      font-size: 16px;
      font-weight: 400;
      color: rgba(255, 255, 255, 0.65);
      margin: 0;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }

    /* Bottom loader */
    .bottom-section {
      position: absolute;
      bottom: 52px;
      left: 0;
      right: 0;
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: center;
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.8s ease 0.4s;
    }
    .bottom-section.show {
      opacity: 1;
      transform: translateY(0);
    }
    .progress-track {
      width: 140px;
      height: 3px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 3px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #FFB800, #FFDB4D);
      border-radius: 3px;
      animation: load 2.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }
    @keyframes load {
      0% { width: 0%; }
      100% { width: 100%; }
    }
  `]
})
export class SplashComponent implements OnInit {
  show = false;
  constructor(private router: Router) {}
  ngOnInit(): void {
    setTimeout(() => (this.show = true), 150);
    setTimeout(() => this.router.navigate(['/onboarding']), 3000);
  }
}
