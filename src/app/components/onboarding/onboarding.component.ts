import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Slide {
  image: string;          // path to illustration
  imageAlt: string;
  title: string;
  highlight: string;      // coloured part of title
  body: string;
}

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="onboard">

      <!-- Slide Area -->
      <div class="slides-wrap">
        <div class="slide"
             *ngFor="let s of slides; let i = index"
             [class.active]="idx === i"
             [class.prev]="idx > i">

          <!-- Illustration Section -->
          <div class="art-section">
            <!-- Real image if provided -->
            <img *ngIf="s.image"
                 [src]="s.image" [alt]="s.imageAlt"
                 class="slide-img" />
            <!-- Fallback emoji for slides without images -->
            <div *ngIf="!s.image" class="emoji-art">
              <div class="emoji-circle">{{ s.imageAlt }}</div>
            </div>
            <!-- Decorative arc -->
            <div class="arc"></div>
          </div>

          <!-- Text Section -->
          <div class="text-section">
            <h2>
              {{ s.title }}<br>
              <span class="hl">{{ s.highlight }}</span>
            </h2>
            <p>{{ s.body }}</p>
          </div>
        </div>
      </div>

      <!-- Dots -->
      <div class="dots">
        <span *ngFor="let s of slides; let i = index"
              [class.active]="idx === i"
              (click)="goTo(i)">
        </span>
      </div>

      <!-- Actions -->
      <div class="actions">
        <button class="btn-next" (click)="next()">
          {{ idx < slides.length - 1 ? 'Next' : 'Get Started' }}
        </button>
        <button class="btn-skip" *ngIf="idx < slides.length - 1"
                (click)="skip()">
          Skip
        </button>
      </div>
    </div>
  `,
  styles: [`
    .onboard {
      width: 100%;
      height: 100dvh;
      background: var(--surface);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;
    }

    /* ---- Slides ---- */
    .slides-wrap {
      flex: 1;
      position: relative;
      overflow: hidden;
    }
    .slide {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      opacity: 0;
      transform: translateX(60px);
      transition: opacity 0.45s ease, transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
      pointer-events: none;
    }
    .slide.active {
      opacity: 1;
      transform: translateX(0);
      pointer-events: all;
    }
    .slide.prev {
      opacity: 0;
      transform: translateX(-60px);
    }

    /* ---- Art Section ---- */
    .art-section {
      height: 58%;
      background: linear-gradient(180deg, #FFF8E7 0%, #FFF4D4 100%);
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .slide-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center bottom;
      display: block;
    }
    .arc {
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 40px;
      background: var(--surface);
      border-radius: 100% 100% 0 0 / 40px 40px 0 0;
    }
    .emoji-art {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    }
    .emoji-circle {
      width: 140px;
      height: 140px;
      background: var(--primary-gradient);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 70px;
      box-shadow: 0 20px 60px rgba(255, 184, 0, 0.4);
      animation: float 2.5s ease-in-out infinite;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-14px); }
    }

    /* ---- Text Section ---- */
    .text-section {
      flex: 1;
      padding: var(--spacing-4) var(--spacing-4) 0;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1);
    }
    h2 {
      font-family: 'Outfit', sans-serif;
      font-size: 30px;
      font-weight: 800;
      color: var(--text-primary);
      line-height: 1.2;
      margin: 0;
    }
    .hl { color: var(--primary); }
    p {
      font-family: 'Inter', sans-serif;
      font-size: 15px;
      color: var(--text-secondary);
      line-height: 1.65;
      margin: 0;
    }

    /* ---- Dots ---- */
    .dots {
      display: flex;
      gap: 8px;
      justify-content: center;
      padding: 14px 0 0;
    }
    .dots span {
      width: 8px;
      height: 8px;
      border-radius: 4px;
      background: var(--border-color);
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .dots span.active {
      width: 28px;
      background: var(--primary-gradient);
    }

    /* ---- Actions ---- */
    .actions {
      padding: var(--spacing-2) var(--spacing-3) max(36px, var(--safe-bottom));
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1);
    }
    /* We can remove .btn-next if we switch to .btn-primary in HTML, but changing CSS is safer here to avoid HTML changes as per user request to not change structure drastically */
    .btn-next {
      width: 100%;
      padding: 16px;
      height: 56px;
      background: var(--primary-gradient);
      border: none;
      border-radius: var(--radius-md);
      font-family: 'Outfit', sans-serif;
      font-size: 18px;
      font-weight: 700;
      color: #fff;
      cursor: pointer;
      box-shadow: 0 10px 28px rgba(255, 184, 0, 0.45);
      transition: all 0.2s ease;
      letter-spacing: 0.3px;
    }
    .btn-next:active { transform: scale(0.97); }
    .btn-skip {
      background: none;
      border: none;
      font-family: 'Inter', sans-serif;
      font-size: 15px;
      color: var(--text-tertiary);
      cursor: pointer;
      padding: 8px;
      transition: color 0.2s;
    }
    .btn-skip:hover { color: var(--text-secondary); }
  `]
})
export class OnboardingComponent {
  idx = 0;

  slides: Slide[] = [
    {
      image: 'assets/onboard-driver.png',
      imageAlt: 'Professional driver with car',
      title: 'Safe Rides,',
      highlight: 'Every Time',
      body: 'Book reliable, verified drivers for your own car and enjoy comfortable rides anytime, anywhere.',
    },
    {
      image: 'assets/onboard-fast.png',
      imageAlt: 'Fast pickup',
      title: 'Fast Pickup,',
      highlight: 'Less Waiting',
      body: 'Get matched with a nearby professional driver in seconds. No delays — just go!',
    },
    {
      image: 'assets/onboard-track.png',
      imageAlt: 'Live Tracking',
      title: 'Track Your Trip',
      highlight: 'Live on Map',
      body: 'Follow your driver\'s location in real time. Share your trip with loved ones for added safety.',
    },
  ];

  constructor(private router: Router) {}

  next(): void {
    if (this.idx < this.slides.length - 1) {
      this.idx++;
    } else {
      this.router.navigate(['/login']);
    }
  }

  skip(): void { this.router.navigate(['/login']); }
  goTo(i: number): void { this.idx = i; }
}
