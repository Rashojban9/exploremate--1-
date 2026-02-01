import React, { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { Calendar, MapPin, Clock, MoreVertical, Plus, Users, ArrowRight, Plane, CheckCircle2, AlertCircle, Compass, Mountain, User, Bell, X, ChevronLeft, Utensils, Camera, Share2, Edit2, Trash2, Coffee, Sun } from 'lucide-react';
import { LOGIN_IMAGES, SIGNUP_IMAGES } from '../assets/images';

const NEPAL_DESTINATIONS = [
  { name: "Kathmandu", image: LOGIN_IMAGES.BOUDHANATH },
  { name: "Pokhara", image: LOGIN_IMAGES.POKHARA },
  { name: "Everest Base Camp", image: LOGIN_IMAGES.EVEREST },
  { name: "Annapurna Circuit", image: SIGNUP_IMAGES.ANNAPURNA },
  { name: "Bhaktapur", image: SIGNUP_IMAGES.BHAKTAPUR },
  { name: "Chitwan National Park", image: SIGNUP_IMAGES.CHITWAN },
  { name: "Lumbini", image: "https://images.unsplash.com/photo-1570702172793-27b32c21943d?auto=format&fit=crop&q=80&w=800" },
  { name: "Nagarkot", image: LOGIN_IMAGES.EVEREST }, 
  { name: "Mustang", image: SIGNUP_IMAGES.ANNAPURNA },
  { name: "Rara Lake", image: LOGIN_IMAGES.POKHARA },
  { name: "Bandipur", image: SIGNUP_IMAGES.BHAKTAPUR },
  { name: "Gosaikunda", image: LOGIN_IMAGES.POKHARA },
  { name: "Patan", image: LOGIN_IMAGES.BOUDHANATH },
  { name: "Swayambhunath", image: LOGIN_IMAGES.BOUDHANATH }
];

const INITIAL_TRIPS = [
  {
    id: 1,
    status: 'upcoming',
    title: 'Amalfi Coast Summer',
    location: 'Positano, Italy',
    startDate: '2024-07-15',
    endDate: '2024-07-22',
    image: 'https://images.unsplash.com/photo-1533904350293-3da112575914?auto=format&fit=crop&q=80&w=800',
    collaborators: ['https://i.pravatar.cc/150?img=1', 'https://i.pravatar.cc/150?img=5'],
    daysLeft: 14
  },
  {
    id: 2,
    status: 'draft',
    title: 'Kyoto Fall Colors',
    location: 'Kyoto, Japan',
    startDate: 'TBD',
    endDate: 'TBD',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800',
    collaborators: [],
    daysLeft: null
  },
  {
    id: 3,
    status: 'past',
    title: 'Swiss Alps Hiking',
    location: 'Interlaken, Switzerland',
    startDate: '2023-09-10',
    endDate: '2023-09-18',
    image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&q=80&w=800',
    collaborators: ['https://i.pravatar.cc/150?img=3'],
    daysLeft: -200
  },
  {
    id: 4,
    status: 'upcoming',
    title: 'New York City Weekend',
    location: 'New York, USA',
    startDate: '2024-11-20',
    endDate: '2024-11-24',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4a0e62e6e9?auto=format&fit=crop&q=80&w=800',
    collaborators: ['https://i.pravatar.cc/150?img=8', 'https://i.pravatar.cc/150?img=9', 'https://i.pravatar.cc/150?img=10'],
    daysLeft: 142
  }
];

// Mock Data for Itinerary Details
const MOCK_ITINERARY_DAYS = [
    {
        day: 1,
        title: "Arrival & Settlement",
        activities: [
            { id: 101, time: "10:00 AM", title: "Arrival at Airport", type: "transport", icon: Plane, desc: "Private transfer to hotel arranged." },
            { id: 102, time: "01:00 PM", title: "Check-in & Rest", type: "stay", icon: Calendar, desc: "Relax and freshen up." },
            { id: 103, time: "06:00 PM", title: "Welcome Dinner", type: "food", icon: Utensils, desc: "Traditional cuisine at The Golden Spoon." }
        ]
    },
    {
        day: 2,
        title: "Cultural Exploration",
        activities: [
            { id: 201, time: "08:00 AM", title: "Breakfast at Cafe", type: "food", icon: Coffee, desc: "Start the day with local coffee." },
            { id: 202, time: "10:00 AM", title: "City Heritage Tour", type: "activity", icon: MapPin, desc: "Guided tour of the old city and temples." },
            { id: 203, time: "04:00 PM", title: "Sunset Viewpoint", type: "nature", icon: Sun, desc: "Best views from the hilltop observatory." }
        ]
    }
];

const TripCard: React.FC<{ trip: any; onClick: () => void }> = ({ trip, onClick }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const onHover = (enter: boolean) => {
    if (enter) {
        gsap.to(cardRef.current, { y: -8, scale: 1.01, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', duration: 0.4 });
        gsap.to(cardRef.current?.querySelector('.trip-img'), { scale: 1.1, duration: 0.6 });
        gsap.to(cardRef.current?.querySelector('.trip-action'), { x: 0, opacity: 1, duration: 0.3 });
    } else {
        gsap.to(cardRef.current, { y: 0, scale: 1, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', duration: 0.4 });
        gsap.to(cardRef.current?.querySelector('.trip-img'), { scale: 1, duration: 0.6 });
        gsap.to(cardRef.current?.querySelector('.trip-action'), { x: -10, opacity: 0, duration: 0.3 });
    }
  };

  return (
    <div 
        ref={cardRef}
        onClick={onClick}
        className="group bg-white rounded-[2.5rem] p-3 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 hover:border-sky-100 transition-colors cursor-pointer overflow-hidden trip-card-anim"
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
    >
        {/* Image Section */}
        <div className="w-full md:w-72 h-56 md:h-auto rounded-[2rem] overflow-hidden relative shrink-0">
            <img src={trip.image} alt={trip.title} className="trip-img w-full h-full object-cover transition-transform duration-700" />
            <div className="absolute top-4 left-4">
                {trip.status === 'upcoming' && (
                    <div className="bg-sky-600/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                        <Clock size={12} /> {trip.daysLeft} days to go
                    </div>
                )}
                {trip.status === 'draft' && (
                    <div className="bg-amber-500/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                        <AlertCircle size={12} /> Pending
                    </div>
                )}
                {trip.status === 'past' && (
                    <div className="bg-emerald-600/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                        <CheckCircle2 size={12} /> Completed
                    </div>
                )}
            </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col flex-grow py-3 pr-4">
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-1">
                    <MapPin size={16} className="text-sky-500" /> {trip.location}
                </div>
                <button className="text-slate-300 hover:text-slate-600 transition-colors">
                    <MoreVertical size={20} />
                </button>
            </div>
            
            <h3 className="text-2xl font-bold text-slate-900 font-display mb-3 group-hover:text-sky-700 transition-colors">
                {trip.title}
            </h3>

            <div className="flex items-center gap-4 text-slate-600 text-sm font-medium mb-6">
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <Calendar size={16} className="text-slate-400" />
                    <span>{trip.startDate} — {trip.endDate}</span>
                </div>
            </div>

            <div className="mt-auto flex items-center justify-between">
                <div className="flex items-center -space-x-2">
                    {trip.collaborators.length > 0 ? (
                        <>
                            {trip.collaborators.map((img: string, i: number) => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white relative z-0 hover:z-10 hover:scale-110 transition-transform">
                                    <img src={img} alt="User" className="w-full h-full rounded-full object-cover" />
                                </div>
                            ))}
                            <button className="w-8 h-8 rounded-full border-2 border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors text-xs font-bold z-0 ml-2">
                                <Plus size={12} />
                            </button>
                        </>
                    ) : (
                        <div className="text-slate-400 text-sm flex items-center gap-2">
                            <Users size={16} /> <span className="text-xs">Solo Trip</span>
                        </div>
                    )}
                </div>

                <div className="trip-action flex items-center gap-2 text-sky-600 font-bold text-sm opacity-0 -translate-x-4 transition-all duration-300">
                    {trip.status === 'draft' ? 'Continue Planning' : 'View Itinerary'} <ArrowRight size={18} />
                </div>
            </div>
        </div>
    </div>
  );
};

// --- Trip Detail / Itinerary View Component ---
const TripDetailView = ({ trip, onBack, onDelete }: { trip: any, onBack: () => void, onDelete: (id: number) => void }) => {
    const headerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const tl = gsap.timeline();
        tl.fromTo(headerRef.current, 
            { y: -50, opacity: 0 }, 
            { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
        );
        tl.fromTo('.day-card', 
            { y: 50, opacity: 0 }, 
            { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out' },
            "-=0.4"
        );
    }, []);

    return (
        <div className="w-full min-h-[80vh] bg-white rounded-[3rem] overflow-hidden shadow-sm border border-slate-100 relative">
            {/* Hero Header */}
            <div ref={headerRef} className="relative h-72 md:h-96">
                <img src={trip.image} alt={trip.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                
                <button 
                    onClick={onBack}
                    className="absolute top-6 left-6 p-3 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/40 transition-colors z-20"
                >
                    <ChevronLeft size={24} />
                </button>

                <div className="absolute top-6 right-6 flex gap-3 z-20">
                    <button className="p-3 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/40 transition-colors">
                        <Share2 size={20} />
                    </button>
                    <button className="p-3 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/40 transition-colors">
                        <Edit2 size={20} />
                    </button>
                </div>

                <div className="absolute bottom-8 left-8 right-8 text-white">
                    <div className="flex flex-wrap gap-3 mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-white/20 flex items-center gap-1.5 ${
                            trip.status === 'upcoming' ? 'bg-sky-500/80' : 
                            trip.status === 'past' ? 'bg-emerald-500/80' : 'bg-amber-500/80'
                        }`}>
                            {trip.status === 'upcoming' && <Clock size={12} />}
                            {trip.status === 'past' && <CheckCircle2 size={12} />}
                            {trip.status === 'draft' && <AlertCircle size={12} />}
                            {trip.status === 'draft' ? 'Pending' : (trip.status === 'past' ? 'Completed' : 'Upcoming')}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md border border-white/20 flex items-center gap-1.5">
                            <MapPin size={12} /> {trip.location}
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight mb-2">{trip.title}</h1>
                    <div className="flex items-center gap-2 text-slate-200 font-medium">
                        <Calendar size={16} /> {trip.startDate === 'TBD' ? 'Date TBD' : `${trip.startDate} - ${trip.endDate}`}
                    </div>
                </div>
            </div>

            {/* Itinerary Content */}
            <div ref={contentRef} className="p-6 md:p-10 bg-slate-50 min-h-[500px]">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 font-display">Itinerary</h2>
                        {trip.status === 'draft' && (
                            <button className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-xl font-bold text-sm hover:bg-sky-700 transition-colors shadow-lg shadow-sky-600/20">
                                <Plus size={16} /> Add Activity
                            </button>
                        )}
                    </div>

                    <div className="space-y-8 relative">
                        {/* Timeline Line */}
                        <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-slate-200 md:left-8"></div>

                        {MOCK_ITINERARY_DAYS.map((day, i) => (
                            <div key={i} className="day-card relative pl-12 md:pl-20">
                                {/* Day Marker */}
                                <div className="absolute left-0 md:left-4 top-0 w-8 h-8 rounded-full bg-white border-4 border-sky-200 flex items-center justify-center font-bold text-xs text-sky-700 z-10 shadow-sm">
                                    {day.day}
                                </div>
                                
                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-slate-900">{day.title}</h3>
                                    <p className="text-sm text-slate-500">Day {day.day}</p>
                                </div>

                                <div className="space-y-3">
                                    {day.activities.map((act) => (
                                        <div key={act.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4 group">
                                            <div className="p-3 bg-slate-50 rounded-xl text-slate-500 group-hover:text-sky-600 group-hover:bg-sky-50 transition-colors">
                                                <act.icon size={20} />
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-slate-800 text-sm">{act.title}</h4>
                                                    <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">{act.time}</span>
                                                </div>
                                                <p className="text-sm text-slate-500 mt-1">{act.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-12 pt-8 border-t border-slate-200 flex justify-center">
                        <button 
                            onClick={() => onDelete(trip.id)}
                            className="text-red-500 font-bold text-sm flex items-center gap-2 hover:bg-red-50 px-4 py-2 rounded-xl transition-colors"
                        >
                            <Trash2 size={16} /> Delete Trip
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TripsPage = ({ onLogout, onNavigate, isLoggedIn }: { onLogout: () => void, onNavigate: (page: string) => void, isLoggedIn?: boolean }) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'draft'>('upcoming');
  const [trips, setTrips] = useState(INITIAL_TRIPS);
  const [selectedTrip, setSelectedTrip] = useState<any | null>(null);
  
  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTrip, setNewTrip] = useState({ title: '', location: '', startDate: '', endDate: '' });
  const [suggestions, setSuggestions] = useState<typeof NEPAL_DESTINATIONS>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const filteredTrips = trips.filter(trip => {
      if (activeTab === 'upcoming') return trip.status === 'upcoming';
      if (activeTab === 'past') return trip.status === 'past';
      return trip.status === 'draft';
  });

  useEffect(() => {
    if (!selectedTrip) {
        // Only run main page animations if we are not in detail view
        const tl = gsap.timeline();
        tl.fromTo('.dash-header', 
            { y: -30, opacity: 0 }, 
            { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
        );
        tl.fromTo('.reveal-text-char', 
            { y: 50, opacity: 0, skewY: 10, rotateZ: 5 },
            { y: 0, opacity: 1, skewY: 0, rotateZ: 0, stagger: 0.02, duration: 1, ease: 'power4.out', delay: 0.2 }
        );
        tl.fromTo('.trips-header-anim',
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.3 }
        );
        tl.fromTo('.dash-nav-mobile',
            { y: 60, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.6 }
        );
    }
  }, [selectedTrip]);

  useEffect(() => {
      // List Animation on Tab Change
      if (containerRef.current && !selectedTrip) {
        gsap.fromTo(containerRef.current.children,
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out', clearProps: 'all' }
        );
      }
  }, [activeTab, selectedTrip]);

  useEffect(() => {
      if (isModalOpen && modalRef.current) {
          gsap.fromTo(modalRef.current,
              { scale: 0.9, opacity: 0, y: 20 },
              { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.5)' }
          );
      }
  }, [isModalOpen]);

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewTrip({ ...newTrip, location: value });
    
    if (value.trim()) {
        const filtered = NEPAL_DESTINATIONS.filter(dest => 
            dest.name.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(filtered);
        setShowSuggestions(true);
    } else {
        setSuggestions(NEPAL_DESTINATIONS);
    }
  };

  const handleSelectSuggestion = (dest: typeof NEPAL_DESTINATIONS[0]) => {
    setNewTrip({ ...newTrip, location: dest.name });
    setShowSuggestions(false);
  };

  const handleDeleteTrip = (id: number) => {
    if (window.confirm("Are you sure you want to delete this trip?")) {
        setTrips(prev => prev.filter(t => t.id !== id));
        setSelectedTrip(null);
    }
  };

  const handleCreateTrip = (e: React.FormEvent | null, status: 'upcoming' | 'draft' = 'upcoming') => {
      if (e) e.preventDefault();
      
      // Basic validation for confirmed trips
      if (status === 'upcoming' && (!newTrip.startDate || !newTrip.endDate)) {
          alert("Please select start and end dates for an upcoming trip.");
          return;
      }

      const isTBD = !newTrip.startDate || !newTrip.endDate;
      const start = newTrip.startDate ? new Date(newTrip.startDate) : new Date();
      const today = new Date();
      const diffTime = Math.abs(start.getTime() - today.getTime());
      const daysLeft = isTBD ? null : Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      const matchingDest = NEPAL_DESTINATIONS.find(d => d.name === newTrip.location) 
        || NEPAL_DESTINATIONS.find(d => newTrip.location.toLowerCase().includes(d.name.toLowerCase()))
        || NEPAL_DESTINATIONS[0];

      const createdTrip = {
          id: Date.now(),
          status: status,
          title: newTrip.title || "Untitled Trip",
          location: newTrip.location || "Unknown Destination",
          startDate: newTrip.startDate || 'TBD',
          endDate: newTrip.endDate || 'TBD',
          image: matchingDest.image,
          collaborators: [],
          daysLeft: daysLeft
      };

      setTrips([createdTrip, ...trips]);
      setIsModalOpen(false);
      setNewTrip({ title: '', location: '', startDate: '', endDate: '' });
      setActiveTab(status === 'draft' ? 'draft' : 'upcoming');
  };

  const splitText = (text: string) => {
    return text.split('').map((char, index) => (
      <span key={index} className="reveal-text-char inline-block whitespace-pre origin-bottom will-change-transform">
        {char}
      </span>
    ));
  };

  const navItems = [
    { label: 'Explore', icon: Compass, page: 'dashboard' },
    { label: 'Saved', icon: Mountain, page: 'saved' },
    { label: 'Trips', icon: Calendar, page: 'trips' },
    { label: 'Profile', icon: User, page: 'profile' }
  ];

  return (
    <div className="relative w-full min-h-screen p-4 pb-24 md:p-8 flex flex-col items-center bg-slate-50/50">
      
      {/* Dashboard Header */}
      <div className="dash-header w-full max-w-6xl flex items-center justify-between mb-8 z-20">
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
                    item.page === 'trips' 
                    ? 'bg-slate-900 text-white shadow-md transform scale-105' 
                    : 'text-slate-500 hover:text-sky-600 hover:bg-sky-50'
                }`}
             >
                <item.icon size={16} className={item.page === 'trips' ? 'fill-white' : ''} />
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
      
      {/* Main Content Area */}
      <div className="w-full max-w-5xl z-10">
        
        {/* Conditional Rendering: List vs Detail */}
        {selectedTrip ? (
            <TripDetailView 
                trip={selectedTrip} 
                onBack={() => setSelectedTrip(null)} 
                onDelete={handleDeleteTrip}
            />
        ) : (
            <>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="trips-header-anim inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider shadow-sm mb-4">
                            <Plane size={14} className="text-sky-500" /> Travel Log
                        </div>
                        <h1 className="text-4xl md:text-6xl font-display font-bold text-slate-900 mb-2 tracking-tight overflow-hidden">
                            {splitText("My Adventures")}
                        </h1>
                        <p className="trips-header-anim text-slate-500 text-lg">
                            Manage your itineraries and look back on past journeys.
                        </p>
                    </div>
                    
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="trips-header-anim px-6 py-3 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 transition-all shadow-lg shadow-sky-600/20 hover:scale-105 active:scale-95 duration-200 flex items-center gap-2"
                    >
                        <Plus size={20} /> Create New Trip
                    </button>
                </div>

                {/* Tabs */}
                <div className="trips-header-anim border-b border-slate-200 mb-8 flex gap-8">
                    {[
                        { id: 'upcoming', label: 'Upcoming' },
                        { id: 'draft', label: 'Pending' },
                        { id: 'past', label: 'Completed' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`pb-4 text-sm font-bold uppercase tracking-wider transition-all relative ${
                                activeTab === tab.id 
                                ? 'text-sky-600' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-600 rounded-t-full"></div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Trips List */}
                <div ref={containerRef} className="space-y-6 min-h-[400px]">
                    {filteredTrips.length > 0 ? (
                        filteredTrips.map((trip) => (
                            <TripCard 
                                key={trip.id} 
                                trip={trip} 
                                onClick={() => setSelectedTrip(trip)}
                            />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-white/50">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-6">
                                <Plane size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No {activeTab === 'draft' ? 'pending' : activeTab} trips found</h3>
                            <p className="text-slate-500 max-w-xs mx-auto mb-8">Ready to explore somewhere new? Start planning your next adventure today.</p>
                            <button onClick={() => setIsModalOpen(true)} className="text-sky-600 font-bold hover:underline">Plan a trip now</button>
                        </div>
                    )}
                </div>
            </>
        )}

      </div>
      
      {/* Create Trip Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
              <div 
                ref={modalRef} 
                className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl p-8 relative flex flex-col"
                onClick={() => setShowSuggestions(false)}
              >
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
                  >
                      <X size={20} />
                  </button>
                  
                  <h2 className="text-2xl font-bold font-display text-slate-900 mb-1">Plan New Adventure</h2>
                  <p className="text-slate-500 text-sm mb-6">Where are you heading next?</p>
                  
                  <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Trip Title</label>
                          <input 
                            type="text" 
                            required
                            value={newTrip.title}
                            onChange={(e) => setNewTrip({...newTrip, title: e.target.value})}
                            placeholder="e.g. Summer in Nepal" 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-sky-500 focus:bg-white outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                          />
                      </div>
                      
                      <div className="relative">
                          <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Destination (Nepal)</label>
                          <div className="relative">
                              <input 
                                type="text" 
                                required
                                value={newTrip.location}
                                onChange={handleLocationChange}
                                onFocus={(e) => {
                                    e.stopPropagation(); 
                                    setSuggestions(NEPAL_DESTINATIONS);
                                    setShowSuggestions(true);
                                }}
                                onClick={(e) => e.stopPropagation()} 
                                placeholder="e.g. Pokhara" 
                                className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl focus:border-sky-500 focus:bg-white outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                              />
                              <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          </div>
                          
                          {showSuggestions && (
                              <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto z-50 animate-in fade-in zoom-in-95 duration-200">
                                  {suggestions.map((dest, i) => (
                                      <button
                                          key={i}
                                          type="button"
                                          onClick={(e) => {
                                              e.stopPropagation();
                                              handleSelectSuggestion(dest);
                                          }}
                                          className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 transition-colors border-b border-slate-50 last:border-0 group"
                                      >
                                          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-slate-100">
                                              <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                          </div>
                                          <span className="text-sm font-medium text-slate-700">{dest.name}</span>
                                      </button>
                                  ))}
                                  {suggestions.length === 0 && (
                                      <div className="p-4 text-xs text-slate-400 text-center font-bold">No destinations found</div>
                                  )}
                              </div>
                          )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Start Date</label>
                              <input 
                                type="date" 
                                value={newTrip.startDate}
                                onChange={(e) => setNewTrip({...newTrip, startDate: e.target.value})}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-sky-500 focus:bg-white outline-none transition-all font-medium text-slate-900"
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">End Date</label>
                              <input 
                                type="date" 
                                value={newTrip.endDate}
                                onChange={(e) => setNewTrip({...newTrip, endDate: e.target.value})}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-sky-500 focus:bg-white outline-none transition-all font-medium text-slate-900"
                              />
                          </div>
                      </div>
                      
                      <div className="pt-4 flex gap-3">
                          <button 
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
                          >
                              Cancel
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleCreateTrip(null, 'draft')}
                            className="flex-1 py-3 bg-amber-100 text-amber-700 font-bold rounded-xl hover:bg-amber-200 transition-colors"
                          >
                              Save Draft
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleCreateTrip(null, 'upcoming')}
                            className="flex-1 py-3 bg-sky-600 text-white font-bold rounded-xl hover:bg-sky-700 shadow-lg shadow-sky-600/20 transition-all active:scale-95"
                          >
                              Create Trip
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Bottom Nav (Mobile Only) */}
      <div className="dash-nav-mobile md:hidden fixed bottom-4 left-4 right-4 bg-gradient-to-tr from-sky-600 via-blue-600 to-sky-700 backdrop-blur-xl border border-white/20 py-4 px-8 rounded-2xl shadow-xl shadow-sky-900/20 z-50 flex items-center justify-between ring-1 ring-white/20">
        {navItems.map((item, i) => {
           const isActive = item.page === 'trips';
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

export default TripsPage;