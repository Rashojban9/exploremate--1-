/**
 * routingService.ts - Mapbox Routing Service — Advanced Edition
 * Uses Mapbox Optimization API (TSP) & Directions API - 50,000 free requests/month
 */

export interface RoutePoint {
  lat: number;
  lng: number;
}

export interface RouteStep {
  distance: number;
  duration: number;
  instruction: string;
  name: string;
  speedLimit?: number;
  maneuver?: {
    type: string;
    modifier?: string;
    location: [number, number];
    instruction?: string;
  };
}

export interface RouteLeg {
  distance: number;
  duration: number;
  summary: string;
  steps: Array<{
    distance: number;
    duration: number;
    name: string;
    speed_limit?: number;
    maneuver: {
      type: string;
      modifier?: string;
      location: [number, number];
      instruction?: string;
    };
  }>;
}

export interface MapboxRoute {
  distance: number; // meters
  duration: number; // seconds
  geometry: {
    coordinates: [number, number][];
    type: string;
  };
  legs: RouteLeg[];
  routeName?: string;
  weight?: number;
  weight_name?: string;
}

export interface MapboxDirectionsResponse {
  code: string;
  routes: MapboxRoute[];
  waypoints: Array<{
    name: string;
    location: [number, number];
    waypoint_index?: number;
  }>;
}

export interface MapboxOptimizationResponse {
  code: string;
  trips: MapboxRoute[];
  waypoints: Array<{
    name: string;
    location: [number, number];
    waypoint_index: number;
    trips_index: number;
  }>;
}

export interface ItineraryItem {
  location: string;
  arrivalTime: Date;
  departureTime: Date;
  stayTimeMinutes: number;
}

export interface WeatherData {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  humidity: number;
  description: string;
}

// ── Routing avoid options ─────────────────────────────────────────────────────
export type AvoidOption = 'motorway' | 'toll' | 'ferry' | 'unpaved';

// Get Mapbox token from environment
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';
const MAPBOX_DIRECTIONS_URL = 'https://api.mapbox.com/directions/v5/mapbox';
const MAPBOX_OPTIMIZATION_URL = 'https://api.mapbox.com/optimized-trips/v1/mapbox';

/**
 * Build a URL query string for avoid options
 */
function buildExcludes(avoidOptions: AvoidOption[]): string {
  if (!avoidOptions || avoidOptions.length === 0) return '';
  return `&exclude=${avoidOptions.join(',')}`;
}

/**
 * Get route between multiple waypoints using Mapbox Directions API (keeps original order)
 */
export async function getRoute(
  waypoints: RoutePoint[],
  profile: 'driving-traffic' | 'driving' | 'cycling' | 'walking' = 'driving',
  avoidOptions: AvoidOption[] = []
): Promise<MapboxDirectionsResponse | null> {
  if (waypoints.length < 2) return null;
  if (!MAPBOX_TOKEN) {
    console.error('Mapbox token not configured');
    return null;
  }

  const coordinates = waypoints.map(wp => `${wp.lng},${wp.lat}`).join(';');
  const exclude = buildExcludes(avoidOptions);
  const url = `${MAPBOX_DIRECTIONS_URL}/${profile}/${coordinates}?geometries=geojson&steps=true&annotations=speed,duration,distance&overview=full&alternatives=true${exclude}&access_token=${MAPBOX_TOKEN}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Mapbox API error: ${response.status}`);
    const data = await response.json() as MapboxDirectionsResponse;
    if (data.code !== 'Ok') return null;

    data.routes = data.routes.map((route, i) => ({
      ...route,
      routeName: i === 0 ? 'Fastest Route' : `Alternative ${i}`
    }));

    return data;
  } catch (error) {
    console.error('Failed to fetch route:', error);
    return null;
  }
}

/**
 * Get optimized route using Mapbox Optimization API (reorders intermediate stops for best path)
 * Falls back to Directions API for >12 waypoints.
 */
