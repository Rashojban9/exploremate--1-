import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Bot, Map, Languages, QrCode, CloudRain, Sun, Users, ArrowRight, Zap, CheckCircle2, MessageCircle, Navigation, Globe, ShieldCheck, Sparkles, Smartphone, Clock } from 'lucide-react';
import { Navbar, Footer } from '../components/Navigation';
import LeafletMap from '../components/LeafletMap';

gsap.registerPlugin(ScrollTrigger);

const FeatureSection = ({ title, subTitle, description, icon: Icon, align = 'left', visual, listItems }: any) => (
  <div className={`flex flex-col md:flex-row items-center gap-12 md:gap-20 py-24 ${align === 'right' ? 'md:flex-row-reverse' : ''}`}>
    <div className="w-full md:w-1/2 feature-text">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100 text-sky-700 font-bold text-xs uppercase tracking-wider border border-sky-200 mb-6 font-grotesk">
        <Icon size={14} /> {subTitle}
      </div>
      <h2 className="text-3xl md:text-4xl font-grotesk font-bold text-slate-900 mb-6 leading-tight">
        {title}
      </h2>
      <p className="text-base md:text-lg text-slate-600 leading-relaxed mb-8 font-sans">
        {description}
      </p>
      {listItems && (
        <ul className="space-y-4 mb-8">
          {listItems.map((item: string, i: number) => (
            <li key={i} className="flex items-start gap-3 text-slate-700 font-medium font-sans text-sm md:text-base">
              <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
    
    <div className="w-full md:w-1/2 feature-visual relative group">
      <div className="absolute inset-0 bg-gradient-to-tr from-sky-200 to-purple-200 rounded-[2.5rem] rotate-3 opacity-50 group-hover:rotate-6 transition-transform duration-500"></div>
      <div className="relative bg-white/80 backdrop-blur-xl border border-white p-2 rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[400px] flex items-center justify-center">
        {visual}
      </div>
    </div>
  </div>
);

const FeaturesPage = ({ onNavigate, isLoggedIn }: { onNavigate: (page: string) => void, isLoggedIn?: boolean }) => {
  useEffect(() => {
    const tl = gsap.timeline();

    // Modern Text Reveal
    tl.fromTo('.reveal-text-char', 
        { y: 50, opacity: 0, skewY: 10, rotateZ: 5 },
        { y: 0, opacity: 1, skewY: 0, rotateZ: 0, stagger: 0.02, duration: 1, ease: 'power4.out' }
    );

    // Staggered animation for the overview cards
    gsap.fromTo('.overview-card', 
      { y: 50, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.overview-grid', start: 'top 85%' }
      }
    );

    gsap.utils.toArray('.feature-text').forEach((elem: any) => {
      gsap.fromTo(elem, 
        { x: -50, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: elem, start: 'top 80%' }
        }
      );
    });

    gsap.utils.toArray('.feature-visual').forEach((elem: any) => {
      gsap.fromTo(elem, 
        { scale: 0.9, opacity: 0 },
        {
          scale: 1, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: elem, start: 'top 80%' }
        }
      );
    });
  }, []);

  const splitText = (text: string) => {
    return text.split('').map((char, index) => (
      <span key={index} className="reveal-text-char inline-block whitespace-pre origin-bottom will-change-transform">
        {char}
      </span>
    ));
  };

  return (
    <div className="w-full relative bg-slate-50/50">
       <Navbar onNavigate={onNavigate} isLoggedIn={isLoggedIn} />

       {/* Hero */}
       <section className="relative pt-40 pb-20 overflow-hidden bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 text-center">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 font-bold text-xs uppercase tracking-wider border border-purple-200 mb-6 font-grotesk">
                <Zap size={14} /> Next-Gen Tourist System
             </div>
             <h1 className="text-4xl md:text-6xl font-grotesk font-bold text-slate-900 mb-8 overflow-hidden">
               {splitText("Smart Travel,")} <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-sky-500">{splitText("Intelligent Guidance")}</span>
             </h1>
             <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-sans">
               A complete digital ecosystem replacing traditional guides with accurate, real-time, and AI-driven personalized experiences.
             </p>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-purple-200/20 filter blur-[100px] rounded-full -z-10"></div>
       </section>

       {/* System Definition / Overview Section */}
       <section className="py-24 bg-white relative">
         <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="bg-slate-900 rounded-[3rem] p-8 md:p-16 text-white relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/20 rounded-full blur-[100px] pointer-events-none"></div>
               
               <div className="grid lg:grid-cols-2 gap-16 relative z-10">
                  <div>
                     <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 font-bold text-xs uppercase tracking-wider mb-6 font-grotesk border border-sky-500/30">
                       <Globe size={12} /> System Definition
                     </div>
                     <h2 className="text-3xl md:text-4xl font-grotesk font-bold mb-6">What is a Tourist Guide System?</h2>
                     <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-6 font-sans">
                       A Tourist Guide System is a digital platform (web or mobile app) designed to help travelers explore a city, plan trips, and access important travel information in an easy and personalized way.
                     </p>
                     <p className="text-slate-300 text-base md:text-lg leading-relaxed font-sans">
                       Instead of depending on travel agencies, random blogs, or traditional tour guides, our system empowers you with data-driven independence.
                     </p>
                  </div>

                  <div className="overview-grid grid sm:grid-cols-2 gap-4">
                     {[
                       { title: "Accurate Information", icon: ShieldCheck, desc: "Verified data points." },
                       { title: "Personalized Recs", icon: Sparkles, desc: "Tailored to your vibe." },
                       { title: "Real-time Updates", icon: Clock, desc: "Live traffic & crowd data." },
                       { title: "Smart Planning", icon: Smartphone, desc: "Automated logistics." }
                     ].map((item, i) => (
                        <div key={i} className="overview-card bg-white/5 border border-white/10 p-5 rounded-2xl hover:bg-white/10 transition-colors">
                           <item.icon className="text-sky-400 mb-3" size={24} />
                           <h3 className="font-bold text-lg font-grotesk mb-1">{item.title}</h3>
                           <p className="text-slate-400 text-sm font-sans">{item.desc}</p>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
       </section>

       {/* Features List */}
       <section className="pb-24 pt-12">
         <div className="max-w-7xl mx-auto px-4 md:px-8">
            
            {/* 1. AI Personalized Itinerary */}
            <FeatureSection 
              subTitle="Machine Learning Planner"
              title="AI-Based Personalized Itinerary"
              description="Forget generic travel blogs. Our system uses machine learning to generate a daily plan based on your specific duration, budget, and interests."
              icon={Bot}
              listItems={[
                "Input: Trip Duration (e.g., 2 days), Budget, Interests",
                "Output: Optimized Daily Plan & Cost Estimation",
                "Adaptability: Suggestions for Nature, Culture, Food, or Adventure"
              ]}
              visual={
                <div className="w-full max-w-xs space-y-4 p-4">
                  {/* Input Simulation */}
                  <div className="flex gap-2 mb-6">
                    <div className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-500 font-grotesk">2 Days</div>
                    <div className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-500 font-grotesk">$$ Budget</div>
                    <div className="px-3 py-1 bg-sky-100 rounded-full text-xs font-bold text-sky-600 font-grotesk">Adventure</div>
                  </div>
                  
                  {/* Generated Cards */}
                  <div className="flex gap-4">
                    <div className="w-1 bg-sky-200 rounded-full relative">
                      <div className="absolute top-0 w-3 h-3 bg-sky-500 rounded-full -left-1"></div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 w-full transform transition-transform hover:scale-105">
                      <div className="text-xs font-bold text-sky-600 mb-1 font-grotesk">Day 1 • 09:00 AM</div>
                      <div className="font-bold text-slate-800 font-grotesk">Bungee Jumping</div>
                      <div className="text-xs text-slate-500 mt-1 font-sans">Match: 98% based on interest</div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-1 bg-sky-200 rounded-full relative">
                      <div className="absolute top-8 w-3 h-3 bg-purple-500 rounded-full -left-1"></div>
                    </div>
                    <div className="bg-sky-50 p-4 rounded-xl shadow-sm border border-sky-100 w-full transform transition-transform hover:scale-105">
                      <div className="text-xs font-bold text-purple-600 mb-1 font-grotesk">Day 1 • 01:00 PM</div>
                      <div className="font-bold text-slate-800 font-grotesk">Local Cuisine Tour</div>
                      <div className="text-xs text-slate-500 mt-1 font-sans">Est. Cost: $15.00</div>
                    </div>
                  </div>
                </div>
              }
            />

            {/* 2. Route Optimization (OpenStreetMap) */}
            <FeatureSection 
              subTitle="OpenStreetMap Integration"
              title="Detailed Open-Source Mapping"
              description="Powered by OpenStreetMap and Leaflet, we provide free, unrestricted access to the most detailed map data available. No hidden costs, just pure navigation."
              icon={Map}
              align="right"
              listItems={[
                "Full access to OpenStreetMap raw data",
                "Detailed footpaths, cycleways, and hidden trails",
                "Community-updated maps ensuring 100% free accuracy"
              ]}
              visual={
                <div className="w-full h-full min-h-[400px]">
                   <LeafletMap className="w-full h-full rounded-[2rem] z-0" />
                   
                   <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-3 rounded-xl border border-white/50 shadow-lg flex items-center gap-3 z-10">
                      <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center text-white shrink-0">
                         <Navigation size={20} />
                      </div>
                      <div>
                         <div className="text-xs font-bold text-slate-400 uppercase">Routing Engine</div>
                         <div className="font-bold text-slate-800 text-sm">Optimized via OSRM (Open Source)</div>
                      </div>
                   </div>
                </div>
              }
            />

            {/* 3. AI Travel Companion */}
            <FeatureSection 
              subTitle="Powered by Gemini / ChatGPT"
              title="AI Travel Companion"
              description="A built-in chatbot acting as your virtual tour guide. Ask questions naturally and get instant, context-aware answers."
              icon={MessageCircle}
              listItems={[
                "\"Suggest me a place to visit nearby\"",
                "\"Plan 2 hours for me\"",
                "\"Where is the nearest vegetarian restaurant?\""
              ]}
              visual={
                <div className="w-full max-w-xs space-y-4 p-4">
                   <div className="flex justify-end">
                      <div className="bg-sky-600 text-white px-4 py-3 rounded-2xl rounded-tr-sm text-sm font-medium shadow-md max-w-[85%] font-sans">
                        What can I do in Kathmandu this evening?
                      </div>
                   </div>
                   <div className="flex justify-start items-end gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-sky-500 flex items-center justify-center text-white shrink-0">
                         <Bot size={16} />
                      </div>
                      <div className="bg-white text-slate-700 px-4 py-3 rounded-2xl rounded-tl-sm text-sm font-medium shadow-md border border-slate-100 font-sans">
                         I recommend visiting <strong>Swayambhunath</strong> for the sunset view. Afterwards, try the vegetarian Thali at <em>Forest & Plate</em> nearby.
                      </div>
                   </div>
                   <div className="flex justify-center mt-4">
                      <div className="bg-slate-100 px-4 py-1 rounded-full text-xs text-slate-400 font-bold animate-pulse font-grotesk">
                         AI typing...
                      </div>
                   </div>
                </div>
              }
            />

            {/* 4. Dynamic Weather */}
            <FeatureSection 
              subTitle="Weather-Adaptive Intelligence"
              title="Dynamic Weather Suggestions"
              description="The app constantly monitors weather conditions and automatically adjusts your recommendations to ensure a great experience."
              icon={CloudRain}
              align="right"
              listItems={[
                "Rainy 🌧️ → Suggests indoor museums, art galleries, cafes",
                "Sunny ☀️ → Suggests parks, viewpoints, outdoor trekking",
                "Foggy 🌫️ → Avoids high-altitude viewpoints for safety"
              ]}
              visual={
                <div className="w-full max-w-sm p-4">
                   <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 relative overflow-hidden">
                      <div className="flex justify-between items-center mb-6">
                         <div>
                            <h4 className="font-grotesk font-bold text-lg text-slate-900">Today's Plan</h4>
                            <span className="text-xs font-bold text-red-400 font-grotesk">Rain Alert Detected</span>
                         </div>
                         <CloudRain size={32} className="text-slate-400" />
                      </div>

                      {/* Transitioning cards */}
                      <div className="space-y-3">
                         <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 opacity-50">
                            <Sun size={20} className="text-orange-400" />
                            <span className="text-slate-400 line-through text-sm font-sans">Outdoor Park Walk</span>
                         </div>
                         <div className="flex items-center justify-between p-3 rounded-xl bg-sky-50 border border-sky-200">
                            <div className="flex items-center gap-3">
                               <div className="bg-sky-200 p-1.5 rounded-lg text-sky-700"><Bot size={14}/></div>
                               <div>
                                 <span className="text-slate-800 font-bold text-sm block font-grotesk">National Museum</span>
                                 <span className="text-xs text-sky-600 font-bold font-grotesk">Recommended Alternative</span>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              }
            />
         </div>
       </section>

       {/* Detailed Grid for Tools */}
       <section className="py-24 bg-white relative">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
             <div className="text-center mb-16">
               <h2 className="text-2xl md:text-3xl font-grotesk font-bold text-slate-900">Smart On-Site Tools</h2>
               <p className="text-slate-500 mt-2 font-sans text-base">Everything you need when you arrive at your destination.</p>
             </div>
             
             <div className="grid md:grid-cols-3 gap-8">
                {/* QR Guide */}
                <div className="bg-slate-50 p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 group border border-slate-100">
                   <div className="w-14 h-14 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <QrCode size={28} />
                   </div>
                   <h3 className="text-lg font-grotesk font-bold text-slate-900 mb-3">QR-Based Local Guide</h3>
                   <p className="text-slate-500 text-sm leading-relaxed mb-4 font-sans">
                      Scan QR codes placed at temples and museums to instantly access history, photos, and operating hours. Promoting smart city interaction.
                   </p>
                   <div className="flex gap-2">
                      <span className="px-2 py-1 bg-white border border-slate-200 text-[10px] font-bold uppercase text-slate-500 rounded-md font-grotesk">History</span>
                      <span className="px-2 py-1 bg-white border border-slate-200 text-[10px] font-bold uppercase text-slate-500 rounded-md font-grotesk">Audio</span>
                   </div>
                </div>

                {/* Translator */}
                <div className="bg-slate-50 p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 group border border-slate-100">
                   <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Languages size={28} />
                   </div>
                   <h3 className="text-lg font-grotesk font-bold text-slate-900 mb-3">Real-Time Translator</h3>
                   <p className="text-slate-500 text-sm leading-relaxed mb-4 font-sans">
                      Break language barriers instantly. Speak or type "Where is the bus station?" and the app converts it to the local language (e.g., Nepali) and vice-versa.
                   </p>
                   <div className="flex gap-2">
                      <span className="px-2 py-1 bg-white border border-slate-200 text-[10px] font-bold uppercase text-slate-500 rounded-md font-grotesk">Voice</span>
                      <span className="px-2 py-1 bg-white border border-slate-200 text-[10px] font-bold uppercase text-slate-500 rounded-md font-grotesk">Text</span>
                   </div>
                </div>

                {/* Group Planner */}
                <div className="bg-slate-50 p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 group border border-slate-100">
                   <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Users size={28} />
                   </div>
                   <h3 className="text-lg font-grotesk font-bold text-slate-900 mb-3">Smart Group Planner</h3>
                   <p className="text-slate-500 text-sm leading-relaxed mb-4 font-sans">
                      Traveling with friends? Everyone selects their interests, and our system finds the highest match overlaps to generate a group-friendly itinerary.
                   </p>
                   <div className="flex gap-2">
                      <span className="px-2 py-1 bg-white border border-slate-200 text-[10px] font-bold uppercase text-slate-500 rounded-md font-grotesk">Voting</span>
                      <span className="px-2 py-1 bg-white border border-slate-200 text-[10px] font-bold uppercase text-slate-500 rounded-md font-grotesk">Sync</span>
                   </div>
                </div>
             </div>
          </div>
       </section>

       <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default FeaturesPage;