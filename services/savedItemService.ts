/**
 * savedItemService.ts — Saved Items API calls
 *
 * Endpoints (via API Gateway → localhost:9080):
 *   GET    /saved       → getSavedItems
 *   POST   /saved       → createSavedItem
 *   DELETE /saved/{id}  → deleteSavedItem
 *
 * type values: "DESTINATION" | "ITINERARY" | "ARTICLE"
 */

import { get, post, del } from './http';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SavedItemType = 'DESTINATION' | 'ITINERARY' | 'ARTICLE';

export interface SavedItemRequest {
    type: SavedItemType;
    title: string;
    location?: string;
    imageUrl?: string;
    description?: string;
}

export interface SavedItemResponse {
    id: number;
    type: SavedItemType;
    title: string;
    location?: string;
    imageUrl?: string;
    description?: string;
    dateAdded: string;
}

// ─── API Calls ────────────────────────────────────────────────────────────────

/** Get all saved items for the authenticated user */
export async function getSavedItems(): Promise<SavedItemResponse[]> {
    return get<SavedItemResponse[]>('/api/saved', true);
}

/** Save a new item */
export async function createSavedItem(payload: SavedItemRequest): Promise<SavedItemResponse> {
    return post<SavedItemResponse>('/api/saved', payload, true);
}

/** Delete a saved item by ID */
export async function deleteSavedItem(id: number | string): Promise<void> {
    return del<void>(`/api/saved/${id}`, true);
}
