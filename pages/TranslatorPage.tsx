import React, { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { ArrowLeft, Mic, Volume2, Camera, Copy, Repeat, Star, Languages, Sparkles, ChevronDown, Check, AlertCircle } from 'lucide-react';
import { Navbar, Footer } from '../components/Navigation';
import { translateText, SUPPORTED_LANGUAGES, type Language, setAiEnabled, getAiEnabled } from '../services/translationService';
import { aiTranslationService, type AiProgress } from '../services/translationAiService';

// Quick phrases for common travel expressions
const QUICK_PHRASES = [
  { en: "Hello / Namaste", np: "नमस्ते" },
  { en: "How much is this?", np: "यसको कति हो?" },
  { en: "Where is the bathroom?", np: "शौचालय कहाँ छ?" },
  { en: "Thank you", np: "धन्यवाद" },
  { en: "I don't understand", np: "मैले बुझिन" },
  { en: "Help!", np: "गुहार!" },
  { en: "Good morning", np: "शुभ प्रभात" },
  { en: "How are you?", np: "तपाईंलाई कस्तो छ?" },
];

// ─── Language Picker Dropdown ─────────────────────────────────────────────────

const LanguagePicker = ({
  selected,
  onChange,
  label,
  excludeAuto = false,
}: {
  selected: Language;
  onChange: (lang: Language) => void;
  label: string;
  excludeAuto?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const languages = excludeAuto 
    ? SUPPORTED_LANGUAGES.filter(l => l.code !== 'auto')
    : SUPPORTED_LANGUAGES;

  return (
    <div ref={ref} className="relative flex-1">
      <button
        id={`lang-picker-${label}`}
        onClick={() => setOpen(!open)}
        className="w-full py-2.5 px-4 text-sky-700 font-bold text-sm bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center gap-2 hover:border-sky-300 transition-colors"
      >
        <span>{selected.nativeName}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-slate-100 max-h-64 overflow-y-auto z-50 py-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => { onChange(lang); setOpen(false); }}
              className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-sky-50 transition-colors ${selected.code === lang.code ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-700'}`}
            >
              <span>
                {lang.nativeName}{' '}
                {lang.code !== 'auto' && <span className="text-slate-400 ml-1">({lang.name})</span>}
              </span>
              {selected.code === lang.code && <Check size={16} className="text-sky-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const TranslatorPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<'source' | 'target' | null>(null);
  const [detectedLang, setDetectedLang] = useState<Language | null>(null);

  // Phase 3: AI state
  const [isAiMode, setIsAiMode] = useState(getAiEnabled());
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [aiStatus, setAiStatus] = useState<string>('');
  const [showAiSuggestion, setShowAiSuggestion] = useState(false);

  // Language state
  const [sourceLang, setSourceLang] = useState<Language>(SUPPORTED_LANGUAGES.find(l => l.code === 'auto') || SUPPORTED_LANGUAGES[0]);
  const [targetLang, setTargetLang] = useState<Language>(SUPPORTED_LANGUAGES.find(l => l.code === 'ne') || SUPPORTED_LANGUAGES[1]);

  // Speech
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const autoSpeakRef = useRef(false);

  // ─── Animations ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo('.trans-header', { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' });
      tl.fromTo('.trans-main', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, '-=0.5');
      tl.fromTo('.quick-phrase', { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, stagger: 0.05, duration: 0.5, ease: 'back.out(1.5)' }, '-=0.4');
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // ─── Translation ─────────────────────────────────────────────────────────────
  const doTranslate = useCallback(async (text: string) => {
    if (!text.trim()) {
      setTranslatedText('');
      setDetectedLang(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await translateText(text, sourceLang.code, targetLang.code);
      setTranslatedText(res.translatedText);
      
      // Update detected language feedback
      if (res.detectedLang && sourceLang.code === 'auto') {
        const found = SUPPORTED_LANGUAGES.find(l => l.code === res.detectedLang);
        setDetectedLang(found || null);
      } else {
        setDetectedLang(null);
      }
      
      setShowAiSuggestion(!!res.isDictionaryPartial);

      // Auto-speak if the target text was triggered by voice dictation
      if (autoSpeakRef.current) {
        if (window.speechSynthesis) {
           window.speechSynthesis.cancel();
           const utt = new SpeechSynthesisUtterance(res.translatedText);
           utt.lang = targetLang.speechCode || 'en-US';
           utt.rate = 0.9;
           setTimeout(() => window.speechSynthesis.speak(utt), 100);
        }
        autoSpeakRef.current = false;
      }

    } catch (err: any) {
      console.error('Translation error:', err);
      setError('Translation failed.');
      setTranslatedText('');
    } finally {
      setIsLoading(false);
    }
  }, [sourceLang, targetLang]);

  useEffect(() => {
    aiTranslationService.setProgressListener((progress: AiProgress) => {
      if (progress.status === 'progress') {
        const percent = Math.round(progress.progress || 0);
        setDownloadProgress(percent);
        setAiStatus(`Downloading Brain: ${percent}%`);
      } else if (progress.status === 'init' || progress.status === 'downloading') {
          setAiStatus('Initializing AI...');
      } else if (progress.status === 'done') {
          setDownloadProgress(null);
          setAiStatus('');
      }
    });
  }, []);

  const toggleAiMode = (enabled: boolean) => {
    setAiEnabled(enabled);
    setIsAiMode(enabled);
    if (enabled && inputText.trim()) {
        doTranslate(inputText);
    }
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!inputText.trim()) {
      setTranslatedText('');
      setDetectedLang(null);
      return;
    }
    debounceRef.current = setTimeout(() => doTranslate(inputText), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [inputText, doTranslate]);

  // ─── Swap languages ─────────────────────────────────────────────────────────
  const swapLanguages = () => {
    if (sourceLang.code === 'auto') {
      // If auto-detect is on, swap to target and set target to previously detected or English
      const newSource = targetLang;
      const newTarget = detectedLang || SUPPORTED_LANGUAGES.find(l => l.code === 'en') || SUPPORTED_LANGUAGES[1];
      setSourceLang(newSource);
      setTargetLang(newTarget);
    } else {
      const prevSource = sourceLang;
      setSourceLang(targetLang);
      setTargetLang(prevSource);
    }
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  const handleCopy = (text: string, which: 'source' | 'target') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(null), 1500);
  };

  // ─── Speech-to-text (mic) ───────────────────────────────────────────────────
  const handleMicClick = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Speech recognition not supported.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    // For auto-detect, try English or the current target as hint
    recognition.lang = sourceLang.speechCode || 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      autoSpeakRef.current = true;
      setInputText(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const speak = (text: string, lang: Language) => {
    if (!text || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    // If auto-detect, use the detected language for speech
    const speechCode = (sourceLang.code === 'auto' && detectedLang) 
      ? detectedLang.speechCode 
      : lang.speechCode;
      
    utt.lang = speechCode || 'en-US';
    utt.rate = 0.9;
    window.speechSynthesis.speak(utt);
  };

  return (
    <div ref={containerRef} className="w-full min-h-screen bg-slate-50 relative flex flex-col">
      <div className="trans-header bg-white shadow-sm border-b border-slate-100 p-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={() => onNavigate('dashboard')} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
            <Languages className="text-sky-600" /> AI Translator
          </h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="flex-grow p-4 md:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="trans-main bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100 relative">
            <div className="flex items-center justify-between p-4 border-b border-slate-50 bg-slate-50/50 gap-2">
              <LanguagePicker selected={sourceLang} onChange={setSourceLang} label="source" />
              <button
                onClick={swapLanguages}
                className="mx-2 p-2 rounded-full transition-colors hover:bg-sky-100 text-slate-400 hover:text-sky-600"
              >
                <Repeat size={20} />
              </button>
              <LanguagePicker selected={targetLang} onChange={setTargetLang} label="target" excludeAuto />
            </div>

            {/* AI Toggle & Progress */}
            <div className="px-6 py-3 bg-sky-50/30 flex flex-col gap-2 border-b border-slate-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${isAiMode ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-400'}`}>
                            <Sparkles size={16} className={isAiMode ? 'animate-pulse' : ''} />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-slate-700">Advanced AI Mode</div>
                            <div className="text-[10px] text-slate-400">Offline Neural Translation (Google-style)</div>
                        </div>
                    </div>
                    <button 
                        onClick={() => toggleAiMode(!isAiMode)}
                        className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 ${isAiMode ? 'bg-sky-500' : 'bg-slate-200'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isAiMode ? 'translate-x-5' : 'translate-x-0'} shadow-sm`} />
                    </button>
                </div>
                
                {downloadProgress !== null && (
                    <div className="w-full space-y-1 mt-1">
                        <div className="flex justify-between text-[10px] font-bold text-sky-600">
                            <span>{aiStatus}</span>
                            <span>{downloadProgress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-sky-500 transition-all duration-300" 
                                style={{ width: `${downloadProgress}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8 relative">
              <div className="relative">
                {sourceLang.code === 'auto' && detectedLang && (
                  <div className="absolute -top-6 left-0 flex items-center gap-1.5 text-sky-600 text-xs font-bold animate-fade-in">
                    <Sparkles size={12} /> Detected: {detectedLang.name}
                  </div>
                )}
                <textarea
                  id="translator-input"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter text..."
                  className="w-full h-40 bg-transparent resize-none outline-none text-xl md:text-2xl text-slate-700 placeholder-slate-300 font-medium"
                />
                <div className="absolute bottom-0 right-0 flex gap-2">
                  <button
                    onClick={() => handleCopy(inputText, 'source')}
                    className={`p-2 transition-colors rounded-full ${copied === 'source' ? 'text-emerald-500' : 'text-slate-300 hover:text-sky-600'}`}
                  >
                    {copied === 'source' ? <Check size={20} /> : <Copy size={20} />}
                  </button>
                  {inputText && (
                    <button
                      onClick={() => speak(inputText, sourceLang)}
                      className="p-2 text-slate-300 hover:text-sky-600 transition-colors rounded-full"
                    >
                      <Volume2 size={20} />
                    </button>
                  )}
                </div>
              </div>

              <div className="relative border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
                {isLoading ? (
                  <div className="flex items-center gap-2 text-slate-400 animate-pulse mt-2">
                    <Sparkles size={18} className="animate-spin" /> {isAiMode ? 'AI is Thinking...' : 'Translating...'}
                  </div>
                ) : error ? (
                  <div className="flex items-start gap-2 text-red-400 mt-2 text-base">
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                ) : (
                  <div className="flex flex-col h-full w-full">
                    <div id="translator-output" className={`flex-1 text-xl md:text-2xl font-medium transition-colors overflow-y-auto pb-8 ${translatedText ? 'text-sky-700' : 'text-slate-300'}`}>
                      {translatedText || 'Translation will appear here'}
                    </div>
                    {showAiSuggestion && !isAiMode && (
                      <div className="mt-2 bg-amber-50 text-amber-700 text-xs py-2 px-3 rounded-lg border border-amber-200 flex items-start gap-2 shadow-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <Star size={14} className="mt-0.5 text-amber-500 shrink-0 fill-amber-500" />
                        <span>Dictionary missed some words. Enable <strong>Advanced AI Mode</strong> for better results.</span>
                        <button 
                         onClick={() => toggleAiMode(true)}
                         className="ml-auto bg-amber-500 hover:bg-amber-600 text-white px-2 py-0.5 rounded text-[10px] transition-colors whitespace-nowrap"
                        >
                          Enable AI
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="absolute bottom-0 right-0 flex gap-2">
                  <button
                    onClick={() => handleCopy(translatedText, 'target')}
                    className={`p-2 transition-colors rounded-full ${copied === 'target' ? 'text-emerald-500' : 'text-slate-300 hover:text-sky-600'}`}
                  >
                    {copied === 'target' ? <Check size={20} /> : <Copy size={20} />}
                  </button>
                  {translatedText && !isLoading && (
                    <button
                      onClick={() => speak(translatedText, targetLang)}
                      className="p-2 text-sky-600 hover:bg-sky-50 rounded-full transition-colors"
                    >
                      <Volume2 size={20} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 flex justify-center gap-6">
              <button
                onClick={handleMicClick}
                className={`p-6 rounded-full shadow-lg shadow-sky-500/30 text-white transition-all scale-110 active:scale-95 ${isListening ? 'bg-red-500 animate-pulse' : 'bg-sky-600 hover:bg-sky-500'}`}
              >
                <Mic size={32} />
              </button>
            </div>
          </div>

          <div className="pt-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Quick Phrases</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {QUICK_PHRASES.map((phrase, i) => (
                <button
                  key={i}
                  onClick={() => setInputText(phrase.en)}
                  className="quick-phrase bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:border-sky-200 hover:shadow-md transition-all text-left group"
                >
                  <div className="text-slate-800 font-bold text-sm mb-1 group-hover:text-sky-700">{phrase.en}</div>
                  <div className="text-slate-500 text-xs">{phrase.np}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranslatorPage;
