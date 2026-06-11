import { Injectable, inject } from '@angular/core';
import { Firestore, doc, setDoc, deleteDoc, collection, query, where, onSnapshot } from '@angular/fire/firestore';
import { AuthService } from '../auth/auth.service';
import { Geolocation } from '@capacitor/geolocation';
import * as geofire from 'geofire-common';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { NotificationService } from '../notification/notification.service';

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notifService = inject(NotificationService);
  
  private isOnlineSubject = new BehaviorSubject<boolean>(false);
  public isOnline$ = this.isOnlineSubject.asObservable();
  
  private watchId: string | null = null;
  private rideListenerUnsubscribe: any = null;
  
  private currentLat = 0;
  private currentLng = 0;

  constructor() { }

  async toggleOnlineStatus(isOnline: boolean): Promise<void> {
    const profile = await this.getCurrentProfile();
    if (!profile) return;

    if (isOnline) {
      await this.startTracking(profile.uid);
      this.startRideListener();
      this.isOnlineSubject.next(true);
    } else {
      await this.stopTracking(profile.uid);
      if (this.rideListenerUnsubscribe) {
        this.rideListenerUnsubscribe();
        this.rideListenerUnsubscribe = null;
      }
      this.isOnlineSubject.next(false);
    }
  }

  private startRideListener() {
    if (this.rideListenerUnsubscribe) this.rideListenerUnsubscribe();

    const q = query(collection(this.firestore, 'rides'), where('status', '==', 'searching'));
    
    // Using onSnapshot to listen for changes
    this.rideListenerUnsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          
          // Check if driver is within 5km of pickup location
          if (data['pickupLat'] && data['pickupLng'] && this.currentLat !== 0) {
            const distanceInKm = geofire.distanceBetween(
              [this.currentLat, this.currentLng], 
              [data['pickupLat'], data['pickupLng']]
            );
            
            // If distance is greater than 5km, ignore this ride
            if (distanceInKm > 5) {
              console.log(`Ignoring ride request. Distance: ${distanceInKm.toFixed(2)} km`);
              return;
            }
          }
          
          // Trigger the NotificationService and navigate
          this.notifService.incomingRideSubject.next({
            rideId: change.doc.id,
            pickupAddress: data['pickupAddress'] || 'Unknown Pickup',
            dropAddress: data['dropAddress'] || 'Unknown Drop',
            distance: '4.5 km' // In a real app, calculate actual distance or use distanceInKm
          });
          
          this.router.navigate(['/incoming-ride']);
        }
      });
    });
  }

  private async startTracking(uid: string): Promise<void> {
    // Check permissions
    const permission = await Geolocation.checkPermissions();
    if (permission.location !== 'granted') {
      await Geolocation.requestPermissions();
    }

    // Get initial position
    const position = await Geolocation.getCurrentPosition();
    this.currentLat = position.coords.latitude;
    this.currentLng = position.coords.longitude;
    await this.updateLocationInDb(uid, position.coords.latitude, position.coords.longitude);

    // Watch position
    this.watchId = await Geolocation.watchPosition({ enableHighAccuracy: true }, (position, err) => {
      if (position) {
        this.currentLat = position.coords.latitude;
        this.currentLng = position.coords.longitude;
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
