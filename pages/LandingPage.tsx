import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, ArrowRight, MapPin, Star, Heart, Compass, Zap, Coins, ArrowRightLeft, RefreshCw, TrendingUp, ChevronUp } from 'lucide-react';
import { Navbar, Footer } from '../components/Navigation';
import { LOGIN_IMAGES, DESTINATION_IMAGES } from '../assets/images';

gsap.registerPlugin(ScrollTrigger);

const DestinationCard = ({ image, title, location, rating, price, index }: any) => (
  <div className="destination-card group relative overflow-hidden rounded-[2.5rem] bg-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 w-full border border-slate-100">
    <div className="relative h-64 sm:h-72 overflow-hidden rounded-[2.5rem]">
      <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <button className="absolute top-4 right-4 p-3 bg-white/30 backdrop-blur-md rounded-full hover:bg-white text-white hover:text-red-500 transition-colors">
        <Heart size={20} className={index === 1 ? "fill-red-500 text-red-500" : ""} />
      </button>
      <div className="absolute bottom-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full flex items-center gap-1 text-xs font-bold text-slate-800 shadow-sm">
        <Star size={12} className="text-orange-400 fill-orange-400" /> {rating}
      </div>
    </div>
    <div className="p-6">
      <div className="flex justify-between items-start mb-2">
        <div className="min-w-0">
          <h3 className="text-xl font-bold text-slate-900 font-display truncate">{title}</h3>
          <div className="flex items-center gap-1 text-slate-500 text-sm font-medium mt-1">
            <MapPin size={14} /> <span className="truncate">{location}</span>
          </div>
        </div>
        <div className="bg-sky-50 px-3 py-1 rounded-xl text-sky-700 font-bold text-sm shrink-0 ml-2">
          ${price}
        </div>
      </div>
    </div>
  </div>
);

const LandingPage = ({ onNavigate, isLoggedIn }: { onNavigate: (page: string) => void, isLoggedIn?: boolean }) => {
  const [showAllLocations, setShowAllLocations] = useState(false);
  
  useEffect(() => {
    const tl = gsap.timeline();

    tl.fromTo('.hero-badge', 
      { y: 20, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)' }
    );

    tl.fromTo('.hero-title-line', 
      { y: 40, opacity: 0, skewY: 5 },
      { y: 0, opacity: 1, skewY: 0, stagger: 0.2, duration: 0.8, ease: 'power4.out' },
      "-=0.2"
    );

    tl.fromTo('.hero-desc',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
      "-=0.6"
    )
    .fromTo('.hero-btn',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'power2.out' },
      "-=0.6"
    );

    tl.fromTo('.hero-visual-composition',
      { scale: 0.9, opacity: 0, y: 40 },
      { scale: 1, opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' },
      "-=0.8"
    );

    gsap.utils.toArray('.section-reveal').forEach((elem: any) => {
      gsap.fromTo(elem,
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: elem, start: 'top 85%' }
        }
      );
    });

  }, []);

  const TRENDING = [
    { title: "Everest Base Camp", location: "Solukhumbu", rating: "4.9", price: "1,400", image: DESTINATION_IMAGES.EVEREST },
    { title: "Phewa Lake Boating", location: "Pokhara", rating: "4.8", price: "600", image: DESTINATION_IMAGES.POKHARA },
    { title: "Boudhanath Stupa", location: "Kathmandu", rating: "4.9", price: "40", image: DESTINATION_IMAGES.KATHMANDU }
  ];

  return (
    <div className="w-full relative bg-slate-50/50">
      <Navbar onNavigate={onNavigate} isLoggedIn={isLoggedIn} />

      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative z-10 text-center lg:text-left">
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-sky-100 text-sky-600 font-bold text-xs uppercase tracking-wider shadow-sm mb-6">
              <Sparkles size={14} className="fill-sky-600" /> Nepal's Premier AI Guide
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold text-slate-900 mb-6 leading-tight">
              <div className="hero-title-line">Explore Nepal</div>
              <div className="hero-title-line text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600">with Intelligence</div>
            </h1>
            
            <p className="hero-desc text-base sm:text-lg md:text-xl text-slate-500 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Your "locally file-stored" digital companion for real-time mountain intelligence and cultural discovery.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button 
                onClick={() => onNavigate(isLoggedIn ? 'dashboard' : 'signup')}
                className="hero-btn w-full sm:w-auto px-8 py-4 bg-sky-900 text-white rounded-2xl font-bold hover:bg-sky-800 transition-all shadow-lg flex items-center justify-center gap-2 group"
              >
                Start Journey <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => onNavigate('features')}
                className="hero-btn w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold hover:border-sky-300 hover:text-sky-600 transition-all shadow-sm"
              >
                How it Works
              </button>
            </div>
          </div>

          <div className="hero-visual-composition relative flex items-center justify-center">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[500px] h-full max-h-[500px] bg-sky-200/40 rounded-full blur-[80px] animate-pulse"></div>
             
             <div className="relative z-10 w-full grid grid-cols-2 gap-4">
                <div className="space-y-4">
                   <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-white rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                      <img src={LOGIN_IMAGES.POKHARA} className="w-full h-48 sm:h-64 object-cover" alt="Pokhara Local" />
                   </div>
                   <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50 animate-float">
                      <div className="flex items-center gap-2 mb-1">
                         <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                         <span className="text-[10px] font-bold text-slate-400 uppercase">Live Weather</span>
                      </div>
                      <p className="text-slate-800 font-bold text-sm">Pokhara: Clear Skies 24°C</p>
                   </div>
                </div>
                <div className="space-y-4 pt-12">
                   <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-white rotate-[3deg] hover:rotate-0 transition-transform duration-500">
                      <img src={LOGIN_IMAGES.BOUDHANATH} className="w-full h-48 sm:h-64 object-cover" alt="Boudhanath Local" />
                   </div>
                   <div className="bg-slate-900 p-4 rounded-2xl shadow-xl text-white">
                      <div className="flex items-center gap-2 mb-1 opacity-60">
                         <Compass size={12} />
                         <span className="text-[10px] font-bold uppercase">AI Tip</span>
                      </div>
                      <p className="text-xs font-medium">Try local Newari food in Patan today.</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white relative z-10">
         <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end mb-12 gap-6 section-reveal">
               <div className="text-center sm:text-left">
                  <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-900 mb-4">Trending Local Picks</h2>
                  <p className="text-slate-500 text-base md:text-lg max-w-md">Curated from high-fidelity local asset storage.</p>
               </div>
               <button 
                  onClick={() => setShowAllLocations(!showAllLocations)}
                  className="px-6 py-3 bg-sky-50 text-sky-600 rounded-xl font-bold hover:bg-sky-100 flex items-center gap-2 group transition-all"
               >
                  {showAllLocations ? "Show Less" : "Explore All"} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
               </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
               {TRENDING.map((dest, i) => (
                  <div key={i} className="section-reveal">
                    <DestinationCard {...dest} index={i} />
                  </div>
               ))}
            </div>
         </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default LandingPage;