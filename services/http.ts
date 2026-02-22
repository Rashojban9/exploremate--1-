/**
 * http.ts — Base HTTP client for ExploreMate
 *
 * All service modules import { get, post, put, del } from './http'
 * - Reads VITE_API_BASE_URL from Vite env (empty = Vite proxy handles /api)
 * - Automatically attaches Bearer token for authenticated requests
 * - Throws ApiError with server message on non-2xx responses
 * - Auto-clears session on 401
 */

import { getToken, clearSession } from './storageService';

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

// ─── Typed Error ──────────────────────────────────────────────────────────────

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// ─── Internal Request ─────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  init: RequestInit = {},
  requiresAuth = false,
): Promise<T> {
  const headers = new Headers(init.headers ?? {});

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (requiresAuth) {
    const token = getToken();
    if (!token) throw new ApiError('Authentication required. Please log in.', 401);
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = API_BASE ? `${API_BASE}${path}` : path;
  const response = await fetch(url, { ...init, headers });

  if (!response.ok) {
    if (response.status === 401) {
      clearSession();
    }

    let message = 'Request failed';
    try {
      const body = await response.json();
      message = body.message ?? body.error ?? body.msg ?? message;
    } catch { /* ignore json parse errors */ }

    throw new ApiError(message, response.status);
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

// ─── Public Methods ───────────────────────────────────────────────────────────

export function get<T>(path: string, requiresAuth = false): Promise<T> {
  return request<T>(path, { method: 'GET' }, requiresAuth);
}

export function post<T>(path: string, body: unknown, requiresAuth = false): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) }, requiresAuth);
}

export function put<T>(path: string, body: unknown, requiresAuth = false): Promise<T> {
  return request<T>(path, { method: 'PUT', body: JSON.stringify(body) }, requiresAuth);
}

export function del<T>(path: string, requiresAuth = false): Promise<T> {
  return request<T>(path, { method: 'DELETE' }, requiresAuth);
}
