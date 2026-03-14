/**
 * groupTripService.ts — Group Trip management API calls
 *
 * Endpoints (via API Gateway → localhost:9080):
 *   POST   /api/group-trips                             → createGroupTrip
 *   GET    /api/group-trips                             → getGroupTrips
 *   GET    /api/group-trips/{id}                        → getGroupTripDetail
 *   PUT    /api/group-trips/{id}                        → updateGroupTrip
 *   DELETE /api/group-trips/{id}                        → deleteGroupTrip
 *   POST   /api/group-trips/join?code=                  → joinByInviteCode
 *   GET    /api/group-trips/{id}/members                → getMembers
 *   POST   /api/group-trips/{id}/members                → addMember
 *   DELETE /api/group-trips/{id}/members/{email}         → removeMember
 *   GET    /api/group-trips/{id}/activities              → getActivities
 *   POST   /api/group-trips/{id}/activities              → proposeActivity
 *   POST   /api/group-trips/{id}/activities/{aId}/vote   → voteActivity
 *   PUT    /api/group-trips/{id}/activities/{aId}/confirm→ confirmActivity
 *   DELETE /api/group-trips/{id}/activities/{aId}        → deleteActivity
 *   GET    /api/group-trips/{id}/messages                → getMessages
 *   POST   /api/group-trips/{id}/messages                → sendMessage
 *   GET    /api/group-trips/{id}/expenses                → getExpenses
 *   POST   /api/group-trips/{id}/expenses                → addExpense
 *   GET    /api/group-trips/{id}/budget                  → getBudgetSummary
 */

import { get, post, put, del } from './http';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GroupTripRequest {
    tripName: string;
    destination: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    coverImage?: string;
}

