import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="splash">
      <div class="splash-bg">
        <div class="road-lines">
          <div class="line l1"></div>
          <div class="line l2"></div>
          <div class="line l3"></div>
        </div>
      </div>
      <div class="splash-content" [class.show]="show">
        <div class="logo-wrap">
          <div class="logo-circle">
            <span class="steering">🚗</span>
          </div>
        </div>
        <h1 class="brand">DriverSaab</h1>
        <p class="tagline">Apna Car, Hamar Driver</p>
        <p class="tagline-en">Your Car · Our Expert Driver</p>
      </div>
      <div class="bottom-bar">
        <div class="progress-track">
          <div class="progress-fill"></div>
        </div>
        <p class="version">v1.0.0</p>
      </div>
    </div>
  `,
  styles: [`
    .splash {
      width: 100%;
      height: 100vh;
      background: linear-gradient(160deg, #0f1923 0%, #1a2f4e 60%, #0d1a2d 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }
    .splash-bg {
      position: absolute;
      inset: 0;
      overflow: hidden;
    }
    .road-lines {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 40%;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      gap: 0;
    }
    .line {
      height: 3px;
      background: linear-gradient(90deg, transparent 0%, rgba(255,184,0,0.15) 30%, rgba(255,184,0,0.25) 50%, rgba(255,184,0,0.15) 70%, transparent 100%);
      margin-bottom: 20px;
    }
    .splash-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      opacity: 0;
      transform: translateY(24px);
      transition: all 0.9s cubic-bezier(0.34, 1.56, 0.64, 1);
      z-index: 2;
    }
    .splash-content.show { opacity: 1; transform: translateY(0); }
    .logo-wrap { position: relative; }
    .logo-circle {
      width: 100px;
      height: 100px;
      background: linear-gradient(135deg, #FFB800, #FF8C00);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 48px;
      box-shadow: 0 0 40px rgba(255,184,0,0.5), 0 0 80px rgba(255,184,0,0.2);
      animation: float 3s ease-in-out infinite;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0) rotate(-3deg); }
      50% { transform: translateY(-12px) rotate(3deg); }
    }
    .brand {
      font-family: 'Outfit', sans-serif;
      font-size: 40px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .tagline {
      font-family: 'Outfit', sans-serif;
      font-size: 16px;
      font-weight: 600;
      color: #FFB800;
      margin: 0;
    }
    .tagline-en {
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      color: rgba(255,255,255,0.4);
      margin: 0;
      letter-spacing: 1px;
    }
    .bottom-bar {
      position: absolute;
      bottom: 48px;
      left: 0;
      right: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      z-index: 2;
    }
    .progress-track {
      width: 120px;
      height: 3px;
      background: rgba(255,255,255,0.1);
      border-radius: 3px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #FFB800, #FF8C00);
      animation: load 2.5s ease-in-out forwards;
    }
    @keyframes load { 0% { width: 0; } 100% { width: 100%; } }
    .version {
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      color: rgba(255,255,255,0.2);
      margin: 0;
    }
  `]
})
export class SplashComponent implements OnInit {
  show = false;
  constructor(private router: Router) {}
  ngOnInit() {
    setTimeout(() => this.show = true, 100);
    setTimeout(() => this.router.navigate(['/onboarding']), 2800);
  }
}
