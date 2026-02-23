/**
 * tripService.ts — Trip management API calls
 *
 * Endpoints (via API Gateway → localhost:9080):
 *   GET    /trips               → getTrips
 *   POST   /trips               → createTrip
 *   PUT    /trips/{id}          → updateTrip
 *   DELETE /trips/{id}          → deleteTrip
 *   GET    /trips/search?place= → searchTrips
 *
 * Backend requires X-User-Email header (injected by API Gateway from JWT).
 * All calls use Bearer token auth; gateway sets the header from claims.
 */

import { get, post, put, del } from './http';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TripRequest {
    tripName: string;
    tripDescription?: string;
    placeName: string;
    placeDescription?: string;
    placePhotos?: string[];
    startDate?: string;
    endDate?: string;
    status?: string;
}

export interface TripResponse {
    id: string;
    tripName: string;
    tripDescription?: string;
    placeName: string;
    placeDescription?: string;
    placePhotos?: string[];
    userEmail: string;
    startDate?: string;
    endDate?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

// ─── API Calls ────────────────────────────────────────────────────────────────

/** Get all trips for the authenticated user */
export async function getTrips(): Promise<TripResponse[]> {
    return get<TripResponse[]>('/api/trips', true);
}

/** Create a new trip */
export async function createTrip(payload: TripRequest): Promise<TripResponse> {
    return post<TripResponse>('/api/trips', payload, true);
}

/** Update an existing trip */
export async function updateTrip(id: string, payload: TripRequest): Promise<TripResponse> {
    return put<TripResponse>(`/api/trips/${id}`, payload, true);
}

/** Delete a trip by ID */
export async function deleteTrip(id: string): Promise<void> {
    return del<void>(`/api/trips/${id}`, true);
}

/** Search public trips by place name */
export async function searchTrips(place: string): Promise<TripResponse[]> {
    return get<TripResponse[]>(`/api/trips/search?place=${encodeURIComponent(place)}`, true);
}
