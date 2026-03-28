import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ArrowLeft, Send, Sparkles, User, Bot, MapPin, Coffee, Compass, Camera, Trash2, StopCircle, Menu, X, Heart } from 'lucide-react';
import { askAiSuggestion, getSessionId, clearSession, getChatHistory, clearChatHistory } from '../services/aiService';
import { createSavedItem, getSavedItems, deleteSavedItem } from '../services/savedItemService';
import ChatSidebar from '../components/ChatSidebar';

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  // Track saved suggestions: map title → saved item id
  const [savedMap, setSavedMap] = useState<Record<string, string | number>>({});

  // Load saved items on mount to track which suggestions are already saved
  useEffect(() => {
    getSavedItems()
      .then((items) => {
        const map: Record<string, string | number> = {};
        items.forEach((item) => { map[item.title] = item.id; });
        setSavedMap(map);
      })
      .catch(() => {});
  }, []);

  // Load session and history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const sid = getSessionId();
        setSessionId(sid);
        
        // Check if there's a pending response from dashboard
        const dashboardResponse = sessionStorage.getItem('dashboardAiResponse');
        const dashboardPrompt = sessionStorage.getItem('dashboardAiPrompt');
        
        if (dashboardResponse && dashboardPrompt) {
          // Clear the stored values
          sessionStorage.removeItem('dashboardAiResponse');
          sessionStorage.removeItem('dashboardAiPrompt');
          
          // Add user message and AI response to messages
          const userMsg: Message = {
            id: 'dash_user_' + Date.now(),
            role: 'user',
            text: dashboardPrompt,
            timestamp: new Date()
          };
          const aiMsg: Message = {
            id: 'dash_ai_' + Date.now(),
            role: 'model',
            text: dashboardResponse,
            timestamp: new Date()
          };
          setMessages([userMsg, aiMsg]);
          setIsLoadingHistory(false);
          return;
        }
        
        // Try to load chat history from backend
        const history = await getChatHistory(sid);
        
        if (history && history.length > 0) {
          const loadedMessages: Message[] = history.map((msg: any, index: number) => ({
            id: `hist_${index}`,
            role: msg.role === 'user' ? 'user' : 'model',
            text: msg.content,
            timestamp: new Date()
          }));
          setMessages(loadedMessages);
        } else {
          // No history, show welcome message
          setMessages([{
            id: 'welcome',
            role: 'model',
            text: "Namaste! I'm your AI travel companion. I can help you plan your trip to Nepal, find hidden gems, or suggest authentic local cuisines. What's on your mind?",
            timestamp: new Date()
          }]);
        }
      } catch (error) {
        console.error('Error loading history:', error);
        // Fallback to welcome message
        setMessages([{
          id: 'welcome',
          role: 'model',
          text: "Namaste! I'm your AI travel companion. I can help you plan your trip to Nepal, find hidden gems, or suggest authentic local cuisines. What's on your mind?",
          timestamp: new Date()
        }]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadHistory();
  }, []);

  // Animation on Mount
  useEffect(() => {
    if (isLoadingHistory) return;
    
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
  }, [isLoadingHistory]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSelectSession = async (newSessionId: string) => {
    setIsLoadingHistory(true);
    try {
      setSessionId(newSessionId);
      localStorage.setItem('exploremate_ai_session', newSessionId);
      
      const history = await getChatHistory(newSessionId);
      if (history && history.length > 0) {
        const loadedMessages: Message[] = history.map((msg: any, index: number) => ({
          id: `hist_${index}`,
          role: msg.role === 'user' ? 'user' : 'model',
          text: msg.content,
          timestamp: new Date()
        }));
        setMessages(loadedMessages);
      } else {
        setMessages([{
          id: 'welcome',
          role: 'model',
          text: "Namaste! I'm your AI travel companion. I can help you plan your trip to Nepal, find hidden gems, or suggest authentic local cuisines. What's on your mind?",
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleNewChat = () => {
    clearSession();
    const newSid = getSessionId();
    setSessionId(newSid);
    setMessages([{
      id: 'welcome',
      role: 'model',
      text: "Namaste! I'm your AI travel companion. I can help you plan your trip to Nepal, find hidden gems, or suggest authentic local cuisines. What's on your mind?",
      timestamp: new Date()
    }]);
    setSidebarOpen(false);
    setRefreshKey(k => k + 1); // Refresh sidebar conversations
  };

  const handleClearChat = async () => {
    try {
      await clearChatHistory(sessionId);
      clearSession(); // Clear local session too
      setSessionId(getSessionId()); // Get new session
      setMessages([{
        id: 'welcome',
        role: 'model',
        text: "Namaste! I'm your AI travel companion. I can help you plan your trip to Nepal, find hidden gems, or suggest authentic local cuisines. What's on your mind?",
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  const handleSendMessage = async (text: string = inputValue) => {
    if (!text.trim()) {
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    // Call the actual backend API
    try {
      const response = await askAiSuggestion(text, sessionId);
      addAiMessage(response.text);
    } catch (error) {
      console.error('AI suggestion error:', error);
      // Fallback to simulation if API fails
      addAiMessage("I'm having trouble connecting to my AI service. Please try again later!");
    }
  };

  const addAiMessage = (text: string) => {
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  const handleSaveSuggestion = async (text: string) => {
    const suggestionTitle = text.split('\n')[0].substring(0, 50) || "AI Suggested Trip";
    const existingId = savedMap[suggestionTitle];

    try {
      if (existingId !== undefined) {
        // Already saved → unsave
        await deleteSavedItem(existingId);
        setSavedMap((prev) => {
          const next = { ...prev };
          delete next[suggestionTitle];
          return next;
        });
      } else {
        // Not saved → save
        const created = await createSavedItem({
            type: 'ITINERARY',
            title: suggestionTitle,
            description: text,
            location: "Nepal"
        });
        setSavedMap((prev) => ({ ...prev, [suggestionTitle]: created.id }));
      }
    } catch (error) {
        console.error("Failed to toggle save", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoadingHistory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 flex overflow-hidden">
      {/* Sidebar */}
      <ChatSidebar
        currentSessionId={sessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        refreshKey={refreshKey}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="ai-header bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-100 sticky top-0 z-30">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors lg:hidden"
              >
                {sidebarOpen ? <X className="w-5 h-5 text-slate-600" /> : <Menu className="w-5 h-5 text-slate-600" />}
              </button>
              <button 
                onClick={() => onNavigate('dashboard')}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors hidden lg:block"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-slate-800">ExploreMate AI</h1>
                  <p className="text-xs text-slate-500">Your Travel Companion</p>
                </div>
              </div>
            </div>
            <button 
              onClick={handleClearChat}
              className="p-2 hover:bg-red-50 rounded-full transition-colors group"
              title="Clear chat"
            >
              <Trash2 className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-slate-200 chat-area" style={{ minHeight: 0 }}>
          <div className="max-w-3xl mx-auto space-y-6 pb-4">
            {/* Quick Prompts - only show when no messages */}
            {messages.length <= 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt.label)}
                    className="quick-prompt flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200 hover:bg-white hover:shadow-md transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center group-hover:bg-sky-200 transition-colors">
                      <prompt.icon className="w-5 h-5 text-sky-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{prompt.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Messages */}
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-violet-500 to-purple-600' 
                    : 'bg-gradient-to-br from-sky-500 to-emerald-500'
                }`}>
                  {msg.role === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`px-5 py-3 rounded-2xl shadow-sm relative group ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white rounded-tr-md' 
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-md'
                  }`}>
                    <p className="text-sm md:text-base whitespace-pre-wrap">{msg.text}</p>
                    
                    {msg.role === 'model' && msg.id !== 'welcome' && (() => {
                      const suggestionTitle = msg.text.split('\n')[0].substring(0, 50) || "AI Suggested Trip";
                      const isSaved = savedMap[suggestionTitle] !== undefined;
                      return (
                        <button 
                          onClick={() => handleSaveSuggestion(msg.text)}
                          className={`absolute -right-12 top-0 p-2 border rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity ${
                            isSaved 
                              ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100' 
                              : 'bg-white border-slate-200 text-sky-600 hover:bg-sky-50'
                          }`}
                          title={isSaved ? 'Unsave' : 'Save to Trips'}
                        >
                          <Heart size={16} className={isSaved ? 'fill-red-500' : ''} />
                        </button>
                      );
                    })()}
                  </div>
                  <span className="text-xs text-slate-400 mt-1.5 px-1 font-medium">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-md">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-slate-200 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about travel in Nepal..."
                className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {isLoading ? (
                  <StopCircle className="w-5 h-5 text-white" />
                ) : (
                  <Send className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
            <p className="text-center text-xs text-slate-400 mt-2">
              AI can make mistakes. Please verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISuggestionPage;
