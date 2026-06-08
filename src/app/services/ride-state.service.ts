import { Injectable, signal, computed } from '@angular/core';
import { TripBooking, Location, CarType, Driver, TripStatus } from '../models/ride.models';
import { MockDataService } from './mock-data.service';

@Injectable({ providedIn: 'root' })
export class RideStateService {
  private readonly _trip = signal<Partial<TripBooking>>({
    status: 'idle',
    paymentMethod: 'Cash',
  });

  readonly trip = this._trip.asReadonly();
  readonly pickupLocation = computed(() => this._trip().pickup);
  readonly dropLocation = computed(() => this._trip().drop);
  readonly currentStatus = computed(() => this._trip().status ?? 'idle');
  readonly selectedDriver = computed(() => this._trip().driver);
  readonly selectedCar = computed(() => this._trip().carType);
  readonly currentFare = computed(() => this._trip().fare ?? 0);

  constructor(private mock: MockDataService) {}

  setPickup(loc: Location) { this._trip.update(t => ({ ...t, pickup: loc })); }

  setDrop(loc: Location) {
    const p = this._trip().pickup;
    if (p) {
      const km = this.mock.calculateDistance(p, loc);
      const min = this.mock.calculateDuration(km);
      this._trip.update(t => ({ ...t, drop: loc, distanceKm: km, durationMin: min }));
    } else {
      this._trip.update(t => ({ ...t, drop: loc }));
    }
  }

  setCarType(car: CarType) { this._trip.update(t => ({ ...t, carType: car })); }

  setDriver(driver: Driver) {
    const km = this._trip().distanceKm ?? 55;
    const fare = this.mock.calculateFare(driver, km);
    this._trip.update(t => ({ ...t, driver, fare }));
  }

  setStatus(status: TripStatus) { this._trip.update(t => ({ ...t, status })); }
  setPaymentMethod(m: string) { this._trip.update(t => ({ ...t, paymentMethod: m })); }
  setRating(rating: number, review?: string) { this._trip.update(t => ({ ...t, rating, review })); }

  startTrip() { this._trip.update(t => ({ ...t, startTime: new Date(), status: 'trip-in-progress' })); }
  completeTrip() { this._trip.update(t => ({ ...t, endTime: new Date(), status: 'completed' })); }
  reset() { this._trip.set({ status: 'idle', paymentMethod: 'Cash' }); }

  get distanceKm(): number { return this._trip().distanceKm ?? 55; }
  get durationMin(): number { return this._trip().durationMin ?? 66; }
}
