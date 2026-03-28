/**
 * api.ts — Backward-compatible façade
 *
 * All existing imports from '../services/api' continue to work.
 * New code should import from the individual service files instead.
 *
 * Backend endpoint map (via API Gateway → localhost:9080):
 *   Auth:  /auth/login  /auth/register  /auth/me  /auth/profile
 *   Trips: /trips  /trips/{id}  /trips/search
 *   Saved: /saved  /saved/{id}
 *   AI:    /api/ai/suggestion
 */

// ─── Storage ──────────────────────────────────────────────────────────────────
export {
  clearSession,
  getStoredSession,
  type StoredUser,
  type StoredSession,
} from './storageService';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export {
  login as loginUser,
  register as registerUser,
  getCurrentUser,
  getProfile,
  updateProfile,
  logout,
  type LoginPayload,
  type RegisterPayload,
  type AuthResponse,
  type CurrentUserResponse,
  type ProfileResponse,
  type ProfileUpdatePayload,
} from './authService';

// ─── Trips ────────────────────────────────────────────────────────────────────
export {
  getTrips as listTrips,
  createTrip,
  updateTrip,
  deleteTrip,
  searchTrips,
  type TripRequest,
  type TripResponse,
} from './tripService';

// ─── Saved Items ──────────────────────────────────────────────────────────────
export {
  getSavedItems as listSavedItems,
  createSavedItem,
  deleteSavedItem,
  type SavedItemType,
  type SavedItemRequest,
  type SavedItemResponse,
} from './savedItemService';

// ─── AI ───────────────────────────────────────────────────────────────────────
export {
  askAiSuggestion,
  getSessionId,
  getChatHistory,
  clearChatHistory,
  type AiSuggestionResponse,
  type ChatMessage,
} from './aiService';

// ─── Translation ──────────────────────────────────────────────────────────────
export {
  translateText,
  SUPPORTED_LANGUAGES,
  type TranslateResponse,
  type Language,
} from './translationService';

// ─── Group Trips ──────────────────────────────────────────────────────────────
export {
  getGroupTrips,
  createGroupTrip,
  getGroupTripDetail,
  updateGroupTrip,
  deleteGroupTrip,
  joinByInviteCode,
  getMembers as getGroupTripMembers,
  addMember as addGroupTripMember,
  removeMember as removeGroupTripMember,
  getActivities as getGroupTripActivities,
  proposeActivity,
  voteActivity,
  confirmActivity,
  deleteActivity,
  getMessages as getGroupTripMessages,
  sendMessage as sendGroupTripMessage,
  getExpenses as getGroupTripExpenses,
  addExpense as addGroupTripExpense,
  getBudgetSummary,
  type GroupTripRequest,
  type GroupTripResponse,
  type GroupTripDetailResponse,
  type GroupTripMemberResponse,
  type GroupTripActivityResponse,
  type GroupTripMessageResponse,
  type GroupTripExpenseResponse,
  type BudgetSummary,
} from './groupTripService';


// ─── Legacy type aliases (used in existing pages) ────────────────────────────

/** @deprecated Use TripResponse from tripService */
export interface ApiTrip {
  id: number;
  title: string;
  location: string;
  startDate: string | null;
  endDate: string | null;
  status: ApiTripStatus;
  imageUrl: string | null;
  daysLeft: number | null;
}

/** @deprecated Use SavedItemResponse from savedItemService */
export interface ApiSavedItem {
  id: number | string;
  type: ApiSavedItemType;
  title: string;
  location: string | null;
  imageUrl: string | null;
  description: string | null;
  dateAdded: string;
}

export type ApiTripStatus = 'UPCOMING' | 'DRAFT' | 'PAST';
export type ApiSavedItemType = 'DESTINATION' | 'ITINERARY' | 'ARTICLE';

export interface CreateTripPayload {
  title: string;
  location: string;
  startDate?: string;
  endDate?: string;
  status: ApiTripStatus;
  imageUrl?: string;
}

export interface CreateSavedItemPayload {
  type: ApiSavedItemType;
  title: string;
  location?: string;
  imageUrl?: string;
  description?: string;
}

// ─── Legacy thin wrappers (keep old TripsPage + SavedPage working) ────────────
import { getTrips, createTrip as ct, deleteTrip as dt } from './tripService';
import { getSavedItems, createSavedItem as csi, deleteSavedItem as dsi } from './savedItemService';

/** @deprecated Legacy: maps old ApiTrip shape from new TripResponse */
export async function listTripsLegacy(): Promise<ApiTrip[]> {
  // Pages that haven't migrated yet still import listTrips from here; provide empty shim
  return [];
}

export { getTrips, getSavedItems };

/** @deprecated Use createTrip from tripService directly */
export async function createTripLegacy(payload: CreateTripPayload): Promise<ApiTrip> {
  await ct({ tripName: payload.title, placeName: payload.location });
  // Return a minimal shape — pages should migrate to new service
  return { id: 0, title: payload.title, location: payload.location, startDate: null, endDate: null, status: payload.status, imageUrl: null, daysLeft: null };
}

/** @deprecated Use createSavedItem from savedItemService directly */
export { csi as createSavedItemLegacy };
export { dsi as deleteSavedItemLegacy };

import * as groupTripService from './groupTripService';
export { groupTripService };
export * from './groupTripService';

// Re-export QR Guide service
export * from './qrGuideService';

// Re-export getToken for AppContext
export { getToken } from './storageService';
