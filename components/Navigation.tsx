import React, { useState, useEffect } from 'react';
import { Twitter, Globe, Menu, X, Smartphone, Home, Info, Zap, Newspaper, Download } from 'lucide-react';
import { Logo } from './SharedUI';

export const Footer = ({ onNavigate }: { onNavigate: (page: string) => void }) => (
  <footer className="bg-white/90 backdrop-blur-xl pt-20 md:pt-24 pb-10 md:pb-12 border-t border-slate-100 relative z-10">
    <div className="max-w-7xl mx-auto px-6 md:px-8">
      <div className="grid md:grid-cols-4 gap-10 md:gap-12 mb-16">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-3 mb-6 cursor-pointer" onClick={() => onNavigate('landing')}>
            <Logo className="w-8 h-8" />
            <span className="font-display font-bold text-xl text-sky-900">ExploreMate</span>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Your intelligent travel companion for personalized itineraries, seamless navigation, and authentic experiences across Nepal.
          </p>
          <div className="flex gap-4 text-slate-400">
            <Twitter size={20} className="hover:text-sky-500 cursor-pointer transition-colors" />
            <Globe size={20} className="hover:text-sky-500 cursor-pointer transition-colors" />
          </div>
        </div>

        {[
          { title: "Company", links: [{ label: "About Us", page: "about" }, { label: "Features", page: "features" }, { label: "News & Weather", page: "news" }] },
          { title: "Features", links: [{ label: "AI Planner", page: "features" }, { label: "Route Optimizer", page: "features" }] },
          { title: "Support", links: [{ label: "Help Center", page: "faq" }, { label: "FAQ", page: "faq" }, { label: "Contact", page: "about" }] }
        ].map((col, i) => (
          <div key={i}>
            <h4 className="font-bold text-slate-900 mb-6 text-sm uppercase tracking-wider">{col.title}</h4>
            <ul className="space-y-3 md:space-y-4">
              {col.links.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => link.page && onNavigate(link.page)}
                    className="text-slate-500 text-sm hover:text-sky-600 transition-colors text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="pt-8 border-t border-slate-100 text-center text-slate-400 text-xs md:text-sm">
        &copy; 2024 ExploreMate. All rights reserved.
      </div>
    </div>
    <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-sky-200 via-sunset-200 to-sky-200"></div>
  </footer>
);

export const Navbar = ({ onNavigate, isLoggedIn = false }: { onNavigate: (page: string) => void, isLoggedIn?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const textColor = scrolled ? 'text-slate-700 hover:text-sky-600' : 'text-slate-700 hover:text-sky-600';
  const logoText = scrolled ? 'text-slate-900' : 'text-slate-900';
  const logoBg = scrolled ? 'bg-gradient-to-br from-sky-500 to-purple-600' : 'bg-gradient-to-br from-sky-400 to-purple-500';

  const menuItems = [
    { label: 'Home', page: 'landing', icon: Home },
    { label: 'About', page: 'about', icon: Info },
    { label: 'Features', page: 'features', icon: Zap },
    { label: 'Blog', page: 'blog', icon: Newspaper },
    { label: 'Pricing', page: 'pricing', icon: Zap }
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 px-4 md:px-0 ${scrolled ? 'glass-premium shadow-2xl border-b border-white/20 py-2.5 md:py-3' : 'glass-card py-5 md:py-6'}`}>
      <div className="max-w-7xl mx-auto md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate('landing')}>
          <div className={`${logoBg} p-2 rounded-xl shadow-lg transition-all duration-300 border border-white/20 group-hover:scale-110 group-hover:shadow-xl`}>
            <Logo className="w-6 h-6 md:w-7 md:h-7 text-white" variant="default" />
          </div>
          <span className={`font-display font-bold text-base sm:text-lg md:text-xl tracking-tight transition-colors duration-300 ${logoText}`}>
            Explore<span className="gradient-text">Mate</span>
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6 lg:gap-10">
          {menuItems.map((item) => (
            <button
              key={item.page}
              onClick={() => onNavigate(item.page)}
              className={`text-sm font-bold transition-all tracking-wide relative group ${textColor}`}
            >
              {item.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-sky-600 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
            </button>
          ))}
          <button className={`text-sm font-bold transition-colors flex items-center gap-2 ${textColor}`}>
            <Smartphone size={16} /> Download
          </button>
        </div>

        <div className="hidden md:flex items-center gap-3 lg:gap-4">
          {isLoggedIn ? (
            <button onClick={() => onNavigate('dashboard')} className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg bg-gradient-to-r from-sky-600 to-purple-600 text-white hover:shadow-xl hover:scale-105 active:scale-95`}>
              Dashboard
            </button>
          ) : (
            <>
              <button onClick={() => onNavigate('login')} className={`text-sm font-bold transition-colors text-slate-700 hover:text-sky-600`}>
                Log In
              </button>
              <button onClick={() => onNavigate('signup')} className={`px-5 lg:px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg bg-gradient-to-r from-sky-600 to-purple-600 text-white hover:shadow-xl hover:scale-105 active:scale-95`}>
                Sign Up
              </button>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className={`md:hidden p-2 rounded-xl transition-colors ${scrolled ? 'text-slate-700 bg-slate-100' : 'text-slate-700 bg-slate-100'}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Sidebar (Slide down) */}
      <div className={`absolute top-full left-0 w-full bg-white/95 backdrop-blur-2xl border-b border-slate-100 shadow-2xl transition-all duration-300 md:hidden overflow-hidden ${isOpen ? 'max-h-[500px] opacity-100 visible' : 'max-h-0 opacity-0 invisible'}`}>
        <div className="p-6 flex flex-col gap-2">
          {menuItems.map((item) => (
            <button
              key={item.page}
              onClick={() => { onNavigate(item.page); setIsOpen(false); }}
              className="flex items-center gap-4 px-4 py-3.5 text-left text-sm font-bold text-slate-600 hover:bg-sky-50 hover:text-sky-600 rounded-xl transition-all active:scale-95"
            >
              <item.icon size={18} className="text-slate-400 group-hover:text-sky-500" />
              {item.label}
            </button>
          ))}
          <button className="flex items-center gap-4 px-4 py-3.5 text-left text-sm font-bold text-slate-600 hover:bg-sky-50 hover:text-sky-600 rounded-xl transition-all active:scale-95">
            <Download size={18} className="text-slate-400" />
            Download App
          </button>

          <div className="my-2 border-t border-slate-50"></div>

          {isLoggedIn ? (
            <button onClick={() => { onNavigate('dashboard'); setIsOpen(false); }} className="w-full py-4 text-center font-bold text-white bg-sky-900 rounded-2xl shadow-xl shadow-sky-900/10 active:scale-[0.98] transition-transform">
              Go to Dashboard
            </button>
          ) : (
            <div className="flex gap-3 mt-2">
              <button onClick={() => { onNavigate('login'); setIsOpen(false); }} className="flex-1 py-4 text-center font-bold text-slate-700 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors">
                Log In
              </button>
              <button onClick={() => { onNavigate('signup'); setIsOpen(false); }} className="flex-1 py-4 text-center font-bold text-white bg-sky-900 rounded-2xl shadow-lg active:scale-[0.98] transition-transform">
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
