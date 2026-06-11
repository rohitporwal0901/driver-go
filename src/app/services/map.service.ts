import { Injectable } from '@angular/core';
import * as L from 'leaflet';

// Fix default marker icons for Angular/Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export interface MapMarkerConfig {
  lat: number;
  lng: number;
  emoji?: string;
  color?: string;
  size?: number;
  label?: string;
  pulseColor?: string;
}

@Injectable({ providedIn: 'root' })
export class MapService {
  private maps = new Map<string, L.Map>();
  private markers = new Map<string, L.Marker>();
  private polylines = new Map<string, L.Polyline>();

  createMap(elementId: string, center: [number, number], zoom = 10): L.Map {
    if (this.maps.has(elementId)) {
      this.maps.get(elementId)!.remove();
    }
    const map = L.map(elementId, {
      center,
      zoom,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(map);

    this.maps.set(elementId, map);
    return map;
  }

  addEmojiMarker(map: L.Map, id: string, lat: number, lng: number, emoji: string, size = 36, pulse = false): L.Marker {
    const icon = L.divIcon({
      html: `
        <div style="
          position:relative;
          display:flex;
          align-items:center;
          justify-content:center;
          width:${size + 8}px;
          height:${size + 8}px;
        ">
          ${pulse ? `<div style="
            position:absolute;
            width:${size + 16}px;
            height:${size + 16}px;
            border-radius:50%;
            background:rgba(255,184,0,0.3);
            animation:pulse-ring 1.5s ease-out infinite;
          "></div>` : ''}
          <div style="
            width:${size + 8}px;
            height:${size + 8}px;
            border-radius:50%;
            background:#FFB800;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:${size - 4}px;
            box-shadow:0 4px 12px rgba(0,0,0,0.25);
            border:3px solid white;
          ">${emoji}</div>
        </div>
      `,
      className: '',
      iconSize: [size + 8, size + 8],
      iconAnchor: [(size + 8) / 2, (size + 8) / 2],
    });

    if (this.markers.has(id)) {
      this.markers.get(id)!.remove();
    }
    const marker = L.marker([lat, lng], { icon }).addTo(map);
    this.markers.set(id, marker);
    return marker;
  }

  addDotMarker(map: L.Map, id: string, lat: number, lng: number, color: string, label?: string): L.Marker {
    const icon = L.divIcon({
      html: `
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
          ${label ? `<div style="background:white;border-radius:6px;padding:6px 10px;font-family:'Inter',sans-serif;font-size:13px;font-weight:600;color:#111;white-space:nowrap;box-shadow:0 3px 8px rgba(0,0,0,0.15);display:flex;align-items:center;gap:8px;">
            <span style="overflow:hidden;text-overflow:ellipsis;max-width:140px;display:inline-block;">${label}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>` : ''}
          <div style="position:relative;">
            <div style="
              width:20px;height:20px;border-radius:50%;
              background:white;
              border:5px solid ${color};
              box-shadow:0 2px 4px rgba(0,0,0,0.2);
            "></div>
          </div>
        </div>
      `,
      className: '',
      iconSize: [24, label ? 60 : 24],
      iconAnchor: [12, label ? 60 : 12],
    });

    if (this.markers.has(id)) this.markers.get(id)!.remove();
    const marker = L.marker([lat, lng], { icon }).addTo(map);
    this.markers.set(id, marker);
    return marker;
  }

  moveMarker(id: string, lat: number, lng: number, animateDuration = 600): void {
    const marker = this.markers.get(id);
    if (!marker) return;
    const start = marker.getLatLng();
    const end = L.latLng(lat, lng);
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / animateDuration, 1);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      marker.setLatLng([
        start.lat + (end.lat - start.lat) * ease,
        start.lng + (end.lng - start.lng) * ease,
      ]);
      if (t < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }

  drawRoute(map: L.Map, id: string, points: [number, number][], color = '#000000', dashed = false): L.Polyline {
    if (this.polylines.has(id)) {
      map.removeLayer(this.polylines.get(id)!);
    }

    // Draw white outline/background for the route line
    const outline = L.polyline(points, {
      color: '#ffffff',
      weight: 8,
      opacity: 1,
      lineJoin: 'round',
      lineCap: 'round',
    });

    const line = L.polyline(points, {
      color: color,
      weight: 4,
      opacity: 1,
      dashArray: dashed ? '10, 8' : undefined,
      lineJoin: 'round',
      lineCap: 'round',
    });

    // Store as a feature group so both can be removed properly
    const group = L.featureGroup([outline, line]).addTo(map);

    this.polylines.set(id, group as any);
    return line;
  }

  fitBounds(map: L.Map, points: [number, number][]): void {
    if (points.length < 2) return;
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [60, 60] });
  }

  panTo(map: L.Map, lat: number, lng: number, zoom?: number): void {
    if (zoom !== undefined) map.setView([lat, lng], zoom);
    else map.panTo([lat, lng]);
  }

  removeMap(id: string): void {
    if (this.maps.has(id)) {
      this.maps.get(id)!.remove();
      this.maps.delete(id);
    }
  }

  getMap(id: string): L.Map | undefined {
    return this.maps.get(id);
  }

  async getCurrentLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      }
    });
  }

  async searchPlaces(query: string): Promise<any[]> {
    if (!query) return [];
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=in`);
      return await response.json();
    } catch (e) {
      console.error('Error searching places:', e);
      return [];
    }
  }

  async reverseGeocode(lat: number, lon: number): Promise<any> {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
      return await response.json();
    } catch (e) {
      console.error('Error reverse geocoding:', e);
      return null;
    }
  }

  async getRouteDistance(start: [number, number], end: [number, number]): Promise<{ distanceKm: number, routePoints: [number, number][] } | null> {
    try {
      // OSRM expects lng,lat
      const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`);
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const distanceKm = route.distance / 1000;
        const coordinates = route.geometry.coordinates; // array of [lng, lat]
        const routePoints: [number, number][] = coordinates.map((c: any) => [c[1], c[0]]); // Convert to [lat, lng]
        return { distanceKm, routePoints };
      }
      return null;
    } catch (e) {
      console.error('Error fetching route:', e);
      return null;
    }
  }

  async searchGooglePlaces(query: string): Promise<any[]> {
    if (!query) return [];

    return new Promise((resolve) => {
      if (!(window as any).google?.maps?.places) {
        console.warn('Google Maps Places API not loaded or API key missing.');
        resolve([]);
        return;
      }

      const service = new (window as any).google.maps.places.AutocompleteService();
      service.getPlacePredictions({ input: query, componentRestrictions: { country: 'in' } }, (predictions: any, status: any) => {
        if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && predictions) {
          resolve(predictions);
        } else {
          resolve([]);
        }
      });
    });
  }

  async getGooglePlaceDetails(placeId: string): Promise<any> {
    return new Promise((resolve) => {
      if (!(window as any).google?.maps?.places) {
        resolve(null);
        return;
      }

      const dummyDiv = document.createElement('div');
      const service = new (window as any).google.maps.places.PlacesService(dummyDiv);

      service.getDetails({ placeId: placeId, fields: ['name', 'geometry', 'formatted_address'] }, (place: any, status: any) => {
        if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          resolve({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            name: place.name,
            address: place.formatted_address
          });
        } else {
          resolve(null);
        }
      });
    });
  }
}
