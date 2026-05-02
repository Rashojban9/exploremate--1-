import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { MapPin, Languages, QrCode, Users, Bell, Sun, Moon, Compass, ArrowRight, Sparkles, Search, Mountain, Calendar, User, Cloud, CloudRain, Snowflake, CloudLightning, Wind, CloudDrizzle, Droplets, Eye, Thermometer, BrainCircuit, CloudMoon, Loader, MessageSquare, Trash2, Plane, Heart, BookOpen, Clock, CheckCircle2, AlertCircle, TrendingUp, Star, Globe, ChevronRight, Bookmark, BarChart3, Route } from 'lucide-react';
import { Logo } from '../components/SharedUI';
import { LOGIN_IMAGES } from '../assets/images';
import { askAiSuggestion, getSessionId, getChatHistory } from '../services/aiService';
import { getNotifications } from '../services/notificationService';
import { getSavedItems, SavedItemResponse } from '../services/savedItemService';
import { getTrips, TripResponse } from '../services/tripService';
import { useApp } from '../context/AppContext';

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

const DashboardPage = ({ onLogout, onNavigate, userName, userProfilePicture }: { onLogout: () => void, onNavigate: (page: string) => void, userName?: string, userProfilePicture?: string }) => {
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
  const { state } = useApp();
  const backendNotifications = state.ui.backendNotifications;
  const [savedItems, setSavedItems] = useState<SavedItemResponse[]>([]);
  const [trips, setTrips] = useState<TripResponse[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
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

    const loadData = async () => {
      setIsLoadingData(true);
      try {
        const [saved, userTrips] = await Promise.all([
          getSavedItems().catch(() => []),
          getTrips().catch(() => [])
        ]);
        setSavedItems(saved || []);
        setTrips(userTrips || []);
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadRecentChat();
    loadData();
  }, []);

  const unreadCount = backendNotifications.filter(n => !n.read).length;

  // Trip stats
  const upcomingTrips = trips.filter(t => t.status === 'UPCOMING');
  const completedTrips = trips.filter(t => t.status === 'PAST');
  const draftTrips = trips.filter(t => t.status === 'DRAFT');

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
      tl.fromTo('.dash-section', { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: 'power2.out' }, "-=0.2");
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const tools = [
    { icon: <MapPin size={20} />, label: "Optimizer", color: "bg-emerald-500", hoverGlow: "group-hover:shadow-emerald-500/30", action: () => onNavigate('route-optimizer') },
    { icon: <Languages size={20} />, label: "Translate", color: "bg-blue-500", hoverGlow: "group-hover:shadow-blue-500/30", action: () => onNavigate('translator') },
    { icon: <QrCode size={20} />, label: "QR Guide", color: "bg-purple-500", hoverGlow: "group-hover:shadow-purple-500/30", action: () => onNavigate('qr-guide') },
    { icon: <Users size={20} />, label: "Groups", color: "bg-orange-500", hoverGlow: "group-hover:shadow-orange-500/30", action: () => onNavigate('group-plan') },
  ];

  const getRelativeTime = (dateStr: string): string => {
    const target = new Date(dateStr).getTime();
    if (Number.isNaN(target)) return 'recently';
    const diffMs = Date.now() - target;
    const minute = 60_000;
    const hour = 60 * minute;
    const day = 24 * hour;
    if (diffMs < minute) return 'just now';
    if (diffMs < hour) return `${Math.floor(diffMs / minute)}m ago`;
    if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`;
    return `${Math.floor(diffMs / day)}d ago`;
  };

  const getDaysUntil = (dateStr?: string): string => {
    if (!dateStr || dateStr === 'TBD') return 'TBD';
    const startDate = new Date(dateStr);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today!';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 0) return 'Ongoing';
    return `${diffDays} days`;
  };

  return (
    <div ref={containerRef} className="relative w-full min-h-screen p-4 pb-24 md:p-8 flex flex-col items-center bg-slate-50/50 overflow-x-hidden">
      {/* ─── Header ─── */}
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
          <button className="p-2 rounded-full bg-white border border-slate-100 text-slate-600 hover:text-sky-600 relative" onClick={() => onNavigate('notifications')}>
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
            )}
          </button>
          <button
            className="h-9 w-9 md:h-11 md:w-11 rounded-full bg-sky-400 p-[2px] cursor-pointer"
            onClick={() => onNavigate('profile')}
            aria-label="Open settings"
          >
            <div className="relative w-full h-full rounded-full border-2 border-white bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold overflow-hidden">
              {userProfilePicture ? (
                <img
                  src={userProfilePicture}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-bold">{(userName || 'E').charAt(0).toUpperCase()}</span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* ─── Main Grid ─── */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Left Column (2/3) ─── */}
        <div className="lg:col-span-2 space-y-6">
          {/* ─── Welcome / Weather Card ─── */}
          <div className={`dash-welcome w-full rounded-[2.5rem] p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[380px] md:min-h-[420px] transition-all duration-500 ${weather.isDay === 0 ? 'bg-slate-900' : 'bg-sky-600'}`}>
            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-[80px]"></div>
            <div className="absolute bottom-[-30%] left-[-15%] w-48 h-48 bg-white/5 rounded-full blur-[60px]"></div>

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

          {/* ─── AI Search Bar ─── */}
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

          {/* ─── Activity Stats Row ─── */}
          <div className="dash-section grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Trips', value: trips.length, icon: Plane, color: 'from-sky-500 to-blue-600', bgLight: 'bg-sky-50', textColor: 'text-sky-700' },
              { label: 'Upcoming', value: upcomingTrips.length, icon: Clock, color: 'from-amber-500 to-orange-600', bgLight: 'bg-amber-50', textColor: 'text-amber-700' },
              { label: 'Completed', value: completedTrips.length, icon: CheckCircle2, color: 'from-emerald-500 to-green-600', bgLight: 'bg-emerald-50', textColor: 'text-emerald-700' },
              { label: 'Saved', value: savedItems.length, icon: Heart, color: 'from-rose-500 to-pink-600', bgLight: 'bg-rose-50', textColor: 'text-rose-700' },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group" onClick={() => onNavigate(stat.label === 'Saved' ? 'saved' : 'trips')}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                  <stat.icon size={18} />
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-0.5">
                  {isLoadingData ? <div className="w-8 h-6 bg-slate-100 rounded animate-pulse"></div> : stat.value}
                </div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* ─── Recent Trips Section ─── */}
          <div className="dash-section bg-white rounded-[2rem] p-6 shadow-xl border border-slate-100">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Plane size={18} className="text-sky-500 -rotate-45" />
                Recent Trips
              </h3>
              <button onClick={() => onNavigate('trips')} className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1">
                View All <ChevronRight size={14} />
              </button>
            </div>
            <div className="space-y-3">
              {isLoadingData ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex gap-4 p-3 animate-pulse">
                    <div className="w-16 h-16 rounded-xl bg-slate-100"></div>
                    <div className="flex flex-col justify-center gap-2 flex-1">
                      <div className="w-32 h-4 bg-slate-100 rounded"></div>
                      <div className="w-20 h-3 bg-slate-100 rounded"></div>
                    </div>
                  </div>
                ))
              ) : trips.length > 0 ? (
                trips.slice(0, 4).map((trip, i) => {
                  const isUpcoming = trip.status === 'UPCOMING';
                  const isPast = trip.status === 'PAST';
                  const isDraft = trip.status === 'DRAFT';
                  return (
                    <div key={i} className="flex gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer group" onClick={() => onNavigate('trips')}>
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 relative">
                        <img 
                          src={trip.placePhotos?.[0] || LOGIN_IMAGES.POKHARA} 
                          alt={trip.tripName} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                      </div>
                      <div className="flex flex-col justify-center flex-1 min-w-0">
                        <h4 className="font-bold text-slate-800 text-sm truncate group-hover:text-sky-600 transition-colors">{trip.tripName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                            <MapPin size={10} /> {trip.placeName}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-center gap-1 shrink-0">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                          isPast ? 'bg-emerald-50 text-emerald-600' :
                          isDraft ? 'bg-amber-50 text-amber-600' :
                          'bg-sky-50 text-sky-600'
                        }`}>
                          {isPast ? 'Done' : isDraft ? 'Draft' : 'Upcoming'}
                        </span>
                        {isUpcoming && trip.startDate && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            {getDaysUntil(trip.startDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Plane size={24} className="text-slate-300 -rotate-45" />
                  </div>
                  <p className="text-slate-400 text-sm font-medium mb-3">No trips planned yet</p>
                  <button onClick={() => onNavigate('trips')} className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-700 transition-colors">
                    Create First Trip
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ─── Recent Chat History ─── */}
          {recentMessages.length > 0 && (
            <div className="dash-section bg-white rounded-[2rem] p-6 shadow-xl border border-slate-100">
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

        {/* ─── Right Column (1/3) ─── */}
        <div className="space-y-6">
          {/* ─── Quick Tools ─── */}
          <div className="grid grid-cols-2 gap-4">
            {tools.map((tool, index) => (
              <button key={index} onClick={tool.action} className={`dash-tool group bg-white p-6 rounded-[2rem] flex flex-col items-center justify-center gap-3 border border-slate-100 hover:shadow-xl transition-all hover:-translate-y-1 ${tool.hoverGlow}`}>
                <div className={`${tool.color} p-3 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform`}>{tool.icon}</div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{tool.label}</span>
              </button>
            ))}
          </div>

          {/* ─── Saved Items Section ─── */}
          <div className="dash-section bg-white rounded-[2rem] p-6 shadow-xl border border-slate-100">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Heart size={18} className="text-rose-500" />
                Saved Items
              </h3>
              <button onClick={() => onNavigate('saved')} className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1">
                View All <ChevronRight size={14} />
              </button>
            </div>
            <div className="space-y-3">
              {isLoadingData ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex gap-4 p-2 animate-pulse">
                    <div className="w-14 h-14 rounded-xl bg-slate-100"></div>
                    <div className="flex flex-col justify-center gap-2">
                       <div className="w-24 h-4 bg-slate-100 rounded"></div>
                       <div className="w-16 h-3 bg-slate-100 rounded"></div>
                    </div>
                  </div>
                ))
              ) : savedItems.length > 0 ? (
                savedItems.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex gap-4 p-2 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => onNavigate('saved')}>
                    <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 relative">
                      <img src={item.imageUrl || LOGIN_IMAGES.POKHARA} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex flex-col justify-center min-w-0 flex-1">
                      <h4 className="font-bold text-slate-800 text-sm truncate group-hover:text-sky-600 transition-colors">{item.title}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                          item.type === 'DESTINATION' ? 'bg-sky-50 text-sky-600' :
                          item.type === 'ITINERARY' ? 'bg-purple-50 text-purple-600' :
                          'bg-amber-50 text-amber-600'
                        }`}>
                          {item.type === 'DESTINATION' ? '📍 Place' : item.type === 'ITINERARY' ? '🗺️ Trip' : '📖 Guide'}
                        </span>
                        {item.location && (
                          <span className="text-[10px] text-slate-400 truncate">{item.location}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Heart size={20} className="text-rose-300" />
                  </div>
                  <p className="text-slate-400 text-sm font-medium mb-3">No saved items yet</p>
                  <button onClick={() => onNavigate('saved')} className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold hover:bg-rose-600 transition-colors">
                    Discover Places
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ─── Notifications Preview ─── */}
          <div className="dash-section bg-white rounded-[2rem] p-6 shadow-xl border border-slate-100">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Bell size={18} className="text-amber-500" />
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">{unreadCount}</span>
                )}
              </h3>
              <button onClick={() => onNavigate('notifications')} className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1">
                View All <ChevronRight size={14} />
              </button>
            </div>
            <div className="space-y-2">
              {isLoadingData ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex gap-3 p-3 animate-pulse">
                    <div className="w-9 h-9 rounded-full bg-slate-100"></div>
                    <div className="flex flex-col justify-center gap-2 flex-1">
                      <div className="w-full h-3 bg-slate-100 rounded"></div>
                      <div className="w-16 h-2.5 bg-slate-100 rounded"></div>
                    </div>
                  </div>
                ))
              ) : backendNotifications.length > 0 ? (
                backendNotifications.slice(0, 4).map((notif, i) => {
                  const typeConfig: Record<string, { bg: string; icon: React.ReactNode }> = {
                    info: { bg: 'bg-sky-100 text-sky-600', icon: <Globe size={14} /> },
                    success: { bg: 'bg-emerald-100 text-emerald-600', icon: <CheckCircle2 size={14} /> },
                    warning: { bg: 'bg-amber-100 text-amber-600', icon: <AlertCircle size={14} /> },
                    error: { bg: 'bg-red-100 text-red-600', icon: <AlertCircle size={14} /> },
                  };
                  const config = typeConfig[notif.type] || typeConfig.info;
                  return (
                    <div key={i} className={`flex gap-3 p-3 rounded-xl transition-colors cursor-pointer group ${notif.read ? 'hover:bg-slate-50' : 'bg-sky-50/50 hover:bg-sky-50'}`} onClick={() => onNavigate('notifications')}>
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${config.bg}`}>
                        {config.icon}
                      </div>
                      <div className="flex flex-col justify-center min-w-0 flex-1">
                        <p className={`text-sm leading-snug truncate ${notif.read ? 'text-slate-500' : 'text-slate-800 font-semibold'}`}>{notif.title || notif.message}</p>
                        <span className="text-[10px] text-slate-400 font-medium mt-0.5">{getRelativeTime(notif.createdAt)}</span>
                      </div>
                      {!notif.read && (
                        <div className="w-2 h-2 bg-sky-500 rounded-full mt-2 shrink-0"></div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Bell size={20} className="text-amber-300" />
                  </div>
                  <p className="text-slate-400 text-sm font-medium">All caught up!</p>
                  <p className="text-slate-300 text-xs mt-1">No new notifications</p>
                </div>
              )}
            </div>
          </div>

          {/* ─── Explore More Section ─── */}
          <div className="dash-section bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-6 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-[50px]"></div>
            <div className="relative z-10">
              <h3 className="font-bold text-white text-lg mb-2 flex items-center gap-2">
                <Compass size={18} className="text-sky-400" />
                Explore More
              </h3>
              <p className="text-slate-400 text-sm mb-5">Discover all ExploreMate tools</p>
              <div className="space-y-2">
                {[
                  { label: 'Route Optimizer', icon: <Route size={16} />, desc: 'Plan perfect routes', page: 'route-optimizer', gradient: 'from-emerald-500 to-teal-600' },
                  { label: 'AI Travel Guide', icon: <BrainCircuit size={16} />, desc: 'Smart suggestions', page: 'ai-suggestion', gradient: 'from-violet-500 to-purple-600' },
                  { label: 'Group Plans', icon: <Users size={16} />, desc: 'Travel together', page: 'group-plan', gradient: 'from-orange-500 to-red-600' },
                ].map((item, idx) => (
                  <button key={idx} onClick={() => onNavigate(item.page)} className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all group text-left">
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-bold">{item.label}</div>
                      <div className="text-slate-400 text-[10px]">{item.desc}</div>
                    </div>
                    <ChevronRight size={16} className="text-slate-500 group-hover:text-white transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Mobile Bottom Nav ─── */}
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
