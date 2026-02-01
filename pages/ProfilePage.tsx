import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { User, MapPin, Settings, Camera, Edit2, LogOut, Mail, Globe, Shield, Bell, CreditCard, Compass, Mountain, Calendar, Check, Plane, Phone, Users, DollarSign, ChevronDown, X, Save } from 'lucide-react';
import { InputField } from '../components/SharedUI';

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'NPR', name: 'Nepalese Rupee', symbol: '₨' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
];

const AVAILABLE_INTERESTS = ["Hiking", "Photography", "Foodie", "History", "Art", "Nightlife", "Luxury", "Budget"];

const ProfilePage = ({ onLogout, onNavigate }: { onLogout: () => void, onNavigate: (page: string) => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'preferences' | 'account'>('preferences');
  const [isEditing, setIsEditing] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  
  // Profile Data State
  const [userProfile, setUserProfile] = useState({
    name: "Rashoj Ban",
    title: "Digital Nomad",
    location: "Kathmandu, Nepal",
    email: "rashojban@gmail.com",
    phone: "+977 9800000000",
    nationality: "Nepal",
    interests: ["Hiking", "Photography", "Foodie"],
    budget: 50, // 0 to 100 representing range
    travelStyle: "Solo"
  });

  // Image State
  // Using reliable Unsplash images for defaults
  const [profileImage, setProfileImage] = useState("https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=300&h=300");
  const [coverImage, setCoverImage] = useState("https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1200");
  
  // Refs
  const passwordModalRef = useRef<HTMLDivElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Animation setup
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.fromTo('.profile-header', 
          { y: -30, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      );

      tl.fromTo('.profile-card',
          { y: 40, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' },
          "-=0.5"
      );
      
      // Modern Text Reveal inside card (Only run if not editing to avoid input mess)
      if (!isEditing) {
        tl.fromTo('.reveal-text-char', 
            { y: 50, opacity: 0, skewY: 10, rotateZ: 5 },
            { y: 0, opacity: 1, skewY: 0, rotateZ: 0, stagger: 0.02, duration: 1, ease: 'power4.out' },
            "-=0.5"
        );
      }

      tl.fromTo('.profile-content',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out' },
          "-=0.4"
      );

      // Mobile Nav Animation
      tl.fromTo('.dash-nav-mobile',
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', },
          "-=0.6"
      );
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  // Modal Animation
  useEffect(() => {
      if(isPasswordModalOpen && passwordModalRef.current) {
          gsap.fromTo(passwordModalRef.current,
              { scale: 0.9, opacity: 0, y: 20 },
              { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.5)' }
          );
      }
  }, [isPasswordModalOpen]);

  const splitText = (text: string) => {
    return text.split('').map((char, index) => (
      <span key={index} className="reveal-text-char inline-block whitespace-pre origin-bottom will-change-transform">
        {char}
      </span>
    ));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'profile') {
          setProfileImage(reader.result as string);
        } else {
          setCoverImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
      setIsEditing(false);
      // Simulate API Save
      gsap.to('.save-feedback', { opacity: 1, y: -10, duration: 0.5, onComplete: () => {
          setTimeout(() => gsap.to('.save-feedback', { opacity: 0, y: 0 }), 2000);
      }});
  };

  const toggleInterest = (interest: string) => {
      if (!isEditing) return;
      
      setUserProfile(prev => ({
          ...prev,
          interests: prev.interests.includes(interest)
             ? prev.interests.filter(i => i !== interest)
             : [...prev.interests, interest]
      }));
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
      <div className="profile-header w-full max-w-6xl flex items-center justify-between mb-8 z-20">
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
                    item.page === 'profile' 
                    ? 'bg-slate-900 text-white shadow-md transform scale-105' 
                    : 'text-slate-500 hover:text-sky-600 hover:bg-sky-50'
                }`}
             >
                <item.icon size={16} className={item.page === 'profile' ? 'fill-white' : ''} />
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
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-4xl z-10 space-y-8">
        
        {/* Profile Header Card */}
        <div className="profile-card bg-white rounded-[2.5rem] shadow-xl border border-white/60 overflow-hidden relative">
           {/* Cover Image */}
           <div className="h-48 w-full relative overflow-hidden bg-slate-200">
              <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10"></div>
              
              <button 
                onClick={() => coverInputRef.current?.click()}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors z-10"
              >
                 <Camera size={18} />
              </button>
              <input 
                type="file" 
                ref={coverInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'cover')}
              />
           </div>
           
           <div className="px-8 pb-8">
              <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 mb-6 gap-6">
                 {/* Avatar */}
                 <div className="relative group z-10">
                    <div className="w-32 h-32 rounded-[2rem] p-1 bg-white shadow-lg">
                       <img src={profileImage} alt="Profile" className="w-full h-full rounded-[1.8rem] object-cover" />
                    </div>
                    <button 
                        onClick={() => profileInputRef.current?.click()}
                        className="absolute bottom-2 right-2 p-2 bg-sky-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 z-20"
                    >
                       <Edit2 size={14} />
                    </button>
                    <input 
                        type="file" 
                        ref={profileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'profile')}
                    />
                 </div>
                 
                 <div className="flex-grow pt-2 md:pt-0 w-full">
                    {isEditing ? (
                        <div className="space-y-3 mt-4 md:mt-0">
                            <input 
                                type="text" 
                                value={userProfile.name}
                                onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                                className="w-full text-3xl font-display font-bold text-slate-900 border-b-2 border-sky-200 outline-none bg-transparent focus:border-sky-500 placeholder-slate-300"
                                placeholder="Your Name"
                            />
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input 
                                    type="text" 
                                    value={userProfile.location}
                                    onChange={(e) => setUserProfile({...userProfile, location: e.target.value})}
                                    className="text-sm font-medium text-slate-500 border-b border-slate-200 outline-none bg-transparent focus:border-sky-400 w-full sm:w-auto"
                                    placeholder="City, Country"
                                />
                                <input 
                                    type="text" 
                                    value={userProfile.title}
                                    onChange={(e) => setUserProfile({...userProfile, title: e.target.value})}
                                    className="text-sm font-medium text-slate-500 border-b border-slate-200 outline-none bg-transparent focus:border-sky-400 w-full sm:w-auto"
                                    placeholder="Your Title"
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-3xl font-display font-bold text-slate-900 overflow-hidden">
                                {splitText(userProfile.name)}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-slate-500 mt-1 font-medium">
                                <span className="flex items-center gap-1"><MapPin size={16} /> {userProfile.location}</span>
                                <span className="flex items-center gap-1"><Globe size={16} /> {userProfile.title}</span>
                                <span className="text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide">Premium Member</span>
                            </div>
                        </>
                    )}
                 </div>

                 <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0 relative">
                    <button 
                        onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)} 
                        className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm border flex items-center justify-center gap-2 ${isEditing ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800' : 'bg-white text-slate-700 border-slate-200 hover:border-sky-300'}`}
                    >
                       {isEditing ? <><Save size={18} /> Save</> : <><Edit2 size={18} /> Edit Profile</>}
                    </button>
                    <button className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-sky-600 hover:border-sky-300 transition-all">
                       <Settings size={20} />
                    </button>
                    
                    {/* Save Feedback */}
                    <div className="save-feedback absolute -top-12 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg opacity-0 pointer-events-none whitespace-nowrap flex items-center gap-1">
                        <Check size={12} /> Profile Updated!
                    </div>
                 </div>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-6">
                 <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900 font-display">12</div>
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Districts</div>
                 </div>
                 <div className="text-center border-l border-slate-100">
                    <div className="text-2xl font-bold text-slate-900 font-display">8</div>
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Treks</div>
                 </div>
                 <div className="text-center border-l border-slate-100">
                    <div className="text-2xl font-bold text-slate-900 font-display">156</div>
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Memories</div>
                 </div>
              </div>
           </div>
        </div>

        {/* Tabs */}
        <div className="profile-content flex gap-8 border-b border-slate-200 px-4">
           {['preferences', 'account'].map((tab) => (
              <button
                 key={tab}
                 onClick={() => setActiveTab(tab as any)}
                 className={`pb-4 text-sm font-bold uppercase tracking-wider transition-all relative ${
                    activeTab === tab 
                    ? 'text-sky-600' 
                    : 'text-slate-400 hover:text-slate-600'
                 }`}
              >
                 {tab === 'preferences' ? 'Travel Preferences' : 'Account Settings'}
                 {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-600 rounded-t-full"></div>
                 )}
              </button>
           ))}
        </div>

        {/* Tab Content */}
        <div className="profile-content">
           {activeTab === 'preferences' ? (
              <div className="grid md:grid-cols-2 gap-6">
                 {/* Interests */}
                 <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                       <Compass size={20} className="text-sky-500" /> Travel Interests
                    </h3>
                    <div className="flex flex-wrap gap-2">
                       {AVAILABLE_INTERESTS.map((interest) => (
                          <button 
                             key={interest}
                             onClick={() => toggleInterest(interest)}
                             disabled={!isEditing}
                             className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                userProfile.interests.includes(interest) 
                                   ? 'bg-sky-100 text-sky-700 border border-sky-200' 
                                   : 'bg-slate-50 text-slate-500 border border-slate-100 hover:bg-white hover:border-slate-300'
                             } ${isEditing ? 'cursor-pointer hover:scale-105' : 'cursor-default opacity-80'}`}
                          >
                             {interest}
                          </button>
                       ))}
                       {isEditing && (
                           <button className="px-4 py-2 rounded-xl text-sm font-bold bg-white border border-dashed border-slate-300 text-slate-400 hover:text-sky-600 hover:border-sky-300 transition-all">
                              + Add
                           </button>
                       )}
                    </div>
                 </div>

                 {/* Travel Style */}
                 <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-6">
                    <div>
                       <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <CreditCard size={20} className="text-emerald-500" /> Budget Range
                       </h3>
                       <div className="h-2 bg-slate-100 rounded-full overflow-hidden relative">
                          <div 
                            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                            style={{ width: `${userProfile.budget}%` }}
                          ></div>
                          {isEditing && (
                              <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={userProfile.budget} 
                                onChange={(e) => setUserProfile({...userProfile, budget: parseInt(e.target.value)})}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                          )}
                       </div>
                       <div className="flex justify-between mt-2 text-xs font-bold text-slate-400">
                          <span>Budget</span>
                          <span className="text-emerald-600">{userProfile.budget > 66 ? 'Luxury' : (userProfile.budget > 33 ? 'Moderate' : 'Budget')} (${userProfile.budget * 5}-{userProfile.budget * 10}/day)</span>
                          <span>Luxury</span>
                       </div>
                    </div>

                    <div>
                       <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <Users size={20} className="text-purple-500" /> Travel Companions
                       </h3>
                       <div className="flex gap-2">
                          {['Solo', 'Couple', 'Group'].map(style => (
                              <button 
                                key={style}
                                onClick={() => isEditing && setUserProfile({...userProfile, travelStyle: style})}
                                className={`px-3 py-1 rounded-lg text-sm font-bold transition-all ${
                                    userProfile.travelStyle === style 
                                    ? 'bg-purple-50 text-purple-700' 
                                    : 'bg-white border border-slate-200 text-slate-500 opacity-50 hover:opacity-100'
                                }`}
                              >
                                {style}
                              </button>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
           ) : (
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-8">
                 <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <h3 className="text-lg font-bold text-slate-900 mb-2">Personal Information</h3>
                       <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                          <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isEditing ? 'bg-white border-sky-300 shadow-sm' : 'bg-slate-50 border-slate-100'}`}>
                             <Mail size={18} className="text-slate-400" /> 
                             {isEditing ? (
                                <input 
                                    type="email" 
                                    value={userProfile.email}
                                    onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                                    className="bg-transparent outline-none w-full text-slate-700 font-medium"
                                />
                             ) : (
                                <span className="text-slate-700 font-medium">{userProfile.email}</span>
                             )}
                          </div>
                       </div>
                       <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                          <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isEditing ? 'bg-white border-sky-300 shadow-sm' : 'bg-slate-50 border-slate-100'}`}>
                             <Phone size={18} className="text-slate-400" />
                             {isEditing ? (
                                <input 
                                    type="tel" 
                                    value={userProfile.phone}
                                    onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
                                    className="bg-transparent outline-none w-full text-slate-700 font-medium"
                                />
                             ) : (
                                <span className="text-slate-700 font-medium">{userProfile.phone}</span>
                             )}
                          </div>
                       </div>

                       {/* Regional Settings */}
                       <div className="pt-6 mt-2 border-t border-slate-100">
                           <h3 className="text-lg font-bold text-slate-900 mb-4">Regional Settings</h3>
                           <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Preferred Currency</label>
                              <div className="relative group">
                                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors">
                                    <DollarSign size={18} />
                                 </div>
                                 <select 
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    disabled={!isEditing}
                                    className={`w-full pl-12 pr-10 py-4 rounded-xl border text-slate-700 font-medium appearance-none outline-none transition-all cursor-pointer ${isEditing ? 'bg-white border-sky-300 focus:shadow-md' : 'bg-slate-50 border-slate-100'}`}
                                 >
                                    {CURRENCIES.map((c) => (
                                       <option key={c.code} value={c.code}>
                                          {c.name} ({c.code}) - {c.symbol}
                                       </option>
                                    ))}
                                 </select>
                                 <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                    <ChevronDown size={16} />
                                 </div>
                              </div>
                           </div>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <h3 className="text-lg font-bold text-slate-900 mb-2">Security & Privacy</h3>
                       <button 
                        onClick={() => setIsPasswordModalOpen(true)}
                        className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-sky-300 group transition-all"
                       >
                          <div className="flex items-center gap-3">
                             <div className="p-2 bg-sky-50 text-sky-600 rounded-lg group-hover:bg-sky-600 group-hover:text-white transition-colors">
                                <Shield size={18} />
                             </div>
                             <div className="text-left">
                                <div className="font-bold text-slate-800">Change Password</div>
                                <div className="text-xs text-slate-500">Last changed 3 months ago</div>
                             </div>
                          </div>
                          <Check size={18} className="text-slate-300" />
                       </button>

                       <button className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-red-300 group transition-all">
                          <div className="flex items-center gap-3">
                             <div className="p-2 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-colors">
                                <LogOut size={18} />
                             </div>
                             <div className="text-left">
                                <div className="font-bold text-slate-800">Log Out All Devices</div>
                                <div className="text-xs text-slate-500">Active on iPhone 13, MacBook Pro</div>
                             </div>
                          </div>
                       </button>
                    </div>
                 </div>
                 
                 <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <button onClick={onLogout} className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center gap-2">
                       <LogOut size={18} /> Sign Out
                    </button>
                 </div>
              </div>
           )}
        </div>

      </div>

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
              <div ref={passwordModalRef} className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 relative">
                  <button onClick={() => setIsPasswordModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-50 rounded-full">
                      <X size={24} />
                  </button>
                  <h2 className="text-2xl font-bold text-slate-900 mb-6 font-display">Change Password</h2>
                  <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsPasswordModalOpen(false); }}>
                      <InputField label="Current Password" type="password" placeholder="••••••••" required />
                      <InputField label="New Password" type="password" placeholder="••••••••" required />
                      <InputField label="Confirm New Password" type="password" placeholder="••••••••" required />
                      
                      <div className="pt-4 flex gap-3">
                          <button 
                            type="button" 
                            onClick={() => setIsPasswordModalOpen(false)}
                            className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
                          >
                              Cancel
                          </button>
                          <button 
                            type="submit" 
                            className="flex-1 py-3 bg-sky-600 text-white font-bold rounded-xl hover:bg-sky-700 shadow-lg shadow-sky-600/20 transition-all active:scale-95"
                          >
                              Update
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Bottom Nav (Mobile Only) */}
      <div className="dash-nav-mobile md:hidden fixed bottom-4 left-4 right-4 bg-gradient-to-tr from-sky-600 via-blue-600 to-sky-700 backdrop-blur-xl border border-white/20 py-4 px-8 rounded-2xl shadow-xl shadow-sky-900/20 z-50 flex items-center justify-between ring-1 ring-white/20">
        {navItems.map((item, i) => {
           const isActive = item.page === 'profile';
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

export default ProfilePage;