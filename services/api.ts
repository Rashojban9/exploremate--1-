export interface AuthResponse {
  token: string;
  userId: number;
  name: string;
  email: string;
  role: string;
}

export interface CurrentUserResponse {
  userId: number;
  name: string;
  email: string;
  role: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface StoredSession {
  token: string;
  user: AuthUser;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export type ApiTripStatus = "UPCOMING" | "DRAFT" | "PAST";

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

export interface CreateTripPayload {
  title: string;
  location: string;
  startDate?: string;
  endDate?: string;
  status: ApiTripStatus;
  imageUrl?: string;
}

export type ApiSavedItemType = "DESTINATION" | "ITINERARY" | "ARTICLE";

export interface ApiSavedItem {
  id: number;
  type: ApiSavedItemType;
  title: string;
  location: string | null;
  imageUrl: string | null;
  description: string | null;
  dateAdded: string;
}

export interface CreateSavedItemPayload {
  type: ApiSavedItemType;
  title: string;
  location?: string;
  imageUrl?: string;
  description?: string;
}

export interface AiSuggestionResponse {
  text: string;
  simulated: boolean;
}

const TOKEN_STORAGE_KEY = "exploremate_token";
const USER_STORAGE_KEY = "exploremate_user";
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

function buildUrl(path: string): string {
  return API_BASE_URL ? `${API_BASE_URL}${path}` : path;
}

function getToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

async function request<T>(path: string, init: RequestInit = {}, includeAuth = false): Promise<T> {
  const headers = new Headers(init.headers ?? {});
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (includeAuth) {
    const token = getToken();
    if (!token) {
      throw new Error("You need to log in first.");
    }
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path), { ...init, headers });
  if (!response.ok) {
    if (response.status === 401) {
      clearSession();
    }

    let message = "Request failed";
    try {
      const body = await response.json();
      message = body.message ?? body.error ?? message;
    } catch {
      // Ignore JSON parse errors for non-JSON responses.
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  const response = await request<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  persistSession(response);
  return response;
}

export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  const response = await request<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  persistSession(response);
  return response;
}

export async function getCurrentUser(): Promise<CurrentUserResponse> {
  return request<CurrentUserResponse>("/api/auth/me", undefined, true);
}

export async function listTrips(): Promise<ApiTrip[]> {
  return request<ApiTrip[]>("/api/trips", undefined, true);
}

export async function createTrip(payload: CreateTripPayload): Promise<ApiTrip> {
  return request<ApiTrip>(
    "/api/trips",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    true
  );
}

export async function deleteTrip(tripId: number): Promise<void> {
  return request<void>(`/api/trips/${tripId}`, { method: "DELETE" }, true);
}

export async function listSavedItems(): Promise<ApiSavedItem[]> {
  return request<ApiSavedItem[]>("/api/saved", undefined, true);
}

export async function createSavedItem(payload: CreateSavedItemPayload): Promise<ApiSavedItem> {
  return request<ApiSavedItem>(
    "/api/saved",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    true
  );
}

export async function deleteSavedItem(itemId: number): Promise<void> {
  return request<void>(`/api/saved/${itemId}`, { method: "DELETE" }, true);
}

export async function askAiSuggestion(prompt: string): Promise<AiSuggestionResponse> {
  return request<AiSuggestionResponse>(
    "/api/ai/suggestion",
    {
      method: "POST",
      body: JSON.stringify({ prompt }),
    },
    true
  );
}

export function persistSession(auth: AuthResponse): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, auth.token);
  localStorage.setItem(
    USER_STORAGE_KEY,
    JSON.stringify({
      id: auth.userId,
      name: auth.name,
      email: auth.email,
      role: auth.role,
    } satisfies AuthUser)
  );
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

export function getStoredSession(): StoredSession | null {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const rawUser = localStorage.getItem(USER_STORAGE_KEY);
  if (!token || !rawUser) {
    if (token || rawUser) {
      clearSession();
    }
    return null;
  }

  try {
    const user = JSON.parse(rawUser) as AuthUser;
    if (!user?.email) {
      clearSession();
      return null;
    }
    return { token, user };
  } catch {
    clearSession();
    return null;
  }
}
