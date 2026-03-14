import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Building, Linkedin, Award, Globe, Mail, Phone, MapPin, Sparkles, Users, Target, Heart, ArrowRight, Star } from 'lucide-react';
import { Navbar, Footer } from '../components/Navigation';

gsap.registerPlugin(ScrollTrigger);

const StatCard = ({ value, label, icon: Icon, index }: { value: string; label: string; icon: any; index: number }) => (
  <div className="stat-card group relative overflow-hidden rounded-[2rem] bg-white/80 backdrop-blur-xl p-6 md:p-8 shadow-xl border border-white/50 hover:border-sky-200 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-sky-100 to-purple-100 rounded-full blur-2xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
    <div className="relative z-10">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-purple-600 flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
        <Icon size={24} />
      </div>
      <div className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-1">{value}</div>
      <div className="text-slate-500 font-medium text-sm">{label}</div>
    </div>
  </div>
);

const TeamMemberCard = ({ name, role, image, bio, badges }: { name: string; role: string; image: string; bio: string; badges: string[] }) => (
  <div className="team-card group relative overflow-hidden rounded-[2.5rem] bg-white shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-slate-100">
    <div className="relative h-72 overflow-hidden">
      <img src={image} alt={name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
        <div className="flex items-center justify-center gap-2">
          <a href="#" className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-sky-500 transition-all">
            <Linkedin size={18} />
          </a>
        </div>
      </div>
    </div>
    <div className="p-6">
      <h3 className="text-xl font-display font-bold text-slate-900 mb-1">{name}</h3>
      <p className="text-sky-600 font-bold text-sm mb-3">{role}</p>
      <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2">{bio}</p>
      <div className="flex flex-wrap gap-2">
        {badges.map((badge, i) => (
          <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
            {badge}
          </span>
        ))}
      </div>
    </div>
  </div>
);

const ValueCard = ({ icon: Icon, title, description, index }: { icon: any; title: string; description: string; index: number }) => (
  <div className="value-card group relative overflow-hidden rounded-[2rem] bg-white p-8 shadow-lg hover:shadow-xl transition-all duration-500 border border-slate-100">
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sky-100 to-purple-100 rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
    <div className="relative z-10">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-purple-600 flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
        <Icon size={32} />
      </div>
      <h3 className="text-xl font-display font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{description}</p>
    </div>
  </div>
);

const AboutPage = ({ onNavigate, isLoggedIn }: { onNavigate: (page: string) => void, isLoggedIn?: boolean }) => {
  useEffect(() => {
    const tl = gsap.timeline();

    tl.fromTo('.hero-badge',
      { y: 20, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, duration: 1, scale: 0.6, ease: 'back.out(1.7)' }
    );

    tl.fromTo('.hero-title-line',
      { y: 40, opacity: 0, skewY: 5 },
      { y: 0, opacity: 1, skewY: 0, stagger: 0.15, duration: 0.8, ease: 'power4.out' },
      "-=0.3"
    );

    tl.fromTo('.hero-desc',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
      "-=0.5"
    );

    gsap.utils.toArray('.stat-card').forEach((elem: any, i: number) => {
      gsap.fromTo(elem,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.6, delay: i * 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: elem, start: 'top 90%' }
        }
      );
    });

    gsap.utils.toArray('.team-card').forEach((elem: any, i: number) => {
      gsap.fromTo(elem,
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.7, delay: i * 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: elem, start: 'top 85%' }
        }
      );
    });

    gsap.utils.toArray('.value-card').forEach((elem: any, i: number) => {
      gsap.fromTo(elem,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.6, delay: i * 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: elem, start: 'top 85%' }
        }
      );
    });

    gsap.utils.toArray('.section-reveal').forEach((elem: any) => {
      gsap.fromTo(elem,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: elem, start: 'top 85%' }
        }
      );
    });
  }, []);

  return (
    <div className="w-full relative bg-slate-50/50">
       <Navbar onNavigate={onNavigate} isLoggedIn={isLoggedIn} />

       {/* About Hero */}
       <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden px-4 md:px-8">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-purple-50 to-pink-50 animate-gradient"></div>
          <div className="absolute top-20 right-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-sky-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
          
          <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 text-center">
             <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-sky-200 text-sky-600 font-bold text-xs uppercase tracking-wider shadow-lg mb-6">
                <Sparkles size={14} className="fill-sky-600" /> Our Story
             </div>
             <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold text-slate-900 mb-6 leading-tight overflow-hidden">
               <div className="hero-title-line">Redefining Travel with</div>
               <div className="hero-title-line gradient-text">Artificial Intelligence</div>
             </h1>
             <p className="hero-desc text-base sm:text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
               At ExploreMate, we believe travel should be seamless, personalized, and unforgettable. By harnessing the power of advanced AI, we connect travelers to authentic experiences, smart routes, and local cultures like never before.
             </p>
          </div>
       </section>

       {/* Stats Section */}
       <section className="py-16 -mt-8 relative z-20">
         <div className="max-w-7xl mx-auto px-4 md:px-8">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
             <StatCard value="50K+" label="Happy Travelers" icon={Users} index={0} />
             <StatCard value="500+" label="Destinations" icon={MapPin} index={1} />
             <StatCard value="99%" label="Satisfaction Rate" icon={Star} index={2} />
             <StatCard value="24/7" label="AI Support" icon={Sparkles} index={3} />
           </div>
         </div>
       </section>

       {/* Leadership Section */}
       <section className="py-20 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center mb-16 section-reveal">
              <span className="text-sky-600 font-bold uppercase tracking-widest text-sm">Leadership</span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mt-2">Meet Our CEO</h2>
            </div>
            
            <div className="max-w-4xl mx-auto section-reveal rounded-[2.5rem] overflow-hidden">
               <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-slate-100 flex flex-col md:flex-row items-center gap-10">
                  <div className="relative shrink-0">
                     <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-purple-500 rounded-[2.5rem] blur-xl opacity-30"></div>
                     <div className="relative w-56 h-56 md:w-64 md:h-64 rounded-full p-1 bg-gradient-to-br from-sky-400 to-sunset-400">
                        <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400" alt="CEO" className="w-full h-full rounded-full object-cover border-4 border-white" />
                     </div>
                     <div className="absolute bottom-2 right-2 bg-white p-3 rounded-full shadow-lg text-sky-600 hover:scale-110 transition-transform">
                       <Linkedin size={24} />
                     </div>
                  </div>
                  <div className="text-center md:text-left flex-1">
                     <h3 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-2">Alex Pathfinder</h3>
                     <p className="text-sky-600 font-bold text-lg mb-4">Founder & Chief Executive Officer</p>
                     <p className="text-slate-600 leading-relaxed mb-6">
                       With over 15 years of experience in both the tourism and technology sectors, Alex founded ExploreMate with a singular vision: to make the world accessible to everyone through smart technology. Alex leads our global team with a passion for innovation and a deep respect for cultural heritage.
                     </p>
                     <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-50 to-purple-50 rounded-xl text-sky-700 font-bold text-xs border border-sky-200">
                           <Award size={16} /> Tech Innovator 2023
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sunset-50 to-pink-50 rounded-xl text-sunset-700 font-bold text-xs border border-sunset-200">
                           <Globe size={16} /> Global Speaker
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
       </section>

       {/* Values Section */}
       <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center mb-16 section-reveal">
              <span className="text-purple-600 font-bold uppercase tracking-widest text-sm">Our Values</span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mt-2">What Drives Us</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <ValueCard 
                icon={Target}
                title="Innovation First"
                description="We constantly push the boundaries of what's possible with AI to create groundbreaking travel experiences."
                index={0}
              />
              <ValueCard 
                icon={Heart}
                title="User-Centric Design"
                description="Every feature we build is designed with our users' needs at the forefront, ensuring seamless experiences."
                index={1}
              />
              <ValueCard 
                icon={Globe}
                title="Sustainable Tourism"
                description="We're committed to promoting responsible travel that respects local cultures and preserves destinations."
                index={2}
              />
            </div>
          </div>
       </section>

       {/* Team Section */}
       <section className="py-20 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center mb-16 section-reveal">
              <span className="text-sunset-500 font-bold uppercase tracking-widest text-sm">Our Team</span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mt-2">The Minds Behind ExploreMate</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <TeamMemberCard 
                name="Sarah Chen"
                role="Chief Technology Officer"
                image="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400"
                bio="Former Google AI researcher with 10+ years in machine learning and natural language processing."
                badges={["AI Expert", "ML Pioneer"]}
              />
              <TeamMemberCard 
                name="Michael Rai"
                role="Head of Operations"
                image="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400"
                bio="Travel industry veteran with deep connections across Nepal's tourism sector and local communities."
                badges={["Tourism Pro", "Local Expert"]}
              />
              <TeamMemberCard 
                name="Emily Watson"
                role="Head of Product"
                image="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400"
                bio="Product leader focused on creating intuitive experiences that travelers love worldwide."
                badges={["UX Master", "Strategy Lead"]}
              />
            </div>
          </div>
       </section>

       {/* Contact Details */}
       <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center section-reveal">
               <div>
                  <span className="text-sky-600 font-bold uppercase tracking-widest text-sm">Get in Touch</span>
                  <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mt-2 mb-6">We'd Love to Hear From You</h2>
                  <p className="text-slate-600 mb-8 text-lg leading-relaxed">
                      Whether you have a question about our platform, need support for your upcoming trip, or want to partner with us, our team is here to help.
                  </p>
                  
                  <div className="space-y-4">
                     <div className="group flex items-start gap-4 p-5 rounded-2xl bg-white shadow-lg border border-slate-100 hover:border-sky-300 hover:shadow-xl transition-all duration-300 cursor-pointer">
                        <div className="p-3 bg-gradient-to-br from-sky-100 to-sky-200 text-sky-600 rounded-xl group-hover:scale-110 transition-transform">
                           <Mail size={24} />
                        </div>
                        <div>
                           <h4 className="font-bold text-slate-900 mb-1">Email Us</h4>
                           <p className="text-slate-500 text-sm">hello@exploremate.ai</p>
                           <p className="text-slate-500 text-sm">support@exploremate.ai</p>
                        </div>
                     </div>
                     
                     <div className="group flex items-start gap-4 p-5 rounded-2xl bg-white shadow-lg border border-slate-100 hover:border-sunset-300 hover:shadow-xl transition-all duration-300 cursor-pointer">
                        <div className="p-3 bg-gradient-to-br from-sunset-100 to-sunset-200 text-sunset-600 rounded-xl group-hover:scale-110 transition-transform">
                           <Phone size={24} />
                        </div>
                        <div>
                           <h4 className="font-bold text-slate-900 mb-1">Call Us</h4>
                           <p className="text-slate-500 text-sm">+1 (555) 0123-4567</p>
                           <p className="text-slate-400 text-xs mt-1">Mon-Fri from 8am to 5pm</p>
                        </div>
                     </div>

                     <div className="group flex items-start gap-4 p-5 rounded-2xl bg-white shadow-lg border border-slate-100 hover:border-emerald-300 hover:shadow-xl transition-all duration-300 cursor-pointer">
                        <div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                           <MapPin size={24} />
                        </div>
                        <div>
                           <h4 className="font-bold text-slate-900 mb-1">Headquarters</h4>
                           <p className="text-slate-500 text-sm">123 Innovation Drive, Tech Valley</p>
                           <p className="text-slate-500 text-sm">Kathmandu, Nepal 44600</p>
                        </div>
                     </div>
                  </div>
               </div>
               
               <div className="h-full min-h-[400px] rounded-[2.5rem] overflow-hidden relative shadow-2xl group">
                  <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Map Location" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent flex items-end p-8">
                     <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl flex items-center gap-3 shadow-lg">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="font-bold text-slate-800">Open Now</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>
       </section>

       {/* CTA Section */}
       <section className="py-20">
         <div className="max-w-4xl mx-auto px-4 md:px-8">
           <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-r from-sky-600 to-purple-600 p-12 md:p-16 text-center shadow-2xl">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
             <div className="relative z-10">
               <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">Ready to Start Your Journey?</h2>
               <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                 Join thousands of travelers who have discovered the magic of Nepal with ExploreMate's AI-powered guidance.
               </p>
               <button 
                 onClick={() => onNavigate(isLoggedIn ? 'dashboard' : 'signup')}
                 className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
               >
                 Get Started <ArrowRight size={20} />
               </button>
             </div>
           </div>
         </div>
       </section>

       <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default AboutPage;
