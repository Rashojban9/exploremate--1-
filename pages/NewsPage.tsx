import React, { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Cloud, Sun, CloudRain, Snowflake, Wind, CloudLightning, Droplets, Newspaper, ArrowRight, MapPin, ExternalLink, RefreshCw, AlertTriangle, Clock, Loader2 } from 'lucide-react';
import { Navbar, Footer } from '../components/Navigation';

gsap.registerPlugin(ScrollTrigger);

// --- Types ---
interface WeatherData {
  city: string;
  temp: number;
  condition: number;
  wind: number;
  humidity: number;
  isDay: number;
}

interface NewsItem {
  id: string | number;
  title: string;
  summary: string;
  source: string;
  date: string;
  image: string;
  category: string;
  link?: string;
}

// --- Constants ---
const NEPAL_CITIES = [
  { name: 'Kathmandu', lat: 27.7172, lon: 85.3240 },
  { name: 'Pokhara', lat: 28.2096, lon: 83.9856 },
  { name: 'Lukla', lat: 27.6857, lon: 86.7266 }, // Everest Region
  { name: 'Chitwan', lat: 27.5291, lon: 84.3542 },
  { name: 'Lumbini', lat: 27.4840, lon: 83.2760 },
];

const NewsPage = ({ onNavigate, isLoggedIn }: { onNavigate: (page: string) => void, isLoggedIn?: boolean }) => {
  const [weatherList, setWeatherList] = useState<WeatherData[]>([]);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [nepalTime, setNepalTime] = useState<string>("");
  const [activeSource, setActiveSource] = useState<string>("OnlineKhabar");

  // Update Nepal Time Clock
  useEffect(() => {
    const updateTime = () => {
      // Kathmandu is Asia/Kathmandu (UTC+5:45)
      const timeString = new Date().toLocaleTimeString("en-US", {
        timeZone: "Asia/Kathmandu",
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      setNepalTime(timeString);
    };
    
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Weather for all cities
  const fetchAllWeather = async () => {
    // Only show loading spinner on initial load, not background refreshes
    if (weatherList.length === 0) setLoadingWeather(true);
    
    try {
      const promises = NEPAL_CITIES.map(async (city) => {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,weather_code,is_day,wind_speed_10m,relative_humidity_2m&temperature_unit=celsius`
        );
        const data = await res.json();
        return {
          city: city.name,
          temp: Math.round(data.current.temperature_2m),
          condition: data.current.weather_code,
          wind: data.current.wind_speed_10m,
          humidity: data.current.relative_humidity_2m,
          isDay: data.current.is_day
        };
      });

      const results = await Promise.all(promises);
      setWeatherList(results);
    } catch (error) {
      console.error("Error fetching weather:", error);
    } finally {
      setLoadingWeather(false);
    }
  };

  // Fetch Real News via RSS to JSON bridge
  const fetchRealNews = async () => {
    setLoadingNews(true);
    
    // Fallback strategy: Try multiple reliable RSS feeds from Nepal
    // Prioritized OnlineKhabar as requested
    const feeds = [
      { url: 'https://english.onlinekhabar.com/feed', name: 'OnlineKhabar' },
      { url: 'https://www.nepalitimes.com/feed', name: 'Nepali Times' },
      { url: 'https://thehimalayantimes.com/feed', name: 'Himalayan Times' }
    ];

    let success = false;

    for (const feed of feeds) {
        try {
            console.log(`Attempting to fetch news from ${feed.name}...`);
            // rss2json is a free bridge to convert RSS XML to JSON
            const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`);
            const data = await res.json();
      
            if (data.status === 'ok' && data.items && data.items.length > 0) {
                const mappedNews: NewsItem[] = data.items.slice(0, 9).map((item: any, index: number) => {
                    // Extract image from content if thumbnail is missing
                    let imageUrl = item.thumbnail || item.enclosure?.link;
                    if (!imageUrl) {
                        // Regex to try and find an image tag in the description
                        const imgMatch = item.description?.match(/<img[^>]+src="([^">]+)"/);
                        if (imgMatch) imageUrl = imgMatch[1];
                        
                        // Try content if description doesn't have it
                        if (!imageUrl && item.content) {
                             const contentImgMatch = item.content.match(/<img[^>]+src="([^">]+)"/);
                             if (contentImgMatch) imageUrl = contentImgMatch[1];
                        }
                    }

                    // Clean up summary
                    const rawSummary = item.description || item.content || "";
                    const cleanSummary = rawSummary.replace(/<[^>]*>?/gm, '').substring(0, 160) + "...";

                    return {
                        id: `real-${index}`,
                        title: item.title,
                        summary: cleanSummary,
                        source: feed.name,
                        date: new Date(item.pubDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                        image: imageUrl || "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=800", // Generic Nepal Image
                        category: "Latest",
                        link: item.link
                    };
                });
                
                setNewsList(mappedNews);
                setActiveSource(feed.name);
                success = true;
                break; // Stop loop on success
            }
        } catch (error) {
            console.warn(`Failed to fetch ${feed.name}, trying next source...`, error);
        }
    }

    if (!success) {
        console.warn("All real news feeds failed.");
        setNewsList([]);
        setActiveSource("Unavailable");
    }

    setLoadingNews(false);
  };

  useEffect(() => {
    fetchAllWeather();
    fetchRealNews();
    
    // Auto-refresh weather every minute
    const weatherInterval = setInterval(fetchAllWeather, 60000);
    return () => clearInterval(weatherInterval);
  }, []);

  // Animations
  useEffect(() => {
    if (!loadingNews && newsList.length > 0) {
      const tl = gsap.timeline();

      tl.fromTo('.news-header', 
          { y: -30, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      );

      // Weather Cards Stagger
      tl.fromTo('.weather-card', 
          { y: 30, opacity: 0, scale: 0.9 },
          { y: 0, opacity: 1, scale: 1, stagger: 0.1, duration: 0.6, ease: 'back.out(1.5)' },
          "-=0.4"
      );

      // News Items
      gsap.utils.toArray('.news-item').forEach((elem: any) => {
        gsap.fromTo(elem, 
          { y: 50, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: elem, start: 'top 85%' }
          }
        );
      });
    }
  }, [loadingWeather, loadingNews, newsList.length]);

  const getWeatherIcon = (code: number, isDay: number) => {
    if (code >= 95) return <CloudLightning size={32} className="text-purple-500" />;
    if (code >= 71) return <Snowflake size={32} className="text-sky-300" />;
    if (code >= 51) return <CloudRain size={32} className="text-blue-500" />;
    if (code >= 45) return <Wind size={32} className="text-slate-400" />;
    if (code <= 3 && isDay === 1) return <Sun size={32} className="text-orange-400 animate-spin-slow" />;
    return <Cloud size={32} className="text-slate-400" />;
  };

  const getConditionText = (code: number) => {
     if (code === 0) return "Clear";
     if (code <= 3) return "Partly Cloudy";
     if (code <= 48) return "Foggy";
     if (code <= 67) return "Rainy";
     if (code <= 77) return "Snow";
     return "Thunderstorm";
  };

  return (
    <div className="w-full relative min-h-screen bg-slate-50/50">
      <Navbar onNavigate={onNavigate} isLoggedIn={isLoggedIn} />

      <section className="pt-32 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="news-header flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-slate-900 leading-tight">
              Nepal <span className="text-sky-600">News & Weather</span>
            </h1>
            <p className="text-slate-500 mt-4 text-lg max-w-2xl">
              Stay informed with real-time weather conditions across the Himalayas and the latest stories.
            </p>
          </div>
          <div className="text-right">
             <div className="flex items-center justify-end gap-2 text-sm font-bold text-sky-600 uppercase tracking-widest mb-1">
                <Clock size={16} /> Nepal Time
             </div>
             <div className="text-4xl font-display font-bold text-slate-800">
               {nepalTime || "--:-- --"}
             </div>
             <div className="text-slate-400 font-medium text-sm mt-1">
               {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
             </div>
          </div>
        </div>

        {/* Weather Dashboard */}
        <div className="mb-16">
           <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                 <Cloud size={24} className="text-sky-500" /> Live Conditions
              </h2>
              <div className="flex gap-2">
                <button onClick={fetchAllWeather} className="p-2 hover:bg-white rounded-full transition-colors text-slate-500 hover:text-sky-600" title="Refresh Weather">
                   <RefreshCw size={20} className={loadingWeather ? "animate-spin" : ""} />
                </button>
              </div>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {weatherList.map((weather, idx) => (
                 <div key={idx} className="weather-card bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md hover:border-sky-200 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                       <span className="font-bold text-slate-700">{weather.city}</span>
                       {getWeatherIcon(weather.condition, weather.isDay)}
                    </div>
                    <div className="mb-2">
                       <span className="text-3xl font-display font-bold text-slate-900">{weather.temp}°</span>
                       <span className="text-sm text-slate-400 ml-1">{getConditionText(weather.condition)}</span>
                    </div>
                    <div className="flex gap-3 text-xs text-slate-400 font-medium">
                       <span className="flex items-center gap-1"><Wind size={12} /> {weather.wind} km/h</span>
                       <span className="flex items-center gap-1"><Droplets size={12} /> {weather.humidity}%</span>
                    </div>
                 </div>
              ))}
              {loadingWeather && weatherList.length === 0 && Array(5).fill(0).map((_, i) => (
                 <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 h-40 animate-pulse">
                    <div className="w-20 h-4 bg-slate-100 rounded mb-4"></div>
                    <div className="w-10 h-10 bg-slate-100 rounded-full mb-4"></div>
                    <div className="w-16 h-8 bg-slate-100 rounded"></div>
                 </div>
              ))}
           </div>
        </div>

        {/* News Feed */}
        <div className="grid lg:grid-cols-3 gap-12">
           {/* Main Feed */}
           <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-8">
                 <h2 className="text-2xl font-bold text-slate-800">Latest Headlines</h2>
                 {loadingNews && (
                    <div className="flex items-center gap-2 text-sky-600 font-bold text-sm animate-pulse">
                       <Loader2 size={16} className="animate-spin" /> Updating Feed...
                    </div>
                 )}
                 {!loadingNews && newsList.length > 0 && (
                     <span className="text-xs font-bold px-3 py-1 rounded-full flex items-center gap-2 bg-emerald-100 text-emerald-700">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Connected
                     </span>
                 )}
              </div>

              {!loadingNews && newsList.length === 0 && (
                 <div className="bg-orange-50 border border-orange-200 p-8 rounded-xl flex flex-col items-center justify-center text-center gap-3 mb-6">
                    <AlertTriangle size={32} className="text-orange-500" />
                    <div className="text-orange-800">
                       <h3 className="font-bold text-lg">Unable to load news</h3>
                       <p className="text-sm mt-1">We couldn't connect to the news feed at this time. Please try again later.</p>
                       <button onClick={fetchRealNews} className="mt-4 px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-800 font-bold rounded-lg text-sm transition-colors flex items-center gap-2 mx-auto">
                           <RefreshCw size={14} /> Retry
                       </button>
                    </div>
                 </div>
              )}

              {loadingNews ? (
                 <div className="space-y-6">
                    {[1,2,3,4,5].map(i => (
                       <div key={i} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 animate-pulse">
                          <div className="w-full md:w-48 h-48 bg-slate-100 rounded-2xl shrink-0"></div>
                          <div className="flex-grow space-y-3 py-2">
                             <div className="w-32 h-4 bg-slate-100 rounded"></div>
                             <div className="w-full h-8 bg-slate-100 rounded"></div>
                             <div className="w-full h-16 bg-slate-100 rounded"></div>
                             <div className="w-24 h-4 bg-slate-100 rounded mt-auto"></div>
                          </div>
                       </div>
                    ))}
                 </div>
              ) : (
                 newsList.map((news) => (
                    <div key={news.id} className="news-item bg-white rounded-[2rem] p-4 md:p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group flex flex-col md:flex-row gap-6">
                       <div className="w-full md:w-48 h-48 rounded-2xl overflow-hidden shrink-0 relative bg-slate-100 border border-slate-100">
                          {news.image ? (
                             <img src={news.image} alt={news.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" onError={(e) => (e.currentTarget.src = "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=400")} />
                          ) : (
                             <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <Newspaper size={32} />
                             </div>
                          )}
                          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-lg text-slate-800 shadow-sm border border-white/50">
                             {news.category}
                          </div>
                       </div>
                       <div className="flex flex-col justify-center flex-grow">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                             <span className="text-red-600">{news.source}</span>
                             <span>•</span>
                             <span>{news.date}</span>
                          </div>
                          <h3 className="text-xl font-bold font-display text-slate-900 mb-3 group-hover:text-sky-700 transition-colors leading-tight">
                             {news.title}
                          </h3>
                          <div className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2" dangerouslySetInnerHTML={{ __html: news.summary }} />
                          
                          {news.link ? (
                             <a href={news.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors mt-auto">
                                Read Full Story <ExternalLink size={16} />
                             </a>
                          ) : (
                             <button className="flex items-center gap-2 text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors mt-auto">
                                Read Full Story <ArrowRight size={16} />
                             </button>
                          )}
                       </div>
                    </div>
                 ))
              )}
           </div>

           {/* Sidebar */}
           <div className="space-y-8">
              {/* Emergency Contacts */}
              <div className="bg-sky-50 rounded-[2rem] p-6 border border-sky-100 news-item">
                 <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <MapPin size={18} className="text-sky-600" /> Tourist Police
                 </h3>
                 <div className="space-y-3">
                    <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm">
                       <span className="text-sm font-medium text-slate-600">Kathmandu HQ</span>
                       <span className="text-sm font-bold text-sky-700">1144</span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm">
                       <span className="text-sm font-medium text-slate-600">Pokhara</span>
                       <span className="text-sm font-bold text-sky-700">061-462761</span>
                    </div>
                 </div>
                 <p className="text-xs text-slate-400 mt-4 leading-relaxed">
                    Always carry your TIMS card and permits while trekking. In case of emergency, dial 100 for Police.
                 </p>
              </div>

              {/* Quick Links */}
              <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm news-item">
                 <h3 className="font-bold text-slate-900 mb-4">Official Resources</h3>
                 <ul className="space-y-3">
                    {[
                      { name: 'Nepal Tourism Board', url: 'https://ntb.gov.np/' },
                      { name: 'Trekking Agencies Assoc.', url: 'https://www.taan.org.np/' },
                      { name: 'Dept. of Immigration', url: 'https://www.immigration.gov.np/' }
                    ].map((item, i) => (
                       <li key={i}>
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-sm font-medium text-slate-500 hover:text-sky-600 transition-colors group">
                             {item.name}
                             <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                       </li>
                    ))}
                 </ul>
              </div>
           </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default NewsPage;