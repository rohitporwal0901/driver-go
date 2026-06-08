export interface Location {
  lat: number;
  lng: number;
  address: string;
  city?: string;
  name?: string;
}

export interface Driver {
  id: string;
  name: string;
  photo: string;
  rating: number;
  totalTrips: number;
  experience: string;
  languages: string[];
  licenseNo: string;
  vehicle?: string;
  phone: string;
  lat: number;
  lng: number;
  isAvailable: boolean;
  specialties: string[];
  pricePerKm: number;
  baseCharge: number;
}

export interface CarType {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface TripBooking {
  id: string;
  pickup: Location;
  drop: Location;
  driver?: Driver;
  carType?: CarType;
  distanceKm: number;
  durationMin: number;
  fare: number;
  status: TripStatus;
  paymentMethod: string;
  scheduledDate?: Date;
  notes?: string;
  startTime?: Date;
  endTime?: Date;
  rating?: number;
  review?: string;
}

export type TripStatus =
  | 'idle'
  | 'location-selection'
  | 'driver-list'
  | 'confirm-booking'
  | 'searching'
  | 'driver-found'
  | 'driver-arriving'
  | 'trip-in-progress'
  | 'completed';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
}
