import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React from 'react';
import { MapContainer, TileLayer, ZoomControl, useMap } from 'react-leaflet';

// Get Mapbox token from environment
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

// Fix: Leaflet's bundled default icon image paths break with Vite bundler
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Reusable custom pin icon
export const customIcon = new L.DivIcon({
  html: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" fill="#0ea5e9" stroke="white" stroke-width="2"/>
    <circle cx="12" cy="10" r="3" fill="white"/>
  </svg>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -30],
});

/**
 * Tile layer configuration.
 *
 * Mapbox Style Tiles REST API format:
 *   /styles/v1/{username}/{style_id}/tiles/{tileSize}/{z}/{x}/{y}
 *
 * Note: The old URL was /tile/{z}/{x}/{y} (wrong — 404s silently and leaves gray tiles).
 * The correct path is /tiles/256/{z}/{x}/{y}.
 */
const TILE_URL = MAPBOX_TOKEN
  ? `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/256/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`
  : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

const ATTRIBUTION = MAPBOX_TOKEN
  ? '© <a href="https://www.mapbox.com/" target="_blank">Mapbox</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
  : '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors';

interface LeafletMapProps {
  className?: string;
  center?: [number, number];
  zoom?: number;
  children?: React.ReactNode;
}

/**
 * Helper component to automatically invalidate the map size when its container resizes.
 * This fixes the common Leaflet bug where tiles render gray or map appears half-loaded
 * if the container size changes (e.g., due to flexbox layout changes, window resize, or GSAP animations).
 */
const MapResizer = () => {
  const map = useMap();
  React.useEffect(() => {
    // 1. ResizeObserver for precise container monitoring
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    observer.observe(map.getContainer());

    // 2. Fallbacks to catch late animation finishes
    const t1 = setTimeout(() => map.invalidateSize(), 500);
    const t2 = setTimeout(() => map.invalidateSize(), 1000);
    const t3 = setTimeout(() => map.invalidateSize(), 1500);

    return () => {
      observer.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [map]);
  return null;
};

const LeafletMap: React.FC<LeafletMapProps> = ({
  className = 'h-[400px] w-full rounded-2xl',
  center = [27.7172, 85.3240], // Default: Kathmandu, Nepal
  zoom = 13,
  children,
}) => {
  return (
    <div className={`relative overflow-hidden z-0 ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        className="h-full w-full"
        zoomControl={false}
      >
        <MapResizer />
        <TileLayer
          attribution={ATTRIBUTION}
          url={TILE_URL}
          tileSize={256}
          detectRetina={false}
          maxZoom={19}
        />
        <ZoomControl position="bottomright" />
        {children}
      </MapContainer>
    </div>
  );
};


export default LeafletMap;