export interface GroupTripResponse {
    id: string;
    tripName: string;
    destination: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    creatorEmail: string;
    inviteCode: string;
    coverImage?: string;
    memberCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface GroupTripMemberRequest {
    userEmail: string;
    displayName?: string;
    avatarUrl?: string;
}

export interface GroupTripMemberResponse {
    id: string;
    groupTripId: string;
    userEmail: string;
    displayName: string;
    avatarUrl?: string;
    role: string;
    joinedAt: string;
}

export interface GroupTripActivityRequest {
    title: string;
    description?: string;
    scheduledTime?: string;
    price?: number;
    imageUrl?: string;
}

export interface GroupTripActivityResponse {
    id: string;
    groupTripId: string;
    title: string;
    description?: string;
    scheduledTime?: string;
    price: number;
    imageUrl?: string;
    status: string;
    proposedByEmail: string;
    votedByEmails: string[];
    voteCount: number;
    createdAt: string;
}

export interface GroupTripMessageRequest {
    text: string;
    senderName?: string;
}

export interface GroupTripMessageResponse {
    id: string;
    groupTripId: string;
    senderEmail: string;
    senderName: string;
    text: string;
    sentAt: string;
}

export interface GroupTripExpenseRequest {
    title: string;
    amount: number;
    splitAmongEmails?: string[];
}

export interface GroupTripExpenseResponse {
    id: string;
    groupTripId: string;
    title: string;
    amount: number;
    paidByEmail: string;
    splitAmongEmails: string[];
    createdAt: string;
}

export interface BudgetSummary {
    totalCost: number;
    memberCount: number;
    perPersonCost: number;
}

export interface GroupTripDetailResponse {
    trip: GroupTripResponse;
    members: GroupTripMemberResponse[];
    activities: GroupTripActivityResponse[];
    budget: BudgetSummary;
}

// ─── Group Trip CRUD ──────────────────────────────────────────────────────────

export async function createGroupTrip(payload: GroupTripRequest): Promise<GroupTripResponse> {
    return post<GroupTripResponse>('/api/group-trips', payload, true);
}

export async function getGroupTrips(): Promise<GroupTripResponse[]> {
    return get<GroupTripResponse[]>('/api/group-trips', true);
}

export async function getGroupTripDetail(tripId: string): Promise<GroupTripDetailResponse> {
    return get<GroupTripDetailResponse>(`/api/group-trips/${tripId}`, true);
}

export async function updateGroupTrip(tripId: string, payload: GroupTripRequest): Promise<GroupTripResponse> {
    return put<GroupTripResponse>(`/api/group-trips/${tripId}`, payload, true);
}

export async function deleteGroupTrip(tripId: string): Promise<void> {
    return del<void>(`/api/group-trips/${tripId}`, true);
}

// ─── Join ─────────────────────────────────────────────────────────────────────

export async function joinByInviteCode(code: string, displayName?: string, avatarUrl?: string): Promise<GroupTripResponse> {
    const params = new URLSearchParams({ code });
    if (displayName) params.set('displayName', displayName);
    if (avatarUrl) params.set('avatarUrl', avatarUrl);
    return post<GroupTripResponse>(`/api/group-trips/join?${params.toString()}`, {}, true);
}

// ─── Members ──────────────────────────────────────────────────────────────────

export async function getMembers(tripId: string): Promise<GroupTripMemberResponse[]> {
    return get<GroupTripMemberResponse[]>(`/api/group-trips/${tripId}/members`, true);
}

export async function addMember(tripId: string, payload: GroupTripMemberRequest): Promise<GroupTripMemberResponse> {
    return post<GroupTripMemberResponse>(`/api/group-trips/${tripId}/members`, payload, true);
}

export async function removeMember(tripId: string, memberEmail: string): Promise<void> {
    return del<void>(`/api/group-trips/${tripId}/members/${encodeURIComponent(memberEmail)}`, true);
}

// ─── Activities ───────────────────────────────────────────────────────────────

export async function getActivities(tripId: string): Promise<GroupTripActivityResponse[]> {
    return get<GroupTripActivityResponse[]>(`/api/group-trips/${tripId}/activities`, true);
}

export async function proposeActivity(tripId: string, payload: GroupTripActivityRequest): Promise<GroupTripActivityResponse> {
    return post<GroupTripActivityResponse>(`/api/group-trips/${tripId}/activities`, payload, true);
}

export async function voteActivity(tripId: string, activityId: string): Promise<GroupTripActivityResponse> {
    return post<GroupTripActivityResponse>(`/api/group-trips/${tripId}/activities/${activityId}/vote`, {}, true);
}

export async function confirmActivity(tripId: string, activityId: string): Promise<GroupTripActivityResponse> {
    return put<GroupTripActivityResponse>(`/api/group-trips/${tripId}/activities/${activityId}/confirm`, {}, true);
}

export async function deleteActivity(tripId: string, activityId: string): Promise<void> {
    return del<void>(`/api/group-trips/${tripId}/activities/${activityId}`, true);
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export async function getMessages(tripId: string): Promise<GroupTripMessageResponse[]> {
    return get<GroupTripMessageResponse[]>(`/api/group-trips/${tripId}/messages`, true);
}

export async function sendMessage(tripId: string, payload: GroupTripMessageRequest): Promise<GroupTripMessageResponse> {
    return post<GroupTripMessageResponse>(`/api/group-trips/${tripId}/messages`, payload, true);
}

// ─── Expenses & Budget ────────────────────────────────────────────────────────

export async function getExpenses(tripId: string): Promise<GroupTripExpenseResponse[]> {
    return get<GroupTripExpenseResponse[]>(`/api/group-trips/${tripId}/expenses`, true);
}

export async function addExpense(tripId: string, payload: GroupTripExpenseRequest): Promise<GroupTripExpenseResponse> {
    return post<GroupTripExpenseResponse>(`/api/group-trips/${tripId}/expenses`, payload, true);
}

export async function getBudgetSummary(tripId: string): Promise<BudgetSummary> {
    return get<BudgetSummary>(`/api/group-trips/${tripId}/budget`, true);
}
