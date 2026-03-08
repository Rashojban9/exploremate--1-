/**
 * routingService.ts - Mapbox Routing Service for production-level route optimization
 * Uses Mapbox Directions API - 50,000 free requests/month
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
 * @param alternatives - Whether to include alternative routes (0-2)
 * @returns Route geometry and metadata
 */
export async function getRoute(
  waypoints: RoutePoint[],
  profile: 'driving-traffic' | 'driving' | 'cycling' | 'walking' = 'driving',
  alternatives: number = 0
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

  const url = `${MAPBOX_BASE_URL}/${profile}/${coordinates}?geometries=geojson&steps=true&alternatives=${alternatives}&access_token=${MAPBOX_TOKEN}`;

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

    // Add route names for alternative routes
    data.routes = data.routes.map((route, index) => ({
      ...route,
      routeName: index === 0 ? 'Fastest Route' : `Alternative ${index}`
    }));

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
 * @param alternatives - Number of alternative routes to return (0-2)
 * @returns Optimized route with re-ordered waypoints
 */
export async function getOptimizedRoute(
  waypoints: RoutePoint[],
  profile: 'driving-traffic' | 'driving' | 'cycling' | 'walking' = 'driving',
  alternatives: number = 0
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
  return getRoute(waypoints, profile, alternatives);
}

/**
 * Get turn-by-turn navigation instructions from route
 * @param route - The route to get instructions from
 * @returns Array of instructions with distance and duration
 */
export function getNavigationInstructions(route: MapboxRoute): RouteStep[] {
  if (!route.legs || route.legs.length === 0) {
    return [];
  }

  const instructions: RouteStep[] = [];
  
  for (const leg of route.legs) {
    if (leg.steps) {
      for (const step of leg.steps) {
        // Build instruction from maneuver type and modifier
        const maneuver = step.maneuver;
        let instruction = '';
        
        if (maneuver) {
          const modifier = maneuver.modifier ? `${maneuver.modifier} ` : '';
          const type = maneuver.type.replace(/([A-Z])/g, ' $1').trim(); // Add spaces before capitals
          instruction = `${modifier}${type}`.trim();
        }
        
        if (!instruction) {
          instruction = step.name || 'Continue';
        }

        instructions.push({
          distance: step.distance,
          duration: step.duration,
          instruction,
          name: step.name || '',
          maneuver: maneuver
        });
      }
    }
  }

  return instructions;
}

// Weather API - Using Open-Meteo (free, no API key required)
const WEATHER_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export interface WeatherData {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  humidity: number;
  description: string;
}

/**
 * Get weather along the route at multiple waypoints
 * @param waypoints - Array of route points
 * @returns Weather data for each waypoint
 */
export async function getWeatherAlongRoute(waypoints: RoutePoint[]): Promise<WeatherData[]> {
  try {
    // Get weather for each waypoint (limit to 5 to avoid too many API calls)
    const limitedWaypoints = waypoints.slice(0, 5);
    const weatherPromises = limitedWaypoints.map(async (wp) => {
      const url = `${WEATHER_BASE_URL}?latitude=${wp.lat}&longitude=${wp.lng}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m`;
      const response = await fetch(url);
      
      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return {
        temperature: data.current?.temperature_2m || 0,
        weatherCode: data.current?.weather_code || 0,
        windSpeed: data.current?.wind_speed_10m || 0,
        humidity: data.current?.relative_humidity_2m || 0,
        description: getWeatherDescription(data.current?.weather_code || 0)
      };
    });

    const weatherResults = await Promise.all(weatherPromises);
    return weatherResults.filter((w): w is WeatherData => w !== null);
  } catch (error) {
    console.error('Failed to fetch weather:', error);
    return [];
  }
}

/**
 * Convert weather code to description
 */
function getWeatherDescription(code: number): string {
  const weatherCodes: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
  };
  
  return weatherCodes[code] || 'Unknown';
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