export async function getOptimizedRoute(
  waypoints: RoutePoint[],
  profile: 'driving' | 'cycling' | 'walking' = 'driving',
  roundtrip: boolean = false,
  useTraffic: boolean = false,
  avoidOptions: AvoidOption[] = []
): Promise<MapboxDirectionsResponse | null> {
  if (waypoints.length < 2) return null;
  if (!MAPBOX_TOKEN) {
    console.error('Mapbox token not configured');
    return null;
  }

  const finalProfile = useTraffic && profile === 'driving' ? 'driving-traffic' : profile;
  const exclude = buildExcludes(avoidOptions);

  // Mapbox Optimization API limit is 12 waypoints
  if (waypoints.length > 12) {
    console.warn('Optimization API limited to 12 points, falling back to Directions API');
    return getRoute(waypoints, finalProfile, avoidOptions);
  }

  const coordinates = waypoints.map(wp => `${wp.lng},${wp.lat}`).join(';');
  const destination = roundtrip ? 'any' : 'last';
  const url = `${MAPBOX_OPTIMIZATION_URL}/${finalProfile}/${coordinates}?geometries=geojson&steps=true&annotations=speed,duration,distance&overview=full&roundtrip=${roundtrip}&source=first&destination=${destination}${exclude}&access_token=${MAPBOX_TOKEN}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Mapbox Optimization API error: ${response.status} ${await response.text()}`);

    const data = await response.json() as MapboxOptimizationResponse;

    if (data.code !== 'Ok') {
      console.warn('Mapbox optimization failed, falling back to Directions API:', data.code);
      return getRoute(waypoints, finalProfile, avoidOptions);
    }

    if (!data.trips || data.trips.length === 0) {
      console.warn('No trips returned, falling back to Directions API');
      return getRoute(waypoints, finalProfile, avoidOptions);
    }

    return {
      code: data.code,
      routes: data.trips.map((trip, i) => ({
        ...trip,
        routeName: i === 0 ? 'Optimized Route' : `Alternative ${i}`
      })),
      waypoints: data.waypoints
    };
  } catch (error) {
    console.error('Failed to fetch optimized route, falling back:', error);
    return getRoute(waypoints, finalProfile, avoidOptions);
  }
}

/**
 * Extract the optimized waypoint order from the Optimization API response.
 */
export function getOptimizedWaypointIndices(
  originalWaypoints: RoutePoint[],
  response: MapboxDirectionsResponse
): number[] {
  if (response?.waypoints && response.waypoints.length > 0) {
    const wps = response.waypoints as Array<{
      waypoint_index?: number;
      trips_index?: number;
    }>;
    const hasOptimization = wps.every(wp => wp.waypoint_index !== undefined && wp.trips_index !== undefined);

    if (hasOptimization) {
      const sorted = [...wps].sort((a, b) => (a.trips_index ?? 0) - (b.trips_index ?? 0));
      return sorted.map(wp => wp.waypoint_index as number);
    }
  }
  return originalWaypoints.map((_, i) => i);
}

/**
 * Get turn-by-turn navigation instructions from a route
 */
export function getNavigationInstructions(route: MapboxRoute): RouteStep[] {
  if (!route.legs || route.legs.length === 0) return [];

  const instructions: RouteStep[] = [];

  for (const leg of route.legs) {
    if (leg.steps) {
      for (const step of leg.steps) {
        const maneuver = step.maneuver;
        let instruction = '';

        if (maneuver) {
          const modifier = maneuver.modifier ? `${maneuver.modifier} ` : '';
          const type = maneuver.type.replace(/-/g, ' ');
          instruction = `${modifier}${type}`.trim();
        }

        if (!instruction) instruction = step.name || 'Continue straight';

        instructions.push({
          distance: step.distance,
          duration: step.duration,
          instruction,
          name: step.name || '',
          maneuver
        });
      }
    }
  }

  return instructions;
}

// ── Per-leg segment breakdown ────────────────────────────────────────────────

export interface LegSegment {
  from: string;
  to: string;
  distance: number;  // meters
  duration: number;  // seconds
  arrivalTime: Date;
  avgSpeedKph: number;
}

/**
 * Build a per-leg breakdown for the route sidebar table.
 */
export function buildLegSegments(
  route: MapboxRoute,
  waypointLabels: string[],
  startTime: Date,
  stayDurations: Record<number, number>
): LegSegment[] {
  const segments: LegSegment[] = [];
  let current = new Date(startTime);

  for (let i = 0; i < route.legs.length; i++) {
    const leg = route.legs[i];
    current = new Date(current.getTime() + leg.duration * 1000);

    const avgSpeedKph = leg.distance > 0 && leg.duration > 0
      ? Math.round((leg.distance / 1000) / (leg.duration / 3600))
      : 0;

    segments.push({
      from: waypointLabels[i] ?? `Stop ${i + 1}`,
      to: waypointLabels[i + 1] ?? `Stop ${i + 2}`,
      distance: leg.distance,
      duration: leg.duration,
      arrivalTime: new Date(current),
      avgSpeedKph
    });

    // Add stay time
    const stay = stayDurations[i + 1] ?? 0;
    current = new Date(current.getTime() + stay * 60000);
  }

  return segments;
}

