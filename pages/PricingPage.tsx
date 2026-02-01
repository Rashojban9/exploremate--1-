import React, { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CheckCircle2, X, Sparkles, Zap, Globe, Briefcase, ArrowRight } from 'lucide-react';
import { Navbar, Footer } from '../components/Navigation';

gsap.registerPlugin(ScrollTrigger);

const PricingCard = ({ 
  title, 
  price, 
  description, 
  features, 
  isPopular, 
  icon: Icon,
  buttonText,
  buttonVariant = 'outline'
}: any) => (
  <div className={`relative p-8 rounded-[2.5rem] flex flex-col h-full transition-all duration-300 pricing-card group ${
    isPopular 
      ? 'bg-sky-900 text-white shadow-2xl scale-105 z-10 border border-sky-700' 
      : 'bg-white text-slate-900 shadow-xl border border-slate-100 hover:border-sky-200'
  }`}>
    {isPopular && (
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-sunset-500 to-orange-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1">
        <Sparkles size={12} /> Most Popular
      </div>
    )}
    
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
      isPopular ? 'bg-white/10 text-white' : 'bg-sky-50 text-sky-600'
    }`}>
      <Icon size={28} />
    </div>

    <h3 className="text-xl font-bold mb-2 font-display">{title}</h3>
    <p className={`text-sm mb-6 ${isPopular ? 'text-sky-100' : 'text-slate-500'}`}>
      {description}
    </p>

    <div className="mb-8">
      <span className="text-4xl font-bold font-display">${price}</span>
      <span className={`text-sm ${isPopular ? 'text-sky-200' : 'text-slate-400'}`}>/month</span>
    </div>

    <div className="flex-grow space-y-4 mb-8">
      {features.map((feature: any, i: number) => (
        <div key={i} className="flex items-start gap-3 text-sm">
          {feature.included ? (
            <CheckCircle2 size={18} className={`shrink-0 ${isPopular ? 'text-emerald-400' : 'text-emerald-500'}`} />
          ) : (
            <X size={18} className={`shrink-0 ${isPopular ? 'text-white/20' : 'text-slate-300'}`} />
          )}
          <span className={isPopular ? 'text-sky-50' : 'text-slate-600'}>{feature.text}</span>
        </div>
      ))}
    </div>

    <button className={`w-full py-4 rounded-xl font-bold transition-all duration-300 ${
      buttonVariant === 'solid'
        ? 'bg-white text-sky-900 hover:bg-sky-50'
        : isPopular 
          ? 'bg-sky-800 text-white hover:bg-sky-700'
          : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
    }`}>
      {buttonText}
    </button>
  </div>
);

const PricingPage = ({ onNavigate, isLoggedIn }: { onNavigate: (page: string) => void, isLoggedIn?: boolean }) => {
  const [isAnnual, setIsAnnual] = useState(true);

  useEffect(() => {
    const tl = gsap.timeline();

    // Modern Text Reveal
    tl.fromTo('.reveal-text-char', 
        { y: 50, opacity: 0, skewY: 10, rotateZ: 5 },
        { y: 0, opacity: 1, skewY: 0, rotateZ: 0, stagger: 0.02, duration: 1, ease: 'power4.out' }
    );

    gsap.utils.toArray('.pricing-fade-up').forEach((elem: any) => {
      gsap.fromTo(elem, 
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: elem, start: 'top 85%' }
        }
      );
    });

    gsap.fromTo('.pricing-card', 
      { y: 60, opacity: 0 }, 
      { 
        y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: '.pricing-grid', start: 'top 80%' }
      }
    );
  }, []);

  const splitText = (text: string) => {
    return text.split('').map((char, index) => (
      <span key={index} className="reveal-text-char inline-block whitespace-pre origin-bottom will-change-transform">
        {char}
      </span>
    ));
  };

  const tiers = [
    {
      title: "Explorer",
      price: "0",
      description: "Perfect for planning your weekend getaways and local trips.",
      icon: Globe,
      buttonText: "Get Started Free",
      features: [
        { text: "3 AI Itineraries per month", included: true },
        { text: "Standard Destination Guides", included: true },
        { text: "Public Trip Reviews", included: true },
        { text: "Offline Maps", included: false },
        { text: "Real-time Translation", included: false },
        { text: "Group Collaboration", included: false },
      ]
    },
    {
      title: "Nomad",
      price: isAnnual ? "12" : "15",
      description: "For serious travelers who want the full AI experience.",
      icon: Zap,
      isPopular: true,
      buttonText: "Start 7-Day Trial",
      buttonVariant: 'solid',
      features: [
        { text: "Unlimited AI Itineraries", included: true },
        { text: "Premium Hidden Gems", included: true },
        { text: "Offline Maps & Guides", included: true },
        { text: "Real-time Voice Translation", included: true },
        { text: "Route Optimization", included: true },
        { text: "Priority Support", included: true },
      ]
    },
    {
      title: "Agency",
      price: isAnnual ? "49" : "59",
      description: "Powerful tools for travel agencies and tour guides.",
      icon: Briefcase,
      buttonText: "Contact Sales",
      features: [
        { text: "Everything in Nomad", included: true },
        { text: "White-label Itineraries", included: true },
        { text: "Client Management Dashboard", included: true },
        { text: "Team Collaboration (5 seats)", included: true },
        { text: "API Access", included: true },
        { text: "Dedicated Account Manager", included: true },
      ]
    }
  ];

  return (
    <div className="w-full relative">
       <Navbar onNavigate={onNavigate} isLoggedIn={isLoggedIn} />

       {/* Hero */}
       <section className="relative pt-40 pb-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 text-center">
             <div className="pricing-fade-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100 text-sky-700 font-bold text-xs uppercase tracking-wider border border-sky-200 mb-6">
                <Sparkles size={14} /> Unlock the World
             </div>
             <h1 className="text-5xl md:text-7xl font-display font-bold text-slate-900 mb-8 overflow-hidden">
               {splitText("Invest in Memories,")} <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-sunset-500">{splitText("Not Logistics.")}</span>
             </h1>
             <p className="pricing-fade-up text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-12">
               Choose the plan that fits your travel style. Whether you're a weekend explorer or a full-time digital nomad, we have tools to make your journey seamless.
             </p>

             {/* Toggle */}
             <div className="pricing-fade-up flex items-center justify-center gap-4 mb-16">
               <span className={`text-sm font-bold ${!isAnnual ? 'text-slate-900' : 'text-slate-400'}`}>Monthly</span>
               <button 
                onClick={() => setIsAnnual(!isAnnual)}
                className="w-16 h-8 bg-sky-100 rounded-full p-1 relative transition-colors duration-300"
               >
                 <div className={`w-6 h-6 bg-sky-600 rounded-full shadow-md transform transition-transform duration-300 ${isAnnual ? 'translate-x-8' : 'translate-x-0'}`}></div>
               </button>
               <span className={`text-sm font-bold ${isAnnual ? 'text-slate-900' : 'text-slate-400'}`}>
                 Yearly <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full ml-1">-20%</span>
               </span>
             </div>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-sky-200/20 filter blur-[100px] rounded-full -z-10"></div>
       </section>

       {/* Pricing Grid */}
       <section className="pb-24">
         <div className="max-w-7xl mx-auto px-4 md:px-8">
           <div className="grid md:grid-cols-3 gap-8 items-center pricing-grid">
             {tiers.map((tier, i) => (
               <PricingCard key={i} {...tier} />
             ))}
           </div>

           <div className="mt-20 text-center pricing-fade-up">
             <p className="text-slate-500 mb-4">Need a custom enterprise solution?</p>
             <button onClick={() => onNavigate('about')} className="text-sky-600 font-bold hover:underline flex items-center justify-center gap-2">
               Contact our Enterprise Team <ArrowRight size={16} />
             </button>
           </div>
         </div>
       </section>

       <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default PricingPage;