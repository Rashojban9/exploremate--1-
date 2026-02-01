import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

// Fix for default Leaflet marker icons not rendering in some environments
const iconSvg = `
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" fill="#0ea5e9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="12" cy="10" r="3" fill="white"/>
  </svg>
`;

export const customIcon = new L.DivIcon({
  html: iconSvg,
  className: 'custom-leaflet-icon',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
});

interface LeafletMapProps {
  className?: string;
  center?: [number, number];
  zoom?: number;
  children?: React.ReactNode;
}

const LeafletMap: React.FC<LeafletMapProps> = ({ 
  className = "h-[400px] w-full rounded-2xl", 
  center = [27.7172, 85.3240], // Kathmandu
  zoom = 13,
  children
}) => {
  return (
    <div className={`relative overflow-hidden z-0 ${className}`}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={false} 
        className="h-full w-full z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />
        
        {children ? children : (
          <>
            <Marker position={center} icon={customIcon}>
              <Popup className="font-sans font-medium text-sm">
                <div className="text-center">
                  <strong className="text-sky-600 block mb-1">Start Here</strong>
                  Kathmandu, Nepal
                </div>
              </Popup>
            </Marker>

            <Marker position={[27.700769, 85.300140]} icon={customIcon}>
              <Popup className="font-sans font-medium text-sm">
                <div className="text-center">
                  <strong className="text-sky-600 block mb-1">Destination</strong>
                  Swayambhunath Stupa
                </div>
              </Popup>
            </Marker>
          </>
        )}
      </MapContainer>
      
      {/* Overlay to show it's free */}
      <div className="absolute top-4 right-4 z-[400] bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 shadow-sm border border-slate-200">
        OpenStreetMap Data
      </div>
    </div>
  );
};

export default LeafletMap;