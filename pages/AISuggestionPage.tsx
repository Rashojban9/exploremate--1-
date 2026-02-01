import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ArrowLeft, Send, Sparkles, User, Bot, MapPin, Coffee, Compass, Camera, Trash2, StopCircle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  { icon: Compass, label: "3-Day Itinerary in Pokhara" },
  { icon: Coffee, label: "Best Local Food in Kathmandu" },
  { icon: Camera, label: "Hidden Photography Spots" },
  { icon: MapPin, label: "Off-beat Trekking Routes" },
];

const AISuggestionPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Namaste! I'm your AI travel companion. I can help you plan your trip to Nepal, find hidden gems, or suggest authentic local cuisines. What's on your mind?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Animation on Mount
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.ai-header', 
        { y: -20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
      );
      gsap.fromTo('.chat-area',
        { opacity: 0, scale: 0.98 },
        { opacity: 1, scale: 1, duration: 0.6, delay: 0.2, ease: 'power2.out' }
      );
      gsap.fromTo('.quick-prompt',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, delay: 0.4, ease: 'back.out(1.5)' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string = inputValue) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      // 1. Try Real Gemini API
      if (process.env.API_KEY) {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: text,
          config: {
            systemInstruction: "You are an expert travel guide for Nepal named ExploreMate. Provide concise, enthusiastic, and practical travel advice. Format lists with bullets.",
          }
        });
        
        const aiResponse = response.text || "I couldn't generate a response. Please try again.";
        addAiMessage(aiResponse);
      } else {
        // 2. Fallback Simulation (No API Key)
        throw new Error("No API Key");
      }
    } catch (error) {
      console.warn("AI Request failed or no key, using simulation.", error);
      simulateResponse(text);
    }
  };

  const addAiMessage = (text: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'model',
      text: text,
      timestamp: new Date()
    }]);
    setIsLoading(false);
  };

  const simulateResponse = (query: string) => {
    // Smart Simulation Logic
    setTimeout(() => {
      let response = "That sounds like a great plan! Could you tell me a bit more about your preferences?";
      const lowerQ = query.toLowerCase();

      if (lowerQ.includes('itinerary') || lowerQ.includes('day')) {
        response = "**Here is a suggested 3-Day Plan:**\n\n*   **Day 1:** Explore the heritage sites of Kathmandu (Swayambhunath, Patan).\n*   **Day 2:** Drive to Nagarkot for sunrise and Himalayan views.\n*   **Day 3:** Visit Bhaktapur Durbar Square for ancient culture and pottery.";
      } else if (lowerQ.includes('food') || lowerQ.includes('eat')) {
        response = "You simply must try **Momo** (dumplings) and **Dal Bhat** (lentil soup with rice). For a local experience, visit *Honacha* in Patan for authentic Newari Bara and Wo.";
      } else if (lowerQ.includes('trek') || lowerQ.includes('hike')) {
        response = "For a short trek, I recommend **Poon Hill** (3-4 days) for amazing Annapurna views. For something closer to Kathmandu, try the **Shivapuri Peak** day hike.";
      }

      addAiMessage(response);
    }, 1500); // Simulated delay
  };

  const clearChat = () => {
    setMessages([messages[0]]); // Keep welcome message
  };

  // Simple Markdown-ish parser for bold and newlines
  const renderText = (text: string) => {
    return text.split('\n').map((line, i) => (
      <p key={i} className={`mb-1 ${line.startsWith('*') ? 'pl-4' : ''}`}>
        {line.split('**').map((part, j) => 
          j % 2 === 1 ? <strong key={j}>{part}</strong> : part
        )}
      </p>
    ));
  };

  return (
    <div ref={containerRef} className="w-full h-screen bg-slate-50 flex flex-col overflow-hidden">
      
      {/* Header */}
      <div className="ai-header bg-white border-b border-slate-200 p-4 shrink-0 z-20 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onNavigate('dashboard')} 
              className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
                <Sparkles size={20} />
              </div>
              <div>
                <h1 className="text-lg font-bold font-display text-slate-900 leading-none">AI Travel Agent</h1>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Online</span>
                </div>
              </div>
            </div>
          </div>
          <button onClick={clearChat} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Clear Chat">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-grow overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-slate-200 chat-area">
        <div className="max-w-3xl mx-auto space-y-6 pb-4">
          
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm mt-1 ${msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-100 text-sky-600'}`}>
                {msg.role === 'user' ? <User size={14} /> : <Bot size={16} />}
              </div>
              
              <div className={`max-w-[85%] md:max-w-[75%]`}>
                <div className={`p-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-slate-900 text-white rounded-tr-none' 
                    : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                }`}>
                  {renderText(msg.text)}
                </div>
                <div className={`text-[10px] text-slate-400 mt-1 font-medium px-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4">
               <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-sky-600 shrink-0 shadow-sm">
                  <Bot size={16} />
               </div>
               <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                  <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
               </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200 z-20">
        <div className="max-w-3xl mx-auto">
          
          {/* Quick Prompts (Only show if few messages) */}
          {messages.length < 3 && (
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-2">
              {QUICK_PROMPTS.map((prompt, i) => (
                <button 
                  key={i}
                  onClick={() => handleSendMessage(prompt.label)}
                  className="quick-prompt flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:bg-sky-50 hover:border-sky-200 hover:text-sky-700 transition-all whitespace-nowrap"
                >
                  <prompt.icon size={14} /> {prompt.label}
                </button>
              ))}
            </div>
          )}

          <div className="relative flex items-end gap-2 bg-slate-50 p-2 rounded-[1.5rem] border border-slate-200 focus-within:border-sky-400 focus-within:bg-white focus-within:shadow-md transition-all">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask for recommendations, routes, or tips..." 
              className="w-full bg-transparent px-4 py-3 outline-none text-slate-700 font-medium max-h-32 placeholder-slate-400"
              autoFocus
            />
            <button 
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className={`p-3 rounded-full text-white shadow-lg transition-all mb-1 ${
                !inputValue.trim() || isLoading 
                ? 'bg-slate-300 cursor-not-allowed' 
                : 'bg-sky-600 hover:bg-sky-700 hover:scale-105 active:scale-95'
              }`}
            >
              {isLoading ? <StopCircle size={20} className="animate-pulse" /> : <Send size={20} />}
            </button>
          </div>
          
          <div className="text-center mt-2">
             <p className="text-[10px] text-slate-400">AI can make mistakes. Please verify important travel information.</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AISuggestionPage;