/**
 * Calculate full trip itinerary with arrival/departure times for each stop
 */
export function calculateItinerary(
  startTime: Date,
  waypoints: { location: string }[],
  legs: RouteLeg[],
  stayDurations: number[]
): ItineraryItem[] {
  const itinerary: ItineraryItem[] = [];
  let currentTime = new Date(startTime);

  itinerary.push({
    location: waypoints[0].location,
    arrivalTime: new Date(currentTime),
    departureTime: new Date(currentTime),
    stayTimeMinutes: 0
  });

  for (let i = 0; i < legs.length; i++) {
    const travelSeconds = legs[i].duration;
    currentTime = new Date(currentTime.getTime() + travelSeconds * 1000);

    const arrivalTime = new Date(currentTime);
    const stayMins = stayDurations[i + 1] ?? 0;
    currentTime = new Date(currentTime.getTime() + stayMins * 60000);

    itinerary.push({
      location: waypoints[i + 1]?.location ?? `Stop ${i + 1}`,
      arrivalTime,
      departureTime: new Date(currentTime),
      stayTimeMinutes: stayMins
    });
  }

  return itinerary;
}

/**
 * Given a desired arrival time at the last stop, calculate the required departure time.
 * Returns the departure time that would result in arriving on time.
 */
export function calculateDepartureTime(
  desiredArrivalTime: Date,
  totalDurationSeconds: number,
  totalStayMinutes: number
): Date {
  const totalTravelMs = totalDurationSeconds * 1000;
  const totalStayMs = totalStayMinutes * 60000;
  return new Date(desiredArrivalTime.getTime() - totalTravelMs - totalStayMs);
}

/**
 * Estimate fuel cost for driving a given distance (Nepal average rates)
 */
export function calculateFuelCost(distanceMeters: number): number {
  const km = distanceMeters / 1000;
  const lPer100km = 8;
  const pricePerLitre = 175;
  return (km / 100) * lPer100km * pricePerLitre;
}

/**
 * Get weather along the route at multiple waypoints (Open-Meteo, no API key)
 */
const WEATHER_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export async function getWeatherAlongRoute(waypoints: RoutePoint[]): Promise<WeatherData[]> {
  try {
    const limited = waypoints.slice(0, 5);
    const results = await Promise.all(
      limited.map(async (wp) => {
        const url = `${WEATHER_BASE_URL}?latitude=${wp.lat}&longitude=${wp.lng}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m`;
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();
        return {
          temperature: data.current?.temperature_2m ?? 0,
          weatherCode: data.current?.weather_code ?? 0,
          windSpeed: data.current?.wind_speed_10m ?? 0,
          humidity: data.current?.relative_humidity_2m ?? 0,
          description: getWeatherDescription(data.current?.weather_code ?? 0)
        };
      })
    );
    return results.filter((w): w is WeatherData => w !== null);
  } catch {
    return [];
  }
}

function getWeatherDescription(code: number): string {
  const map: Record<number, string> = {
    0: 'Clear', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Icy fog', 51: 'Light drizzle', 53: 'Drizzle',
    55: 'Heavy drizzle', 61: 'Slight rain', 63: 'Rain', 65: 'Heavy rain',
    71: 'Slight snow', 73: 'Snow', 75: 'Heavy snow', 95: 'Thunderstorm'
  };
  return map[code] ?? 'Unknown';
}

/** Format meters into human-readable distance */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

/** Format seconds into human-readable duration */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)} sec`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m} min`;
}

// ─────────────────────────────────────────
// Elevation Profile
// ─────────────────────────────────────────

export interface ElevationPoint {
  distance: number;   // cumulative meters from start
  elevation: number;  // meters above sea level
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function getElevationProfile(
  coords: [number, number][],
  maxSamples = 50
): Promise<ElevationPoint[]> {
  if (coords.length < 2) return [];
  try {
    const step = Math.max(1, Math.floor(coords.length / maxSamples));
    const sampled = coords.filter((_, i) => i % step === 0);
    if (sampled[sampled.length - 1] !== coords[coords.length - 1]) {
      sampled.push(coords[coords.length - 1]);
    }

    const response = await fetch('https://api.open-elevation.com/api/v1/lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locations: sampled.map(([lat, lng]) => ({ latitude: lat, longitude: lng }))
      })
    });

    if (!response.ok) return [];
    const data = await response.json();
    if (!data.results) return [];

    let cumDist = 0;
    return data.results.map((r: { latitude: number; longitude: number; elevation: number }, i: number) => {
      if (i > 0) {
        const [lat1, lng1] = sampled[i - 1];
        const [lat2, lng2] = sampled[i];
        cumDist += haversineDistance(lat1, lng1, lat2, lng2);
      }
      return { distance: cumDist, elevation: r.elevation ?? 0 };
    });
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────
// Carbon Footprint
// ─────────────────────────────────────────

