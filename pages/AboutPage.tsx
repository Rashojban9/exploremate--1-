import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Building, Linkedin, Award, Globe, Mail, Phone, MapPin } from 'lucide-react';
import { Navbar, Footer } from '../components/Navigation';

gsap.registerPlugin(ScrollTrigger);

const AboutPage = ({ onNavigate, isLoggedIn }: { onNavigate: (page: string) => void, isLoggedIn?: boolean }) => {
  useEffect(() => {
    const tl = gsap.timeline();

    // Modern Text Reveal
    tl.fromTo('.reveal-text-char', 
        { y: 50, opacity: 0, skewY: 10, rotateZ: 5 },
        { y: 0, opacity: 1, skewY: 0, rotateZ: 0, stagger: 0.02, duration: 1, ease: 'power4.out' }
    );

    gsap.utils.toArray('.about-fade-up').forEach((elem: any) => {
      gsap.fromTo(elem, 
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: elem, start: 'top 85%' }
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
    <div className="w-full relative">
       <Navbar onNavigate={onNavigate} isLoggedIn={isLoggedIn} />

       {/* About Hero */}
       <section className="relative pt-40 pb-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 text-center">
             <div className="about-fade-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100 text-sky-700 font-bold text-xs uppercase tracking-wider border border-sky-200 mb-6">
                <Building size={14} /> Our Story
             </div>
             <h1 className="text-5xl md:text-7xl font-display font-bold text-slate-900 mb-8 overflow-hidden">
               {splitText("Redefining Travel with")} <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-sunset-500">{splitText("Artificial Intelligence")}</span>
             </h1>
             <p className="about-fade-up text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
               At ExploreMate, we believe travel should be seamless, personalized, and unforgettable. By harnessing the power of advanced AI, we connect travelers to authentic experiences, smart routes, and local cultures like never before.
             </p>
          </div>
          {/* Background element */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-sky-200/20 filter blur-[100px] rounded-full -z-10"></div>
       </section>

       {/* Leadership Section */}
       <section className="py-20 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center mb-16 about-fade-up">
              <span className="text-sunset-500 font-bold uppercase tracking-widest text-sm">Leadership</span>
              <h2 className="text-3xl font-display font-bold text-slate-900 mt-2">Meet Our CEO</h2>
            </div>
            
            <div className="max-w-4xl mx-auto glass-card rounded-[2.5rem] p-8 md:p-12 about-fade-up flex flex-col md:flex-row items-center gap-12 shadow-xl border-white/60">
               <div className="relative shrink-0">
                  <div className="w-64 h-64 rounded-full p-2 bg-gradient-to-br from-sky-400 to-sunset-400">
                     <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400" alt="CEO" className="w-full h-full rounded-full object-cover border-4 border-white" />
                  </div>
                  <div className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg text-sky-600">
                    <Linkedin size={24} />
                  </div>
               </div>
               <div className="text-center md:text-left">
                  <h3 className="text-3xl font-display font-bold text-slate-900 mb-2">Alex Pathfinder</h3>
                  <p className="text-sky-600 font-bold mb-4">Founder & Chief Executive Officer</p>
                  <p className="text-slate-600 leading-relaxed mb-6">
                    With over 15 years of experience in both the tourism and technology sectors, Alex founded ExploreMate with a singular vision: to make the world accessible to everyone through smart technology. Alex leads our global team with a passion for innovation and a deep respect for cultural heritage.
                  </p>
                  <div className="flex items-center justify-center md:justify-start gap-4">
                     <div className="flex items-center gap-2 px-4 py-2 bg-sky-50 rounded-lg text-sky-700 font-bold text-xs">
                        <Award size={16} /> Tech Innovator 2023
                     </div>
                     <div className="flex items-center gap-2 px-4 py-2 bg-sunset-50 rounded-lg text-sunset-700 font-bold text-xs">
                        <Globe size={16} /> Global Speaker
                     </div>
                  </div>
               </div>
            </div>
          </div>
       </section>

       {/* Contact Details */}
       <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center about-fade-up">
               <div>
                  <span className="text-sky-600 font-bold uppercase tracking-widest text-sm">Get in Touch</span>
                  <h2 className="text-4xl font-display font-bold text-slate-900 mt-2 mb-6">We'd Love to Hear From You</h2>
                  <p className="text-slate-600 mb-8">
                    Whether you have a question about our platform, need support for your upcoming trip, or want to partner with us, our team is here to help.
                  </p>
                  
                  <div className="space-y-6">
                     <div className="flex items-start gap-4 p-4 rounded-2xl bg-white shadow-sm border border-slate-100 hover:border-sky-200 transition-colors">
                        <div className="p-3 bg-sky-100 text-sky-600 rounded-xl">
                           <Mail size={24} />
                        </div>
                        <div>
                           <h4 className="font-bold text-slate-900">Email Us</h4>
                           <p className="text-slate-500 text-sm">hello@exploremate.ai</p>
                           <p className="text-slate-500 text-sm">support@exploremate.ai</p>
                        </div>
                     </div>
                     
                     <div className="flex items-start gap-4 p-4 rounded-2xl bg-white shadow-sm border border-slate-100 hover:border-sky-200 transition-colors">
                        <div className="p-3 bg-sunset-100 text-sunset-600 rounded-xl">
                           <Phone size={24} />
                        </div>
                        <div>
                           <h4 className="font-bold text-slate-900">Call Us</h4>
                           <p className="text-slate-500 text-sm">+1 (555) 0123-4567</p>
                           <p className="text-slate-400 text-xs mt-1">Mon-Fri from 8am to 5pm</p>
                        </div>
                     </div>

                     <div className="flex items-start gap-4 p-4 rounded-2xl bg-white shadow-sm border border-slate-100 hover:border-sky-200 transition-colors">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                           <MapPin size={24} />
                        </div>
                        <div>
                           <h4 className="font-bold text-slate-900">Headquarters</h4>
                           <p className="text-slate-500 text-sm">123 Innovation Drive, Tech Valley</p>
                           <p className="text-slate-500 text-sm">Kathmandu, Nepal 44600</p>
                        </div>
                     </div>
                  </div>
               </div>
               
               <div className="h-full min-h-[400px] bg-slate-200 rounded-[2.5rem] overflow-hidden relative shadow-2xl">
                  {/* Placeholder Map Image */}
                  <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800" className="absolute inset-0 w-full h-full object-cover" alt="Map Location" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-8">
                     <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="font-bold text-slate-800 text-sm">Open Now</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>
       </section>

       <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default AboutPage;