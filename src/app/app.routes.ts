import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'splash', pathMatch: 'full' },
  {
    path: 'splash',
    loadComponent: () =>
      import('./components/splash/splash.component').then(m => m.SplashComponent),
  },
  {
    path: 'onboarding',
    loadComponent: () =>
      import('./components/onboarding/onboarding.component').then(m => m.OnboardingComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/auth/auth.component').then(m => m.AuthComponent),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./components/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'ride-options',
    loadComponent: () =>
      import('./components/ride-options/ride-options.component').then(m => m.RideOptionsComponent),
  },
  {
    path: 'confirm-ride',
    loadComponent: () =>
      import('./components/confirm-ride/confirm-ride.component').then(m => m.ConfirmRideComponent),
  },
  {
    path: 'searching-driver',
    loadComponent: () =>
      import('./components/searching-driver/searching-driver.component').then(m => m.SearchingDriverComponent),
  },
  {
    path: 'driver-found',
    loadComponent: () =>
      import('./components/driver-found/driver-found.component').then(m => m.DriverFoundComponent),
  },
  {
    path: 'live-tracking',
    loadComponent: () =>
      import('./components/live-tracking/live-tracking.component').then(m => m.LiveTrackingComponent),
  },
  {
    path: 'on-ride',
    loadComponent: () =>
      import('./components/on-ride/on-ride.component').then(m => m.OnRideComponent),
  },
  {
    path: 'ride-completed',
    loadComponent: () =>
      import('./components/ride-completed/ride-completed.component').then(m => m.RideCompletedComponent),
  },
  { path: '**', redirectTo: 'splash' },
];
