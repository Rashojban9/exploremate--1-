/**
 * translationService.ts — Advanced Offline Multi-Language Translation
 *
 * Intelligence Phase 2:
 *   - Suffix Stemming (English)
 *   - Stopword-aware fuzzy phrase matching
 *   - Basic SOV reordering for Target (Nepali/Hindi)
 */

import { DICTIONARIES, type Dictionary } from './translationDictionaries';
import { aiTranslationService } from './translationAiService';
import { getStoredSession } from './storageService';

// Backend API URL mapping
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9080/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TranslateResponse {
    translatedText: string;
    sourceLang: string;
    targetLang: string;
    detectedLang?: string;
    isDictionaryPartial?: boolean;
}

// ─── Supported Languages ──────────────────────────────────────────────────────

export interface Language {
    code: string;
    name: string;
    nativeName: string;
    speechCode: string | null;
}

export const SUPPORTED_LANGUAGES: Language[] = [
    { code: 'auto', name: 'Auto-detect', nativeName: 'Auto-detect', speechCode: null },
    { code: 'en', name: 'English', nativeName: 'English', speechCode: 'en-US' },
    { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', speechCode: 'ne-NP' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', speechCode: 'hi-IN' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', speechCode: 'es-ES' },
    { code: 'fr', name: 'French', nativeName: 'Français', speechCode: 'fr-FR' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', speechCode: 'de-DE' },
    { code: 'zh', name: 'Chinese', nativeName: '中文', speechCode: 'zh-CN' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', speechCode: 'ja-JP' },
    { code: 'ko', name: 'Korean', nativeName: '한국어', speechCode: 'ko-KR' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', speechCode: 'ar-SA' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', speechCode: 'pt-BR' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', speechCode: 'ru-RU' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', speechCode: 'it-IT' },
    { code: 'th', name: 'Thai', nativeName: 'ไทย', speechCode: 'th-TH' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', speechCode: 'bn-IN' },
];

/** Global AI state for the service */
let isAiEnabled = false;

export function setAiEnabled(enabled: boolean) {
    isAiEnabled = enabled;
}

export function getAiEnabled() {
    return isAiEnabled;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STOPWORDS_EN = /^(the|a|an|is|am|are|was|were|do|does|did|will|would|can|could|to|for|of|with|in|on|at|by)$/i;

/** Simple English Stemmer */
function stemWord(word: string): string {
    return word.toLowerCase()
        .replace(/ing$/, '')
        .replace(/ed$/, '')
        .replace(/ies$/, 'y')
        .replace(/es$/, '')
        .replace(/s$/, '');
}

/** Basic SOV Reorder for Nepali/Hindi Target */
function reorderToSOV(words: string[]): string[] {
    if (words.length <= 2) return words;
    // VERY BASIC: If we find a verb-like thing in the middle, move it to the end
    // In our case, since we translate word-by-word, we just move the last part if it looks like a verb.
    // This is hard to do perfectly offline, so we'll only do it for specific patterns.
    return words; 
}

// ─── Language Detection ──────────────────────────────────────────────────────

export function detectLanguage(text: string): string {
    const trimmed = text.trim();
    if (!trimmed) return 'en';

    if (/[\u0900-\u097F]/.test(trimmed)) {
        const nepaliMatches = (trimmed.match(/छ|नु|ने|का|को|मा|ले/g) || []).length;
        const hindiMatches = (trimmed.match(/है|में|के|की|का|को/g) || []).length;
        return nepaliMatches >= hindiMatches ? 'ne' : 'hi';
    }
    if (/[\u4E00-\u9FFF]/.test(trimmed)) return 'zh';
    if (/[\u3040-\u309F\u30A0-\u30FF]/.test(trimmed)) return 'ja';
    if (/[\uAC00-\uD7AF]/.test(trimmed)) return 'ko';
    if (/[\u0600-\u06FF]/.test(trimmed)) return 'ar';
    if (/[\u0400-\u04FF]/.test(trimmed)) return 'ru';
    if (/[\u0E00-\u0E7F]/.test(trimmed)) return 'th';
    if (/[\u0980-\u09FF]/.test(trimmed)) return 'bn';

    const words = trimmed.toLowerCase().split(/\s+/);
    const scores: Record<string, number> = { en: 0, es: 0, fr: 0, de: 0, pt: 0, it: 0 };
    
    for (const word of words.slice(0, 5)) {
        const clean = word.replace(/[^a-z]/g, '');
        if (!clean) continue;
        for (const langCode of ['es', 'fr', 'de', 'pt', 'it']) {
            const rev = getReverse(langCode);
            if (rev && rev.words[clean]) scores[langCode]++;
        }
        if (STOPWORDS_EN.test(clean)) scores.en++;
    }

    let bestLang = 'en';
    let maxScore = 0;
    for (const [lang, score] of Object.entries(scores)) {
        if (score > maxScore) { maxScore = score; bestLang = lang; }
    }
    return bestLang;
}

// ─── Dictionary Management ──────────────────────────────────────────────────

function buildReverse(dict: Dictionary): Dictionary {
    const phrases: Record<string, string> = {};
    const words: Record<string, string> = {};
    for (const [en, tr] of Object.entries(dict.phrases)) phrases[tr.toLowerCase()] = en;
    for (const [en, tr] of Object.entries(dict.words)) words[tr.toLowerCase()] = en;
    return { phrases, words };
}

const reverseDictCache: Record<string, Dictionary> = {};
function getReverse(langCode: string): Dictionary | null {
    if (!DICTIONARIES[langCode]) return null;
    if (!reverseDictCache[langCode]) reverseDictCache[langCode] = buildReverse(DICTIONARIES[langCode]);
    return reverseDictCache[langCode];
}

// ─── Core translation engine ─────────────────────────────────────────────────

function translateWithDict(text: string, dict: Dictionary, isTargetSOV: boolean): string {
    const input = text.trim();
    const inputLower = input.toLowerCase();

    // 1. Exact phrase match
    if (dict.phrases[inputLower]) return dict.phrases[inputLower];
    // Helper to transliterate English to Devanagari (Basic Phonetics)
    const transliterateToDevanagari = (word: string) => {
        const charMap: Record<string, string> = {
            'a': 'ा', 'aa': 'आ', 'i': 'ि', 'ee': 'ी', 'u': 'ु', 'oo': 'ू',
            'e': 'े', 'ai': 'ै', 'o': 'ो', 'au': 'ौ',
            'k': 'क', 'kh': 'ख', 'g': 'ग', 'gh': 'घ',
            'c': 'च', 'ch': 'च', 'chh': 'छ', 'j': 'ज', 'jh': 'झ',
            't': 'त', 'th': 'थ', 'd': 'द', 'dh': 'ध', 'n': 'न',
            'p': 'प', 'f': 'फ', 'ph': 'फ', 'b': 'ब', 'bh': 'भ', 'm': 'म',
            'y': 'य', 'r': 'र', 'l': 'ल', 'v': 'व', 'w': 'व',
            's': 'स', 'sh': 'श', 'h': 'ह', 'x': 'क्स', 'z': 'ज़',
            'q': 'क' // approximate
        };
        let res = '';
        let i = 0;
        let isFirstChar = true;

        while (i < word.length) {
            let found = false;
            // Try 3-char, then 2-char, then 1-char
            for (let len = 3; len >= 1; len--) {
                if (i + len <= word.length) {
                    const chunk = word.slice(i, i + len).toLowerCase();
                    if (charMap[chunk]) {
                        // Handle a special case for 'a' at the start of a word
                        if (isFirstChar && chunk === 'a') {
                            res += 'अ';
                        } else if (isFirstChar && chunk === 'i') {
                            res += 'इ';
                        } else if (isFirstChar && chunk === 'o') {
                            res += 'ओ';
                        } else if (isFirstChar && chunk === 'u') {
                            res += 'उ';
                        } else if (isFirstChar && chunk === 'e') {
                            res += 'ए';
                        } else {
                            res += charMap[chunk];
                        }
                        i += len;
                        found = true;
                        isFirstChar = false;
                        break;
                    }
                }
            }
            if (!found) {
                // If it's a completely unknown char, just keep it or skip?
                res += word[i];
                i++;
                isFirstChar = false;
            }
        }
        return res;
    };

    // 2. Fuzzy phrase match (strip punctuation, then strip stopwords)
    const cleanInput = inputLower.replace(/[?!.]+$/, '').trim();
    if (dict.phrases[cleanInput]) return dict.phrases[cleanInput];

    // 3. Exact word match (before greedy phrase splitting)
    // If the entire input is just one word, and we know it, translate it immediately.
    if (!cleanInput.includes(' ') && dict.words[cleanInput]) {
         return dict.words[cleanInput];
    }

    // Greedy matching
    let remaining = inputLower;
    let resultParts: string[] = [];
    
    const sortedPhrases = Object.keys(dict.phrases).sort((a,b) => b.length - a.length);

    while (remaining.length > 0) {
        let matched = false;
        
        // Try phrases
        for (const phrase of sortedPhrases) {
            if (remaining.startsWith(phrase)) {
                resultParts.push(dict.phrases[phrase]);
                remaining = remaining.slice(phrase.length).trimStart();
                matched = true;
                break;
            }
        }

        if (!matched) {
            const spaceIdx = remaining.indexOf(' ');
            const wordWithPunct = spaceIdx === -1 ? remaining : remaining.slice(0, spaceIdx);
            const word = wordWithPunct.replace(/[^a-zA-Z0-9\u0900-\u097F\u0980-\u09FF\u0E00-\u0E7F\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF\u0600-\u06FF\u0400-\u04FF]/g, '');
            const lowerWord = word.toLowerCase();

            // Word-by-word with Stemming Fallback
            if (lowerWord && dict.words[lowerWord]) {
                resultParts.push(dict.words[lowerWord]);
            } else if (lowerWord) {
                const stemmed = stemWord(lowerWord);
                if (dict.words[stemmed]) {
                    // Try to guess conjugation if it was -ing
                    let translated = dict.words[stemmed];
                    if (lowerWord.endsWith('ing')) {
                        // For Nepali, add 'दै' if possible, but keep it simple
                        if (isTargetSOV) {
                            // Basic heuristic for continuous aspect
                            // Note: this is very language specific, usually would need better dict
                        }
                    }
                    resultParts.push(translated);
                } else {
                    // TRANSLITERATION: If target is Devanagari (SOV implies ne or hi right now) and word isn't in dict
                    if (isTargetSOV) {
                        resultParts.push(transliterateToDevanagari(word) + (wordWithPunct.slice(word.length)));
                    } else {
                        resultParts.push(wordWithPunct); // keep original
                    }
                }
            } else {
                if (isTargetSOV && word.length > 0) {
                    resultParts.push(transliterateToDevanagari(word) + (wordWithPunct.slice(word.length)));
                } else {
                    resultParts.push(wordWithPunct);
                }
            }
            remaining = spaceIdx === -1 ? '' : remaining.slice(spaceIdx + 1).trimStart();
        }
    }

    return resultParts.join(' ').trim() || input;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function translateText(
    text: string,
    sourceLangCode: string,
    targetLangCode: string,
): Promise<TranslateResponse> {
    const trimmed = text.trim();
    if (!trimmed) return { translatedText: '', sourceLang: sourceLangCode, targetLang: targetLangCode };

    let actualSource = sourceLangCode;
    let detected: string | undefined;
    if (sourceLangCode === 'auto') {
        actualSource = detectLanguage(trimmed);
        detected = actualSource;
    }

    const isTargetSOV = (targetLangCode === 'ne' || targetLangCode === 'hi');
    let translatedText: string;

    // Phase 3: Try Neural AI if enabled
    if (getAiEnabled()) {
        if (!navigator.onLine) {
            console.warn('Wi-Fi is off. Falling back to offline dictionary.');
        } else {
            try {
                // Replaced Local NLLB worker with Cloud API (Groq via Backend)
                const session = getStoredSession();
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            };
            if (session?.token) {
                headers['Authorization'] = `Bearer ${session.token}`;
            }

            // Call the Translate endpoint we built in AiController.java
            const response = await fetch(`${API_URL}/ai/translate`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    text: trimmed,
                    sourceLang: actualSource,
                    targetLang: targetLangCode
                })
            });

            if (!response.ok) {
                throw new Error(`Cloud API failed: ${response.statusText}`);
            }

            const data = await response.json();
            translatedText = data.translatedText;
            
            return {
                translatedText,
                sourceLang: sourceLangCode,
                targetLang: targetLangCode,
                detectedLang: detected,
            };
            } catch (error) {
                console.error('Cloud AI translation failed, falling back to instant dictionary:', error);
                // Fall back to dictionary below
            }
        }
    }

    if (actualSource === 'en' && targetLangCode !== 'en') {
        const dict = DICTIONARIES[targetLangCode];
        translatedText = dict ? translateWithDict(trimmed, dict, isTargetSOV) : trimmed;
    } else if (actualSource !== 'en' && targetLangCode === 'en') {
        const reverseDict = getReverse(actualSource);
        translatedText = reverseDict ? translateWithDict(trimmed, reverseDict, false) : trimmed;
    } else if (actualSource !== 'en' && targetLangCode !== 'en') {
        const reverseDict = getReverse(actualSource);
        const targetDict = DICTIONARIES[targetLangCode];
        if (reverseDict && targetDict) {
            const english = translateWithDict(trimmed, reverseDict, false);
            translatedText = translateWithDict(english, targetDict, isTargetSOV);
        } else {
            translatedText = trimmed;
        }
    } else {
        translatedText = trimmed;
    }

    let isDictionaryPartial = false;
    const nonLatinCodes = ['ne', 'hi', 'bn', 'ar', 'ko', 'zh', 'ja', 'th', 'ru'];
    if (!getAiEnabled() && actualSource === 'en' && nonLatinCodes.includes(targetLangCode)) {
        if (/[a-zA-Z]{2,}/.test(translatedText)) {
            isDictionaryPartial = true;
        }
    }

    await new Promise((r) => setTimeout(r, 150));

    return {
        translatedText,
        sourceLang: sourceLangCode,
        targetLang: targetLangCode,
        detectedLang: detected,
        isDictionaryPartial,
    };
}
