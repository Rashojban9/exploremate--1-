
import { pipeline, env } from '@xenova/transformers';

// Skip local check to download from Hugging Face Hub if not cached
env.allowLocalModels = false;
env.useBrowserCache = true;

class TranslationPipeline {
    static task = 'translation';
    // NLLB-200 distilled 600M is much better than M2M100 for Nepali/Hindi
    static model = 'Xenova/nllb-200-distilled-600M'; 
    static instance: any = null;

    static async getInstance(progress_callback?: any) {
        if (this.instance === null) {
            this.instance = await pipeline(this.task as any, this.model, { 
                progress_callback,
                quantized: true, // Use 8-bit quantization (~250MB)
            });
        }
        return this.instance;
    }
}

// Map of standard codes to NLLB codes
const NLLB_CODES: Record<string, string> = {
    'en': 'eng_Latn',
    'ne': 'nepi_Deva',
    'hi': 'hin_Deva',
    'es': 'spa_Latn',
    'fr': 'fra_Latn',
    'de': 'deu_Latn',
    'zh': 'zho_Hans',
    'ja': 'jpn_Jpan',
    'ko': 'kor_Hang',
    'ar': 'ara_Arab',
    'pt': 'por_Latn',
    'ru': 'rus_Cyrl',
    'it': 'ita_Latn',
    'th': 'tha_Thai',
    'bn': 'ben_Beng',
};

self.addEventListener('message', async (event) => {
    const { text, sourceLang, targetLang } = event.data;

    try {
        const translator = await TranslationPipeline.getInstance((x: any) => {
            self.postMessage({ status: 'progress', ...x });
        });

        const srcCode = NLLB_CODES[sourceLang] || 'eng_Latn';
        const tgtCode = NLLB_CODES[targetLang] || 'nepi_Deva';

        const output = await translator(text, {
            src_lang: srcCode,
            tgt_lang: tgtCode,
        });

        self.postMessage({
            status: 'complete',
            output: output[0].translation_text
        });
    } catch (error: any) {
        self.postMessage({
            status: 'error',
            error: error.message
        });
    }
});
