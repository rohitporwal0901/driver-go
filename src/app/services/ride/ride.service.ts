import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, doc, updateDoc, onSnapshot, query, getDocs, getDoc } from '@angular/fire/firestore';
import { AuthService } from '../auth/auth.service';
import * as geofire from 'geofire-common';
import { BehaviorSubject } from 'rxjs';

export interface RideRequest {
  id?: string;
  userId: string;
  pickupLat: number;
  pickupLng: number;
  dropLat: number;
  dropLng: number;
  pickupAddress: string;
  dropAddress: string;
  status: 'searching' | 'accepted' | 'started' | 'completed' | 'cancelled';
  driverId?: string;
  otp?: string;
  createdAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class RideService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  private currentRideSubject = new BehaviorSubject<RideRequest | null>(null);
  public currentRide$ = this.currentRideSubject.asObservable();

  private rideListenerUnsubscribe: any;

  constructor() { }

  async requestRide(pickupLat: number, pickupLng: number, dropLat: number, dropLng: number, pickupAddr: string, dropAddr: string): Promise<string> {
    const profile = await this.getCurrentProfile();
    if (!profile) throw new Error('User not authenticated');

    const rideData: RideRequest = {
      userId: profile.uid,
      pickupLat,
      pickupLng,
      dropLat,
      dropLng,
      pickupAddress: pickupAddr,
      dropAddress: dropAddr,
      status: 'searching',
      createdAt: Date.now()
    };

    const docRef = await addDoc(collection(this.firestore, 'rides'), rideData);
    rideData.id = docRef.id;
    this.currentRideSubject.next(rideData);

    // Listen to changes for this ride
    this.listenToRideStatus(docRef.id);

    // Trigger finding nearby drivers
    await this.findNearbyDrivers(pickupLat, pickupLng, docRef.id);

    return docRef.id;
  }

  private async findNearbyDrivers(lat: number, lng: number, rideId: string): Promise<void> {
    const radiusInM = 5 * 1000; // 5 km
    const center: geofire.Geopoint = [lat, lng];
    const bounds = geofire.geohashQueryBounds(center, radiusInM);

    const promises = [];
    for (const b of bounds) {
      const q = query(collection(this.firestore, 'active_drivers'));
      // Note: In real app, we use inequality queries on geohash. 
      // Simplified here: we'd ideally filter `geohash >= b[0] && geohash <= b[1]`
      // For now, getting all active drivers and filtering manually to keep it simple
      promises.push(getDocs(q));
    }

    const snapshots = await Promise.all(promises);
    const nearbyDrivers: string[] = [];

    for (const snap of snapshots) {
      for (const doc of snap.docs) {
        const data = doc.data();
        const distanceInKm = geofire.distanceBetween([data['lat'], data['lng']], center);
        const distanceInM = distanceInKm * 1000;
        if (distanceInM <= radiusInM) {
          nearbyDrivers.push(data['uid']);
        }
      }
    }

    // In a full implementation, here we would trigger a Cloud Function or 
    // update the ride document with a list of "notified_drivers" to send FCM calls
    console.log('Found nearby drivers:', nearbyDrivers);

    // As a mockup for the client side:
    if (nearbyDrivers.length > 0) {
      // Logic to notify driver...
    }
  }

  private listenToRideStatus(rideId: string) {
    if (this.rideListenerUnsubscribe) this.rideListenerUnsubscribe();

    const docRef = doc(this.firestore, `rides/${rideId}`);
    this.rideListenerUnsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        this.currentRideSubject.next({ id: snap.id, ...snap.data() } as RideRequest);
      }
    });
  }

  private async getCurrentProfile(): Promise<any> {
    let profile: any = null;
    this.authService.userProfile$.subscribe(p => profile = p).unsubscribe();
    return profile;
  }

  async getDriverDetails(driverId: string): Promise<any> {
    const profile = await this.authService.getUserProfile(driverId);
    if (!profile) return null;

    let lat = 0;
    let lng = 0;

    // Attempt to fetch current location from active_drivers
    try {
      const activeRef = doc(this.firestore, `active_drivers/${driverId}`);
      const activeSnap = await getDoc(activeRef);
      if (activeSnap.exists()) {
        lat = activeSnap.data()['lat'] || 0;
        lng = activeSnap.data()['lng'] || 0;
      }
    } catch (e) {
      console.warn('Could not fetch active driver location', e);
    }

    // Convert UserProfile to Driver model as best as possible
    return {
      id: profile.uid,
      name: profile.name,
      photo: '🧑‍✈️', // Default or fetch from profile if added later
      rating: 4.8,
      totalTrips: 120,
      experience: '3 years',
      languages: ['English', 'Hindi'],
      licenseNo: 'MP09-2023-XXXX',
      phone: '+91-9999999999',
      lat,
      lng,
      isAvailable: false,
      specialties: ['City'],
      pricePerKm: 12,
      baseCharge: 50
    };
  }
}
