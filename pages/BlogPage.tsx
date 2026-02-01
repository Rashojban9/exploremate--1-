import React, { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BookOpen, Clock, Calendar, ArrowRight, ChevronDown, Mail, Check, Loader2 } from 'lucide-react';
import { Navbar, Footer } from '../components/Navigation';

gsap.registerPlugin(ScrollTrigger);

const BlogCard = ({ image, category, title, excerpt, date, readTime }: any) => (
  <div className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col h-full border border-slate-100 blog-card">
    <div className="relative h-48 overflow-hidden">
      <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md text-xs font-bold text-sky-600 rounded-full shadow-sm uppercase tracking-wide">
        {category}
      </div>
    </div>
    <div className="p-6 flex flex-col flex-grow">
      <div className="flex items-center gap-4 text-xs text-slate-400 mb-3 font-semibold">
        <span className="flex items-center gap-1"><Calendar size={14} /> {date}</span>
        <span className="flex items-center gap-1"><Clock size={14} /> {readTime}</span>
      </div>
      <h3 className="font-display font-bold text-xl text-slate-900 mb-3 group-hover:text-sky-600 transition-colors line-clamp-2">
        {title}
      </h3>
      <p className="text-slate-500 text-sm mb-6 line-clamp-3 flex-grow">
        {excerpt}
      </p>
      <button className="flex items-center gap-2 text-sm font-bold text-slate-700 group-hover:text-sky-600 transition-colors mt-auto">
        Read Article <ArrowRight size={16} />
      </button>
    </div>
  </div>
);

