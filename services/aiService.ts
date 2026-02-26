/**
 * aiService.ts — AI Suggestion API calls
 *
 * Endpoints (via API Gateway → localhost:9080):
 *   POST /api/ai/suggestion → askAiSuggestion
 *   GET  /api/ai/history/{sessionId} → getChatHistory
 *   POST /api/ai/clear → clearChatHistory
 *
 * Requires authentication (Bearer token).
 */

import { post, get } from './http';
import { getUser } from './storageService';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AiSuggestionResponse {
    text: string;
    simulated: boolean;
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

// ─── Session Management ────────────────────────────────────────────────────────

// Generate or get session ID from localStorage (user-specific)
export function getSessionId(): string {
    const SESSION_KEY = 'exploremate_ai_session';
    const user = getUser();
    const userPrefix = user ? `user_${user.id}_` : 'guest_';
    let sessionId = localStorage.getItem(SESSION_KEY);
    
    // Check if session exists and belongs to current user
    if (sessionId && !sessionId.startsWith(userPrefix)) {
        // Different user - clear old session
        localStorage.removeItem(SESSION_KEY);
        sessionId = null;
    }
    
    if (!sessionId) {
        sessionId = userPrefix + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
}

// Clear session (start new conversation)
export function clearSession(): void {
    localStorage.removeItem('exploremate_ai_session');
}

// ─── API Calls ────────────────────────────────────────────────────────────────

/** Send a travel prompt and receive an AI-generated suggestion */
export async function askAiSuggestion(prompt: string, sessionId?: string): Promise<AiSuggestionResponse> {
    const sid = sessionId || getSessionId();
    return post<AiSuggestionResponse>('/api/ai/suggestion', { 
        prompt,
        sessionId: sid
    }, true);
}

/** Get chat history for a session */
export async function getChatHistory(sessionId?: string): Promise<ChatMessage[]> {
    const sid = sessionId || getSessionId();
    return get<ChatMessage[]>(`/api/ai/history/${sid}`, true);
}

/** Clear chat history */
export async function clearChatHistory(sessionId?: string): Promise<void> {
    const sid = sessionId || getSessionId();
    return post<void>('/api/ai/clear', { sessionId: sid }, true);
}

/** Get all conversations */
export async function getConversations(): Promise<any[]> {
    return get<any[]>('/api/ai/conversations', true);
}
