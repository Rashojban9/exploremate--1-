import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { MapPin, Navigation, Plus, Clock, Gauge, ArrowLeft, GripVertical, X, MoreVertical, Settings } from 'lucide-react';
import { Marker, Popup, Polyline } from 'react-leaflet';
import LeafletMap, { customIcon } from '../components/LeafletMap';

interface Waypoint {
  id: number;
  location: string;
  coords: [number, number];
}

const MOCK_WAYPOINTS: Waypoint[] = [
  { id: 1, location: "Thamel, Kathmandu", coords: [27.7154, 85.3123] },
  { id: 2, location: "Patan Durbar Square", coords: [27.6727, 85.3253] },
  { id: 3, location: "Boudhanath Stupa", coords: [27.7215, 85.3620] },
  { id: 4, location: "Swayambhunath", coords: [27.7149, 85.2903] }
];

const RouteOptimizerPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([
      { id: 1, location: "Locating you...", coords: [27.7172, 85.3240] }, // Default temp placeholder
      MOCK_WAYPOINTS[1]
  ]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([27.7172, 85.3240]);
  
  // Animation setup
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      
      tl.fromTo('.route-sidebar',
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      );
      
      tl.fromTo('.route-map',
        { scale: 0.95, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, ease: 'power3.out' },
        "-=0.6"
      );

      tl.fromTo('.waypoint-item',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: 'back.out(1.5)' },
        "-=0.4"
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Get User Location
  useEffect(() => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                setMapCenter([lat, lon]);

                let locationName = "My Current Location";

                try {
                    // Reverse geocode to get address name
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
                        { headers: { 'Accept-Language': 'en' } }
                    );
                    
                    if (res.ok) {
                        const data = await res.json();
                        if (data && data.address) {
                            const addr = data.address;
                            locationName = addr.amenity || addr.shop || addr.tourism || addr.building || 
                                          `${addr.road || ''} ${addr.suburb || ''}`.trim() || 
                                          addr.city || addr.town || "My Location";
                        }
                    }
                } catch (error) {
                    console.error("Failed to fetch address name:", error);
                    // Fallback using raw coords if name lookup fails
                    locationName = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
                }

                setWaypoints(prev => {
                    const newPoints = [...prev];
                    newPoints[0] = {
                        id: 1,
                        location: locationName,
                        coords: [lat, lon]
                    };
                    return newPoints;
                });
            },
            (error) => {
                console.warn("GPS access denied, using default location", error);
                setWaypoints(prev => {
                    const newPoints = [...prev];
                    newPoints[0] = { 
                        ...MOCK_WAYPOINTS[0],
                        location: "Thamel (Default)" 
                    };
                    return newPoints;
                });
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }
  }, []);

  const handleAddStop = () => {
    if (waypoints.length < 5) {
       // Pick a random mock point that isn't already used (simple logic for demo)
       const nextStop = MOCK_WAYPOINTS.find(mp => !waypoints.some(wp => wp.coords[0] === mp.coords[0])) || MOCK_WAYPOINTS[2];
       
       if (nextStop) {
           const newWaypoints = [...waypoints];
           // Insert before the last item (Destination) if we have more than 1, or append
           const newId = Date.now(); // Unique ID
           const stopToAdd = { ...nextStop, id: newId };

           if(newWaypoints.length > 1) {
             newWaypoints.splice(newWaypoints.length - 1, 0, stopToAdd);
           } else {
             newWaypoints.push(stopToAdd);
           }
           setWaypoints(newWaypoints);
           
           // Animate new item
           setTimeout(() => {
               gsap.fromTo(`.waypoint-id-${newId}`,
                   { height: 0, opacity: 0, marginBottom: 0 },
                   { height: 'auto', opacity: 1, marginBottom: 16, duration: 0.4, ease: 'power2.out' }
               );
           }, 10);
       }
    }
  };

  const removeStop = (index: number) => {
      const newPoints = waypoints.filter((_, i) => i !== index);
      setWaypoints(newPoints);
      setIsOptimized(false);
  };

  const handleOptimize = () => {
      setIsOptimizing(true);
      setIsOptimized(false);
      
      // Simulate API call
      setTimeout(() => {
          setIsOptimizing(false);
          setIsOptimized(true);
          
          // Re-order animation simulation
          const shuffled = [...waypoints];
          // Keep start (0) and end (length-1), shuffle middle
          if (shuffled.length > 2) {
             const middle = shuffled.slice(1, shuffled.length - 1).reverse(); // Just reverse for demo "optimization"
             const newOrder = [shuffled[0], ...middle, shuffled[shuffled.length - 1]];
             setWaypoints(newOrder);
          }

          gsap.fromTo('.result-stats', 
             { y: 20, opacity: 0 },
             { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }
          );
      }, 2000);
  };

  return (
    <div ref={containerRef} className="w-full h-screen flex flex-col md:flex-row bg-slate-50 overflow-hidden">
      
      {/* Sidebar Controls */}
      <div className="route-sidebar w-full md:w-[450px] bg-white h-full flex flex-col shadow-2xl z-20 relative">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <button 
                  onClick={() => onNavigate('dashboard')}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
              >
                  <ArrowLeft size={20} />
              </button>
              <h1 className="text-xl font-bold font-display text-slate-800">Route Optimizer</h1>
              <button className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                  <Settings size={20} />
              </button>
          </div>

          <div className="flex-grow overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200">
              <div className="space-y-4 mb-8">
                  {waypoints.map((point, index) => (
                      <div key={point.id} className={`waypoint-item waypoint-id-${point.id} group relative flex items-center gap-3`}>
                          <div className="text-slate-300 cursor-move hover:text-slate-500">
                              <GripVertical size={20} />
                          </div>
                          
                          <div className="flex-grow">
                              <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">
                                  {index === 0 ? "Start Point (You)" : (index === waypoints.length - 1 ? "Destination" : `Stop ${index}`)}
                              </label>
                              <div className="relative">
                                  <input 
                                      type="text" 
                                      value={point.location} 
                                      readOnly
                                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium text-sm focus:outline-none focus:border-sky-400 focus:bg-white transition-all pl-10"
                                  />
                                  <MapPin size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${index === 0 ? 'text-emerald-500' : (index === waypoints.length - 1 ? 'text-red-500' : 'text-sky-500')}`} />
                              </div>
                          </div>

                          {waypoints.length > 2 && (
                              <button 
                                  onClick={() => removeStop(index)}
                                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              >
                                  <X size={18} />
                              </button>
                          )}
                          
                          {/* Connector Line */}
                          {index < waypoints.length - 1 && (
                              <div className="absolute left-[9px] top-12 bottom-[-16px] w-0.5 bg-slate-200 -z-10 group-last:hidden"></div>
                          )}
                      </div>
                  ))}

                  {waypoints.length < 5 && (
                      <button 
                          onClick={handleAddStop}
                          className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold text-sm flex items-center justify-center gap-2 hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50 transition-all"
                      >
                          <Plus size={18} /> Add Stop
                      </button>
                  )}
              </div>

              {isOptimized && (
                  <div className="result-stats bg-sky-50 rounded-2xl p-5 border border-sky-100 mb-6">
                      <div className="flex items-center gap-2 mb-4">
                          <div className="p-1.5 bg-emerald-500 rounded-full">
                              <Check size={12} className="text-white" />
                          </div>
                          <span className="text-sm font-bold text-sky-800">Route Optimized Successfully</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white p-3 rounded-xl border border-sky-100 shadow-sm">
                              <div className="flex items-center gap-2 text-slate-400 mb-1">
                                  <Clock size={14} /> <span className="text-[10px] font-bold uppercase">Total Time</span>
                              </div>
                              <div className="text-lg font-bold text-slate-800">2h 15m</div>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-sky-100 shadow-sm">
                              <div className="flex items-center gap-2 text-slate-400 mb-1">
                                  <Gauge size={14} /> <span className="text-[10px] font-bold uppercase">Distance</span>
                              </div>
                              <div className="text-lg font-bold text-slate-800">12.4 km</div>
                          </div>
                      </div>
                  </div>
              )}
          </div>

          <div className="p-6 border-t border-slate-100 bg-white">
              <button 
                  onClick={handleOptimize}
                  disabled={isOptimizing}
                  className={`w-full py-4 rounded-xl font-bold text-white shadow-xl flex items-center justify-center gap-2 transition-all ${
                      isOptimizing ? 'bg-slate-400 cursor-wait' : 'bg-sky-600 hover:bg-sky-700 hover:shadow-sky-600/20 active:scale-95'
                  }`}
              >
                  {isOptimizing ? (
                      <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Calculating Route...
                      </>
                  ) : (
                      <>
                          <Navigation size={20} /> Optimize Route
                      </>
                  )}
              </button>
          </div>
      </div>

      {/* Map View */}
      <div className="route-map flex-grow h-[50vh] md:h-full relative bg-slate-100">
          <LeafletMap className="w-full h-full z-0" center={mapCenter} zoom={13}>
               {waypoints.map((point, i) => (
                   <Marker key={point.id} position={point.coords} icon={customIcon}>
                      <Popup>
                          <div className="text-center font-sans">
                              <strong className="text-sky-600">{i === 0 ? "Start: " : ""}{point.location}</strong>
                          </div>
                      </Popup>
                   </Marker>
               ))}
               
               {isOptimized && (
                   <Polyline 
                      positions={waypoints.map(p => p.coords)}
                      pathOptions={{ color: '#0284c7', weight: 4, opacity: 0.7, dashArray: '10, 10', lineCap: 'round' }} 
                   />
               )}
          </LeafletMap>

          {/* Map Controls Overlay */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-xl border border-white/50 shadow-lg z-[400] flex flex-col gap-2">
              <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors" title="Zoom In">
                  <Plus size={20} />
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors" title="Settings">
                   <MoreVertical size={20} />
              </button>
          </div>
      </div>
    </div>
  );
};

// Simple check icon component for local use
const Check = ({ size, className }: { size: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

export default RouteOptimizerPage;