import { Injectable } from '@angular/core';
import { Driver, CarType, Location } from '../models/ride.models';

@Injectable({ providedIn: 'root' })
export class MockDataService {

  readonly CAR_TYPES: CarType[] = [
    { id: 'hatchback', name: 'Hatchback', icon: '🚗', description: 'Small city car' },
    { id: 'sedan', name: 'Sedan', icon: '🚘', description: 'Comfortable sedan' },
    { id: 'suv', name: 'SUV', icon: '🚙', description: 'Large SUV / MUV' },
    { id: 'luxury', name: 'Luxury', icon: '🏎️', description: 'Premium car' },
  ];

  readonly MOCK_DRIVERS: Driver[] = [
    {
      id: 'drv_001', name: 'Ramesh Kumar', photo: '👨‍✈️', rating: 4.9, totalTrips: 1240,
      experience: '8 years', languages: ['Hindi', 'English'],
      licenseNo: 'MP09-2016-0012345', phone: '+91 98765 43210',
      lat: 23.179, lng: 75.785, isAvailable: true,
      specialties: ['Highway', 'Night Driving'], pricePerKm: 12, baseCharge: 200,
    },
    {
      id: 'drv_002', name: 'Suresh Yadav', photo: '🧑‍✈️', rating: 4.7, totalTrips: 820,
      experience: '5 years', languages: ['Hindi'],
      licenseNo: 'MP09-2019-0067890', phone: '+91 87654 32109',
      lat: 23.183, lng: 75.789, isAvailable: true,
      specialties: ['City', 'Highway'], pricePerKm: 10, baseCharge: 150,
    },
    {
      id: 'drv_003', name: 'Mahesh Singh', photo: '👨‍🦱', rating: 4.8, totalTrips: 1060,
      experience: '6 years', languages: ['Hindi', 'Marathi'],
      licenseNo: 'MP09-2018-0045678', phone: '+91 76543 21098',
      lat: 23.175, lng: 75.782, isAvailable: true,
      specialties: ['Highway', 'Outstation'], pricePerKm: 11, baseCharge: 180,
    },
    {
      id: 'drv_004', name: 'Anil Patel', photo: '🧔', rating: 4.6, totalTrips: 550,
      experience: '3 years', languages: ['Hindi', 'Gujarati'],
      licenseNo: 'MP09-2021-0023456', phone: '+91 65432 10987',
      lat: 23.186, lng: 75.793, isAvailable: false,
      specialties: ['City'], pricePerKm: 9, baseCharge: 120,
    },
    {
      id: 'drv_005', name: 'Vikram Sharma', photo: '👨‍💼', rating: 4.95, totalTrips: 2100,
      experience: '12 years', languages: ['Hindi', 'English', 'Punjabi'],
      licenseNo: 'MP09-2012-0001234', phone: '+91 54321 09876',
      lat: 23.177, lng: 75.787, isAvailable: true,
      specialties: ['Highway', 'Night Driving', 'Luxury Cars'], pricePerKm: 14, baseCharge: 250,
    },
  ];

  readonly POPULAR_CITIES: Location[] = [
    { lat: 23.1793, lng: 75.7849, address: 'Ujjain, Madhya Pradesh', city: 'Ujjain', name: 'Ujjain' },
    { lat: 22.7196, lng: 75.8577, address: 'Indore, Madhya Pradesh', city: 'Indore', name: 'Indore' },
    { lat: 23.2599, lng: 77.4126, address: 'Bhopal, Madhya Pradesh', city: 'Bhopal', name: 'Bhopal' },
    { lat: 24.5854, lng: 73.7125, address: 'Udaipur, Rajasthan', city: 'Udaipur', name: 'Udaipur' },
    { lat: 26.9124, lng: 75.7873, address: 'Jaipur, Rajasthan', city: 'Jaipur', name: 'Jaipur' },
    { lat: 22.3072, lng: 73.1812, address: 'Vadodara, Gujarat', city: 'Vadodara', name: 'Vadodara' },
    { lat: 21.1702, lng: 72.8311, address: 'Surat, Gujarat', city: 'Surat', name: 'Surat' },
    { lat: 25.4358, lng: 81.8463, address: 'Prayagraj, UP', city: 'Prayagraj', name: 'Prayagraj' },
    { lat: 19.0760, lng: 72.8777, address: 'Mumbai, Maharashtra', city: 'Mumbai', name: 'Mumbai' },
    { lat: 28.6139, lng: 77.2090, address: 'New Delhi', city: 'Delhi', name: 'Delhi' },
    { lat: 23.0225, lng: 72.5714, address: 'Ahmedabad, Gujarat', city: 'Ahmedabad', name: 'Ahmedabad' },
    { lat: 24.8829, lng: 74.6283, address: 'Chittorgarh, Rajasthan', city: 'Chittorgarh', name: 'Chittorgarh' },
  ];

  calculateDistance(p1: { lat: number; lng: number }, p2: { lat: number; lng: number }): number {
    const R = 6371;
    const dLat = this.deg2rad(p2.lat - p1.lat);
    const dLng = this.deg2rad(p2.lng - p1.lng);
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(this.deg2rad(p1.lat)) * Math.cos(this.deg2rad(p2.lat)) * Math.sin(dLng / 2) ** 2;
    return parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1));
  }

  calculateDuration(distanceKm: number): number {
    return Math.round(distanceKm * 1.2); // ~50 km/h avg highway speed
  }

  calculateFare(driver: Driver, distanceKm: number): number {
    return Math.round(driver.baseCharge + driver.pricePerKm * distanceKm);
  }

  filterCities(query: string): Location[] {
    if (!query || query.length < 1) return this.POPULAR_CITIES.slice(0, 6);
    return this.POPULAR_CITIES.filter(
      c => c.name?.toLowerCase().includes(query.toLowerCase()) ||
           c.city?.toLowerCase().includes(query.toLowerCase())
    );
  }

  getAvailableDrivers(): Driver[] {
    return this.MOCK_DRIVERS.filter(d => d.isAvailable);
  }

  private deg2rad(d: number) { return d * (Math.PI / 180); }
}
