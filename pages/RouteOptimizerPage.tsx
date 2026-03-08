import { gsap } from 'gsap';
import L from 'leaflet';
import {
    ArrowLeft,
    ChevronDown,
    ChevronUp,
    Clock,
    Cloud,
    Fuel,
    Gauge,
    GripVertical,
    Hotel,
    Navigation,
    Plus,
    RefreshCcw,
    Save,
    Search,
    Settings,
    Utensils,
    X
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Marker, Polyline, Popup } from 'react-leaflet';
import LeafletMap, { customIcon } from '../components/LeafletMap';
import {
    formatDistance,
    formatDuration,
    getNavigationInstructions,
    getOptimizedRoute,
    type MapboxRoute,
    type RoutePoint,
    type RouteStep,
    type WeatherData
} from '../services/routingService';
import { createTrip, type TripRequest } from '../services/tripService';

interface POI {
  id: string;
  name: string;
  type: 'hotel' | 'restaurant' | 'petrol';
  coords: [number, number];
}

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
      { id: 1, location: "Locating you...", coords: [27.7172, 85.3240] },
      { id: 2, location: "Searching destination...", coords: [27.7172, 85.3240] }
  ]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([27.7172, 85.3240]);
  
  // Destination search state
  const [destinationSearch, setDestinationSearch] = useState('');
  const [searchResults, setSearchResults] = useState<{display_name: string; lat: string; lon: string}[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // POI state
  const [pois, setPois] = useState<POI[]>([]);
  const [showPois, setShowPois] = useState(true);
  const [poiFilters, setPoiFilters] = useState({
    hotel: true,
    restaurant: true,
    petrol: true
  });
  const [loadingPois, setLoadingPois] = useState(false);
  
  // Routing state
  const [travelMode, setTravelMode] = useState<'driving' | 'cycling' | 'walking'>('driving');
  const [routeGeometry, setRouteGeometry] = useState<[number, number][]>([]);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const [routingError, setRoutingError] = useState<string | null>(null);

  // New features state
  const [alternativeRoutes, setAlternativeRoutes] = useState<MapboxRoute[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);
  const [showAlternatives, setShowAlternatives] = useState<boolean>(false);
  const [navigationSteps, setNavigationSteps] = useState<RouteStep[]>([]);
  const [showNavigation, setShowNavigation] = useState<boolean>(false);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [showWeather, setShowWeather] = useState<boolean>(false);
  const [isSavingTrip, setIsSavingTrip] = useState<boolean>(false);
  const [tripSaved, setTripSaved] = useState<boolean>(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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
                
                // Fetch POIs around user location
                fetchPOIs(lat, lon);
            },
            (error) => {
                console.warn("GPS access denied, using default location", error);
                setWaypoints(prev => {
                    const newPoints = [...prev];
                    newPoints[0] = { 
                        id: 1,
                        location: "Thamel (Default)",
                        coords: [27.7154, 85.3123]
                    };
                    return newPoints;
                });
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }
  }, []);

  // Fetch POIs from OpenStreetMap
  const fetchPOIs = async (lat: number, lon: number) => {
      setLoadingPois(true);
      try {
          const query = `
              [out:json][timeout:25];
              (
                node["tourism"="hotel"](around:5000,${lat},${lon});
                node["amenity"="restaurant"](around:5000,${lat},${lon});
                node["amenity"="fast_food"](around:5000,${lat},${lon});
                node["amenity"="fuel"](around:5000,${lat},${lon});
              );
              out body;
          `;
          
          const response = await fetch('https://overpass-api.de/api/interpreter', {
              method: 'POST',
              body: query
          });
          
          if (response.ok) {
              const data = await response.json();
              const fetchedPois: POI[] = data.elements.map((el: any) => {
                  let type: 'hotel' | 'restaurant' | 'petrol' = 'hotel';
                  if (el.tags.amenity === 'restaurant' || el.tags.amenity === 'fast_food') {
                      type = 'restaurant';
                  } else if (el.tags.amenity === 'fuel') {
                      type = 'petrol';
                  } else if (el.tags.tourism === 'hotel') {
                      type = 'hotel';
                  }
                  
                  return {
                      id: `poi-${el.id}`,
                      name: el.tags.name || `${type.charAt(0).toUpperCase() + type.slice(1)}`,
                      type,
                      coords: [el.lat, el.lon] as [number, number]
                  };
              });
              
              setPois(fetchedPois);
          }
      } catch (error) {
          console.error('Failed to fetch POIs:', error);
      } finally {
          setLoadingPois(false);
      }
  };
  
  // Search for destination address
  const handleDestinationSearch = async (query: string) => {
      if (query.length < 3) {
          setSearchResults([]);
          return;
      }
      
      setIsSearching(true);
      try {
          const response = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
              { headers: { 'Accept-Language': 'en' } }
          );
          
          if (response.ok) {
              const data = await response.json();
              setSearchResults(data);
              setShowSearchResults(true);
          }
      } catch (error) {
          console.error('Search failed:', error);
      } finally {
          setIsSearching(false);
      }
  };
  
  // Select destination from search results
  const selectDestination = (result: {display_name: string; lat: string; lon: string}) => {
      const newWaypoints = [...waypoints];
      newWaypoints[newWaypoints.length - 1] = {
          id: Date.now(),
          location: result.display_name.split(',')[0],
          coords: [parseFloat(result.lat), parseFloat(result.lon)]
      };
      setWaypoints(newWaypoints);
      setDestinationSearch(result.display_name.split(',')[0]);
      setShowSearchResults(false);
      setSearchResults([]);
      setIsOptimized(false);
  };

  const handleAddStop = () => {
    if (waypoints.length < 5) {
       setWaypoints(prev => {
           const newPoints = [...prev];
           const newId = Date.now();
           // Add a middle point between start and end
           const stopToAdd: Waypoint = { 
               id: newId, 
               location: `Stop ${newPoints.length - 1}`,
               coords: [
                   (newPoints[0].coords[0] + newPoints[newPoints.length - 1].coords[0]) / 2,
                   (newPoints[0].coords[1] + newPoints[newPoints.length - 1].coords[1]) / 2
               ] as [number, number]
           };
           
           if(newPoints.length > 1) {
             newPoints.splice(newPoints.length - 1, 0, stopToAdd);
           } else {
             newPoints.push(stopToAdd);
           }
           return newPoints;
       });
    }
  };

  const removeStop = (index: number) => {
      const newPoints = waypoints.filter((_, i) => i !== index);
      setWaypoints(newPoints);
      setIsOptimized(false);
  };

  const handleOptimize = async () => {
      if (waypoints.length < 2) return;
      
      setIsOptimizing(true);
      setIsOptimized(false);
      setRoutingError(null);
      
      try {
        const routePoints: RoutePoint[] = waypoints.map(wp => ({
          lat: wp.coords[0],
          lng: wp.coords[1]
        }));

        const response = await getOptimizedRoute(routePoints, travelMode);
        
        if (response && response.routes && response.routes.length > 0) {
          const route = response.routes[0];
          
          const geometry: [number, number][] = route.geometry.coordinates.map(
            (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
          );
          
          setRouteGeometry(geometry);
          setTotalDistance(route.distance);
          setTotalDuration(route.duration);
          
          const reorderedWaypoints = [waypoints[0]];
          if (waypoints.length > 2) {
            for (let i = 1; i < waypoints.length - 1; i++) {
              reorderedWaypoints.push(waypoints[i]);
            }
          }
          reorderedWaypoints.push(waypoints[waypoints.length - 1]);
          
          setWaypoints(reorderedWaypoints);
          
          setIsOptimized(true);
          
          if (geometry.length > 0) {
            const bounds: [number, number][] = geometry;
            const centerLat = bounds.reduce((sum, b) => sum + b[0], 0) / bounds.length;
            const centerLng = bounds.reduce((sum, b) => sum + b[1], 0) / bounds.length;
            setMapCenter([centerLat, centerLng]);
          }
          
          gsap.fromTo('.result-stats', 
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }
          );
        } else {
          setRoutingError('Could not find a route. Please try different waypoints.');
        }
      } catch (error) {
        console.error('Route optimization failed:', error);
        setRoutingError('Failed to optimize route. Please try again.');
      } finally {
        setIsOptimizing(false);
      }
  };

  // Save route to trips
  const handleSaveToTrip = async () => {
    if (!isOptimized || waypoints.length < 2) return;
    
    setIsSavingTrip(true);
    setTripSaved(false);
    
    try {
      const tripName = `Trip to ${waypoints[waypoints.length - 1].location}`;
      const tripDescription = `Route with ${waypoints.length} stops. Total distance: ${formatDistance(totalDistance)}, Duration: ${formatDuration(totalDuration)}`;
      
      const tripData: TripRequest = {
        tripName,
        tripDescription,
        placeName: waypoints[waypoints.length - 1].location,
        placeDescription: tripDescription,
        status: 'planned'
      };
      
      await createTrip(tripData);
      setTripSaved(true);
      
      // Reset after 3 seconds
      setTimeout(() => setTripSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save trip:', error);
      setRoutingError('Failed to save trip. Please try again.');
    } finally {
      setIsSavingTrip(false);
    }
  };

  // Reorder waypoints (move up/down)
  const moveWaypoint = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index <= 1) return; // Can't move start point up or middle points up past position 1
    if (direction === 'down' && index >= waypoints.length - 2) return; // Can't move end point down
    
    const newWaypoints = [...waypoints];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap waypoints
    [newWaypoints[index], newWaypoints[newIndex]] = [newWaypoints[newIndex], newWaypoints[index]];
    
    setWaypoints(newWaypoints);
    setIsOptimized(false);
  };

  // Select alternative route
  const selectAlternativeRoute = (index: number) => {
    if (!alternativeRoutes[index]) return;
    
    const route = alternativeRoutes[index];
    const geometry: [number, number][] = route.geometry.coordinates.map(
      (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
    );
    
    setRouteGeometry(geometry);
    setTotalDistance(route.distance);
    setTotalDuration(route.duration);
    setSelectedRouteIndex(index + 1); // +1 because index 0 is the main route
    
    // Update navigation steps for the selected route
    const steps = getNavigationInstructions(route);
    setNavigationSteps(steps);
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
                          <div className="flex flex-col gap-1">
                              <button 
                                  onClick={() => moveWaypoint(index, 'up')}
                                  disabled={index <= 1}
                                  className={`p-1 rounded hover:bg-slate-100 ${index <= 1 ? 'text-slate-200' : 'text-slate-400 hover:text-sky-500'}`}
                                  title="Move up"
                              >
                                  <ChevronUp size={16} />
                              </button>
                              <button 
                                  onClick={() => moveWaypoint(index, 'down')}
                                  disabled={index >= waypoints.length - 2}
                                  className={`p-1 rounded hover:bg-slate-100 ${index >= waypoints.length - 2 ? 'text-slate-200' : 'text-slate-400 hover:text-sky-500'}`}
                                  title="Move down"
                              >
                                  <ChevronDown size={16} />
                              </button>
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
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                          </div>
                          <span className="text-sm font-bold text-sky-800">Route Optimized Successfully</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white p-3 rounded-xl border border-sky-100 shadow-sm">
                              <div className="flex items-center gap-2 text-slate-400 mb-1">
                                  <Clock size={14} /> <span className="text-[10px] font-bold uppercase">Total Time</span>
                              </div>
                              <div className="text-lg font-bold text-slate-800">{formatDuration(totalDuration)}</div>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-sky-100 shadow-sm">
                              <div className="flex items-center gap-2 text-slate-400 mb-1">
                                  <Gauge size={14} /> <span className="text-[10px] font-bold uppercase">Distance</span>
                              </div>
                              <div className="text-lg font-bold text-slate-800">{formatDistance(totalDistance)}</div>
                          </div>
                      </div>

                      {/* Weather Info */}
                      {weatherData.length > 0 && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                            <div className="flex items-center gap-2 mb-2">
                                <Cloud size={14} className="text-blue-500" />
                                <span className="text-xs font-bold text-blue-700 uppercase">Weather Along Route</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {weatherData.slice(0, 3).map((weather, i) => (
                                    <div key={i} className="bg-white px-2 py-1 rounded-lg text-xs">
                                        <span className="font-medium">{Math.round(weather.temperature)}°C</span>
                                        <span className="text-slate-500 ml-1">{weather.description}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                      )}

                      {/* Alternative Routes */}
                      {alternativeRoutes.length > 0 && (
                        <div className="mt-4">
                            <button 
                                onClick={() => setShowAlternatives(!showAlternatives)}
                                className="flex items-center gap-2 text-sm text-sky-600 hover:text-sky-700 font-medium"
                            >
                                <RefreshCcw size={14} />
                                {alternativeRoutes.length} Alternative Route{alternativeRoutes.length > 1 ? 's' : ''}
                                {showAlternatives ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                            {showAlternatives && (
                                <div className="mt-2 space-y-2">
                                    {alternativeRoutes.map((route, i) => (
                                        <button
                                            key={i}
                                            onClick={() => selectAlternativeRoute(i)}
                                            className={`w-full p-3 rounded-xl border text-left transition-all ${
                                                selectedRouteIndex === i + 1 
                                                    ? 'bg-sky-100 border-sky-300' 
                                                    : 'bg-white border-slate-200 hover:border-sky-300'
                                            }`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium text-slate-700">Alternative {i + 1}</span>
                                                <span className="text-sm text-slate-500">
                                                    {formatDuration(route.duration)} • {formatDistance(route.distance)}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                      )}

                      {/* Navigation Instructions Toggle */}
                      {navigationSteps.length > 0 && (
                        <div className="mt-4">
                            <button 
                                onClick={() => setShowNavigation(!showNavigation)}
                                className="flex items-center gap-2 text-sm text-sky-600 hover:text-sky-700 font-medium"
                            >
                                <Navigation size={14} />
                                Turn-by-Turn Directions
                                {showNavigation ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                            {showNavigation && (
                                <div className="mt-2 max-h-48 overflow-y-auto space-y-2">
                                    {navigationSteps.slice(0, 10).map((step, i) => (
                                        <div key={i} className="flex gap-2 text-sm p-2 bg-white rounded-lg">
                                            <span className="text-slate-400 font-medium">{i + 1}.</span>
                                            <span className="text-slate-600">{step.instruction}</span>
                                            <span className="text-slate-400 ml-auto">{formatDistance(step.distance)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                      )}
                  </div>
              )}

              {routingError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                      <p className="text-sm text-red-600 font-medium">{routingError}</p>
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
              
              {/* Save to Trip Button */}
              {isOptimized && (
                  <button 
                      onClick={handleSaveToTrip}
                      disabled={isSavingTrip}
                      className={`mt-3 w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                          isSavingTrip 
                              ? 'bg-slate-200 text-slate-400 cursor-wait' 
                              : tripSaved 
                                  ? 'bg-emerald-500 text-white' 
                                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                  >
                      {isSavingTrip ? (
                          <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Saving...
                          </>
                      ) : tripSaved ? (
                          <>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                              Saved to Trips!
                          </>
                      ) : (
                          <>
                              <Save size={20} /> Save to Trips
                          </>
                      )}
                  </button>
              )}
          </div>
      </div>

      {/* Map View */}
      <div className="route-map flex-grow h-[50vh] md:h-full relative bg-slate-100">
          <LeafletMap className="w-full h-full z-0" center={mapCenter} zoom={13}>
               {/* POI Markers */}
               {showPois && pois.filter(p => poiFilters[p.type]).map((poi) => (
                   <Marker 
                       key={poi.id} 
                       position={poi.coords}
                       icon={poi.type === 'hotel' ? hotelIcon : poi.type === 'restaurant' ? restaurantIcon : petrolIcon}
                   >
                       <Popup>
                           <div className="text-center font-sans min-w-[120px]">
                               <p className="font-bold text-slate-800">{poi.name}</p>
                               <p className="text-xs text-slate-500 capitalize">{poi.type}</p>
                           </div>
                       </Popup>
                   </Marker>
               ))}
               
               {/* Waypoint Markers */}
               {waypoints.map((point, i) => (
                   <Marker key={point.id} position={point.coords} icon={customIcon}>
                      <Popup>
                          <div className="text-center font-sans">
                              <strong className="text-sky-600">{i === 0 ? "Start: " : i === waypoints.length - 1 ? "Destination: " : `Stop ${i}: `}{point.location}</strong>
                          </div>
                      </Popup>
                   </Marker>
               ))}
               
               {isOptimized && routeGeometry.length > 0 && (
                   <Polyline 
                      positions={routeGeometry}
                      pathOptions={{ color: '#0284c7', weight: 5, opacity: 0.9, lineCap: 'round' }} 
                   />
               )}
          </LeafletMap>

          {/* POI Filter Controls */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md p-2 rounded-xl border border-white/50 shadow-lg z-[400] flex flex-col gap-1">
              <button 
                  onClick={() => setShowPois(!showPois)}
                  className={`p-2 rounded-lg transition-colors ${showPois ? 'bg-sky-100 text-sky-600' : 'text-slate-400 hover:bg-slate-100'}`}
                  title="Toggle POIs"
              >
                  <Search size={18} />
              </button>
              
              {showPois && (
                  <>
                      <button 
                          onClick={() => setPoiFilters(f => ({...f, hotel: !f.hotel}))}
                          className={`p-2 rounded-lg transition-colors ${poiFilters.hotel ? 'bg-amber-100 text-amber-600' : 'text-slate-300'}`}
                          title="Hotels"
                      >
                          <Hotel size={18} />
                      </button>
                      <button 
                          onClick={() => setPoiFilters(f => ({...f, restaurant: !f.restaurant}))}
                          className={`p-2 rounded-lg transition-colors ${poiFilters.restaurant ? 'bg-orange-100 text-orange-600' : 'text-slate-300'}`}
                          title="Restaurants"
                      >
                          <Utensils size={18} />
                      </button>
                      <button 
                          onClick={() => setPoiFilters(f => ({...f, petrol: !f.petrol}))}
                          className={`p-2 rounded-lg transition-colors ${poiFilters.petrol ? 'bg-green-100 text-green-600' : 'text-slate-300'}`}
                          title="Petrol Pumps"
                      >
                          <Fuel size={18} />
                      </button>
                  </>
              )}
          </div>

          {/* Loading POIs indicator */}
          {loadingPois && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-white/50 shadow-lg z-[400] flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-sky-400/30 border-t-sky-600 rounded-full animate-spin"></div>
                  <span className="text-xs font-medium text-slate-600">Loading places...</span>
              </div>
          )}

          {/* Map Controls Overlay */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-xl border border-white/50 shadow-lg z-[400] flex flex-col gap-2">
              <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors" title="Zoom In">
                  <Plus size={20} />
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors" title="Settings">
                   <Settings size={20} />
              </button>
          </div>
      </div>
    </div>
  );
};

const Check = ({ size, className }: { size: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

// Custom POI Icons
const hotelIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#f59e0b" width="32" height="32"><path d="M19 9.5V5a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v4.5a1 1 0 0 0 .5.866l5 3a1 1 0 0 0 1 0l5-3A1 1 0 0 0 19 9.5zM5 18a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm14-1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/></svg>`),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

const restaurantIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#f97316" width="32" height="32"><path d="M12 2C8.5 2 6 4.5 6 7.5c0 1.5.5 2.8 1.3 3.8L6 18h12l-1.3-6.7C17.5 10.3 18 9 18 7.5 18 4.5 15.5 2 12 2zM8 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/></svg>`),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

const petrolIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#22c55e" width="32" height="32"><path d="M19 5h-2V3H7v2H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-8 13a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3-6H8V8h6v4z"/></svg>`),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});


export default RouteOptimizerPage;
