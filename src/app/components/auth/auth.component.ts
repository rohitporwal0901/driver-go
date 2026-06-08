import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-screen">

      <!-- ============ LOGIN MODE ============ -->
      <div class="screen login-screen" *ngIf="mode === 'login'">
        <!-- Hero Section with bg image -->
        <div class="hero-section">
          <img src="/assets/login-hero.png" alt="Login Hero" class="hero-bg-img" />
          <div class="hero-overlay"></div>
          
          <!-- Logo on hero -->
          <div class="hero-logo">
            <!-- <div class="logo-badge">
              <span class="logo-icon-pin">📍</span>
              <span class="logo-txt">DriveGo</span>
            </div> -->
          </div>
        </div>

        <!-- Form Card -->
        <div class="form-card login-card">
          <div class="card-handle"></div>
          <h2>Welcome Back 👋</h2>
          <p class="subtitle">Sign in to continue</p>

          <form (ngSubmit)="handleLogin()">
            <div class="field">
              <label>Email or Phone Number</label>
              <div class="input-box">
                <span class="inp-icon">👤</span>
                <input type="text" [(ngModel)]="loginEmail" name="loginEmail"
                       placeholder="Enter email or phone" id="login-email" />
              </div>
            </div>

            <div class="field">
              <label>Password</label>
              <div class="input-box">
                <span class="inp-icon">🔒</span>
                <input [type]="showPwd ? 'text' : 'password'" [(ngModel)]="loginPassword"
                       name="loginPassword" placeholder="Enter password" id="login-password" />
                <button type="button" class="eye-btn" (click)="showPwd = !showPwd">
                  {{ showPwd ? '🙈' : '👁️' }}
                </button>
              </div>
              <a href="#" class="forgot">Forgot Password?</a>
            </div>

            <button type="submit" class="btn-primary" [class.loading]="isLoading" id="sign-in-btn">
              <span *ngIf="!isLoading">Sign In</span>
              <span *ngIf="isLoading" class="spinner"></span>
            </button>
          </form>

          <div class="divider"><span>or continue with</span></div>

          <div class="social-row">
            <button class="social-btn" id="google-btn">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" alt="Google" />
            </button>
            <button class="social-btn" id="apple-btn">🍎</button>
            <button class="social-btn" id="fb-btn">
              <span style="color:#1877F2;font-weight:800;font-size:18px;font-family:Georgia,serif">f</span>
            </button>
          </div>

          <p class="switch">
            Don't have an account?
            <button (click)="mode='signup'" type="button">Sign Up</button>
          </p>
        </div>
      </div>

      <!-- ============ SIGNUP MODE ============ -->
      <div class="screen signup-screen" *ngIf="mode === 'signup'">
        <!-- Compact hero for signup -->
        <div class="hero-section hero-compact">
          <img src="/assets/login-hero.png" alt="Signup Hero" class="hero-bg-img" />
          <div class="hero-overlay"></div>
          
          <div class="signup-top-bar">
            <button class="back-circle" (click)="mode='login'">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
              </svg>
            </button>
            <span class="hero-brand">DriveGo</span>
          </div>
        </div>

        <div class="form-card signup-card">
          <div class="card-handle"></div>
          <h2>Create Account</h2>
          <p class="subtitle">Let's get you started</p>

          <form (ngSubmit)="handleSignup()">
            <div class="field">
              <div class="input-box">
                <span class="inp-icon">👤</span>
                <input type="text" [(ngModel)]="signupName" name="sName"
                       placeholder="Full Name" id="signup-name" />
              </div>
            </div>
            <div class="field">
              <div class="input-box">
                <span class="inp-icon">📧</span>
                <input type="email" [(ngModel)]="signupEmail" name="sEmail"
                       placeholder="Email or Phone Number" id="signup-email" />
              </div>
            </div>
            <div class="field">
              <div class="input-box">
                <span class="inp-icon">🔒</span>
                <input [type]="showPwd ? 'text' : 'password'" [(ngModel)]="signupPassword"
                       name="sPwd" placeholder="Password" id="signup-password" />
                <button type="button" class="eye-btn" (click)="showPwd = !showPwd">
                  {{ showPwd ? '🙈' : '👁️' }}
                </button>
              </div>
            </div>
            <div class="field">
              <div class="input-box">
                <span class="inp-icon">🔒</span>
                <input [type]="showPwd ? 'text' : 'password'" [(ngModel)]="confirmPassword"
                       name="sCfm" placeholder="Confirm Password" id="signup-confirm" />
              </div>
            </div>

            <button type="submit" class="btn-primary" [class.loading]="isLoading" id="sign-up-btn">
              <span *ngIf="!isLoading">Sign Up</span>
              <span *ngIf="isLoading" class="spinner"></span>
            </button>
          </form>

          <p class="switch">
            Already have an account?
            <button (click)="mode='login'" type="button">Sign In</button>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-screen {
      width: 100%;
      height: 100dvh;
      position: relative;
      overflow: hidden;
    }
    .screen {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    /* =====================
       HERO SECTION
    ===================== */
    .hero-section {
      height: 42%;
      position: relative;
      overflow: hidden;
      flex-shrink: 0;
      background: #0d1a2d;
    }
    .hero-bg-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }
    .hero-section.hero-compact {
      height: 28%;
    }
    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(13,26,45,0.2) 0%, rgba(13,26,45,0.6) 60%, rgba(13,26,45,0.95) 100%);
    }

    /* Logo overlay on hero */
    .hero-logo {
      position: absolute;
      top: 48px;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      z-index: 3;
    }
    .logo-badge {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .logo-icon-pin { font-size: 22px; }
    .logo-txt {
      font-family: 'Outfit', sans-serif;
      font-size: 22px;
      font-weight: 800;
      color: #ffffff;
    }

    /* Signup top bar */
    .signup-top-bar {
      position: absolute;
      top: 44px;
      left: 16px;
      right: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      z-index: 3;
    }
    .back-circle {
      width: 38px;
      height: 38px;
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      backdrop-filter: blur(4px);
    }
    .hero-brand {
      font-family: 'Outfit', sans-serif;
      font-size: 18px;
      font-weight: 700;
      color: #fff;
    }

    /* =====================
       FORM CARD
    ===================== */
    .form-card {
      flex: 1;
      background: #ffffff;
      border-radius: 28px 28px 0 0;
      padding: 14px 22px 36px;
      margin-top: -20px;
      overflow-y: auto;
      box-shadow: 0 -4px 32px rgba(0, 0, 0, 0.12);
      position: relative;
      z-index: 5;
    }
    .card-handle {
      width: 40px;
      height: 4px;
      background: #E5E7EB;
      border-radius: 4px;
      margin: 0 auto 16px;
    }
    h2 {
      font-family: 'Outfit', sans-serif;
      font-size: 26px;
      font-weight: 800;
      color: #111827;
      margin: 0 0 4px;
    }
    .subtitle {
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      color: #9CA3AF;
      margin: 0 0 20px;
    }

    /* ---- Fields ---- */
    .field { margin-bottom: 14px; }
    label {
      display: block;
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      font-weight: 600;
      color: #374151;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    .input-box {
      display: flex;
      align-items: center;
      background: #ffffff;
      border: 1.5px solid #E5E7EB;
      border-radius: 14px;
      overflow: hidden;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .input-box:focus-within {
      border-color: #FFB800;
      box-shadow: 0 0 0 3px rgba(255, 184, 0, 0.12);
    }
    .inp-icon {
      padding: 0 12px;
      font-size: 17px;
      flex-shrink: 0;
    }
    input {
      flex: 1;
      border: none;
      outline: none;
      background: transparent;
      padding: 15px 12px 15px 0;
      font-family: 'Inter', sans-serif;
      font-size: 15px;
      color: #111827;
    }
    input::placeholder { color: #C4C9D4; }
    .eye-btn {
      background: none;
      border: none;
      padding: 0 14px;
      cursor: pointer;
      font-size: 17px;
      flex-shrink: 0;
    }
    .forgot {
      display: block;
      text-align: right;
      margin-top: 6px;
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      color: #FFB800;
      font-weight: 600;
      text-decoration: none;
    }

    /* ---- Primary Button ---- */
    .btn-primary {
      width: 100%;
      padding: 17px;
      margin-top: 6px;
      background: linear-gradient(135deg, #FFB800, #FF8C00);
      border: none;
      border-radius: 16px;
      font-family: 'Outfit', sans-serif;
      font-size: 18px;
      font-weight: 700;
      color: #fff;
      cursor: pointer;
      box-shadow: 0 10px 28px rgba(255, 184, 0, 0.45);
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 56px;
    }
    .btn-primary:active { transform: scale(0.97); }
    .btn-primary.loading { opacity: 0.8; cursor: not-allowed; }

    /* ---- Divider ---- */
    .divider {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 18px 0 14px;
    }
    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #E5E7EB;
    }
    .divider span {
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      color: #9CA3AF;
      white-space: nowrap;
    }

    /* ---- Social Buttons ---- */
    .social-row {
      display: flex;
      justify-content: center;
      gap: 14px;
      margin-bottom: 16px;
    }
    .social-btn {
      width: 56px;
      height: 56px;
      background: #FFFFFF;
      border: 1.5px solid #E5E7EB;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 22px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      transition: all 0.2s;
    }
    .social-btn:hover { border-color: #FFB800; transform: translateY(-2px); }

    /* ---- Switch Link ---- */
    .switch {
      text-align: center;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      color: #6B7280;
      margin: 0;
    }
    .switch button {
      background: none;
      border: none;
      color: #FFB800;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
    }

    /* ---- Spinner ---- */
    .spinner {
      width: 22px;
      height: 22px;
      border: 3px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
      display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class AuthComponent {
  mode: 'login' | 'signup' = 'login';
  loginEmail = '';
  loginPassword = '';
  signupName = '';
  signupEmail = '';
  signupPassword = '';
  confirmPassword = '';
  showPwd = false;
  isLoading = false;

  constructor(private router: Router) { }

  handleLogin(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      this.router.navigate(['/home']);
    }, 1500);
  }

  handleSignup(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      this.router.navigate(['/home']);
    }, 1500);
  }
}
