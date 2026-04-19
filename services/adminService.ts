/**
 * adminService.ts — Admin-specific API calls
 *
 * Endpoints (via API Gateway → localhost:9080):
 *   GET    /api/auth/admin/stats          → getAdminStats
 *   PUT    /api/auth/admin/users/:id      → updateUser
 *   DELETE /api/auth/admin/users/:id      → deleteUser
 *   POST   /api/content/admin/pages       → createPage
 *   DELETE /api/content/admin/pages/:slug → deletePage
 *   GET    /api/content/admin/stats       → getContentStats
 */

import { get, put, del, post } from './http';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminStats {
  totalUsers: number;
  adminCount: number;
  userCount: number;
  enabledCount: number;
  lockedCount: number;
}

export interface ContentStats {
  totalPages: number;
  publishedCount: number;
  draftCount: number;
}

export interface AdminUserUpdatePayload {
  role?: string;
  enabled?: boolean;
  locked?: boolean;
}

// ─── Auth Admin Endpoints ─────────────────────────────────────────────────────

/** Unpack data from the ApiResponse wrapper used by auth-service */
function unpack<T>(res: any): T {
  if (!res) return {} as T;
  if (res.data !== undefined) return res.data as T;
  return res as T;
}

/** Get admin dashboard stats (user counts) */
export async function getAdminStats(): Promise<AdminStats> {
  const res = await get<any>('/api/auth/admin/stats', true);
  return unpack<AdminStats>(res);
}

/** Update user role / enabled / locked */
export async function updateUser(id: string, payload: AdminUserUpdatePayload): Promise<any> {
  const res = await put<any>(`/api/auth/admin/users/${id}`, payload, true);
  return unpack<any>(res);
}

/** Delete a user by ID */
export async function deleteUser(id: string): Promise<void> {
  await del<any>(`/api/auth/admin/users/${id}`, true);
}

// ─── Content Admin Endpoints ──────────────────────────────────────────────────

export interface MediaItem {
  id?: string;
  name: string;
  url: string;
  type: string;
  sizeLabel: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Get content stats (page counts) */
export async function getContentStats(): Promise<ContentStats> {
  return await get<ContentStats>('/api/content/admin/stats', true);
}

/** Create a new content page */
export async function createPage(data: {
  slug: string;
  title: string;
  contentBlocks?: Record<string, string>;
  status?: string;
}): Promise<any> {
  return await post<any>('/api/content/admin/pages', data, true);
}

/** Delete a content page */
export async function deletePage(slug: string): Promise<void> {
  await del<any>(`/api/content/admin/pages/${slug}`, true);
}

// ─── Media Admin Endpoints ────────────────────────────────────────────────────

export async function getAllMedia(): Promise<MediaItem[]> {
  return await get<MediaItem[]>('/api/content/admin/media', true);
}

export async function addMedia(data: MediaItem): Promise<MediaItem> {
  return await post<MediaItem>('/api/content/admin/media', data, true);
}

export async function updateMedia(id: string, data: Partial<MediaItem>): Promise<MediaItem> {
  return await put<MediaItem>(`/api/content/admin/media/${id}`, data, true);
}

export async function deleteMedia(id: string): Promise<void> {
  await del<void>(`/api/content/admin/media/${id}`, true);
}

