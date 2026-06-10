import { Injectable, inject } from '@angular/core';
import { Firestore, doc, setDoc, deleteDoc, updateDoc } from '@angular/fire/firestore';
import { AuthService } from '../auth/auth.service';
import { Geolocation } from '@capacitor/geolocation';
import * as geofire from 'geofire-common';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  
  private isOnlineSubject = new BehaviorSubject<boolean>(false);
  public isOnline$ = this.isOnlineSubject.asObservable();
  
  private watchId: string | null = null;

  constructor() { }

  async toggleOnlineStatus(isOnline: boolean): Promise<void> {
    const profile = await this.getCurrentProfile();
    if (!profile) return;

    if (isOnline) {
      await this.startTracking(profile.uid);
      this.isOnlineSubject.next(true);
    } else {
      await this.stopTracking(profile.uid);
      this.isOnlineSubject.next(false);
    }
  }

  private async startTracking(uid: string): Promise<void> {
    // Check permissions
    const permission = await Geolocation.checkPermissions();
    if (permission.location !== 'granted') {
      await Geolocation.requestPermissions();
    }

    // Get initial position
    const position = await Geolocation.getCurrentPosition();
    await this.updateLocationInDb(uid, position.coords.latitude, position.coords.longitude);

    // Watch position
    this.watchId = await Geolocation.watchPosition({ enableHighAccuracy: true }, (position, err) => {
      if (position) {
        this.updateLocationInDb(uid, position.coords.latitude, position.coords.longitude);
      }
    });
  }

  private async stopTracking(uid: string): Promise<void> {
    if (this.watchId !== null) {
      await Geolocation.clearWatch({ id: this.watchId });
      this.watchId = null;
    }
    // Remove from active drivers
    const docRef = doc(this.firestore, `active_drivers/${uid}`);
    await deleteDoc(docRef);
  }

  private async updateLocationInDb(uid: string, lat: number, lng: number): Promise<void> {
    const hash = geofire.geohashForLocation([lat, lng]);
    const docRef = doc(this.firestore, `active_drivers/${uid}`);
    await setDoc(docRef, {
      uid,
      lat,
      lng,
      geohash: hash,
      updatedAt: Date.now()
    }, { merge: true });
  }

  private async getCurrentProfile(): Promise<any> {
    let profile: any = null;
    this.authService.userProfile$.subscribe(p => profile = p).unsubscribe();
    return profile;
  }
}