const BlogPage = ({ onNavigate, isLoggedIn }: { onNavigate: (page: string) => void, isLoggedIn?: boolean }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  useEffect(() => {
    const tl = gsap.timeline();

    // Modern Text Reveal
    tl.fromTo('.reveal-text-char', 
        { y: 50, opacity: 0, skewY: 10, rotateZ: 5 },
        { y: 0, opacity: 1, skewY: 0, rotateZ: 0, stagger: 0.02, duration: 1, ease: 'power4.out' }
    );

    gsap.utils.toArray('.blog-fade-up').forEach((elem: any) => {
      gsap.fromTo(elem, 
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: elem, start: 'top 85%' }
        }
      );
    });
    
    gsap.fromTo('.blog-card',
      { y: 60, opacity: 0 },
      { 
        y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.blog-grid', start: 'top 80%' }
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

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');

    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setEmail('');
      
      // Reset status after showing success message
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    }, 1500);
  };

  const posts = [
    {
      title: "The Ultimate Packing List for Southeast Asia",
      category: "Guides",
      excerpt: "Traveling light doesn't mean leaving essentials behind. Here's exactly what you need for a month-long trip through Thailand, Vietnam, and Cambodia.",
      date: "Oct 12, 2023",
      readTime: "8 min read",
      image: "https://images.unsplash.com/photo-1552422554-0d5af0c79fc6?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "How AI is Revolutionizing Solo Travel",
      category: "Tech",
      excerpt: "From real-time translation to safety monitoring, discover how artificial intelligence is making solo adventures safer and more accessible than ever before.",
      date: "Sep 28, 2023",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "Eating Your Way Through Osaka: A Foodie's Guide",
      category: "Food",
      excerpt: "Forget Tokyo; Osaka is Japan's true kitchen. We explore the best street food stalls, hidden izakayas, and Michelin-starred spots you can't miss.",
      date: "Sep 15, 2023",
      readTime: "12 min read",
      image: "https://images.unsplash.com/photo-1574484284008-81dcec28d3e7?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "Sustainable Tourism: Traveling Responsibly in 2024",
      category: "Eco",
      excerpt: "As travelers, we have a responsibility to protect the places we visit. Learn practical tips for reducing your carbon footprint and supporting local communities.",
      date: "Aug 30, 2023",
      readTime: "10 min read",
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "Digital Nomad Life: Best Cities for Remote Work",
      category: "Lifestyle",
      excerpt: "Looking to take your office on the road? We've ranked the top cities based on WiFi speed, cost of living, community, and visa accessibility.",
      date: "Aug 10, 2023",
      readTime: "15 min read",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "Hidden Gems in the Himalayas",
      category: "Adventure",
      excerpt: "Beyond Everest Base Camp lies a world of untouched valleys and ancient monasteries. Discover the trekking routes less traveled.",
      date: "Jul 22, 2023",
      readTime: "9 min read",
      image: "https://images.unsplash.com/photo-1585970281220-41834220b3c6?auto=format&fit=crop&q=80&w=800"
    }
  ];

  return (
    <div className="w-full relative">
      <Navbar onNavigate={onNavigate} isLoggedIn={isLoggedIn} />

      {/* Blog Hero */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
           <div className="text-center max-w-3xl mx-auto mb-16 blog-fade-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100 text-sky-700 font-bold text-xs uppercase tracking-wider border border-sky-200 mb-6">
                  <BookOpen size={14} /> Travel Journal
              </div>
              <h1 className="text-5xl md:text-7xl font-display font-bold text-slate-900 mb-6 overflow-hidden">
                {splitText("Stories from the")} <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-sunset-500">{splitText("Open Road")}</span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                Inspiration, tips, and guides for the modern explorer. Join our community of travelers sharing their adventures and insights.
              </p>
           </div>

           {/* Featured Post */}
           <div className="w-full relative rounded-[2.5rem] overflow-hidden shadow-2xl group cursor-pointer blog-fade-up h-[500px]">
              <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1600" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Featured" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
              <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
                 <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-sky-600 text-white text-xs font-bold rounded-full uppercase tracking-wide">Featured</span>
                    <span className="text-slate-300 text-sm font-semibold flex items-center gap-1"><Clock size={14} /> 5 min read</span>
                 </div>
                 <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4 max-w-4xl leading-tight group-hover:text-sky-200 transition-colors">
                    10 breathtaking places to visit before they become too popular
                 </h2>
                 <p className="text-slate-200 text-lg max-w-2xl mb-6 line-clamp-2 md:line-clamp-none">
                    From the azure waters of Albania to the misty forests of Madeira, discover the destinations that are about to have their moment in the spotlight.
                 </p>
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                       <img src="https://i.pravatar.cc/150?img=32" alt="Author" className="w-10 h-10 rounded-full border-2 border-white" />
                       <span className="text-white font-bold text-sm">Sarah Jenkins</span>
                    </div>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-300 text-sm font-semibold">Nov 2, 2023</span>
                 </div>
              </div>
           </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-sky-200/20 filter blur-[100px] rounded-full -z-10"></div>
      </section>

      {/* Post Grid */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
         <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex items-center justify-between mb-12 blog-fade-up">
               <h3 className="text-3xl font-display font-bold text-slate-900">Latest Articles</h3>
               <div className="flex gap-2">
                  {['All', 'Guides', 'Food', 'Tech'].map((tag, i) => (
                     <button key={tag} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${i === 0 ? 'bg-sky-900 text-white' : 'bg-white text-slate-600 hover:bg-sky-50'}`}>
                        {tag}
                     </button>
                  ))}
               </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 blog-grid">
               {posts.map((post, index) => (
                  <BlogCard key={index} {...post} />
               ))}
            </div>

            <div className="mt-16 text-center blog-fade-up">
               <button className="px-8 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:border-sky-300 hover:text-sky-600 transition-all shadow-sm flex items-center gap-2 mx-auto">
                  Load More Articles <ChevronDown size={18} />
               </button>
            </div>
         </div>
      </section>

      {/* Newsletter */}
      <section className="py-24">
         <div className="max-w-5xl mx-auto px-4 md:px-8">
            <div className="bg-sky-900 rounded-[2.5rem] p-8 md:p-16 text-center relative overflow-hidden shadow-2xl blog-fade-up">
               <div className="relative z-10">
                  <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
                     <Mail className="text-white" size={32} />
                  </div>
                  <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
                     Travel tips in your inbox
                  </h2>
                  <p className="text-sky-200 text-lg max-w-xl mx-auto mb-8">
                     Join 50,000+ travelers getting the best travel deals, hidden gems, and inspiration delivered weekly. No spam, ever.
                  </p>
                  
                  <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-4 relative" onSubmit={handleSubscribe}>
                     <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address" 
                        disabled={status === 'loading' || status === 'success'}
                        className="flex-grow px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-sky-200 focus:outline-none focus:bg-white/20 transition-all font-medium disabled:opacity-50"
                     />
                     <button 
                        disabled={status === 'loading' || status === 'success'}
                        className={`px-8 py-4 font-bold rounded-xl transition-all shadow-lg min-w-[140px] flex items-center justify-center gap-2 ${
                            status === 'success' 
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                            : 'bg-white text-sky-900 hover:bg-sky-50'
                        }`}
                     >
                        {status === 'loading' && <Loader2 size={20} className="animate-spin" />}
                        {status === 'success' && <Check size={20} />}
                        {status === 'idle' && 'Subscribe'}
                        {status === 'success' && 'Joined!'}
                     </button>
                  </form>
               </div>
               
               {/* Decorative Circles */}
               <div className="absolute top-0 left-0 w-64 h-64 bg-sky-500/20 rounded-full blur-[60px] -translate-x-1/2 -translate-y-1/2"></div>
               <div className="absolute bottom-0 right-0 w-64 h-64 bg-sunset-500/20 rounded-full blur-[60px] translate-x-1/2 translate-y-1/2"></div>
            </div>
         </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default BlogPage;