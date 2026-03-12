
/**
 * translationAiService.ts — Controller for the Neural AI Worker
 */

export interface AiProgress {
    status: string;
    file: string;
    progress: number;
    loaded: number;
    total: number;
}

class TranslationAiService {
    private worker: Worker | null = null;
    private resolveTranslation: ((value: string) => void) | null = null;
    private rejectTranslation: ((reason: any) => void) | null = null;
    private onProgress: ((progress: AiProgress) => void) | null = null;
    private isReady = false;

    constructor() {
        // Initialize worker if needed, but we'll do it on demand or early load
    }

    private initWorker() {
        if (this.worker) return;

        // Note: Vite handles new Worker(new URL(...)) for bundling
        this.worker = new Worker(new URL('./translationWorker.ts', import.meta.url), {
            type: 'module'
        });

        this.worker.addEventListener('message', (event) => {
            const { status, output, error, ...progressData } = event.data;

            if (status === 'progress' && this.onProgress) {
                this.onProgress(progressData as AiProgress);
            } else if (status === 'complete') {
                this.isReady = true;
                if (this.resolveTranslation) {
                    this.resolveTranslation(output);
                    this.resolveTranslation = null;
                    this.rejectTranslation = null;
                }
            } else if (status === 'error') {
                if (this.rejectTranslation) {
                    this.rejectTranslation(error);
                    this.resolveTranslation = null;
                    this.rejectTranslation = null;
                }
            }
        });
    }

    public setProgressListener(callback: (progress: AiProgress) => void) {
        this.onProgress = callback;
    }

    public async translate(text: string, sourceLang: string, targetLang: string): Promise<string> {
        this.initWorker();
        
        return new Promise((resolve, reject) => {
            this.resolveTranslation = resolve;
            this.rejectTranslation = reject;
            this.worker?.postMessage({ text, sourceLang, targetLang });
        });
    }

    public getIsReady() {
        return this.isReady;
    }
}

export const aiTranslationService = new TranslationAiService();
