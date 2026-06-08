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
    { lat: 19.0760, lng: 72.8777, address: 'Mumbai, Maharashtra', city: 'Mumbai', name: 'Mumbai' },
    { lat: 28.6139, lng: 77.2090, address: 'New Delhi, Delhi', city: 'Delhi', name: 'New Delhi' },
    { lat: 12.9716, lng: 77.5946, address: 'Bengaluru, Karnataka', city: 'Bengaluru', name: 'Bengaluru' },
    { lat: 17.3850, lng: 78.4867, address: 'Hyderabad, Telangana', city: 'Hyderabad', name: 'Hyderabad' },
    { lat: 23.0225, lng: 72.5714, address: 'Ahmedabad, Gujarat', city: 'Ahmedabad', name: 'Ahmedabad' },
    { lat: 13.0827, lng: 80.2707, address: 'Chennai, Tamil Nadu', city: 'Chennai', name: 'Chennai' },
    { lat: 22.5726, lng: 88.3639, address: 'Kolkata, West Bengal', city: 'Kolkata', name: 'Kolkata' },
    { lat: 21.1702, lng: 72.8311, address: 'Surat, Gujarat', city: 'Surat', name: 'Surat' },
    { lat: 18.5204, lng: 73.8567, address: 'Pune, Maharashtra', city: 'Pune', name: 'Pune' },
    { lat: 26.9124, lng: 75.7873, address: 'Jaipur, Rajasthan', city: 'Jaipur', name: 'Jaipur' },
    { lat: 26.8467, lng: 80.9462, address: 'Lucknow, Uttar Pradesh', city: 'Lucknow', name: 'Lucknow' },
    { lat: 26.4499, lng: 80.3319, address: 'Kanpur, Uttar Pradesh', city: 'Kanpur', name: 'Kanpur' },
    { lat: 21.1458, lng: 79.0882, address: 'Nagpur, Maharashtra', city: 'Nagpur', name: 'Nagpur' },
    { lat: 22.7196, lng: 75.8577, address: 'Indore, Madhya Pradesh', city: 'Indore', name: 'Indore' },
    { lat: 19.2183, lng: 72.9781, address: 'Thane, Maharashtra', city: 'Thane', name: 'Thane' },
    { lat: 23.2599, lng: 77.4126, address: 'Bhopal, Madhya Pradesh', city: 'Bhopal', name: 'Bhopal' },
    { lat: 17.6868, lng: 83.2185, address: 'Visakhapatnam, Andhra Pradesh', city: 'Visakhapatnam', name: 'Visakhapatnam' },
    { lat: 18.6298, lng: 73.7997, address: 'Pimpri-Chinchwad, Maharashtra', city: 'Pimpri', name: 'Pimpri-Chinchwad' },
    { lat: 25.5941, lng: 85.1376, address: 'Patna, Bihar', city: 'Patna', name: 'Patna' },
    { lat: 22.3072, lng: 73.1812, address: 'Vadodara, Gujarat', city: 'Vadodara', name: 'Vadodara' },
    { lat: 28.6692, lng: 77.4538, address: 'Ghaziabad, Uttar Pradesh', city: 'Ghaziabad', name: 'Ghaziabad' },
    { lat: 30.9010, lng: 75.8573, address: 'Ludhiana, Punjab', city: 'Ludhiana', name: 'Ludhiana' },
    { lat: 27.1767, lng: 78.0081, address: 'Agra, Uttar Pradesh', city: 'Agra', name: 'Agra' },
    { lat: 20.0059, lng: 73.7629, address: 'Nashik, Maharashtra', city: 'Nashik', name: 'Nashik' },
    { lat: 28.4089, lng: 77.3178, address: 'Faridabad, Haryana', city: 'Faridabad', name: 'Faridabad' },
    { lat: 28.9845, lng: 77.7064, address: 'Meerut, Uttar Pradesh', city: 'Meerut', name: 'Meerut' },
    { lat: 22.3039, lng: 70.8022, address: 'Rajkot, Gujarat', city: 'Rajkot', name: 'Rajkot' },
    { lat: 19.2372, lng: 73.1363, address: 'Kalyan-Dombivli, Maharashtra', city: 'Kalyan', name: 'Kalyan' },
    { lat: 19.3919, lng: 72.8397, address: 'Vasai-Virar, Maharashtra', city: 'Vasai', name: 'Vasai-Virar' },
    { lat: 25.3176, lng: 82.9739, address: 'Varanasi, Uttar Pradesh', city: 'Varanasi', name: 'Varanasi' },
    { lat: 23.1793, lng: 75.7849, address: 'Ujjain, Madhya Pradesh', city: 'Ujjain', name: 'Ujjain' },
    { lat: 24.5854, lng: 73.7125, address: 'Udaipur, Rajasthan', city: 'Udaipur', name: 'Udaipur' }
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
    if (!query || query.length < 1) return this.POPULAR_CITIES.slice(0, 10);
    return this.POPULAR_CITIES.filter(
      c => c.name?.toLowerCase().includes(query.toLowerCase()) ||
           c.city?.toLowerCase().includes(query.toLowerCase()) ||
           c.address?.toLowerCase().includes(query.toLowerCase())
    );
  }

  getAvailableDrivers(): Driver[] {
    return this.MOCK_DRIVERS.filter(d => d.isAvailable);
  }

  private deg2rad(d: number) { return d * (Math.PI / 180); }
}
