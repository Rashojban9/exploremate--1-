import React, { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { Trash2, MapPin, Calendar, ArrowRight, Heart, BookOpen, Plane, Grid, Compass, Mountain, User, Bell, X, Share2, Clock, Star, DollarSign, ExternalLink } from 'lucide-react';

const SAVED_ITEMS = [
  {
    id: 1,
    type: 'destination',
    title: 'Kyoto Ancient Temples',
    location: 'Kyoto, Japan',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800',
    dateAdded: '2 days ago',
    rating: 4.9,
    price: '$1,200',
    description: "Immerse yourself in the tranquility of Kyoto's historic temples. Experience traditional tea ceremonies, walk through the iconic Fushimi Inari shrines, and witness the breathtaking cherry blossoms in spring. This destination offers a perfect blend of spiritual heritage and natural beauty."
  },
  {
    id: 2,
    type: 'itinerary',
    title: '2-Week Euro Summer',
    duration: '14 Days',
    image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&q=80&w=800',
    dateAdded: '1 week ago',
    stops: 5,
    budget: '$$$',
    description: "A comprehensive tour through the highlights of Western Europe. Starting in Paris, moving through the Swiss Alps, and ending in the coastal towns of Italy. Perfect for first-time travelers wanting to see the classics."
  },
  {
    id: 3,
    type: 'article',
    title: 'Hidden Gems in Himalayas',
    author: 'Sarah Jenkins',
    image: 'https://images.unsplash.com/photo-1585970281220-41834220b3c6?auto=format&fit=crop&q=80&w=800',
    dateAdded: '2 weeks ago',
    readTime: '9 min',
    tag: 'Adventure',
    description: "Beyond Everest Base Camp lies a world of untouched valleys and ancient monasteries. Discover the trekking routes less traveled, where local culture remains untouched by mass tourism."
  },
  {
    id: 4,
    type: 'destination',
    title: 'Santorini Sunset',
    location: 'Santorini, Greece',
    image: 'https://images.unsplash.com/photo-1613395877344-13d4c79e4284?auto=format&fit=crop&q=80&w=800',
    dateAdded: '3 weeks ago',
    rating: 4.8,
    price: '$2,400',
    description: "Famous for its stunning sunsets and white-washed buildings, Santorini is the jewel of the Aegean Sea. Explore volcanic beaches, ancient vineyards, and luxury cliffside resorts."
  },
  {
    id: 5,
    type: 'itinerary',
    title: 'Tokyo Food Tour',
    duration: '3 Days',
    image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&q=80&w=800',
    dateAdded: '1 month ago',
    stops: 12,
    budget: '$$',
    description: "A culinary journey through Tokyo's most vibrant districts. From early morning sushi at Tsukiji Outer Market to late-night ramen in Shinjuku, taste the best of Japanese cuisine."
  },
  {
    id: 6,
    type: 'article',
    title: 'Digital Nomad Life in Bali',
    author: 'Alex Chen',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800',
    dateAdded: '1 month ago',
    readTime: '6 min',
    tag: 'Lifestyle',
    description: "Looking to take your office on the road? We explore the best co-working spaces, cafes, and living arrangements in Bali for the modern remote worker."
  }
];

const SavedPage = ({ onLogout, onNavigate, isLoggedIn }: { onLogout: () => void, onNavigate: (page: string) => void, isLoggedIn?: boolean }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<typeof SAVED_ITEMS[0] | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const filteredItems = activeFilter === 'all' 
    ? SAVED_ITEMS 
    : SAVED_ITEMS.filter(item => item.type === activeFilter);

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
                        {SAVED_ITEMS.length} saved items waiting for your next adventure. Organized and ready when you are.
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
                            <button className="absolute top-4 right-4 p-3 bg-white/20 backdrop-blur-xl text-white rounded-full hover:bg-red-500 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-[-10px] group-hover:translate-y-0">
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
                                        <span className="flex items-center gap-2 text-slate-500"><MapPin size={16} className="text-sky-400" /> {item.location}</span>
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
            
            {filteredItems.length === 0 && (
                <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-slate-200 shadow-sm animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                        <Heart size={36} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3 font-display">Collection Empty</h3>
                    <p className="text-slate-500 max-w-xs mx-auto mb-8">It looks like you haven't saved any items yet. Start exploring to build your dream collection.</p>
                    <button onClick={() => onNavigate('landing')} className="px-8 py-3 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 transition-colors shadow-lg shadow-sky-600/20 hover:scale-105 active:scale-95 duration-200">
                        Discover Places
                    </button>
                </div>
            )}
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