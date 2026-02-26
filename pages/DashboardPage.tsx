import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { MapPin, Languages, QrCode, Users, Bell, Sun, Moon, Compass, ArrowRight, Sparkles, Search, Mountain, Calendar, User, Cloud, CloudRain, Snowflake, CloudLightning, Wind, CloudDrizzle, Droplets, Eye, Thermometer, BrainCircuit, CloudMoon, Loader, MessageSquare, Trash2 } from 'lucide-react';
import { Logo } from '../components/SharedUI';
import { LOGIN_IMAGES } from '../assets/images';
import { askAiSuggestion, getSessionId, getChatHistory } from '../services/aiService';

interface WeatherData {
  temp: number;
  code: number;
  isDay: number;
  location: string;
  loading: boolean;
  humidity: number;
  windSpeed: number;
  visibility: number;
  feelsLike: number;
}

const DashboardPage = ({ onLogout, onNavigate, userName }: { onLogout: () => void, onNavigate: (page: string) => void, userName?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const aiInputRef = useRef<HTMLInputElement>(null);

  const [weather, setWeather] = useState<WeatherData>({
    temp: 0,
    code: 0,
    isDay: 1,
    location: 'Locating...',
    loading: true,
    humidity: 0,
    windSpeed: 0,
    visibility: 10,
    feelsLike: 0
  });

  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [recentMessages, setRecentMessages] = useState<{ role: string; text: string }[]>([]);
  const [showChatHistory, setShowChatHistory] = useState<boolean>(false);
  const locationRef = useRef<{ lat: number, lon: number } | null>(null);

  // Load recent chat history on mount
  useEffect(() => {
    const loadRecentChat = async () => {
      try {
        const sid = getSessionId();
        const history = await getChatHistory(sid);
        if (history && history.length > 0) {
          // Get last 4 messages (2 conversations)
          const recent = history.slice(-4).map((msg: any) => ({
            role: msg.role,
            text: msg.content
          }));
          setRecentMessages(recent);
        }
      } catch (error) {
        console.log('No chat history found');
      }
    };
    loadRecentChat();
  }, []);

  const handleAIGo = async () => {
    if (aiPrompt.trim()) {
      setAiLoading(true);
      try {
        const response = await askAiSuggestion(aiPrompt);
        const responseText = response.text;
        setAiResponse(responseText);
        onNavigate('ai-suggestion');
        // Store the response in sessionStorage for the AI page to use
        sessionStorage.setItem('dashboardAiResponse', responseText);
        sessionStorage.setItem('dashboardAiPrompt', aiPrompt);
      } catch (error) {
        console.error('AI request failed:', error);
        const errorText = 'Sorry, I failed to get a response. Please try again.';
        setAiResponse(errorText);
        onNavigate('ai-suggestion');
        sessionStorage.setItem('dashboardAiResponse', errorText);
        sessionStorage.setItem('dashboardAiPrompt', aiPrompt);
      } finally {
        setAiLoading(false);
      }
    }
  };

  const getWeatherDescription = (code: number) => {
    if (code === 0) return "Clear skies";
    if (code === 1 || code === 2 || code === 3) return "Partly cloudy";
    if (code >= 51 && code <= 67) return "Rainy";
    if (code >= 71 && code <= 77) return "Snowy";
    if (code >= 95) return "Thunderstorms";
    return "Overcast";
  };

  useEffect(() => {
    const fetchWeatherForLocation = async (lat: number, lon: number) => {
      try {
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day,relative_humidity_2m,wind_speed_10m,visibility,apparent_temperature&temperature_unit=celsius&wind_speed_unit=kmh`
        );

        if (!weatherRes.ok) throw new Error("Weather API Error");
        const weatherInfo = await weatherRes.json();

        let locationName = "Kathmandu";
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            const addr = geoData.address || {};
            locationName = addr.city || addr.town || addr.village || "Local Area";
          }
        } catch (e) { locationName = "Local Area"; }

        if (weatherInfo && weatherInfo.current) {
          const current = weatherInfo.current;
          setWeather({
            temp: Math.round(current.temperature_2m),
            code: current.weather_code,
            isDay: current.is_day,
            location: locationName,
            loading: false,
            humidity: current.relative_humidity_2m ?? 0,
            windSpeed: current.wind_speed_10m ?? 0,
            visibility: current.visibility ? current.visibility / 1000 : 10,
            feelsLike: current.apparent_temperature != null ? Math.round(current.apparent_temperature) : Math.round(current.temperature_2m)
          });
        }
      } catch (error) {
        setWeather(prev => ({ ...prev, loading: false, location: "Kathmandu" }));
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeatherForLocation(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeatherForLocation(27.7172, 85.3240)
      );
    } else {
      fetchWeatherForLocation(27.7172, 85.3240);
    }
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo('.dash-header', { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 });
      tl.fromTo('.dash-welcome', { scale: 0.98, opacity: 0, y: 20 }, { scale: 1, opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
      tl.fromTo('.dash-search', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.4");
      tl.fromTo('.dash-tool', { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, stagger: 0.05, duration: 0.4 }, "-=0.2");
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const tools = [
    { icon: <MapPin size={20} />, label: "Optimizer", color: "bg-emerald-500", action: () => onNavigate('route-optimizer') },
    { icon: <Languages size={20} />, label: "Translate", color: "bg-blue-500", action: () => onNavigate('translator') },
    { icon: <QrCode size={20} />, label: "QR Guide", color: "bg-purple-500", action: () => onNavigate('qr-guide') },
    { icon: <Users size={20} />, label: "Groups", color: "bg-orange-500", action: () => onNavigate('group-plan') },
  ];

  return (
    <div ref={containerRef} className="relative w-full min-h-screen p-4 pb-24 md:p-8 flex flex-col items-center bg-slate-50/50 overflow-x-hidden">
      <div className="dash-header w-full max-w-6xl flex items-center justify-between mb-8 z-20">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('landing')}>
          <Logo className="w-8 h-8 md:w-9 md:h-9" />
          <span className="font-display font-bold text-lg md:text-xl text-sky-900 hidden sm:inline">ExploreMate</span>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-white/80 backdrop-blur-xl px-2 py-2 rounded-full border border-white/50 shadow-sm">
          {['Explore', 'Saved', 'Trips', 'Profile'].map((item, i) => (
            <button
              key={item}
              onClick={() => onNavigate(item.toLowerCase())}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${i === 0 ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-sky-600'}`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onLogout}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-100 text-slate-600 hover:text-sky-600 shadow-sm"
          >
            <span className="text-xs font-bold uppercase tracking-wider">Log Out</span>
          </button>
          <button className="p-2 rounded-full bg-white border border-slate-100 text-slate-600 hover:text-sky-600 relative">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <button
            className="h-9 w-9 md:h-11 md:w-11 rounded-full bg-sky-400 p-[2px] cursor-pointer"
            onClick={() => onNavigate('profile')}
            aria-label="Open settings"
          >
            <div className="relative w-full h-full rounded-full border-2 border-white bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">
              <span>EM</span>
              <img
                src="https://i.pravatar.cc/150?img=32"
                alt="Profile"
                className="absolute inset-0 w-full h-full rounded-full object-cover"
                onError={(e) => { e.currentTarget.classList.add('hidden'); }}
              />
            </div>
          </button>
        </div>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className={`dash-welcome w-full rounded-[2.5rem] p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[380px] md:min-h-[420px] transition-all duration-500 ${weather.isDay === 0 ? 'bg-slate-900' : 'bg-sky-600'}`}>
            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-[80px]"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4 bg-white/20 w-fit px-4 py-1.5 rounded-full text-xs font-bold backdrop-blur-md border border-white/10">
                <MapPin size={12} /> <span>{weather.loading ? "Locating..." : weather.location}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-display font-bold mb-4">Namaste, {userName || 'Explorer'}!</h1>
              <p className="text-sky-100 max-w-md text-base md:text-lg font-medium opacity-90">
                It's {getWeatherDescription(weather.code).toLowerCase()} in {weather.location}. Perfect for {weather.code < 3 ? 'outdoor adventure' : 'visiting a museum'}.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative z-10 mt-8">
              {[
                { label: 'Humidity', val: weather.humidity + '%', icon: Droplets },
                { label: 'Wind', val: weather.windSpeed + ' km/h', icon: Wind },
                { label: 'Vis', val: weather.visibility + ' km', icon: Eye },
                { label: 'Feels', val: weather.feelsLike + '°', icon: Thermometer }
              ].map((stat, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
                  <div className="flex items-center gap-1.5 text-sky-100 mb-1 opacity-80">
                    <stat.icon size={12} /> <span className="text-[10px] font-bold uppercase tracking-wider">{stat.label}</span>
                  </div>
                  <div className="text-lg font-bold">{stat.val}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="dash-search bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-xl border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-2"><Sparkles size={20} className="text-sky-500" /> Plan with AI</h2>
            <div className="bg-slate-50 rounded-2xl p-2 flex items-center border border-slate-200 focus-within:ring-4 focus-within:ring-sky-100 transition-all">
              <Search className="text-slate-400 ml-4 shrink-0" size={20} />
              <input 
                ref={aiInputRef}
                type="text" 
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAIGo()}
                placeholder="Plan 2 days in Pokhara..." 
                className="w-full bg-transparent p-4 outline-none text-slate-700 font-medium" 
              />
              <button 
                onClick={handleAIGo}
                disabled={aiLoading}
                className={`p-4 text-white rounded-xl shadow-lg active:scale-95 flex items-center gap-2 font-bold shrink-0 transition-all ${
                  aiLoading 
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : 'bg-sky-600 hover:bg-sky-700'
                }`}
              >
                {aiLoading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    <span className="hidden sm:inline">Loading</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Go</span> <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Recent Chat History */}
          {recentMessages.length > 0 && (
            <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <MessageSquare size={18} className="text-sky-500" />
                  Recent Chats
                </h3>
                <button 
                  onClick={() => onNavigate('ai-suggestion')}
                  className="text-xs font-bold text-sky-600 hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                {recentMessages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'user' ? 'bg-slate-200' : 'bg-gradient-to-br from-sky-500 to-emerald-500'
                    }`}>
                      {msg.role === 'user' ? (
                        <User className="w-4 h-4 text-slate-600" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className={`px-4 py-2 rounded-2xl text-sm ${
                        msg.role === 'user' 
                          ? 'bg-sky-600 text-white rounded-tr-md' 
                          : 'bg-slate-100 text-slate-700 rounded-tl-md'
                      }`}>
                        {msg.text.length > 100 ? msg.text.substring(0, 100) + '...' : msg.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => onNavigate('ai-suggestion')}
                className="w-full mt-4 py-2 bg-sky-50 text-sky-600 rounded-xl font-medium text-sm hover:bg-sky-100 transition-colors"
              >
                Continue this conversation →
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {tools.map((tool, index) => (
              <button key={index} onClick={tool.action} className="dash-tool bg-white p-6 rounded-[2rem] flex flex-col items-center justify-center gap-3 border border-slate-100 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className={`${tool.color} p-3 rounded-2xl text-white shadow-lg`}>{tool.icon}</div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{tool.label}</span>
              </button>
            ))}
          </div>

          <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-slate-100 h-full min-h-[300px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 text-lg">Quick Access</h3>
              <button onClick={() => onNavigate('saved')} className="text-xs font-bold text-sky-600 hover:underline">View All</button>
            </div>
            <div className="space-y-4">
              {[
                { name: "Pokhara Lake", type: "Nature", img: LOGIN_IMAGES.POKHARA },
                { name: "Everest Trek", type: "Adventure", img: LOGIN_IMAGES.EVEREST },
                { name: "Boudha Stupa", type: "Heritage", img: LOGIN_IMAGES.BOUDHANATH }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-2 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group">
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                    <img src={item.img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                    <span className="text-[10px] uppercase font-bold text-slate-400">{item.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden fixed bottom-4 left-4 right-4 bg-white/90 backdrop-blur-xl border border-slate-200 py-4 px-8 rounded-3xl shadow-2xl z-50 flex items-center justify-between">
        {navItems.map((item, i) => (
          <button key={i} onClick={() => onNavigate(item.page)} className={`p-2 rounded-xl ${i === 0 ? 'text-sky-600' : 'text-slate-400'}`}>
            <item.icon size={24} />
          </button>
        ))}
      </div>
    </div>
  );
};

const navItems = [
  { icon: Compass, page: 'dashboard' },
  { icon: Mountain, page: 'saved' },
  { icon: Calendar, page: 'trips' },
  { icon: User, page: 'profile' }
];

export default DashboardPage;
