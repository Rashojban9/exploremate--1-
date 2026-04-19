import { gsap } from 'gsap';
import L from 'leaflet';
import {
    AlertTriangle,
    ArrowLeft,
    Bike,
    Car,
    ChevronDown,
    ChevronUp,
    Clock,
    Cloud,
    Download,
    Eye,
    EyeOff,
    Fuel,
    Gauge,
    GripVertical,
    Hotel,
    Leaf,
    Mountain,
    Navigation,
    PersonStanding,
    Plus,
    RefreshCcw,
    RotateCcw,
    Save,
    Search,
    Settings,
    Settings2,
    Share2,
    Shield,
    Timer,
    Truck,
    Utensils,
    X,
    Zap
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import LeafletMap from '../components/LeafletMap';

/** Auto-fits the Leaflet map to the full route bounds after optimization */
const MapRecenterer = ({ center, routeGeometry }: { center: [number, number]; routeGeometry?: [number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    if (routeGeometry && routeGeometry.length > 1) {
      try {
        const bounds = L.latLngBounds(routeGeometry.map(([lat, lng]) => [lat, lng] as [number, number]));
        map.fitBounds(bounds, { padding: [40, 40], animate: true, maxZoom: 15 });
      } catch { /* ignore invalid bounds */ }
    } else {
      map.setView(center, 13, { animate: true });
    }
  }, [center[0], center[1], routeGeometry?.length]);
  return null;
};

import {
    assessRouteRisk,
    buildLegSegments,
    calculateCarbonFootprint,
    calculateDepartureTime,
    calculateFuelCost,
    calculateItinerary,
    formatDistance,
    formatDuration,
    getAllModeComparison,
    getElevationProfile,
    getNavigationInstructions,
    getOptimizedRoute,
    getOptimizedWaypointIndices,
    getWeatherAlongRoute,
    type AvoidOption,
    type CarbonFootprint,
    type ElevationPoint,
    type ItineraryItem,
    type LegSegment,
    type MapboxRoute,
    type ModeStats,
    type RoutePoint,
    type RouteRisk,
    type RouteStep,
    type WeatherData,
} from '../services/routingService';
import { createTrip, type TripRequest } from '../services/tripService';

interface POI {
  id: string;
  name: string;
  type: 'hotel' | 'restaurant' | 'petrol' | 'ev_charging';
  coords: [number, number];
  rating?: number;
  phone?: string;
  openNow?: boolean;
  address?: string;
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
  
  // Destination search state (per waypoint index)
  const [waypointSearchQueries, setWaypointSearchQueries] = useState<Record<number, string>>({});
  const [waypointSearchResults, setWaypointSearchResults] = useState<Record<number, {display_name: string; lat: string; lon: string}[]>>({});
  const [activeSearchIndex, setActiveSearchIndex] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  // POI state
  const [pois, setPois] = useState<POI[]>([]);
  const [showPois, setShowPois] = useState(true);
  const [poiFilters, setPoiFilters] = useState({
    hotel: true,
    restaurant: true,
    petrol: true,
    ev_charging: true
  });
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
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

  // Advanced features state
  const [roundtrip, setRoundtrip] = useState(false);
  const [useTraffic, setUseTraffic] = useState(false);
  const [startTime, setStartTime] = useState(new Date().toISOString().substring(0, 16));
  const [stayDurations, setStayDurations] = useState<Record<number, number>>({});
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
  const [estimatedFuelCost, setEstimatedFuelCost] = useState<number>(0);

  // Advanced analytics
  const [elevationProfile, setElevationProfile] = useState<ElevationPoint[]>([]);
  const [isFetchingElevation, setIsFetchingElevation] = useState(false);
  const [showElevation, setShowElevation] = useState(false);
  const [carbonData, setCarbonData] = useState<CarbonFootprint | null>(null);
  const [modeComparison, setModeComparison] = useState<Record<'driving'|'cycling'|'walking', ModeStats | null> | null>(null);
  const [isFetchingModes, setIsFetchingModes] = useState(false);
  const [showModeComparison, setShowModeComparison] = useState(false);
  const [averageSpeed, setAverageSpeed] = useState<number>(0);

  // Live GPS tracking state
  const [gpsStatus, setGpsStatus] = useState<'locating' | 'locked' | 'error'>('locating');
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [liveSpeed, setLiveSpeed] = useState<number | null>(null);       // km/h from GPS
  const [heading, setHeading] = useState<number | null>(null);           // degrees from GPS
  const [distanceTraveled, setDistanceTraveled] = useState<number>(0);   // meters accumulated
  const prevLocationRef = useRef<[number, number] | null>(null);
  const gpsWatchId = useRef<number | null>(null);
  const lastReverseGeoCoords = useRef<[number, number] | null>(null);

  // ── Advanced options (new) ────────────────────────────────────────────
  const [avoidOptions, setAvoidOptions] = useState<AvoidOption[]>([]);
  const [vehicleType, setVehicleType] = useState<'car' | 'motorcycle' | 'truck'>('car');
  const [arriveByTime, setArriveByTime] = useState<string>('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showTrafficLayer, setShowTrafficLayer] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [legSegments, setLegSegments] = useState<LegSegment[]>([]);
  const [showLegBreakdown, setShowLegBreakdown] = useState(false);
  const [routeRisk, setRouteRisk] = useState<RouteRisk | null>(null);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);


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

  // ── Auto-Preview: debounced route preview when waypoints change ──────────
  useEffect(() => {
    if (!isPreviewMode) return;
    const validWps = waypoints.filter(wp => wp.coords[0] !== 27.7172 || wp.location !== "Locating you...");
    if (validWps.length < 2) return;
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    previewTimerRef.current = setTimeout(() => {
      handleOptimize();
    }, 1200);
    return () => { if (previewTimerRef.current) clearTimeout(previewTimerRef.current); };
  }, [waypoints.map(w => w.coords.join()).join(), isPreviewMode]);


  // ── Live GPS Tracking ──────────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      setWaypoints(prev => {
        const p = [...prev];
        p[0] = { id: 1, location: 'Thamel, Kathmandu (Default)', coords: [27.7154, 85.3123] };
        return p;
      });
      return;
    }

    /** Reverse-geocode only when the user has moved more than ~50 m */
    const reverseGeocode = async (lat: number, lon: number) => {
      const last = lastReverseGeoCoords.current;
      if (last) {
        const dlat = Math.abs(lat - last[0]);
        const dlon = Math.abs(lon - last[1]);
        if (dlat < 0.0005 && dlon < 0.0005) return; // ~50 m threshold
      }
      lastReverseGeoCoords.current = [lat, lon];

      let name = `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
          { headers: { 'Accept-Language': 'en' } }
        );
        if (res.ok) {
          const data = await res.json();
          const a = data?.address;
          if (a) {
            name = a.amenity || a.shop || a.tourism || a.building ||
                   `${a.road || ''} ${a.suburb || ''}`.trim() ||
                   a.neighbourhood || a.city || a.town || name;
          }
        }
      } catch { /* keep coordinate fallback */ }

      setWaypoints(prev => {
        const p = [...prev];
        p[0] = { id: 1, location: name, coords: [lat, lon] };
        return p;
      });
    };

    const onSuccess = (pos: GeolocationPosition) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      const acc = pos.coords.accuracy;

      setGpsStatus('locked');
      setGpsAccuracy(Math.round(acc));
      setUserLocation([lat, lon]);
      setMapCenter([lat, lon]);

      // ── Live speed from native GPS (m/s → km/h) ──
      if (pos.coords.speed != null && pos.coords.speed >= 0) {
        setLiveSpeed(Math.round(pos.coords.speed * 3.6)); // m/s → km/h
      } else {
        setLiveSpeed(null);
      }

      // ── Heading / bearing ──
      if (pos.coords.heading != null && !isNaN(pos.coords.heading)) {
        setHeading(Math.round(pos.coords.heading));
      }

      // ── Distance traveled accumulator (Haversine) ──
      if (prevLocationRef.current) {
        const [pLat, pLon] = prevLocationRef.current;
        const R = 6371000; // earth radius in meters
        const dLat = ((lat - pLat) * Math.PI) / 180;
        const dLon = ((lon - pLon) * Math.PI) / 180;
        const a = Math.sin(dLat / 2) ** 2 +
                  Math.cos((pLat * Math.PI) / 180) * Math.cos((lat * Math.PI) / 180) *
                  Math.sin(dLon / 2) ** 2;
        const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        if (dist > 5 && dist < 500) { // ignore GPS jitter < 5m and jumps > 500m
          setDistanceTraveled(prev => prev + dist);
        }
      }
      prevLocationRef.current = [lat, lon];

      // Update start waypoint coords immediately (so route uses fresh position)
      setWaypoints(prev => {
        const p = [...prev];
        p[0] = { ...p[0], coords: [lat, lon] };
        return p;
      });

      // Reverse geocode label (rate-limited)
      reverseGeocode(lat, lon);

      // Fetch POIs only on first lock
      if (gpsStatus !== 'locked') fetchPOIs(lat, lon);
    };

    const onError = (err: GeolocationPositionError) => {
      console.warn('GPS error:', err.message);
      setGpsStatus('error');
      setWaypoints(prev => {
        const p = [...prev];
        if (p[0].location === 'Locating you...') {
          p[0] = { id: 1, location: 'Thamel, Kathmandu (Default)', coords: [27.7154, 85.3123] };
        }
        return p;
      });
    };

    // Start continuous watch
    gpsWatchId.current = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,         // always get a fresh position for live speed accuracy
    });

    return () => {
      if (gpsWatchId.current !== null) {
        navigator.geolocation.clearWatch(gpsWatchId.current);
      }
    };
  }, []);


  // Fetch POIs from OpenStreetMap — covers user location + full route corridor
  const fetchPOIs = async (lat: number, lon: number, routeCoords?: [number, number][]) => {
      setLoadingPois(true);
      try {
          // Build union of bboxes: user location + sample route points every ~10 stops
          const samplePoints: {lat: number; lon: number}[] = [{ lat, lon }];
          if (routeCoords && routeCoords.length > 0) {
              const step = Math.max(1, Math.floor(routeCoords.length / 8));
              routeCoords.filter((_, i) => i % step === 0).forEach(([rlat, rlon]) => {
                  samplePoints.push({ lat: rlat, lon: rlon });
              });
          }

          const radius = 2000; // 2 km around each sample point
          const queryElements = samplePoints.map(p => `
                node["tourism"~"hotel|motel|guest_house"](around:${radius},${p.lat},${p.lon});
                node["amenity"~"restaurant|fast_food|cafe"](around:${radius},${p.lat},${p.lon});
                node["amenity"="fuel"](around:${radius},${p.lat},${p.lon});
                node["amenity"="charging_station"](around:${radius},${p.lat},${p.lon});
          `).join('\n');

          const query = `
              [out:json][timeout:30];
              (
${queryElements}
              );
              out body 120;
          `;

          const response = await fetch('https://overpass-api.de/api/interpreter', {
              method: 'POST',
              body: query
          });

          if (response.ok) {
              const data = await response.json();
              const seen = new Set<string>();
              const fetchedPois: POI[] = data.elements
                  .filter((el: any) => el.lat && el.lon)
                  .map((el: any) => {
                      let type: POI['type'] = 'hotel';
                      if (el.tags.amenity === 'charging_station') type = 'ev_charging';
                      else if (el.tags.amenity === 'fuel') type = 'petrol';
                      else if (el.tags.amenity === 'restaurant' || el.tags.amenity === 'fast_food' || el.tags.amenity === 'cafe') type = 'restaurant';
                      else type = 'hotel';

                      const key = `${el.lat.toFixed(4)},${el.lon.toFixed(4)}`;
                      if (seen.has(key)) return null;
                      seen.add(key);

                      return {
                          id: `poi-${el.id}`,
                          name: el.tags.name || el.tags.brand || el.tags['operator'] ||
                                (type === 'ev_charging' ? 'EV Charging' :
                                 type === 'petrol' ? 'Petrol Station' :
                                 type === 'restaurant' ? 'Restaurant' : 'Hotel'),
                          type,
                          coords: [el.lat, el.lon] as [number, number],
                          phone: el.tags?.phone || el.tags?.['contact:phone'],
                          address: el.tags?.['addr:street']
                              ? `${el.tags['addr:street']} ${el.tags['addr:housenumber'] || ''}`.trim()
                              : undefined,
                          openNow: el.tags?.opening_hours?.includes('24/7') || undefined,
                      } as POI;
                  })
                  .filter(Boolean) as POI[];

              setPois(fetchedPois);
          }
      } catch (error) {
          console.error('Failed to fetch POIs:', error);
      } finally {
          setLoadingPois(false);
      }
  };
  
  // Search for a waypoint address
  const handleWaypointSearch = async (index: number, query: string) => {
      setWaypointSearchQueries(prev => ({ ...prev, [index]: query }));
      setActiveSearchIndex(index);
      
      if (query.length < 3) {
          setWaypointSearchResults(prev => ({ ...prev, [index]: [] }));
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
              setWaypointSearchResults(prev => ({ ...prev, [index]: data }));
          }
      } catch (error) {
          console.error('Search failed:', error);
      } finally {
          setIsSearching(false);
      }
  };
  
  // Select a search result for a specific waypoint
  const selectWaypointLocation = (waypointIndex: number, result: {display_name: string; lat: string; lon: string}) => {
      const shortName = result.display_name.split(',')[0];
      setWaypoints(prev => {
          const newPoints = [...prev];
          newPoints[waypointIndex] = {
              ...newPoints[waypointIndex],
              location: shortName,
              coords: [parseFloat(result.lat), parseFloat(result.lon)]
          };
          return newPoints;
      });
      setWaypointSearchQueries(prev => ({ ...prev, [waypointIndex]: shortName }));
      setWaypointSearchResults(prev => ({ ...prev, [waypointIndex]: [] }));
      setActiveSearchIndex(null);
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
      setItinerary([]);
      setNavigationSteps([]);
      setElevationProfile([]);
      setCarbonData(null);
      setModeComparison(null);
      setAverageSpeed(0);
      
      try {
        const routePoints: RoutePoint[] = waypoints.map(wp => ({
          lat: wp.coords[0],
          lng: wp.coords[1]
        }));

        const response = await getOptimizedRoute(routePoints, travelMode, roundtrip, useTraffic, avoidOptions);
        
        if (response && response.routes && response.routes.length > 0) {
          const route = response.routes[0];
          
          const geometry: [number, number][] = route.geometry.coordinates.map(
            (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
          );
          
          setRouteGeometry(geometry);
          setTotalDistance(route.distance);
          setTotalDuration(route.duration);

          // Store alternative routes for map display
          if (response.routes.length > 1) {
            setAlternativeRoutes(response.routes.slice(1));
          } else {
            setAlternativeRoutes([]);
          }
          setSelectedRouteIndex(0);

          // Average speed
          const speedKmH = route.duration > 0 ? (route.distance / 1000) / (route.duration / 3600) : 0;
          setAverageSpeed(Math.round(speedKmH));
          
          // Apply optimization reordering
          const optimizedIndices = getOptimizedWaypointIndices(routePoints, response);
          const safeIndices = (
              optimizedIndices.length === waypoints.length &&
              optimizedIndices.every(i => i >= 0 && i < waypoints.length)
          ) ? optimizedIndices : waypoints.map((_, i) => i);
          const reorderedWaypoints = safeIndices.map(i => waypoints[i]);
          setWaypoints(reorderedWaypoints);
          
          // Arrive-by: shift start time so arrival matches desired time
          let effectiveStartTime = new Date(startTime);
          if (arriveByTime) {
            const totalStayMins = reorderedWaypoints.reduce((sum, wp) => sum + (stayDurations[wp.id] ?? 0), 0);
            effectiveStartTime = calculateDepartureTime(new Date(arriveByTime), route.duration, totalStayMins);
            setStartTime(effectiveStartTime.toISOString().substring(0, 16));
          }

          // Generate timed itinerary
          if (route.legs && route.legs.length > 0) {
              const orderedStayDurations = reorderedWaypoints.map(wp => stayDurations[wp.id] ?? 0);
              const generatedItinerary = calculateItinerary(
                  effectiveStartTime,
                  reorderedWaypoints,
                  route.legs,
                  orderedStayDurations
              );
              setItinerary(generatedItinerary);

              // Build per-leg segment breakdown
              const stayRecord: Record<number, number> = {};
              reorderedWaypoints.forEach((wp, i) => { stayRecord[i] = stayDurations[wp.id] ?? 0; });
              setLegSegments(buildLegSegments(
                route,
                reorderedWaypoints.map(wp => wp.location),
                effectiveStartTime,
                stayRecord
              ));
          }

          // Navigation steps
          setNavigationSteps(getNavigationInstructions(route));

          // Fuel cost
          setEstimatedFuelCost(travelMode === 'driving' ? calculateFuelCost(route.distance) : 0);

          // Carbon footprint
          setCarbonData(calculateCarbonFootprint(route.distance, travelMode));
          
          setIsOptimized(true);
          
          if (geometry.length > 0) {
            const centerLat = geometry.reduce((sum, b) => sum + b[0], 0) / geometry.length;
            const centerLng = geometry.reduce((sum, b) => sum + b[1], 0) / geometry.length;
            setMapCenter([centerLat, centerLng]);
          }
          
          gsap.fromTo('.result-stats', 
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }
          );

          // Background analytics
          // 1) Weather → then risk assessment
          getWeatherAlongRoute(routePoints).then(weather => {
            setWeatherData(weather);
            // Risk assessment (needs elevation gain — compute after elevation loads)
            setRouteRisk(null); // will be set after elevation
          }).catch(() => {});

          // 2) Elevation profile → then risk
          setIsFetchingElevation(true);
          getElevationProfile(geometry).then(data => {
            setElevationProfile(data);
            setIsFetchingElevation(false);
            // Compute elevation gain for risk
            const gain = data.reduce((s, d, i) =>
              i > 0 && d.elevation > data[i-1].elevation ? s + d.elevation - data[i-1].elevation : s, 0);
            setRouteRisk(assessRouteRisk(route.distance, gain, weatherData));
          }).catch(() => setIsFetchingElevation(false));

          // 3) Mode comparison
          setIsFetchingModes(true);
          getAllModeComparison(routePoints).then(stats => {
            setModeComparison(stats);
            setIsFetchingModes(false);
          }).catch(() => setIsFetchingModes(false));

          // 4) Refresh POIs along the whole route corridor
          if (userLocation) {
            fetchPOIs(userLocation[0], userLocation[1], geometry);
          }

        } else {
          setRoutingError('Could not find a route. Please check your waypoints and try again.');
        }
      } catch (error) {
        console.error('Route optimization failed:', error);
        setRoutingError('Failed to optimize route. Please ensure all waypoints are valid locations.');
      } finally {
        setIsOptimizing(false);
      }
  };

  /** Export the current route as a GPX file */
  const exportGPX = () => {
    if (routeGeometry.length === 0) return;
    const wpts = waypoints.map(wp =>
      `  <wpt lat="${wp.coords[0].toFixed(6)}" lon="${wp.coords[1].toFixed(6)}"><name>${wp.location}</name></wpt>`
    ).join('\n');
    const trkpts = routeGeometry.map(([lat, lng]) =>
      `      <trkpt lat="${lat.toFixed(6)}" lon="${lng.toFixed(6)}"></trkpt>`
    ).join('\n');
    const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="ExploreMate" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>ExploreMate Route</name>
    <desc>${waypoints[0].location} → ${waypoints[waypoints.length - 1].location}</desc>
  </metadata>
${wpts}
  <trk>
    <name>${waypoints[0].location} → ${waypoints[waypoints.length - 1].location}</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>`;
    const blob = new Blob([gpx], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exploremate-route.gpx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /** Copy a shareable text summary of the route */
  const shareRoute = async () => {
    const summary = `🗺️ Route optimized by ExploreMate\n📍 From: ${waypoints[0].location}\n📍 To: ${waypoints[waypoints.length-1].location}\n📏 Distance: ${formatDistance(totalDistance)}\n⏱️ Duration: ${formatDuration(totalDuration)}\n🚗 Mode: ${travelMode}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'ExploreMate Route', text: summary });
      } else {
        await navigator.clipboard.writeText(summary);
        alert('Route summary copied to clipboard!');
      }
    } catch { /* user cancelled */ }
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
          <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-2">
               <button
                   onClick={() => onNavigate('dashboard')}
                   className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors flex-shrink-0"
               >
                   <ArrowLeft size={20} />
               </button>
               <div className="flex-grow text-center">
                   <h1 className="text-base font-black text-slate-800 leading-tight">Route Optimizer</h1>
                   <div className="text-[9px] font-bold text-sky-500 uppercase tracking-widest">Advanced Edition</div>
               </div>
               <button
                   onClick={() => {
                       setShowAdvancedOptions(!showAdvancedOptions);
                       setTimeout(() => {
                           document.querySelector('.route-sidebar')?.scrollTo({ top: 0, behavior: 'smooth' });
                       }, 50);
                   }}
                   className={`p-2 rounded-full transition-colors flex-shrink-0 ${
                       showAdvancedOptions ? 'bg-sky-100 text-sky-600' : 'hover:bg-slate-100 text-slate-500'
                   }`}
                   title="Advanced Options"
               >
                   <Settings2 size={18} />
               </button>
           </div>

          <div className="flex-grow overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200">
              {/* ── Settings Panel ── */}
              <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100 space-y-4">

                  {/* Vehicle + Mode row */}
                  <div className="flex items-center gap-2">
                      {/* Vehicle type */}
                      {travelMode === 'driving' && (
                          <div className="flex bg-white border border-slate-200 rounded-lg p-0.5 gap-0.5 shadow-sm">
                              {([
                                  { key: 'car', icon: <Car size={13}/>, label: 'Car' },
                                  { key: 'motorcycle', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6l-3 4H8l-2 4"/><path d="M15 6h2l3 1"/></svg>, label: 'Moto' },
                                  { key: 'truck', icon: <Truck size={13}/>, label: 'HGV' },
                              ] as const).map(v => (
                                  <button
                                      key={v.key}
                                      onClick={() => { setVehicleType(v.key); setIsOptimized(false); }}
                                      title={v.label}
                                      className={`p-1.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${vehicleType === v.key ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                                  >
                                      {v.icon}
                                  </button>
                              ))}
                          </div>
                      )}

                      {/* Travel mode */}
                      <div className="flex-grow flex bg-white p-0.5 rounded-lg border border-slate-200 shadow-sm gap-0.5">
                          {([
                              { key: 'driving', icon: <Car size={12}/>, label: 'Drive' },
                              { key: 'cycling', icon: <Bike size={12}/>, label: 'Bike' },
                              { key: 'walking', icon: <PersonStanding size={12}/>, label: 'Walk' },
                          ] as const).map(m => (
                              <button
                                  key={m.key}
                                  onClick={() => { setTravelMode(m.key); setIsOptimized(false); }}
                                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[10px] font-bold transition-all ${travelMode === m.key ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                              >
                                  {m.icon} {m.label}
                              </button>
                          ))}
                      </div>
                  </div>

                  {/* Time row */}
                  <div className="grid grid-cols-2 gap-2">
                      <div>
                          <label className="text-[9px] font-black uppercase text-slate-400 block mb-1 flex items-center gap-1"><Clock size={9}/> Leave at</label>
                          <input
                              type="datetime-local"
                              value={startTime}
                              onChange={(e) => { setStartTime(e.target.value); setArriveByTime(''); setIsOptimized(false); }}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-medium text-slate-600 focus:outline-none focus:border-sky-400"
                          />
                      </div>
                      <div>
                          <label className="text-[9px] font-black uppercase text-slate-400 block mb-1 flex items-center gap-1"><Timer size={9}/> Arrive by</label>
                          <input
                              type="datetime-local"
                              value={arriveByTime}
                              onChange={(e) => { setArriveByTime(e.target.value); setIsOptimized(false); }}
                              placeholder="Optional"
                              className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-medium text-slate-600 focus:outline-none focus:border-indigo-400 focus:border-2"
                              title="Set desired arrival time — departure will be calculated automatically"
                          />
                      </div>
                  </div>
                  {arriveByTime && (
                      <div className="text-[9px] text-indigo-600 font-bold flex items-center gap-1 -mt-2">
                          <Timer size={9}/> Departure time will be auto-calculated when you optimize
                      </div>
                  )}

                  {/* Quick toggles */}
                  <div className="grid grid-cols-2 gap-2">
                      <button
                          onClick={() => { setRoundtrip(!roundtrip); setIsOptimized(false); }}
                          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl border text-[10px] font-bold transition-all ${roundtrip ? 'bg-sky-50 border-sky-300 text-sky-700' : 'bg-white border-slate-100 text-slate-400'}`}
                      >
                          <RotateCcw size={11}/> Roundtrip
                      </button>
                      <button
                          onClick={() => { setUseTraffic(!useTraffic); setIsOptimized(false); }}
                          disabled={travelMode !== 'driving'}
                          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl border text-[10px] font-bold transition-all ${useTraffic && travelMode === 'driving' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-slate-100 text-slate-400'} disabled:opacity-30`}
                      >
                          <Gauge size={11}/> Live Traffic
                      </button>
                  </div>

                  {/* Advanced options toggle */}
                  <button
                      onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                      className="w-full flex items-center justify-between text-[10px] font-black text-slate-500 uppercase hover:text-sky-600 transition-colors"
                  >
                      <span className="flex items-center gap-1"><Settings2 size={11}/> Advanced Options</span>
                      {showAdvancedOptions ? <ChevronUp size={11}/> : <ChevronDown size={11}/>}
                  </button>

                  {/* Collapsible advanced options */}
                  {showAdvancedOptions && (
                      <div className="space-y-3 pt-1">
                          {/* Avoid */}
                          <div>
                              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1.5">Avoid</label>
                              <div className="flex flex-wrap gap-1.5">
                                  {([
                                      { key: 'motorway', label: 'Highways' },
                                      { key: 'toll', label: 'Tolls' },
                                      { key: 'ferry', label: 'Ferries' },
                                      { key: 'unpaved', label: 'Unpaved' },
                                  ] as const).map(opt => {
                                      const active = avoidOptions.includes(opt.key);
                                      return (
                                          <button
                                              key={opt.key}
                                              onClick={() => {
                                                  setAvoidOptions(prev =>
                                                      active ? prev.filter(o => o !== opt.key) : [...prev, opt.key]
                                                  );
                                                  setIsOptimized(false);
                                              }}
                                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${active ? 'bg-orange-100 border-orange-300 text-orange-700' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}
                                          >
                                              {active ? '✕ ' : ''}{opt.label}
                                          </button>
                                      );
                                  })}
                              </div>
                          </div>

                          {/* Map layers */}
                          <div>
                              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1.5">Map Layers</label>
                              <div className="flex gap-1.5">
                                  <button
                                      onClick={() => setShowTrafficLayer(!showTrafficLayer)}
                                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${showTrafficLayer ? 'bg-red-50 border-red-300 text-red-600' : 'bg-white border-slate-200 text-slate-400'}`}
                                  >
                                      {showTrafficLayer ? <Eye size={9}/> : <EyeOff size={9}/>} Traffic
                                  </button>
                                  <button
                                      onClick={() => setShowPois(!showPois)}
                                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${showPois ? 'bg-sky-50 border-sky-300 text-sky-600' : 'bg-white border-slate-200 text-slate-400'}`}
                                  >
                                      {showPois ? <Eye size={9}/> : <EyeOff size={9}/>} POIs
                                  </button>
                              </div>
                          </div>
                      </div>
                  )}
              </div>

              <div className="space-y-4 mb-8">
                  {waypoints.map((point, index) => (
                      <div 
                        key={point.id} 
                        draggable={index > 0 && index < waypoints.length - 1}
                        onDragStart={() => setDraggedIndex(index)}
                        onDragOver={(e) => {
                            e.preventDefault();
                            if (index === 0 || index === waypoints.length - 1) return;
                        }}
                        onDrop={() => {
                            if (draggedIndex === null || draggedIndex === index || index === 0 || index === waypoints.length - 1) return;
                            const newWaypoints = [...waypoints];
                            const draggedItem = newWaypoints[draggedIndex];
                            newWaypoints.splice(draggedIndex, 1);
                            newWaypoints.splice(index, 0, draggedItem);
                            setWaypoints(newWaypoints);
                            setDraggedIndex(null);
                            setIsOptimized(false);
                        }}
                        className={`waypoint-item waypoint-id-${point.id} group relative flex items-center gap-3 p-2 rounded-xl transition-all ${
                            draggedIndex === index ? 'opacity-40 bg-sky-50' : 'hover:bg-slate-50'
                        }`}
                      >
                          {/* Drag Handle & Buttons */}
                          <div className="flex flex-col gap-1 items-center">
                              {index > 0 && index < waypoints.length - 1 && (
                                  <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-sky-500 mb-1">
                                      <GripVertical size={16} />
                                  </div>
                              )}
                              <button 
                                  onClick={() => moveWaypoint(index, 'up')}
                                  disabled={index <= 1}
                                  className={`p-1 rounded hover:bg-slate-100 ${index <= 1 ? 'text-slate-200' : 'text-slate-400 hover:text-sky-500'}`}
                                  title="Move up"
                              >
                                  <ChevronUp size={14} />
                              </button>
                              <button 
                                  onClick={() => moveWaypoint(index, 'down')}
                                  disabled={index >= waypoints.length - 2}
                                  className={`p-1 rounded hover:bg-slate-100 ${index >= waypoints.length - 2 ? 'text-slate-200' : 'text-slate-400 hover:text-sky-500'}`}
                                  title="Move down"
                              >
                                  <ChevronDown size={14} />
                              </button>
                          </div>
                          
                          <div className="flex-grow">
                               <div className="flex items-center justify-between mb-1">
                                   {index === 0 ? (
                                       // ── Live GPS status row ──
                                       <div className="flex items-center gap-1.5 flex-wrap">
                                           {gpsStatus === 'locating' && (
                                               <>
                                                   <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                                   <span className="text-[10px] font-bold text-amber-600 uppercase">Locating GPS…</span>
                                                   <span className="text-[9px] text-slate-400">Type to set manually</span>
                                               </>
                                           )}
                                           {gpsStatus === 'locked' && (
                                               <>
                                                   <div className="relative flex">
                                                       <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                       <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                                                   </div>
                                                   <span className="text-[10px] font-bold text-emerald-600 uppercase">Live GPS</span>
                                                   {gpsAccuracy && <span className="text-[9px] text-slate-400">±{gpsAccuracy}m</span>}
                                                   <span className="text-[9px] text-slate-400 italic">· wrong? type to fix</span>
                                               </>
                                           )}
                                           {gpsStatus === 'error' && (
                                               <>
                                                   <div className="w-2 h-2 rounded-full bg-red-400" />
                                                   <span className="text-[10px] font-bold text-red-500 uppercase">GPS unavailable</span>
                                                   <span className="text-[9px] text-slate-400">· type your location</span>
                                               </>
                                           )}
                                       </div>
                                   ) : (
                                       <label className="text-[10px] font-bold uppercase text-slate-400">
                                           {index === waypoints.length - 1 ? 'Destination' : `Stop ${index}`}
                                       </label>
                                   )}
                                   {index > 0 && index < waypoints.length - 1 && (
                                       <div className="flex items-center gap-1">
                                           <Clock size={10} className="text-slate-400" />
                                           <input
                                               type="number"
                                               min="0"
                                               placeholder="Stay"
                                               value={stayDurations[point.id] || ''}
                                               onChange={(e) => {
                                                   const val = parseInt(e.target.value) || 0;
                                                   setStayDurations(prev => ({ ...prev, [point.id]: val }));
                                                   setIsOptimized(false);
                                               }}
                                               onClick={(e) => e.stopPropagation()}
                                               className="w-10 text-[10px] border-b border-dotted border-slate-300 focus:outline-none focus:border-sky-500 text-right font-bold text-sky-600 bg-transparent"
                                           />
                                           <span className="text-[8px] font-bold text-slate-400">min</span>
                                       </div>
                                   )}
                               </div>
                               <div className="relative" onClick={(e) => e.stopPropagation()}>
                                   {/* Coloured number badge */}
                                   <div className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold z-10 ${
                                       index === 0 ? 'bg-emerald-500 text-white' : index === waypoints.length - 1 ? 'bg-red-500 text-white' : 'bg-sky-600 text-white'
                                   }`}>
                                       {index + 1}
                                   </div>
                                   <input
                                       type="text"
                                       value={waypointSearchQueries[index] ?? point.location}
                                       placeholder={index === 0
                                           ? (gpsStatus === 'locating' ? 'Acquiring GPS…' : 'Search or type your start location')
                                           : 'Search location...'}
                                       onChange={(e) => handleWaypointSearch(index, e.target.value)}
                                       onFocus={() => setActiveSearchIndex(index)}
                                       onBlur={() => setTimeout(() => { if (activeSearchIndex === index) setActiveSearchIndex(null); }, 200)}
                                       className={`w-full p-3 border rounded-xl text-slate-700 font-medium text-sm focus:outline-none transition-all pl-10 ${
                                           index === 0
                                               ? gpsStatus === 'locked'
                                                   ? 'bg-emerald-50 border-emerald-200 focus:border-emerald-400 focus:bg-white'
                                                   : gpsStatus === 'error'
                                                       ? 'bg-red-50 border-red-200 focus:border-red-400 focus:bg-white'
                                                       : 'bg-amber-50 border-amber-200 focus:border-amber-400 focus:bg-white'
                                               : 'bg-slate-50 border-slate-200 focus:border-sky-400 focus:bg-white'
                                       }`}
                                   />
                                   {/* GPS snap-back button for start point */}
                                   {index === 0 && userLocation && (
                                       <button
                                           title="Snap to my live GPS location"
                                           onClick={() => {
                                               setWaypoints(prev => {
                                                   const p = [...prev];
                                                   p[0] = { ...p[0], coords: userLocation, location: waypoints[0].location };
                                                   return p;
                                               });
                                               setWaypointSearchQueries(prev => ({ ...prev, [0]: waypoints[0].location }));
                                               setMapCenter(userLocation);
                                           }}
                                           className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-emerald-600 hover:bg-emerald-100 transition-colors"
                                       >
                                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                               <circle cx="12" cy="12" r="3"/>
                                               <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
                                               <circle cx="12" cy="12" r="9" strokeDasharray="3 3"/>
                                           </svg>
                                       </button>
                                   )}
                                  {/* Search results dropdown */}
                                  {activeSearchIndex === index && (waypointSearchResults[index]?.length ?? 0) > 0 && (
                                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                                          {waypointSearchResults[index].map((result, ri) => (
                                              <button
                                                  key={ri}
                                                  onMouseDown={(e) => { e.preventDefault(); selectWaypointLocation(index, result); }}
                                                  className="w-full text-left px-3 py-2 text-sm hover:bg-sky-50 hover:text-sky-700 border-b border-slate-100 last:border-0 transition-colors"
                                              >
                                                  <div className="font-medium text-slate-800 truncate">{result.display_name.split(',')[0]}</div>
                                                  <div className="text-[10px] text-slate-400 truncate">{result.display_name.split(',').slice(1, 3).join(',')}</div>
                                              </button>
                                          ))}
                                      </div>
                                  )}
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
                              <div className="absolute left-[9px] top-full h-4 w-0.5 bg-slate-200 -z-10"></div>
                          )}
                      </div>
                  ))}

                  {waypoints.length < 8 && (
                      <button 
                          onClick={handleAddStop}
                          className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold text-sm flex items-center justify-center gap-2 hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50 transition-all"
                      >
                          <Plus size={18} /> Add Stop
                      </button>
                  )}
              </div>

              {isOptimized && (
                  <div className="result-stats space-y-3 mb-6">

                      {/* ── Hero stats bar ── */}
                      <div className="bg-gradient-to-r from-sky-600 to-indigo-600 rounded-2xl p-4 text-white shadow-lg">
                          {/* Route summary header */}
                          <div className="flex items-center gap-2 mb-1">
                              <div className="p-1 bg-emerald-400 rounded-full">
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                              </div>
                              <span className="text-xs font-bold uppercase tracking-wider opacity-90">Route Optimized</span>
                              {travelMode === 'driving' && <span className="ml-auto text-[9px] bg-white/15 px-2 py-0.5 rounded-full font-bold capitalize">{vehicleType}</span>}
                          </div>
                          {/* Route path summary */}
                          <div className="text-[10px] font-medium opacity-70 mb-3 truncate">
                              {waypoints[0]?.location?.split(',')[0]} → {waypoints.length > 2 && <span>{waypoints.length - 2} stop{waypoints.length > 3 ? 's' : ''} → </span>}{waypoints[waypoints.length - 1]?.location?.split(',')[0]}
                          </div>
                          {/* ETA row */}
                          <div className="flex items-center justify-between bg-white/10 rounded-xl px-3 py-2 mb-3">
                              <div className="text-center flex-1">
                                  <div className="text-[8px] font-bold uppercase opacity-60">Depart</div>
                                  <div className="text-sm font-black">{new Date(startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                              </div>
                              <div className="flex items-center gap-1 text-white/40 px-2">
                                  <div className="w-3 h-px bg-white/30"></div>
                                  <Timer size={10} className="opacity-50"/>
                                  <div className="text-[8px] font-bold opacity-60">{formatDuration(totalDuration)}</div>
                                  <div className="w-3 h-px bg-white/30"></div>
                              </div>
                              <div className="text-center flex-1">
                                  <div className="text-[8px] font-bold uppercase opacity-60">Arrive</div>
                                  <div className="text-sm font-black text-emerald-300">
                                      {new Date(new Date(startTime).getTime() + totalDuration * 1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                  </div>
                              </div>
                          </div>
                          <div className={`grid ${liveSpeed != null && travelMode === 'driving' ? 'grid-cols-4' : 'grid-cols-3'} gap-2`}>
                              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                                  <div className="text-[10px] font-bold uppercase opacity-70 mb-1">Duration</div>
                                  <div className="text-lg font-black">{formatDuration(totalDuration)}</div>
                              </div>
                              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                                  <div className="text-[10px] font-bold uppercase opacity-70 mb-1">Distance</div>
                                  <div className="text-lg font-black">{formatDistance(totalDistance)}</div>
                              </div>
                              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                                  <div className="text-[10px] font-bold uppercase opacity-70 mb-1">Avg Speed</div>
                                  <div className="text-lg font-black">{averageSpeed} <span className="text-sm font-medium">km/h</span></div>
                              </div>
                              {liveSpeed != null && travelMode === 'driving' && (
                                  <div className={`backdrop-blur-sm rounded-xl p-3 text-center border ${liveSpeed > 0 ? 'bg-emerald-500/30 border-emerald-300/40' : 'bg-white/10 border-transparent'}`}>
                                      <div className="text-[10px] font-bold uppercase opacity-70 mb-1 flex items-center justify-center gap-1">
                                          {liveSpeed > 0 && <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse"></span>}
                                          Live
                                      </div>
                                      <div className="text-lg font-black">{liveSpeed} <span className="text-sm font-medium">km/h</span></div>
                                  </div>
                              )}
                          </div>
                          {travelMode === 'driving' && estimatedFuelCost > 0 && (
                              <div className="mt-3 flex items-center justify-between bg-white/10 rounded-xl px-3 py-2">
                                  <div className="flex items-center gap-2 text-xs font-bold opacity-80"><Fuel size={12} /> Fuel Cost</div>
                                  <span className="text-sm font-black">Rs. {estimatedFuelCost.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                              </div>
                          )}
                          {/* Live distance progress */}
                          {distanceTraveled > 0 && totalDistance > 0 && (
                              <div className="mt-3 bg-white/10 rounded-xl px-3 py-2">
                                  <div className="flex items-center justify-between text-xs font-bold opacity-80 mb-1.5">
                                      <span className="flex items-center gap-1"><Navigation size={10}/> Distance Progress</span>
                                      <span>{Math.min(100, Math.round((distanceTraveled / totalDistance) * 100))}%</span>
                                  </div>
                                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                      <div
                                          className="h-full bg-emerald-400 rounded-full transition-all duration-700"
                                          style={{width: `${Math.min(100, (distanceTraveled / totalDistance) * 100)}%`}}
                                      />
                                  </div>
                                  <div className="flex justify-between text-[9px] font-bold opacity-60 mt-1">
                                      <span>{formatDistance(distanceTraveled)} done</span>
                                      <span>{formatDistance(Math.max(0, totalDistance - distanceTraveled))} left</span>
                                  </div>
                              </div>
                          )}
                      </div>

                      {/* ── Route Risk Badge ── */}
                      {routeRisk && (
                          <div className="flex items-center gap-3 rounded-2xl px-4 py-3 border" style={{borderColor: routeRisk.color + '44', background: routeRisk.color + '11'}}>
                              <Shield size={16} style={{color: routeRisk.color}} />
                              <div className="flex-grow">
                                  <div className="text-[10px] font-black uppercase" style={{color: routeRisk.color}}>{routeRisk.label}</div>
                                  <div className="text-[10px] text-slate-500 mt-0.5">{routeRisk.detail}</div>
                              </div>
                              {routeRisk.level === 'high' && <AlertTriangle size={14} style={{color: routeRisk.color}} />}
                          </div>
                      )}

                      {/* ── Leg-by-Leg Breakdown ── */}
                      {legSegments.length > 0 && (
                          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                              <button
                                  onClick={() => setShowLegBreakdown(!showLegBreakdown)}
                                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
                              >
                                  <span className="text-[10px] font-black uppercase text-slate-600 flex items-center gap-1.5"><Navigation size={11}/> Leg Breakdown</span>
                                  {showLegBreakdown ? <ChevronUp size={12} className="text-slate-400"/> : <ChevronDown size={12} className="text-slate-400"/>}
                              </button>
                              {showLegBreakdown && (
                                  <div className="divide-y divide-slate-50">
                                      {legSegments.map((seg, i) => (
                                          <div key={i} className="px-4 py-3 hover:bg-slate-50 transition-colors">
                                              <div className="flex items-center justify-between mb-1">
                                                  <div className="text-[10px] text-slate-500 truncate max-w-[60%]">
                                                      <span className="font-bold text-slate-700">{seg.from.split(',')[0]}</span>
                                                      <span className="mx-1 text-slate-300">→</span>
                                                      <span className="font-bold text-slate-700">{seg.to.split(',')[0]}</span>
                                                  </div>
                                                  <span className="text-[10px] font-black text-sky-600">{seg.arrivalTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                              </div>
                                              <div className="flex items-center gap-3 text-[9px] text-slate-400 font-bold">
                                                  <span>{formatDistance(seg.distance)}</span>
                                                  <span>·</span>
                                                  <span>{formatDuration(seg.duration)}</span>
                                                  {seg.avgSpeedKph > 0 && <><span>·</span><span>{seg.avgSpeedKph} km/h avg</span></>}
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              )}
                          </div>
                      )}

                      {/* ── Turn-by-Turn Directions ── */}
                      {navigationSteps.length > 0 && (
                          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                              <button
                                  onClick={() => setShowNavigation(!showNavigation)}
                                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
                              >
                                  <span className="text-[10px] font-black uppercase text-slate-600 flex items-center gap-1.5">
                                      <Gauge size={11}/> Directions
                                      <span className="text-[8px] bg-sky-100 text-sky-600 px-1.5 py-0.5 rounded-full">{navigationSteps.length}</span>
                                  </span>
                                  {showNavigation ? <ChevronUp size={12} className="text-slate-400"/> : <ChevronDown size={12} className="text-slate-400"/>}
                              </button>
                              {showNavigation && (
                                  <div className="divide-y divide-slate-50 max-h-[300px] overflow-y-auto scrollbar-thin">
                                      {navigationSteps.map((step, i) => {
                                          const icon = step.maneuver?.modifier?.includes('left') ? '↰'
                                              : step.maneuver?.modifier?.includes('right') ? '↱'
                                              : step.maneuver?.modifier?.includes('straight') ? '↑'
                                              : step.maneuver?.type === 'arrive' ? '🏁'
                                              : step.maneuver?.type === 'depart' ? '🚀'
                                              : step.maneuver?.type?.includes('roundabout') ? '🔄'
                                              : '→';
                                          return (
                                              <div key={i} className="px-4 py-2.5 hover:bg-sky-50/50 transition-colors flex items-start gap-3">
                                                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex-shrink-0 flex items-center justify-center text-sm">
                                                      {icon}
                                                  </div>
                                                  <div className="flex-grow min-w-0">
                                                      <div className="text-[11px] text-slate-700 font-semibold capitalize leading-tight">
                                                          {step.instruction}
                                                      </div>
                                                      {step.name && <div className="text-[10px] text-slate-400 font-medium truncate">{step.name}</div>}
                                                  </div>
                                                  <div className="text-right flex-shrink-0">
                                                      <div className="text-[10px] font-black text-slate-600">{formatDistance(step.distance)}</div>
                                                      <div className="text-[9px] text-slate-400">{formatDuration(step.duration)}</div>
                                                  </div>
                                              </div>
                                          );
                                      })}
                                  </div>
                              )}
                          </div>
                      )}


                      {/* Itinerary Timeline */}
                      {itinerary.length > 1 && (
                          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                              <div className="px-4 py-3 border-b border-slate-50">
                                  <span className="text-[10px] font-black uppercase text-slate-600 flex items-center gap-1.5"><Clock size={11}/> Trip Timeline</span>
                              </div>
                              <div className="relative pl-8 pr-4 py-2">
                                  {/* Vertical timeline line */}
                                  <div className="absolute left-[18px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-emerald-400 via-sky-400 to-red-400 rounded-full" />
                                  {itinerary.map((item, i) => {
                                      const isFirst = i === 0;
                                      const isLast = i === itinerary.length - 1;
                                      const dotColor = isFirst ? '#22c55e' : isLast ? '#ef4444' : '#0284c7';
                                      return (
                                          <div key={i} className="relative py-2.5">
                                              {/* Dot */}
                                              <div className="absolute -left-[14px] top-3 w-3 h-3 rounded-full border-2 border-white shadow-sm" style={{background: dotColor}} />
                                              <div className="flex items-start justify-between gap-2">
                                                  <div className="min-w-0">
                                                      <div className="text-[11px] font-bold text-slate-700 truncate">{item.location.split(',')[0]}</div>
                                                      {item.stayTimeMinutes > 0 && (
                                                          <div className="text-[9px] text-amber-600 font-bold mt-0.5">Stay: {item.stayTimeMinutes} min</div>
                                                      )}
                                                  </div>
                                                  <div className="text-right flex-shrink-0">
                                                      <div className="text-[10px] font-black text-sky-600">
                                                          {item.arrivalTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                                      </div>
                                                      {!isFirst && !isLast && item.departureTime.getTime() !== item.arrivalTime.getTime() && (
                                                          <div className="text-[9px] text-slate-400">
                                                              Dep {item.departureTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                                          </div>
                                                      )}
                                                  </div>
                                              </div>
                                          </div>
                                      );
                                  })}
                              </div>
                          </div>
                      )}

                      {/* ── Carbon Footprint ── */}
                      {carbonData && (
                          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                              <div className="flex items-center gap-2 mb-3">
                                  <Leaf size={14} className="text-emerald-600" />
                                  <span className="text-xs font-bold text-emerald-800 uppercase">Carbon Footprint</span>
                                  {carbonData.savedVsDriving > 0 && (
                                      <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                                          Saves {(carbonData.savedVsDriving / 1000).toFixed(1)} kg CO₂
                                      </span>
                                  )}
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                  {([
                                      { label: 'Your trip', val: travelMode==='driving' ? carbonData.drivingGrams : carbonData.cyclingGrams, highlight: true },
                                      { label: 'By train', val: carbonData.trainGrams, highlight: false },
                                  ] as { label: string; val: number; highlight: boolean }[]).map(item => (
                                      <div key={item.label} className={`p-2 rounded-xl ${item.highlight ? 'bg-emerald-600 text-white' : 'bg-white border border-emerald-100'}`}>
                                          <div className={`text-[10px] font-bold uppercase mb-1 ${item.highlight ? 'opacity-80' : 'text-slate-400'}`}>{item.label}</div>
                                          <div className="font-black">{item.val >= 1000 ? `${(item.val/1000).toFixed(1)} kg` : `${item.val} g`} CO₂</div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )}

                      {/* ── Mode Comparison ── */}
                      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                          <button
                              onClick={() => setShowModeComparison(!showModeComparison)}
                              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                          >
                              <div className="flex items-center gap-2">
                                  <Zap size={14} className="text-amber-500" />
                                  <span className="text-xs font-bold text-slate-700 uppercase">Mode Comparison</span>
                                  {isFetchingModes && <div className="w-3 h-3 border-2 border-amber-300/40 border-t-amber-500 rounded-full animate-spin" />}
                              </div>
                              {showModeComparison ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                          </button>
                          {showModeComparison && modeComparison && (
                              <div className="px-4 pb-4 space-y-2">
                                  {((['driving', 'cycling', 'walking'] as const)).map(mode => {
                                      const s = modeComparison[mode];
                                      const icons = { driving: <Car size={12}/>, cycling: <Bike size={12}/>, walking: <PersonStanding size={12}/> };
                                      const colors = { driving: 'text-sky-600', cycling: 'text-emerald-600', walking: 'text-orange-500' };
                                      const bgColors = { driving: 'bg-sky-50', cycling: 'bg-emerald-50', walking: 'bg-orange-50' };
                                      const isActive = mode === travelMode;
                                      return (
                                          <div key={mode} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isActive ? 'border-sky-200 bg-sky-50' : 'border-slate-100 bg-slate-50'}`}>
                                              <div className={`p-1.5 rounded-lg ${bgColors[mode]} ${colors[mode]}`}>{icons[mode]}</div>
                                              <div className="capitalize text-xs font-bold text-slate-600 w-16">{mode}</div>
                                              {s ? (
                                                  <div className="flex-grow grid grid-cols-3 gap-1 text-[10px] text-right">
                                                      <div><span className="font-black text-slate-800">{formatDuration(s.duration)}</span></div>
                                                      <div><span className="font-black text-slate-800">{formatDistance(s.distance)}</span></div>
                                                      <div>{s.calories > 0 ? <span className="font-black text-orange-600">{s.calories} kcal</span> : <span className="text-slate-400">–</span>}</div>
                                                  </div>
                                              ) : (
                                                  <span className="text-[10px] text-slate-400 ml-auto">Calculating…</span>
                                              )}
                                              {isActive && <span className="text-[8px] font-black text-sky-600 bg-sky-100 px-1.5 py-0.5 rounded-full uppercase">Active</span>}
                                          </div>
                                      );
                                  })}
                              </div>
                          )}
                      </div>

                      {/* ── Itinerary ── */}
                      {itinerary.length > 0 && (
                          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                              <div className="flex items-center gap-2 p-4 border-b border-slate-50">
                                  <Clock size={14} className="text-sky-600" />
                                  <span className="text-xs font-bold text-slate-700 uppercase">Trip Itinerary</span>
                                  {/* Multi-day detection */}
                                  {itinerary.length > 0 && (() => {
                                      const lastItem = itinerary[itinerary.length - 1];
                                      const firstItem = itinerary[0];
                                      const hours = (lastItem.departureTime.getTime() - firstItem.arrivalTime.getTime()) / 3600000;
                                      return hours > 8 ? (
                                          <span className="ml-auto text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Multi-day trip</span>
                                      ) : null;
                                  })()}
                              </div>
                              <div className="p-4 space-y-3">
                                  {itinerary.map((item, i) => {
                                      const isFirst = i === 0;
                                      const isLast = i === itinerary.length - 1;
                                      return (
                                          <div key={i} className="relative flex gap-3 text-xs">
                                              {i < itinerary.length - 1 && (
                                                  <div className="absolute left-[7px] top-4 bottom-[-12px] w-0.5 bg-gradient-to-b from-sky-200 to-transparent"></div>
                                              )}
                                              <div className={`mt-0.5 w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center z-10 shadow-sm ${isFirst ? 'bg-emerald-500' : isLast ? 'bg-red-500' : 'bg-sky-500'}`}>
                                                  <span className="text-white text-[8px] font-black">{i+1}</span>
                                              </div>
                                              <div className="flex-grow pb-2">
                                                  <div className="flex justify-between items-center">
                                                      <span className="font-bold text-slate-800">{item.location}</span>
                                                      <span className="font-black text-sky-600 text-[11px]">
                                                          {item.arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                      </span>
                                                  </div>
                                                  {item.stayTimeMinutes > 0 && (
                                                      <div className="text-slate-400 text-[10px] mt-0.5 flex items-center gap-1">
                                                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                          Stay {item.stayTimeMinutes} min · Depart {item.departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                      </div>
                                                  )}
                                              </div>
                                          </div>
                                      );
                                  })}
                              </div>
                          </div>
                      )}

                      {/* ── Elevation Profile SVG Chart ── */}
                      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                          <button
                              onClick={() => setShowElevation(!showElevation)}
                              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                          >
                              <div className="flex items-center gap-2">
                                  <Mountain size={14} className="text-indigo-500" />
                                  <span className="text-xs font-bold text-slate-700 uppercase">Elevation Profile</span>
                                  {isFetchingElevation && <div className="w-3 h-3 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />}
                              </div>
                              {showElevation ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                          </button>
                          {showElevation && elevationProfile.length >= 2 && (() => {
                              const minE = Math.min(...elevationProfile.map(d => d.elevation));
                              const maxE = Math.max(...elevationProfile.map(d => d.elevation));
                              const maxD = elevationProfile[elevationProfile.length - 1].distance;
                              const W = 320, H = 90, padX = 4, padY = 14;
                              const x = (d: number) => padX + (d / (maxD || 1)) * (W - padX * 2);
                              const y = (e: number) => H - padY - ((e - minE) / ((maxE - minE) || 1)) * (H - padY * 2);
                              const path = elevationProfile.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(d.distance).toFixed(1)},${y(d.elevation).toFixed(1)}`).join(' ');
                              const fill = `${path} L${x(maxD).toFixed(1)},${H} L${x(0).toFixed(1)},${H} Z`;
                              const gain = elevationProfile.reduce((s, d, i) => i > 0 && d.elevation > elevationProfile[i-1].elevation ? s + d.elevation - elevationProfile[i-1].elevation : s, 0);
                              const loss = elevationProfile.reduce((s, d, i) => i > 0 && d.elevation < elevationProfile[i-1].elevation ? s + elevationProfile[i-1].elevation - d.elevation : s, 0);
                              return (
                                  <div className="px-4 pb-4">
                                      <div className="flex justify-between text-[10px] font-bold mb-2">
                                          <span className="text-emerald-600">↑ {Math.round(gain)}m gain</span>
                                          <span className="text-slate-400">Range: {Math.round(minE)}–{Math.round(maxE)}m</span>
                                          <span className="text-red-500">↓ {Math.round(loss)}m loss</span>
                                      </div>
                                      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl bg-slate-50" style={{height:'90px'}}>
                                          <defs>
                                              <linearGradient id="eg" x1="0" y1="0" x2="0" y2="1">
                                                  <stop offset="0%" stopColor="#818cf8" stopOpacity="0.5"/>
                                                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0.03"/>
                                              </linearGradient>
                                          </defs>
                                          <path d={fill} fill="url(#eg)" />
                                          <path d={path} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                          {[0, 0.25, 0.5, 0.75, 1].map(t => (
                                              <text key={t} x={x(maxD*t)} y={H-2} textAnchor="middle" fontSize="7" fill="#94a3b8">
                                                  {(maxD*t/1000).toFixed(0)}km
                                              </text>
                                          ))}
                                          <text x={padX+2} y={y(maxE)+3} fontSize="7" fill="#94a3b8">{Math.round(maxE)}m</text>
                                          <text x={padX+2} y={y(minE)-3} fontSize="7" fill="#94a3b8">{Math.round(minE)}m</text>
                                      </svg>
                                  </div>
                              );
                          })()}
                          {showElevation && !isFetchingElevation && elevationProfile.length < 2 && (
                              <div className="px-4 pb-4 text-xs text-slate-400 text-center">Elevation data unavailable for this route.</div>
                          )}
                      </div>

                      {/* ── Weather ── */}
                      {weatherData.length > 0 && (
                          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                              <div className="flex items-center gap-2 mb-3">
                                  <Cloud size={14} className="text-blue-500" />
                                  <span className="text-xs font-bold text-blue-700 uppercase">Weather Along Route</span>
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                  {weatherData.slice(0, 3).map((w, i) => (
                                      <div key={i} className="bg-white rounded-xl p-2 text-center border border-blue-50">
                                          <div className="text-lg font-black text-slate-800">{Math.round(w.temperature)}°</div>
                                          <div className="text-[9px] text-slate-400 font-medium">{w.description}</div>
                                          <div className="text-[9px] text-blue-500 mt-0.5 font-bold">{Math.round(w.windSpeed)} km/h</div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )}

                      {/* ── Turn-by-Turn ── */}
                      {navigationSteps.length > 0 && (
                          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                              <button
                                  onClick={() => setShowNavigation(!showNavigation)}
                                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                              >
                                  <div className="flex items-center gap-2">
                                      <Navigation size={14} className="text-sky-600" />
                                      <span className="text-xs font-bold text-slate-700 uppercase">Turn-by-Turn Directions</span>
                                      <span className="text-[10px] text-slate-400 font-medium">({navigationSteps.length} steps)</span>
                                  </div>
                                  {showNavigation ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                              </button>
                              {showNavigation && (
                                  <div className="max-h-52 overflow-y-auto divide-y divide-slate-50">
                                      {navigationSteps.map((step, i) => (
                                          <div key={i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors">
                                              <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-500 flex-shrink-0">{i+1}</div>
                                              <span className="text-xs text-slate-600 flex-grow">{step.instruction}</span>
                                              <span className="text-[10px] text-slate-400 font-bold flex-shrink-0">{formatDistance(step.distance)}</span>
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

          {/* ── Footer: Optimize + controls ── */}
          <div className="p-4 border-t border-slate-100 bg-white space-y-2">
              {/* Active filters summary */}
              {(avoidOptions.length > 0 || arriveByTime || roundtrip || useTraffic) && (
                  <div className="flex flex-wrap gap-1 px-1">
                      {avoidOptions.map(o => (
                          <span key={o} className="text-[9px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full capitalize">
                              No {o}
                          </span>
                      ))}
                      {roundtrip && <span className="text-[9px] font-bold bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">Roundtrip</span>}
                      {useTraffic && <span className="text-[9px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Live Traffic</span>}
                      {arriveByTime && <span className="text-[9px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Arrive-by set</span>}
                  </div>
              )}

              <div className="flex gap-2">
              <button
                  onClick={handleOptimize}
                  disabled={isOptimizing}
                  className={`flex-grow py-3.5 rounded-xl font-bold text-white shadow-xl flex items-center justify-center gap-2 transition-all ${
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
                          <Navigation size={18} />
                          {isOptimized ? 'Re-Optimize Route' : 'Optimize Route'}
                          {avoidOptions.length > 0 && (
                              <span className="text-[9px] font-black bg-white/20 px-1.5 py-0.5 rounded-full">
                                  {avoidOptions.length} filter{avoidOptions.length > 1 ? 's' : ''}
                              </span>
                          )}
                      </>
                  )}
              </button>
              <button
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  title={isPreviewMode ? "Auto-preview ON — route updates as you add stops" : "Enable auto-preview"}
                  className={`flex-shrink-0 px-3 py-3.5 rounded-xl font-bold border text-xs transition-all flex flex-col items-center gap-0.5 ${
                      isPreviewMode
                          ? "bg-sky-50 border-sky-300 text-sky-700"
                          : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                  }`}
              >
                  <Zap size={14} />
                  <span className="text-[8px] font-black uppercase">Live</span>
              </button>
              </div>{/* /flex gap-2 */}
              
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

              {/* Export & Share actions */}
              {isOptimized && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                          onClick={exportGPX}
                          className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 text-xs font-bold transition-all"
                      >
                          <Download size={14} /> Export GPX
                      </button>
                      <button
                          onClick={shareRoute}
                          className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 text-xs font-bold transition-all"
                      >
                          <Share2 size={14} /> Share Route
                      </button>
                  </div>
              )}
          </div>
      </div>

      {/* Map View */}
      <div className="route-map flex-grow h-[50vh] md:h-full relative bg-slate-100">
           <LeafletMap className="w-full h-full z-0" center={mapCenter} zoom={13}>
               {/* Mapbox Traffic overlay (semi-transparent, toggle-able) */}
               {showTrafficLayer && (
                   <TileLayer
                       url={`https://api.mapbox.com/styles/v1/mapbox/traffic-day-v2/tiles/256/{z}/{x}/{y}?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`}
                       attribution=""
                       tileSize={256}
                       opacity={0.7}
                       zIndex={300}
                   />
               )}

               {/* POI Markers — Google Maps-style */}
               {pois.filter(p => poiFilters[p.type]).map((poi) => {
                   const cfg = poi.type === 'hotel'
                       ? { bg: '#f59e0b', icon: '🏨', label: 'Hotel' }
                       : poi.type === 'restaurant'
                       ? { bg: '#f97316', icon: '🍴', label: 'Food' }
                       : poi.type === 'ev_charging'
                       ? { bg: '#0ea5e9', icon: '⚡', label: 'EV Charger' }
                       : { bg: '#22c55e', icon: '⛽', label: 'Petrol' };

                   return (
                       <Marker
                           key={poi.id}
                           position={poi.coords}
                           icon={L.divIcon({
                               className: '',
                               html: `<div style="
                                   background:${cfg.bg};
                                   width:30px;height:30px;border-radius:50% 50% 50% 0;
                                   transform:rotate(-45deg);
                                   border:2px solid white;
                                   box-shadow:0 2px 8px rgba(0,0,0,0.3);
                                   display:flex;align-items:center;justify-content:center;
                               ">
                                   <span style="transform:rotate(45deg);font-size:13px;line-height:1">${cfg.icon}</span>
                               </div>`,
                               iconSize: [30, 30],
                               iconAnchor: [10, 30],
                               popupAnchor: [5, -30],
                           })}
                       >
                           <Popup>
                               <div style={{fontFamily:'sans-serif',minWidth:'160px',maxWidth:'200px'}}>
                                   <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'6px'}}>
                                       <span style={{fontSize:'18px'}}>{cfg.icon}</span>
                                       <div>
                                           <div style={{fontWeight:'800',fontSize:'12px',color:'#1e293b',lineHeight:'1.2'}}>{poi.name}</div>
                                           <span style={{fontSize:'9px',fontWeight:'700',textTransform:'uppercase',background:cfg.bg,color:'white',borderRadius:'4px',padding:'1px 5px'}}>{cfg.label}</span>
                                       </div>
                                       {poi.openNow && <span style={{marginLeft:'auto',fontSize:'9px',fontWeight:'700',color:'#16a34a',background:'#dcfce7',borderRadius:'4px',padding:'1px 5px'}}>24/7</span>}
                                   </div>
                                   {poi.address && <div style={{fontSize:'10px',color:'#64748b',marginBottom:'3px'}}>📍 {poi.address}</div>}
                                   {poi.phone && <div style={{fontSize:'10px',color:'#64748b'}}>📞 {poi.phone}</div>}
                                   <div style={{marginTop:'8px',display:'flex',gap:'6px'}}>
                                       <a href={`https://www.google.com/maps/search/?api=1&query=${poi.coords[0]},${poi.coords[1]}`} target="_blank" rel="noreferrer"
                                           style={{flex:1,textAlign:'center',fontSize:'10px',fontWeight:'700',padding:'4px',background:'#0284c7',color:'white',borderRadius:'6px',textDecoration:'none'}}>
                                           Directions
                                       </a>
                                       <a href={`https://www.google.com/maps/place/?q=place_api&ftid=${poi.coords[0]},${poi.coords[1]}`} target="_blank" rel="noreferrer"
                                           style={{flex:1,textAlign:'center',fontSize:'10px',fontWeight:'700',padding:'4px',background:'#f1f5f9',color:'#475569',borderRadius:'6px',textDecoration:'none'}}>
                                           Details
                                       </a>
                                   </div>
                               </div>
                           </Popup>
                       </Marker>
                   );
               })}
               
               {/* Live GPS Beacon — pulsing blue dot at user's actual position */}
               {userLocation && (
                   <Marker
                       position={userLocation}
                       zIndexOffset={1000}
                       icon={L.divIcon({
                           className: '',
                           html: `<div style="position:relative;width:20px;height:20px">
                             <div style="position:absolute;inset:0;border-radius:50%;background:#3b82f6;opacity:0.25;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite"></div>
                             <div style="position:absolute;inset:3px;border-radius:50%;background:#2563eb;border:2.5px solid white;box-shadow:0 0 0 1px #93c5fd"></div>
                           </div>
                           <style>@keyframes ping{0%{transform:scale(1);opacity:.25}75%,100%{transform:scale(2.2);opacity:0}}</style>`,
                           iconSize: [20, 20],
                           iconAnchor: [10, 10],
                       })}
                   >
                       <Popup>
                           <div className="text-center font-sans min-w-[130px]">
                               <div className="text-[10px] font-black text-blue-600 uppercase mb-1 flex items-center justify-center gap-1">
                                   <span style={{display:'inline-block',width:6,height:6,borderRadius:'50%',background:'#22c55e'}}></span>
                                   Your Live Location
                               </div>
                               <div className="text-xs text-slate-600">{waypoints[0]?.location}</div>
                               {gpsAccuracy && <div className="text-[9px] text-slate-400 mt-0.5">±{gpsAccuracy}m accuracy</div>}
                           </div>
                       </Popup>
                   </Marker>
               )}

               {/* Waypoint Markers — color coded */}
               {waypoints.map((point, i) => {
                   const isStart = i === 0;
                   const isEnd = i === waypoints.length - 1;
                   const bg = isStart ? '#22c55e' : isEnd ? '#ef4444' : '#0284c7';
                   return (
                       <Marker
                           key={point.id}
                           position={point.coords}
                           icon={L.divIcon({
                               className: '',
                               html: `<div style="background:${bg};width:28px;height:28px;border-radius:50%;color:white;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:12px;border:2.5px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-family:sans-serif">${i + 1}</div>`,
                               iconSize: [28, 28],
                               iconAnchor: [14, 14]
                           })}
                       >
                           <Popup>
                               <div className="text-center font-sans min-w-[150px]">
                                   <div className="text-[10px] font-black uppercase mb-1" style={{color: bg}}>
                                       {isStart ? '🟢 Start' : isEnd ? '🔴 Destination' : `📍 Stop ${i}`}
                                   </div>
                                   <strong className="text-slate-800 text-sm block">{point.location}</strong>
                                   {itinerary[i] && (
                                       <div className="mt-1 text-xs text-slate-500 border-t pt-1">
                                           Arrive: <strong className="text-sky-600">{itinerary[i].arrivalTime.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</strong>
                                           {itinerary[i].stayTimeMinutes > 0 && (
                                               <div className="text-[10px] mt-0.5">Stay {itinerary[i].stayTimeMinutes}min</div>
                                           )}
                                       </div>
                                   )}
                               </div>
                           </Popup>
                       </Marker>
                   );
               })}

               {/* Alternative Route Polylines (dashed, clickable) */}
               {isOptimized && alternativeRoutes.map((altRoute, idx) => {
                   const altGeo: [number, number][] = altRoute.geometry.coordinates.map(
                       (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
                   );
                   return (
                       <Polyline
                           key={`alt-${idx}`}
                           positions={altGeo}
                           pathOptions={{ color: '#94a3b8', weight: 4, opacity: 0.5, dashArray: '8 6', lineCap: 'round' }}
                           eventHandlers={{
                               click: () => {
                                   // Switch to this alternative route
                                   setRouteGeometry(altGeo);
                                   setTotalDistance(altRoute.distance);
                                   setTotalDuration(altRoute.duration);
                                   const speedKmH = altRoute.duration > 0 ? (altRoute.distance / 1000) / (altRoute.duration / 3600) : 0;
                                   setAverageSpeed(Math.round(speedKmH));
                               }
                           }}
                       />
                   );
               })}

               {/* Main Route Polyline — with shadow outline */}
               {isOptimized && routeGeometry.length > 0 && (
                   <>
                       {/* Shadow/outline for depth */}
                       <Polyline
                           positions={routeGeometry}
                           pathOptions={{ color: '#0369a1', weight: 8, opacity: 0.3, lineCap: 'round', lineJoin: 'round' }}
                       />
                       {/* Main route line */}
                       <Polyline
                           positions={routeGeometry}
                           pathOptions={{ color: '#0284c7', weight: 5, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }}
                       />
                   </>
               )}

               {/* Auto-fit bounds to the full route after optimization */}
               {isOptimized && routeGeometry.length > 1 && (
                   <MapRecenterer center={mapCenter} routeGeometry={routeGeometry} />
               )}
          </LeafletMap>

          {/* Google Maps-style horizontal POI chip bar */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[400] flex items-center gap-2 bg-white/95 backdrop-blur-md rounded-2xl px-3 py-2 shadow-xl border border-white/60">
              {([
                  { key: 'hotel' as const,       label: 'Hotels',     icon: <Hotel size={13}/>,     activeBg: 'bg-amber-500',  count: pois.filter(p=>p.type==='hotel').length },
                  { key: 'restaurant' as const,  label: 'Food',       icon: <Utensils size={13}/>,  activeBg: 'bg-orange-500', count: pois.filter(p=>p.type==='restaurant').length },
                  { key: 'petrol' as const,      label: 'Petrol',     icon: <Fuel size={13}/>,      activeBg: 'bg-green-600',  count: pois.filter(p=>p.type==='petrol').length },
                  { key: 'ev_charging' as const, label: 'EV Charge',  icon: <Zap size={13}/>,       activeBg: 'bg-sky-500',    count: pois.filter(p=>p.type==='ev_charging').length },
              ]).map(chip => (
                  <button
                      key={chip.key}
                      onClick={() => setPoiFilters(f => ({...f, [chip.key]: !f[chip.key]}))}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all ${
                          poiFilters[chip.key]
                              ? `${chip.activeBg} text-white shadow-md scale-105`
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                  >
                      {chip.icon}
                      <span>{chip.label}</span>
                      {chip.count > 0 && (
                          <span className={`text-[9px] font-black px-1 py-0.5 rounded-full ${poiFilters[chip.key] ? 'bg-white/30' : 'bg-slate-300 text-slate-600'}`}>
                              {chip.count}
                          </span>
                      )}
                  </button>
              ))}
              {/* Traffic chip separator */}
              <div className="w-px h-5 bg-slate-200" />
              <button
                  onClick={() => setShowTrafficLayer(t => !t)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all ${
                      showTrafficLayer ? 'bg-red-500 text-white shadow-md scale-105' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
              >
                  <span className="relative flex h-2 w-2">
                      {showTrafficLayer && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>}
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${showTrafficLayer ? 'bg-white' : 'bg-red-400'}`}></span>
                  </span>
                  Traffic
              </button>
              {loadingPois && <div className="w-3 h-3 border-2 border-sky-300/40 border-t-sky-500 rounded-full animate-spin ml-1"/>}
          </div>

          {/* Loading POIs indicator */}
          {loadingPois && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-white/50 shadow-lg z-[400] flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-sky-400/30 border-t-sky-600 rounded-full animate-spin"></div>
                  <span className="text-xs font-medium text-slate-600">Loading places...</span>
              </div>
          )}

          {/* Map Controls Overlay — right side */}
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-white/60 shadow-lg z-[400] flex flex-col gap-1">
              {/* GPS recenter */}
              <button
                  onClick={() => { if (userLocation) { setMapCenter([...userLocation]); } }}
                  className={`p-2 rounded-lg transition-colors ${gpsStatus === 'locked' ? 'text-sky-600 hover:bg-sky-50' : 'text-slate-300'}`}
                  title="Re-center on my location"
              >
                  <Navigation size={17} />
              </button>
              <div className="w-full h-px bg-slate-100" />
              {/* Refresh POIs */}
              <button
                  onClick={() => { if (userLocation) fetchPOIs(userLocation[0], userLocation[1], routeGeometry); }}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                  title="Refresh places"
              >
                  <RefreshCcw size={17} className={loadingPois ? 'animate-spin' : ''} />
              </button>
              {/* Settings */}
              <button
                  onClick={() => setShowAdvancedOptions(v => !v)}
                  className={`p-2 rounded-lg transition-colors ${showAdvancedOptions ? 'bg-sky-100 text-sky-600' : 'text-slate-500 hover:bg-slate-100'}`}
                  title="Advanced Options"
              >
                  <Settings size={17} />
              </button>
          </div>

          {/* Live Speedometer HUD */}
          {gpsStatus === 'locked' && travelMode !== 'walking' && (
              <div className="absolute bottom-6 left-4 z-[400] flex items-end gap-2">
                  <div className="bg-slate-900/85 backdrop-blur-xl rounded-2xl p-3 border border-white/10 shadow-2xl min-w-[120px]">
                      <div className="text-center">
                          <div className="text-3xl font-black text-white tabular-nums leading-none">
                              {liveSpeed != null ? liveSpeed : '--'}
                          </div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">km/h</div>
                      </div>
                      <div className="h-px bg-white/10 my-2"></div>
                      <div className="grid grid-cols-2 gap-2 text-center">
                          <div>
                              <div className="text-[8px] font-bold text-slate-500 uppercase">Heading</div>
                              <div className="text-xs font-black text-white">
                                  {heading != null ? (
                                      <span className="flex items-center justify-center gap-0.5">
                                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{transform: `rotate(${heading}deg)`}}>
                                              <path d="M12 2l4 10-4-3-4 3z" fill="currentColor"/>
                                          </svg>
                                          {heading}&deg;
                                      </span>
                                  ) : '--'}
                              </div>
                          </div>
                          <div>
                              <div className="text-[8px] font-bold text-slate-500 uppercase">Traveled</div>
                              <div className="text-xs font-black text-white">{formatDistance(distanceTraveled)}</div>
                          </div>
                      </div>
                      {/* GPS signal bars */}
                      <div className="mt-2 flex items-center gap-1.5">
                          <div className="flex gap-0.5">
                              {[1,2,3,4].map(bar => (
                                  <div
                                      key={bar}
                                      className="rounded-sm transition-colors"
                                      style={{
                                          width: 3,
                                          height: 4 + bar * 3,
                                          background: gpsAccuracy != null && gpsAccuracy < bar * 15
                                              ? '#22c55e'
                                              : 'rgba(255,255,255,0.15)'
                                      }}
                                  />
                              ))}
                          </div>
                          <span className="text-[8px] font-bold text-slate-500">
                              {gpsAccuracy ? `\u00b1${gpsAccuracy}m` : 'GPS'}
                          </span>
                      </div>
                  </div>
              </div>
          )}

      </div>
    </div>
  );
};

const Check = ({ size, className }: { size: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

export default RouteOptimizerPage;
