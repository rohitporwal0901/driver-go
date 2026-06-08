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
      <div class="auth-header">
        <button class="back-btn" *ngIf="mode === 'signup'" (click)="mode = 'login'">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#111827" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <div class="logo-small">
          <span class="logo-icon-sm">🚗</span>
          <span class="logo-name">DriveGo</span>
        </div>
      </div>

      <!-- Login Form -->
      <div class="form-container" *ngIf="mode === 'login'">
        <h2>Welcome Back <span>👋</span></h2>
        <p class="subtitle">Sign in to continue</p>

        <form (ngSubmit)="handleLogin()">
          <div class="input-group">
            <label>Email or Phone Number</label>
            <div class="input-wrapper">
              <input type="text" [(ngModel)]="loginEmail" name="loginEmail"
                     placeholder="Enter email or phone" />
            </div>
          </div>

          <div class="input-group">
            <label>Password</label>
            <div class="input-wrapper">
              <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="loginPassword"
                     name="loginPassword" placeholder="Enter password" />
              <button type="button" class="eye-btn" (click)="showPassword = !showPassword">
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
            <a class="forgot-link" href="#">Forgot Password?</a>
          </div>

          <button type="submit" class="btn-primary" [class.loading]="isLoading">
            <span *ngIf="!isLoading">Sign In</span>
            <span *ngIf="isLoading" class="spinner"></span>
          </button>
        </form>

        <div class="divider"><span>or continue with</span></div>

        <div class="social-btns">
          <button class="social-btn">
            <img src="https://www.google.com/favicon.ico" width="20" alt="Google">
          </button>
          <button class="social-btn">
            <span>🍎</span>
          </button>
          <button class="social-btn">
            <span style="color:#1877F2;font-size:20px">f</span>
          </button>
        </div>

        <p class="switch-auth">
          Don't have an account?
          <button type="button" (click)="mode = 'signup'">Sign Up</button>
        </p>
      </div>

      <!-- Signup Form -->
      <div class="form-container" *ngIf="mode === 'signup'">
        <h2>Create Account</h2>
        <p class="subtitle">Let's get you started</p>

        <form (ngSubmit)="handleSignup()">
          <div class="input-group">
            <div class="input-wrapper">
              <span class="input-icon">👤</span>
              <input type="text" [(ngModel)]="signupName" name="signupName" placeholder="Full Name" />
            </div>
          </div>
          <div class="input-group">
            <div class="input-wrapper">
              <span class="input-icon">📧</span>
              <input type="email" [(ngModel)]="signupEmail" name="signupEmail" placeholder="Email or Phone Number" />
            </div>
          </div>
          <div class="input-group">
            <div class="input-wrapper">
              <span class="input-icon">🔒</span>
              <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="signupPassword"
                     name="signupPassword" placeholder="Password" />
              <button type="button" class="eye-btn" (click)="showPassword = !showPassword">
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>
          <div class="input-group">
            <div class="input-wrapper">
              <span class="input-icon">🔒</span>
              <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="confirmPassword"
                     name="confirmPassword" placeholder="Confirm Password" />
            </div>
          </div>

          <button type="submit" class="btn-primary" [class.loading]="isLoading">
            <span *ngIf="!isLoading">Sign Up</span>
            <span *ngIf="isLoading" class="spinner"></span>
          </button>
        </form>

        <p class="switch-auth">
          Already have an account?
          <button type="button" (click)="mode = 'login'">Sign In</button>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-screen {
      width: 100%;
      min-height: 100vh;
      background: #F9FAFB;
      display: flex;
      flex-direction: column;
    }
    .auth-header {
      padding: 20px 24px 0;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .back-btn {
      background: white;
      border: 1px solid #E5E7EB;
      border-radius: 12px;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .logo-small {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-left: auto;
    }
    .logo-icon-sm { font-size: 22px; }
    .logo-name {
      font-family: 'Outfit', sans-serif;
      font-size: 18px;
      font-weight: 700;
      color: #111827;
    }
    .form-container {
      flex: 1;
      padding: 32px 24px 48px;
    }
    h2 {
      font-family: 'Outfit', sans-serif;
      font-size: 28px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 6px;
    }
    .subtitle {
      font-family: 'Inter', sans-serif;
      font-size: 15px;
      color: #6B7280;
      margin: 0 0 28px;
    }
    .input-group {
      margin-bottom: 16px;
    }
    label {
      display: block;
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      font-weight: 500;
      color: #374151;
      margin-bottom: 6px;
    }
    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      background: white;
      border: 1.5px solid #E5E7EB;
      border-radius: 14px;
      overflow: hidden;
      transition: border-color 0.2s;
    }
    .input-wrapper:focus-within {
      border-color: #FFB800;
      box-shadow: 0 0 0 3px rgba(255,184,0,0.1);
    }
    .input-icon {
      padding: 0 14px;
      font-size: 16px;
    }
    input {
      flex: 1;
      border: none;
      outline: none;
      padding: 16px 14px;
      font-family: 'Inter', sans-serif;
      font-size: 15px;
      color: #111827;
      background: transparent;
    }
    input::placeholder { color: #9CA3AF; }
    .eye-btn {
      background: none;
      border: none;
      padding: 0 14px;
      cursor: pointer;
      font-size: 16px;
    }
    .forgot-link {
      display: block;
      text-align: right;
      margin-top: 6px;
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      color: #FFB800;
      font-weight: 500;
      text-decoration: none;
    }
    .btn-primary {
      width: 100%;
      padding: 18px;
      background: linear-gradient(135deg, #FFB800, #FF8C00);
      border: none;
      border-radius: 16px;
      font-family: 'Outfit', sans-serif;
      font-size: 18px;
      font-weight: 600;
      color: white;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(255,184,0,0.4);
      transition: all 0.2s ease;
      margin-top: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 58px;
    }
    .btn-primary:active { transform: scale(0.97); }
    .divider {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 20px 0;
    }
    .divider::before, .divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #E5E7EB;
    }
    .divider span {
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      color: #9CA3AF;
    }
    .social-btns {
      display: flex;
      justify-content: center;
      gap: 16px;
    }
    .social-btn {
      width: 56px;
      height: 56px;
      background: white;
      border: 1.5px solid #E5E7EB;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    .social-btn:hover { border-color: #FFB800; }
    .switch-auth {
      text-align: center;
      margin-top: 20px;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      color: #6B7280;
    }
    .switch-auth button {
      background: none;
      border: none;
      color: #FFB800;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
    }
    .spinner {
      width: 22px;
      height: 22px;
      border: 3px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
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
  showPassword = false;
  isLoading = false;

  constructor(private router: Router) {}

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
