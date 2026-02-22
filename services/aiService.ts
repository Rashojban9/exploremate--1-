/**
 * aiService.ts — AI Suggestion API calls
 *
 * Endpoints (via API Gateway → localhost:9080):
 *   POST /api/ai/suggestion → askAiSuggestion
 *
 * Requires authentication (Bearer token).
 */

import { post } from './http';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AiSuggestionResponse {
    text: string;
    simulated: boolean;
}

// ─── API Calls ────────────────────────────────────────────────────────────────

/** Send a travel prompt and receive an AI-generated suggestion */
export async function askAiSuggestion(prompt: string): Promise<AiSuggestionResponse> {
    return post<AiSuggestionResponse>('/api/ai/suggestion', { prompt }, true);
}
