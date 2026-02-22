/**
 * storageService.ts — Centralized localStorage session management
 *
 * Single source of truth for token and user persistence.
 * Imported by http.ts (for token reads) and authService (for write/clear).
 */

export interface StoredUser {
    id: number;
    name: string;
    email: string;
    role: string;
}

export interface StoredSession {
    token: string;
    user: StoredUser;
}

const TOKEN_KEY = 'exploremate_token';
const USER_KEY = 'exploremate_user';

// ─── Token ────────────────────────────────────────────────────────────────────

export function saveToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
}

// ─── User ─────────────────────────────────────────────────────────────────────

export function saveUser(user: StoredUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser(): StoredUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
        const user = JSON.parse(raw) as StoredUser;
        return user?.email ? user : null;
    } catch {
        return null;
    }
}

export function removeUser(): void {
    localStorage.removeItem(USER_KEY);
}

// ─── Session ──────────────────────────────────────────────────────────────────

export function clearSession(): void {
    removeToken();
    removeUser();
}

export function getStoredSession(): StoredSession | null {
    const token = getToken();
    const user = getUser();

    if (!token || !user) {
        if (token || user) clearSession(); // partial state → clean up
        return null;
    }
    return { token, user };
}
