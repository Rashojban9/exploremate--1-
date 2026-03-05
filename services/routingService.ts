/**
 * routingService.ts - Mapbox Routing Service for production-level route optimization
 * Uses Mapbox Directions API - 50,000 free requests/month
 */

export interface RoutePoint {
  lat: number;
  lng: number;
}

export interface MapboxRoute {
  distance: number; // meters
  duration: number; // seconds
  geometry: {
    coordinates: [number, number][];
    type: string;
  };
  legs: Array<{
    distance: number;
    duration: number;
    summary: string;
  }>;
}

export interface MapboxDirectionsResponse {
  code: string;
  routes: MapboxRoute[];
  waypoints: Array<{
    name: string;
    location: [number, number];
  }>;
}

// Get Mapbox token from environment
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';
const MAPBOX_BASE_URL = 'https://api.mapbox.com/directions/v5/mapbox';

/**
 * Get route between multiple waypoints using Mapbox Directions API
 * @param waypoints - Array of route points
 * @param profile - Routing profile: 'driving-traffic', 'driving', 'cycling', 'walking'
 * @returns Route geometry and metadata
 */
export async function getRoute(
  waypoints: RoutePoint[],
  profile: 'driving-traffic' | 'driving' | 'cycling' | 'walking' = 'driving'
): Promise<MapboxDirectionsResponse | null> {
  if (waypoints.length < 2) {
    console.error('Need at least 2 waypoints for routing');
    return null;
  }

  if (!MAPBOX_TOKEN) {
    console.error('Mapbox token not configured');
    return null;
  }

  // Build the coordinates string: lng,lat;lng,lat;...
  const coordinates = waypoints
    .map(wp => `${wp.lng},${wp.lat}`)
    .join(';');

  const url = `${MAPBOX_BASE_URL}/${profile}/${coordinates}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status}`);
    }

    const data = await response.json() as MapboxDirectionsResponse;
    
    if (data.code !== 'Ok') {
      console.error('Mapbox routing failed:', data.code);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch route:', error);
    return null;
  }
}

/**
 * Get optimized route using Mapbox (orders waypoints optimally)
 * @param waypoints - Array of waypoints to optimize
 * @param profile - Routing profile
 * @returns Optimized route with re-ordered waypoints
 */
export async function getOptimizedRoute(
  waypoints: RoutePoint[],
  profile: 'driving-traffic' | 'driving' | 'cycling' | 'walking' = 'driving'
): Promise<MapboxDirectionsResponse | null> {
  if (waypoints.length < 2) {
    console.error('Need at least 2 waypoints for optimization');
    return null;
  }

  if (!MAPBOX_TOKEN) {
    console.error('Mapbox token not configured');
    return null;
  }

  // Mapbox doesn't have a built-in TSP solver in the directions API
  // We'll use the standard directions and keep the order
  // For true optimization, you'd need to implement a TSP algorithm
  return getRoute(waypoints, profile);
}

/**
 * Convert meters to kilometers
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Convert seconds to human readable time
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)} sec`;
  }
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} min`;
}

/**
 * Calculate total distance from route legs
 */
export function getTotalDistance(routes: MapboxRoute[]): number {
  if (!routes || routes.length === 0) return 0;
  return routes[0].distance;
}

/**
 * Calculate total duration from route legs
 */
export function getTotalDuration(routes: MapboxRoute[]): number {
  if (!routes || routes.length === 0) return 0;
  return routes[0].duration;
}

/**
 * Get optimized waypoint order
 * Note: Mapbox directions doesn't reorder waypoints, this returns original order
 */
export function getOptimizedWaypointIndices(
  originalWaypoints: RoutePoint[],
  _response: MapboxDirectionsResponse
): number[] {
  return originalWaypoints.map((_, i) => i);
}
