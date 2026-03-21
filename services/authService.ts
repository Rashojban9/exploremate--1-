/**
 * authService.ts — Authentication & Profile API calls
 *
 * Endpoints (via API Gateway → localhost:9080/auth):
 *   POST /auth/login        → login
 *   POST /auth/register     → register
 *   GET  /auth/me           → getCurrentUser
 *   GET  /auth/profile      → getProfile
 *   PUT  /auth/profile      → updateProfile
 */

import { post, get, put } from './http';
import { saveToken, saveUser, clearSession, getStoredSession, type StoredUser, type StoredSession } from './storageService';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    name: string;
    email: string;
    password: string;
}

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

export interface ProfileResponse {
    id?: string;
    numericId?: number;
    email: string;
    name: string;
    role: string;
    phoneNumber?: string;
    profilePicture?: string;
    bio?: string;
    title?: string;
    location?: string;
    dateOfBirth?: string;
    interests?: string[];
    budget?: number;
    travelStyle?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ProfileUpdatePayload {
    name?: string;
    email?: string;
    phoneNumber?: string;
    profilePicture?: string;
    bio?: string;
    title?: string;
    location?: string;
    dateOfBirth?: string;
    interests?: string[];
    budget?: number;
    travelStyle?: string;
}

// The shape returned by backend's getCurrentUser (wrapped in Response utility)
interface BackendMeResponse {
    data?: CurrentUserResponse;
    userId?: number;
    name?: string;
    email?: string;
    role?: string;
}

// ─── Session Helpers (re-exported for App.tsx backward compat) ────────────────

export { clearSession, getStoredSession };
export type { StoredUser, StoredSession };

// ─── Internal: persist login response ─────────────────────────────────────────

function persistAuth(auth: AuthResponse): void {
    saveToken(auth.token);
    saveUser({
        id: auth.userId,
        name: auth.name,
        email: auth.email,
        role: auth.role,
    });
}

// ─── Auth Calls ───────────────────────────────────────────────────────────────

/** Internal: unpack data from potential ApiResponse wrapper */
function unpack<T>(res: any): T {
    if (!res) return {} as T;
    if (res.data !== undefined) return res.data as T;
    return res as T;
}

/** Login with email + password. Automatically persists token & user. */
export async function login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await post<any>('/api/auth/login', payload);
    const data = unpack<AuthResponse>(res);
    if (data && data.token) persistAuth(data);
    return data;
}

/** Register new account. Automatically persists token & user. */
export async function register(payload: RegisterPayload): Promise<AuthResponse> {
    const res = await post<any>('/api/auth/register', payload);
    const data = unpack<AuthResponse>(res);
    if (data && data.token) persistAuth(data);
    return data;
}

/** Get current authenticated user from server (validates token). */
export async function getCurrentUser(): Promise<CurrentUserResponse> {
    const res = await get<any>('/api/auth/me', true);
    return unpack<CurrentUserResponse>(res);
}

/** Get full profile of authenticated user */
export async function getProfile(): Promise<ProfileResponse> {
    const res = await get<any>('/api/auth/profile', true);
    return unpack<ProfileResponse>(res);
}

/** Update profile fields */
export async function updateProfile(payload: ProfileUpdatePayload): Promise<ProfileResponse> {
    const res = await put<any>('/api/auth/profile', payload, true);
    const data = unpack<ProfileResponse>(res);

    // Sync local storage if name or email changed
    const current = getStoredSession();
    if (current && (data.name || data.email)) {
        saveUser({
            ...current.user,
            name: data.name ?? current.user.name,
            email: data.email ?? current.user.email,
        });
    }

    return data;
}

/** Logout — clears local session */
export function logout(): void {
    clearSession();
}

/** Request password reset email */
export async function forgotPassword(email: string): Promise<void> {
    await post<any>('/api/auth/forgot-password', { email });
}

/** Reset password with token */
export async function resetPassword(token: string, newPassword: string): Promise<void> {
    await post<any>('/api/auth/reset-password', { token, newPassword });
}

/** Change password for authenticated users */
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await put<any>('/api/auth/profile/password', { currentPassword, newPassword }, true);
}

/** Admin: Get all users */
export async function getAllUsers(): Promise<ProfileResponse[]> {
    const res = await get<any>('/api/auth/admin/users', true);
    return unpack<ProfileResponse[]>(res);
}