export interface CarbonFootprint {
  drivingGrams: number;
  cyclingGrams: number;
  walkingGrams: number;
  trainGrams: number;
  savedVsDriving: number;
  treeMinutes: number;
}

export function calculateCarbonFootprint(distanceMeters: number, mode: 'driving' | 'cycling' | 'walking'): CarbonFootprint {
  const km = distanceMeters / 1000;
  const drivingG = Math.round(km * 171);
  const cyclingG = Math.round(km * 5);
  const walkingG = Math.round(km * 5);
  const trainG   = Math.round(km * 41);

  const currentG = mode === 'driving' ? drivingG : mode === 'cycling' ? cyclingG : walkingG;
  const savedVsDriving = Math.max(0, drivingG - currentG);
  const treeMinutes = Math.round(currentG / 0.04);

  return { drivingGrams: drivingG, cyclingGrams: cyclingG, walkingGrams: walkingG, trainGrams: trainG, savedVsDriving, treeMinutes };
}

// ─────────────────────────────────────────
// Mode Comparison
// ─────────────────────────────────────────

export interface ModeStats {
  distance: number;
  duration: number;
  carbonGrams: number;
  calories: number;
}

const CALORIES_PER_KM: Record<string, number> = {
  driving: 0,
  cycling: 35,
  walking: 60,
};

export async function getAllModeComparison(
  waypoints: RoutePoint[]
): Promise<Record<'driving' | 'cycling' | 'walking', ModeStats | null>> {
  const [d, c, w] = await Promise.all([
    getRoute(waypoints, 'driving'),
    getRoute(waypoints, 'cycling'),
    getRoute(waypoints, 'walking'),
  ]);

  const toStats = (res: MapboxDirectionsResponse | null, mode: 'driving' | 'cycling' | 'walking'): ModeStats | null => {
    if (!res?.routes?.[0]) return null;
    const { distance, duration } = res.routes[0];
    const km = distance / 1000;
    return {
      distance,
      duration,
      carbonGrams: mode === 'driving' ? Math.round(km * 171) : Math.round(km * 5),
      calories: Math.round(km * (CALORIES_PER_KM[mode] ?? 0)),
    };
  };

  return {
    driving: toStats(d, 'driving'),
    cycling: toStats(c, 'cycling'),
    walking: toStats(w, 'walking'),
  };
}

// ─────────────────────────────────────────
// Route Risk Assessment
// ─────────────────────────────────────────

export interface RouteRisk {
  level: 'low' | 'moderate' | 'high';
  label: string;
  detail: string;
  color: string;
}

/**
 * Assess route risk based on distance, altitude gain, and weather conditions.
 */
export function assessRouteRisk(
  distanceMeters: number,
  elevationGainMeters: number,
  weatherData: WeatherData[]
): RouteRisk {
  let score = 0;

  // Distance risk
  if (distanceMeters > 200000) score += 3;
  else if (distanceMeters > 100000) score += 2;
  else if (distanceMeters > 50000) score += 1;

  // Elevation gain risk
  if (elevationGainMeters > 1500) score += 3;
  else if (elevationGainMeters > 800) score += 2;
  else if (elevationGainMeters > 300) score += 1;

  // Weather risk
  for (const w of weatherData) {
    if ([65, 75, 95].includes(w.weatherCode)) score += 3; // heavy rain/snow/storm
    else if ([61, 63, 71, 73].includes(w.weatherCode)) score += 2;
    else if ([51, 53, 55].includes(w.weatherCode)) score += 1;
    if (w.windSpeed > 50) score += 2;
    else if (w.windSpeed > 30) score += 1;
  }

  if (score >= 6) return { level: 'high', label: 'High Risk', detail: 'Challenging conditions: long distance, steep terrain, or bad weather', color: '#ef4444' };
  if (score >= 3) return { level: 'moderate', label: 'Moderate Risk', detail: 'Some challenging sections — plan rest stops & check weather', color: '#f59e0b' };
  return { level: 'low', label: 'Low Risk', detail: 'Comfortable route with manageable conditions', color: '#22c55e' };
}
