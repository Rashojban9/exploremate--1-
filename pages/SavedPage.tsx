import React, { useCallback, useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { Trash2, MapPin, Calendar, ArrowRight, Heart, BookOpen, Plane, Grid, Compass, Mountain, User, Bell, X, Share2, Clock, Star, DollarSign, ExternalLink, Sparkles, ChevronDown, Filter, Search } from 'lucide-react';
import { deleteSavedItem, listSavedItems, createSavedItem, type SavedItemResponse, type SavedItemType } from '../services/api';
import { FAMOUS_PLACES, type FamousPlace } from '../data/famousPlaces';

type SavedItemUIType = 'destination' | 'itinerary' | 'article';

interface SavedItemUI {
  id: number | string;
  type: SavedItemUIType;
  title: string;
  location?: string;
  image: string;
  dateAdded: string;
  description: string;
  rating?: number;
  price?: string;
  duration?: string;
  stops?: number;
  budget?: string;
  author?: string;
  readTime?: string;
  tag?: string;
}

const DEFAULT_SAVED_IMAGE = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=800';

const mapSavedType = (type: SavedItemType): SavedItemUIType => {
  if (type === 'ITINERARY') return 'itinerary';
  if (type === 'ARTICLE') return 'article';
  return 'destination';
};

const relativeTime = (isoDate: string): string => {
  const target = new Date(isoDate).getTime();
  if (Number.isNaN(target)) return 'just now';

  const diffMs = Date.now() - target;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;

  if (diffMs < minute) return 'just now';
  if (diffMs < hour) return `${Math.floor(diffMs / minute)} min ago`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)} hour${Math.floor(diffMs / hour) > 1 ? 's' : ''} ago`;
  if (diffMs < week) return `${Math.floor(diffMs / day)} day${Math.floor(diffMs / day) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diffMs / week)} week${Math.floor(diffMs / week) > 1 ? 's' : ''} ago`;
};

const mapSavedItemToUI = (item: SavedItemResponse): SavedItemUI => {
  const type = mapSavedType(item.type);
  const base: SavedItemUI = {
    id: item.id,
    type,
    title: item.title,
    location: item.location ?? undefined,
    image: item.imageUrl ?? DEFAULT_SAVED_IMAGE,
    dateAdded: relativeTime(item.dateAdded),
    description: item.description ?? 'No description available.'
  };

  if (type === 'destination') {
    return { ...base, rating: 4.8, price: '$$' };
  }
  if (type === 'itinerary') {
    return { ...base, duration: 'Flexible', stops: 3, budget: '$$' };
  }
  return { ...base, author: 'ExploreMate', readTime: '5 min', tag: 'Guide' };
};

const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  all: { label: 'All', icon: '🌍' },
  trek: { label: 'Treks', icon: '🥾' },
  temple: { label: 'Temples', icon: '🛕' },
  lake: { label: 'Lakes', icon: '💧' },
  park: { label: 'National Parks', icon: '🌿' },
  adventure: { label: 'Adventure', icon: '🪂' },
  nature: { label: 'Nature', icon: '🏔️' },
  heritage: { label: 'Heritage', icon: '🏛️' },
  city: { label: 'Cities', icon: '🏙️' },
};

const PLACES_PER_PAGE = 12;

const SavedPage = ({ onLogout, onNavigate, isLoggedIn }: { onLogout: () => void, onNavigate: (page: string) => void, isLoggedIn?: boolean }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [savedItems, setSavedItems] = useState<SavedItemUI[]>([]);
  const [selectedItem, setSelectedItem] = useState<SavedItemUI | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  // Track which suggestion places are already saved (title → id)
  const [savedSuggestionMap, setSavedSuggestionMap] = useState<Record<string, string | number>>({});
  const [savingInProgress, setSavingInProgress] = useState<Record<string, boolean>>({});
  // Discover section state
  const [discoverCategory, setDiscoverCategory] = useState('all');
  const [visibleCount, setVisibleCount] = useState(PLACES_PER_PAGE);
  const [discoverSearch, setDiscoverSearch] = useState('');

  const loadSavedItems = useCallback(async () => {
    if (!isLoggedIn) {
      setSavedItems([]);
      setSavedSuggestionMap({});
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);
    try {
      const items = await listSavedItems();
      setSavedItems(items.map(mapSavedItemToUI));
      // Build suggestion map from loaded items
      const map: Record<string, string | number> = {};
      items.forEach((item) => { map[item.title] = item.id; });
      setSavedSuggestionMap(map);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load saved items.';
      setLoadError(message);
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    loadSavedItems();
  }, [loadSavedItems]);

  const handleToggleSuggestion = useCallback(async (place: FamousPlace) => {
    if (!isLoggedIn) {
      onNavigate('login');
      return;
    }
    if (savingInProgress[place.title]) return;
    setSavingInProgress((prev) => ({ ...prev, [place.title]: true }));

    try {
      const existingId = savedSuggestionMap[place.title];
      if (existingId !== undefined) {
        // Already saved → unsave
        await deleteSavedItem(existingId);
        setSavedSuggestionMap((prev) => {
          const next = { ...prev };
          delete next[place.title];
          return next;
        });
        // Remove from saved items list too
        setSavedItems((prev) => prev.filter((item) => item.title !== place.title));
      } else {
        // Not saved → save
        const created = await createSavedItem({
          type: 'DESTINATION',
          title: place.title,
          location: place.location,
          imageUrl: place.image,
          description: place.description,
        });
        setSavedSuggestionMap((prev) => ({ ...prev, [place.title]: created.id }));
        // Add to saved items list
        setSavedItems((prev) => [...prev, mapSavedItemToUI(created)]);
      }
    } catch (error) {
      console.error('Failed to toggle suggestion save', error);
    } finally {
      setSavingInProgress((prev) => ({ ...prev, [place.title]: false }));
    }
  }, [isLoggedIn, savedSuggestionMap, savingInProgress, onNavigate]);

  const filteredItems = activeFilter === 'all' 
    ? savedItems
    : savedItems.filter(item => item.type === activeFilter);

  useEffect(() => {
    // Header Animation Context
    const ctx = gsap.context(() => {
        gsap.fromTo('.dash-header', 
          { y: -30, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
        );

        // Modern Text Reveal
        gsap.fromTo('.reveal-text-char', 
            { y: 50, opacity: 0, skewY: 10, rotateZ: 5 },
            { y: 0, opacity: 1, skewY: 0, rotateZ: 0, stagger: 0.02, duration: 1, ease: 'power4.out', delay: 0.2 }
        );

        gsap.fromTo('.saved-header-anim', 
            { y: 30, opacity: 0 }, 
            { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.3 }
        );
        
        gsap.fromTo('.filter-chip', 
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, stagger: 0.05, duration: 0.5, ease: 'back.out(1.5)', delay: 0.4 }
        );
        
        // Mobile Nav Animation
        gsap.fromTo('.dash-nav-mobile',
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.6 }
        );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    // Grid Animation
    if (containerRef.current) {
        gsap.fromTo(containerRef.current.querySelectorAll('.saved-grid-item'),
            { y: 40, opacity: 0, scale: 0.95 },
            { 
                y: 0, 
                opacity: 1, 
                scale: 1, 
                duration: 0.6, 
                stagger: 0.08, 
                ease: 'power3.out', 
                clearProps: 'all' 
            }
        );
    }
  }, [activeFilter]);

  // Modal Animation
  useEffect(() => {
      if (selectedItem && modalRef.current) {
          gsap.fromTo(modalRef.current,
              { opacity: 0, scale: 0.9, y: 20 },
              { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.2)' }
          );
      }
  }, [selectedItem]);

  const splitText = (text: string) => {
    return text.split('').map((char, index) => (
      <span key={index} className="reveal-text-char inline-block whitespace-pre origin-bottom will-change-transform">
        {char}
      </span>
    ));
  };

  const onCardHover = (e: React.MouseEvent<HTMLDivElement>, enter: boolean) => {
    const target = e.currentTarget;
    const img = target.querySelector('.card-img');
    const badge = target.querySelector('.type-badge');
    const actionArea = target.querySelector('.action-area');
    
    if (enter) {
        gsap.to(target, { y: -8, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)', duration: 0.4, ease: 'power2.out' });
        gsap.to(img, { scale: 1.1, duration: 0.7, ease: 'power2.out' });
        gsap.to(badge, { y: -2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', duration: 0.3 });
        gsap.to(actionArea, { x: 5, color: '#0284c7', duration: 0.3 });
    } else {
        gsap.to(target, { y: 0, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', duration: 0.4, ease: 'power2.out' });
        gsap.to(img, { scale: 1, duration: 0.7, ease: 'power2.out' });
        gsap.to(badge, { y: 0, boxShadow: 'none', duration: 0.3 });
        gsap.to(actionArea, { x: 0, color: '#0f172a', duration: 0.3 });
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'destination': return <MapPin size={14} />;
      case 'itinerary': return <Plane size={14} />;
      case 'article': return <BookOpen size={14} />;
      default: return <Heart size={14} />;
    }
  };

  const getLabel = (type: string) => {
    switch(type) {
        case 'destination': return 'Place';
        case 'itinerary': return 'Trip Plan';
        case 'article': return 'Guide';
        default: return 'Item';
      }
  };

  const handleDeleteSavedItem = async (itemId: number | string) => {
    if (!window.confirm('Remove this saved item?')) return;

    try {
      await deleteSavedItem(itemId);
      setSavedItems((prev) => prev.filter((item) => item.id !== itemId));
      setSelectedItem((current) => (current?.id === itemId ? null : current));
      setLoadError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to delete saved item.';
      setLoadError(message);
    }
  };

  const navItems = [
    { label: 'Explore', icon: Compass, page: 'dashboard' },
    { label: 'Saved', icon: Mountain, page: 'saved' },
    { label: 'Trips', icon: Calendar, page: 'trips' },
    { label: 'Profile', icon: User, page: 'profile' }
  ];

  return (
    <div ref={containerRef} className="relative w-full min-h-screen p-4 pb-24 md:p-8 flex flex-col items-center bg-slate-50/50">
      
      {/* Dashboard Header */}
      <div className="dash-header w-full max-w-6xl flex items-center justify-between mb-8 z-20 relative">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate('landing')}>
          <div className="bg-sky-600 p-2 rounded-lg text-white shadow-lg shadow-sky-600/20 group-hover:scale-110 transition-transform duration-300">
            <Plane size={24} className="-rotate-45" />
          </div>
          <span className="font-display font-bold text-xl text-sky-900 tracking-tight group-hover:text-sky-600 transition-colors">ExploreMate</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2 bg-white/80 backdrop-blur-xl px-2 py-2 rounded-full border border-white/50 shadow-sm ring-1 ring-slate-100">
          {navItems.map((item, i) => (
             <button 
                key={item.label} 
                onClick={() => onNavigate(item.page)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                    item.page === 'saved'
                    ? 'bg-slate-900 text-white shadow-md transform scale-105' 
                    : 'text-slate-500 hover:text-sky-600 hover:bg-sky-50'
                }`}
             >
                <item.icon size={16} className={item.page === 'saved' ? 'fill-white' : ''} />
                {item.label}
             </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button 
             onClick={() => onNavigate('notifications')}
             className="p-2.5 rounded-full bg-white hover:bg-sky-50 transition-colors text-slate-600 hover:text-sky-600 relative border border-slate-100 shadow-sm hover:shadow-md"
          >
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
          </button>
          <button onClick={onLogout} className="text-sm font-bold text-slate-500 hover:text-red-500 transition-colors hidden sm:block">
            Log Out
          </button>
          <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-sky-400 to-sky-600 p-[2px] shadow-lg cursor-pointer hover:scale-110 transition-transform duration-300" onClick={() => onNavigate('profile')}>
             <img src="https://i.pravatar.cc/150?img=32" alt="Profile" className="w-full h-full rounded-full border-2 border-white object-cover" />
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="w-full max-w-6xl z-10">
        <div ref={headerRef} className="mb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8">
                <div>
                    <h1 className="text-4xl md:text-6xl font-display font-bold text-slate-900 mb-4 tracking-tight overflow-hidden">
                        {splitText("Your Collection")}
                    </h1>
                    <p className="saved-header-anim text-slate-500 text-lg max-w-lg">
                        {savedItems.length} saved items waiting for your next adventure. Organized and ready when you are.
                    </p>
                </div>
                
                {/* Modern Filter Tabs */}
                <div className="bg-white p-1.5 rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 inline-flex flex-wrap gap-1">
                    {['all', 'destination', 'itinerary', 'article'].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`filter-chip px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 capitalize flex items-center gap-2 ${
                                activeFilter === filter 
                                ? 'bg-slate-900 text-white shadow-md transform scale-105' 
                                : 'text-slate-500 hover:text-sky-700 hover:bg-slate-50'
                            }`}
                        >
                            {filter === 'all' && <Grid size={14} />}
                            {filter === 'all' ? 'All' : filter + 's'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="h-96 bg-white rounded-[2.5rem] border border-slate-100"></div>
                    ))}
                </div>
            ) : loadError ? (
                <div className="text-center py-16 bg-red-50 rounded-[2.5rem] border border-red-200">
                    <h3 className="text-2xl font-bold text-red-700 mb-3 font-display">Unable to load saved items</h3>
                    <p className="text-red-500 max-w-md mx-auto mb-6">{loadError}</p>
                    <button onClick={loadSavedItems} className="px-6 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors">
                        Retry
                    </button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredItems.map((item) => (
                        <div 
                            key={item.id} 
                            className="saved-grid-item group bg-white rounded-[2.5rem] p-4 shadow-sm border border-slate-100 flex flex-col h-full cursor-pointer relative overflow-hidden"
                            onMouseEnter={(e) => onCardHover(e, true)}
                            onMouseLeave={(e) => onCardHover(e, false)}
                            onClick={() => setSelectedItem(item)}
                        >
                            <div className="relative h-64 rounded-[2rem] overflow-hidden mb-5">
                                <img src={item.image} alt={item.title} className="card-img w-full h-full object-cover transition-transform duration-700" />
                                <div className="absolute top-4 left-4 flex gap-2">
                                    <div className="type-badge px-4 py-2 bg-white/90 backdrop-blur-xl rounded-full text-xs font-bold text-slate-800 flex items-center gap-2 shadow-sm uppercase tracking-wider transition-all duration-300">
                                        {getIcon(item.type)} {getLabel(item.type)}
                                    </div>
                                </div>
                                <button
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleDeleteSavedItem(item.id);
                                    }}
                                    className="absolute top-4 right-4 p-3 bg-white/20 backdrop-blur-xl text-white rounded-full hover:bg-red-500 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-[-10px] group-hover:translate-y-0"
                                >
                                    <Trash2 size={18} />
                                </button>
                                
                                {/* Gradient Overlay on Hover */}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                            </div>

                            <div className="px-2 pb-2 flex flex-col flex-grow">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-2xl font-bold text-slate-900 font-display leading-tight group-hover:text-sky-600 transition-colors duration-300">
                                        {item.title}
                                    </h3>
                                </div>

                                {/* Type Specific Details */}
                                <div className="mb-6 space-y-2">
                                    {item.type === 'destination' && (
                                        <div className="flex items-center justify-between text-sm font-medium">
                                            <span className="flex items-center gap-2 text-slate-500"><MapPin size={16} className="text-sky-400" /> {item.location || 'Nepal'}</span>
                                            <span className="text-slate-900 bg-slate-100 px-2 py-1 rounded-lg">{item.price}</span>
                                        </div>
                                    )}
                                    {item.type === 'itinerary' && (
                                        <div className="flex items-center justify-between text-sm font-medium">
                                            <span className="flex items-center gap-2 text-slate-500"><Calendar size={16} className="text-purple-400" /> {item.duration}</span>
                                            <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full text-xs">{item.budget}</span>
                                        </div>
                                    )}
                                    {item.type === 'article' && (
                                        <div className="flex items-center justify-between text-sm font-medium">
                                            <span className="flex items-center gap-2 text-slate-500"><BookOpen size={16} className="text-orange-400" /> {item.readTime}</span>
                                            <span className="text-slate-400 text-xs">by {item.author}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-auto pt-5 border-t border-slate-50 flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">Added {item.dateAdded}</span>
                                    <button className="action-area flex items-center gap-2 text-sm font-bold text-slate-900 transition-all duration-300">
                                        View Details <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {!isLoading && !loadError && filteredItems.length === 0 && (
                <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-slate-200 shadow-sm animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                        <Heart size={36} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3 font-display">Collection Empty</h3>
                    <p className="text-slate-500 max-w-xs mx-auto mb-8">It looks like you haven't saved any items yet. Save famous places below to build your dream collection.</p>
                </div>
            )}

            {/* ─── Discover Famous Places Section ─── */}
            {!isLoading && !loadError && (() => {
              const filteredByCategory = discoverCategory === 'all' 
                ? FAMOUS_PLACES 
                : FAMOUS_PLACES.filter(p => p.category === discoverCategory);
              
              const categoryPlaces = discoverSearch 
                ? filteredByCategory.filter(p => 
                    p.title.toLowerCase().includes(discoverSearch.toLowerCase()) || 
                    p.location.toLowerCase().includes(discoverSearch.toLowerCase())
                  )
                : filteredByCategory;

              const visiblePlaces = categoryPlaces.slice(0, visibleCount);
              const hasMore = visibleCount < categoryPlaces.length;

              return (
              <div className="mt-16">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl text-white shadow-lg shadow-orange-500/20">
                      <Sparkles size={22} />
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900">Discover Famous Places</h2>
                      <p className="text-slate-500 text-sm">{categoryPlaces.length} destinations in Nepal — tap the heart to save</p>
                    </div>
                  </div>
                  
                  <div className="relative group max-w-md w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search destinations or locations..."
                      value={discoverSearch}
                      onChange={(e) => { setDiscoverSearch(e.target.value); setVisibleCount(PLACES_PER_PAGE); }}
                      className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-sm"
                    />
                  </div>
                </div>

                {/* Category Filter Tabs */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {Object.entries(CATEGORY_LABELS).map(([key, { label, icon }]) => (
                    <button
                      key={key}
                      onClick={() => { setDiscoverCategory(key); setVisibleCount(PLACES_PER_PAGE); }}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-1.5 ${
                        discoverCategory === key
                          ? 'bg-gradient-to-r from-sky-500 to-purple-600 text-white shadow-lg shadow-sky-500/20 scale-105'
                          : 'bg-white text-slate-600 border border-slate-200 hover:border-sky-300 hover:text-sky-600 hover:shadow-md'
                      }`}
                    >
                      <span>{icon}</span> {label}
                      {key !== 'all' && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-md ${
                          discoverCategory === key ? 'bg-white/20' : 'bg-slate-100'
                        }`}>
                          {FAMOUS_PLACES.filter(p => p.category === key).length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visiblePlaces.map((place) => {
                    const isSaved = savedSuggestionMap[place.title] !== undefined;
                    const isSaving = savingInProgress[place.title];
                    return (
                      <div
                        key={place.title}
                        className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-500"
                      >
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={place.image}
                            alt={place.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                          <button
                            onClick={() => handleToggleSuggestion(place)}
                            disabled={isSaving}
                            className={`absolute top-3 right-3 p-2.5 rounded-full transition-all duration-300 hover:scale-110 ${
                              isSaved
                                ? 'bg-white shadow-lg text-red-500'
                                : 'bg-black/20 backdrop-blur-sm text-white hover:bg-white hover:text-red-500'
                            } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <Heart size={18} className={isSaved ? 'fill-red-500 text-red-500' : ''} />
                          </button>
                          <div className="absolute top-3 left-3">
                            <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-bold text-slate-600 uppercase tracking-wider shadow-sm">
                              {CATEGORY_LABELS[place.category]?.icon} {CATEGORY_LABELS[place.category]?.label}
                            </span>
                          </div>
                          <div className="absolute bottom-3 left-3 flex items-center gap-2">
                            <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-slate-800 flex items-center gap-1 shadow-sm">
                              <Star size={10} className="text-amber-400 fill-amber-400" /> {place.rating}
                            </span>
                            <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-emerald-700 shadow-sm">
                              {place.price}
                            </span>
                          </div>
                        </div>
                        <div className="p-5">
                          <h3 className="text-lg font-bold text-slate-900 font-display mb-1 group-hover:text-sky-600 transition-colors">
                            {place.title}
                          </h3>
                          <div className="flex items-center gap-1 text-slate-500 text-xs font-medium mb-3">
                            <MapPin size={12} className="text-sky-400" /> {place.location}
                          </div>
                          <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
                            {place.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Show More / Show Less */}
                <div className="flex justify-center mt-10">
                  {hasMore ? (
                    <button
                      onClick={() => setVisibleCount((prev) => prev + PLACES_PER_PAGE)}
                      className="px-8 py-3.5 bg-gradient-to-r from-sky-500 to-purple-600 text-white rounded-2xl font-bold hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-sky-500/20"
                    >
                      <ChevronDown size={20} />
                      Show More ({categoryPlaces.length - visibleCount} remaining)
                    </button>
                  ) : visibleCount > PLACES_PER_PAGE && (
                    <button
                      onClick={() => setVisibleCount(PLACES_PER_PAGE)}
                      className="px-8 py-3.5 bg-white text-slate-600 border border-slate-200 rounded-2xl font-bold hover:border-sky-300 hover:text-sky-600 transition-all duration-300 flex items-center gap-2"
                    >
                      Show Less
                    </button>
                  )}
                </div>
              </div>
              );
            })()}
        </div>
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-opacity">
              <div 
                ref={modalRef}
                className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col"
              >
                  <button 
                    onClick={() => setSelectedItem(null)}
                    className="absolute top-4 right-4 z-10 p-2 bg-black/20 text-white rounded-full backdrop-blur-md hover:bg-black/40 transition-colors"
                  >
                      <X size={24} />
                  </button>

                  <div className="relative h-64 sm:h-80 shrink-0">
                      <img src={selectedItem.image} alt={selectedItem.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      <div className="absolute bottom-6 left-8 text-white">
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-3 border border-white/20">
                              {getIcon(selectedItem.type)} {getLabel(selectedItem.type)}
                          </div>
                          <h2 className="text-3xl sm:text-4xl font-display font-bold">{selectedItem.title}</h2>
                      </div>
                  </div>

                  <div className="p-8 overflow-y-auto">
                      <div className="flex flex-wrap gap-4 mb-8 text-sm">
                          {selectedItem.type === 'destination' && (
                              <>
                                  <span className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl font-bold text-slate-700">
                                      <MapPin size={16} className="text-sky-500" /> {selectedItem.location}
                                  </span>
                                  <span className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl font-bold text-slate-700">
                                      <Star size={16} className="text-orange-400 fill-orange-400" /> {selectedItem.rating}
                                  </span>
                                  <span className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl font-bold text-slate-700">
                                      <DollarSign size={16} className="text-emerald-500" /> {selectedItem.price}
                                  </span>
                              </>
                          )}
                          {selectedItem.type === 'itinerary' && (
                              <>
                                  <span className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl font-bold text-slate-700">
                                      <Calendar size={16} className="text-purple-500" /> {selectedItem.duration}
                                  </span>
                                  <span className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl font-bold text-slate-700">
                                      <MapPin size={16} className="text-sky-500" /> {selectedItem.stops} Stops
                                  </span>
                                  <span className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl font-bold text-slate-700">
                                      <DollarSign size={16} className="text-emerald-500" /> {selectedItem.budget}
                                  </span>
                              </>
                          )}
                          {selectedItem.type === 'article' && (
                              <>
                                  <span className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl font-bold text-slate-700">
                                      <User size={16} className="text-sky-500" /> {selectedItem.author}
                                  </span>
                                  <span className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl font-bold text-slate-700">
                                      <Clock size={16} className="text-orange-500" /> {selectedItem.readTime}
                                  </span>
                                  <span className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl font-bold text-slate-700">
                                      <BookOpen size={16} className="text-purple-500" /> {selectedItem.tag}
                                  </span>
                              </>
                          )}
                      </div>

                      <div className="prose prose-slate max-w-none mb-8">
                          <h3 className="text-xl font-bold text-slate-900 mb-2">About this {getLabel(selectedItem.type).toLowerCase()}</h3>
                          <p className="text-slate-600 leading-relaxed text-lg">
                              {selectedItem.description}
                          </p>
                      </div>

                      <div className="flex gap-4 border-t border-slate-100 pt-6">
                          <button className="flex-1 py-4 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 transition-all shadow-lg shadow-sky-600/20 flex items-center justify-center gap-2">
                              {selectedItem.type === 'destination' ? 'Plan a Trip Here' : (selectedItem.type === 'itinerary' ? 'Use Template' : 'Read Article')} 
                              <ArrowRight size={20} />
                          </button>
                          <button className="p-4 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200">
                              <Share2 size={24} />
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
      
      {/* Bottom Nav (Mobile Only) */}
      <div className="dash-nav-mobile md:hidden fixed bottom-4 left-4 right-4 bg-gradient-to-tr from-sky-600 via-blue-600 to-sky-700 backdrop-blur-xl border border-white/20 py-4 px-8 rounded-2xl shadow-xl shadow-sky-900/20 z-50 flex items-center justify-between ring-1 ring-white/20">
        {navItems.map((item, i) => {
           const isActive = item.page === 'saved';
           return (
            <button 
                key={item.label} 
                onClick={() => onNavigate(item.page)}
                className={`flex flex-col items-center gap-1 transition-all duration-300 relative p-2 rounded-xl ${isActive ? 'text-white scale-110' : 'text-sky-200 hover:text-white hover:bg-white/10'}`}
            >
                <item.icon size={24} className={`transition-all duration-300 ${isActive ? 'fill-white drop-shadow-md' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && <span className="absolute -bottom-2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"></span>}
            </button>
           );
        })}
      </div>
    </div>
  );
};

export default SavedPage;
