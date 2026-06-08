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

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
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
        <div style="display:flex;flex-direction:column;align-items:center;gap:2px;">
          ${label ? `<div style="background:white;border:1px solid #ddd;border-radius:4px;padding:2px 6px;font-family:Inter,sans-serif;font-size:10px;font-weight:600;color:#111;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.15)">${label}</div>` : ''}
          <div style="
            width:16px;height:16px;border-radius:50%;
            background:${color};
            border:3px solid white;
            box-shadow:0 0 0 2px ${color},0 3px 10px rgba(0,0,0,0.2);
          "></div>
        </div>
      `,
      className: '',
      iconSize: [16, label ? 36 : 16],
      iconAnchor: [8, label ? 36 : 8],
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

  drawRoute(map: L.Map, id: string, points: [number, number][], color = '#FFB800', dashed = false): L.Polyline {
    if (this.polylines.has(id)) this.polylines.get(id)!.remove();
    const line = L.polyline(points, {
      color,
      weight: 4,
      opacity: 0.85,
      dashArray: dashed ? '10, 8' : undefined,
      lineJoin: 'round',
      lineCap: 'round',
    }).addTo(map);
    this.polylines.set(id, line);
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
}
