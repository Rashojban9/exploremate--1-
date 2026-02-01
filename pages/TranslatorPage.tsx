import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ArrowLeft, Mic, Volume2, Camera, Copy, Repeat, Star, Languages, Sparkles } from 'lucide-react';
import { Navbar, Footer } from '../components/Navigation';

const QUICK_PHRASES = [
  { en: "Hello/Namaste", np: "नमस्ते (Namaste)" },
  { en: "How much is this?", np: "यसको कति हो? (Yesko kati ho?)" },
  { en: "Where is the bathroom?", np: "शौचालय कहाँ छ? (Toilet kaha chha?)" },
  { en: "Thank you", np: "धन्यवाद (Dhanyabad)" },
  { en: "I don't understand", np: "मैले बुझिन (Maile bujhina)" },
  { en: "Help!", np: "गुहार! (Guhar!)" }
];

const TranslatorPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Nepali');

  // Animation setup
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      
      tl.fromTo('.trans-header', 
        { y: -30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      );

      tl.fromTo('.trans-main',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
        "-=0.5"
      );

      tl.fromTo('.quick-phrase',
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, stagger: 0.05, duration: 0.5, ease: 'back.out(1.5)' },
        "-=0.4"
      );
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  // Simulation of translation
  useEffect(() => {
    if (!inputText) {
        setTranslatedText('');
        return;
    }

    const timer = setTimeout(() => {
        setIsLoading(true);
        // Mock translation logic
        setTimeout(() => {
            // Check if it matches a quick phrase
            const phrase = QUICK_PHRASES.find(p => p.en.toLowerCase().includes(inputText.toLowerCase()));
            if (phrase) {
                setTranslatedText(phrase.np);
            } else {
                // Fallback mock
                setTranslatedText("तपाईंको यात्रा शुभ रहोस् (Tapai ko yatra subha rahos)");
            }
            setIsLoading(false);
        }, 600);
    }, 500);

    return () => clearTimeout(timer);
  }, [inputText]);

  const handleMicClick = () => {
    setIsListening(!isListening);
    if (!isListening) {
        // Start simulation
        setTimeout(() => {
            setInputText("How much for the tea?");
            setIsListening(false);
        }, 2000);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast here
  };

  const swapLanguages = () => {
      setSourceLang(targetLang);
      setTargetLang(sourceLang);
      setInputText(translatedText); // Swap content too? Maybe clear it.
      setTranslatedText(inputText);
  };

  return (
    <div ref={containerRef} className="w-full min-h-screen bg-slate-50 relative flex flex-col">
      <div className="trans-header bg-white shadow-sm border-b border-slate-100 p-4 sticky top-0 z-50">
         <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button 
                onClick={() => onNavigate('dashboard')}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
            >
                <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
                <Languages className="text-sky-600" /> AI Translator
            </h1>
            <button className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                <SettingsIcon size={24} />
            </button>
         </div>
      </div>

      <div className="flex-grow p-4 md:p-8 overflow-y-auto">
         <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Main Translator Card */}
            <div className="trans-main bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100 relative">
               
               {/* Language Selector */}
               <div className="flex items-center justify-between p-4 border-b border-slate-50 bg-slate-50/50">
                  <button className="flex-1 py-2 text-sky-700 font-bold text-sm bg-white rounded-xl shadow-sm border border-slate-100">
                      {sourceLang}
                  </button>
                  <button onClick={swapLanguages} className="mx-4 p-2 rounded-full hover:bg-sky-100 text-slate-400 hover:text-sky-600 transition-colors">
                      <Repeat size={20} />
                  </button>
                  <button className="flex-1 py-2 text-sky-700 font-bold text-sm bg-white rounded-xl shadow-sm border border-slate-100">
                      {targetLang}
                  </button>
               </div>

               {/* Input Area */}
               <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8 relative">
                  <div className="relative">
                      <textarea
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          placeholder="Enter text to translate..."
                          className="w-full h-40 bg-transparent resize-none outline-none text-xl md:text-2xl text-slate-700 placeholder-slate-300 font-medium"
                      />
                      <div className="absolute bottom-0 right-0 flex gap-2">
                          <button onClick={() => handleCopy(inputText)} className="p-2 text-slate-300 hover:text-sky-600 transition-colors">
                              <Copy size={20} />
                          </button>
                          {inputText && (
                            <button className="p-2 text-slate-300 hover:text-sky-600 transition-colors">
                                <Volume2 size={20} />
                            </button>
                          )}
                      </div>
                  </div>

                  <div className="relative border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
                      {isLoading ? (
                          <div className="flex items-center gap-2 text-slate-400 animate-pulse mt-2">
                              <Sparkles size={18} /> Translating...
                          </div>
                      ) : (
                          <div className={`w-full h-40 text-xl md:text-2xl font-medium transition-colors ${translatedText ? 'text-sky-700' : 'text-slate-300'}`}>
                              {translatedText || "Translation will appear here"}
                          </div>
                      )}
                      
                      <div className="absolute bottom-0 right-0 flex gap-2">
                          <button onClick={() => handleCopy(translatedText)} className="p-2 text-slate-300 hover:text-sky-600 transition-colors">
                              <Copy size={20} />
                          </button>
                          {translatedText && (
                            <button className="p-2 text-sky-600 hover:bg-sky-50 rounded-full transition-colors">
                                <Volume2 size={20} />
                            </button>
                          )}
                      </div>
                  </div>
               </div>

               {/* Action Bar */}
               <div className="bg-slate-50 p-4 flex justify-center gap-6">
                   <button className="p-4 rounded-full bg-white border border-slate-200 text-slate-500 hover:border-sky-300 hover:text-sky-600 shadow-sm transition-all">
                       <Camera size={24} />
                   </button>
                   <button 
                      onClick={handleMicClick}
                      className={`p-6 rounded-full shadow-lg shadow-sky-500/30 text-white transition-all scale-110 active:scale-95 ${isListening ? 'bg-red-500 animate-pulse' : 'bg-sky-600 hover:bg-sky-500'}`}
                   >
                       <Mic size={32} />
                   </button>
                   <button className="p-4 rounded-full bg-white border border-slate-200 text-slate-500 hover:border-sky-300 hover:text-sky-600 shadow-sm transition-all">
                       <Star size={24} />
                   </button>
               </div>
            </div>

            {/* Quick Phrases */}
            <div className="pt-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Quick Phrases</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {QUICK_PHRASES.map((phrase, i) => (
                        <button 
                            key={i}
                            onClick={() => { setInputText(phrase.en); }}
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

// Simple settings icon
const SettingsIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);

export default TranslatorPage;
