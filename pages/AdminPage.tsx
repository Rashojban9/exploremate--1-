
import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Shield, Users, Activity, LogOut, ArrowLeft, RefreshCw, Trash2, Edit, AlertTriangle, CheckCircle, Database, Server, Globe, Search, Filter, Image, FileText, Settings, Upload, UserPlus, ShieldCheck, DollarSign, MapPin, Newspaper, Calendar, Menu, Link, ToggleLeft } from 'lucide-react';

const AdminPage = ({ onBack }: { onBack: () => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.admin-panel', 
        { opacity: 0, scale: 0.98 }, 
        { opacity: 1, scale: 1, duration: 0.8, ease: "power3.out" }
      );
      gsap.fromTo('.admin-card',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: "power2.out" }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const stats = [
    { label: 'System Users', value: '4,129', change: '+8%', icon: Users, color: 'text-sky-500' },
    { label: 'Network Uptime', value: '100%', change: 'Stable', icon: Activity, color: 'text-emerald-500' },
    { label: 'Compute Load', value: '18%', change: 'Low', icon: Server, color: 'text-orange-500' },
    { label: 'Secure Storage', value: '1.2TB', change: '82%', icon: Database, color: 'text-purple-500' },
  ];

  const USERS = [
    { name: 'Root System', email: 'owner@exploremate.ai', status: 'Online', rank: 'MASTER', sync: 'Real-time' },
    { name: 'Sarah J.', email: 'sarah.j@travel.net', status: 'Standby', rank: 'LEVEL 4', sync: '12m ago' },
    { name: 'Arjun N.', email: 'arjun.n@guide.io', status: 'Online', rank: 'LEVEL 2', sync: '3h ago' },
    { name: 'Auto-Bot Alpha', email: 'ai.system@cloud.io', status: 'Active', rank: 'DAEMON', sync: 'Continuous' },
  ];
  const ROLES = [
    { name: 'Super Admin', users: 2, perms: 'Full access', status: 'Active' },
    { name: 'Content Manager', users: 5, perms: 'Pages, News, Media', status: 'Active' },
    { name: 'Support', users: 8, perms: 'Users, Trips', status: 'Limited' },
    { name: 'Analyst', users: 4, perms: 'Read-only', status: 'Limited' },
  ];
  const PAGES = [
    { title: 'Landing', slug: '/', status: 'Published', updated: 'Jan 28, 2026' },
    { title: 'Features', slug: '/features', status: 'Published', updated: 'Jan 25, 2026' },
    { title: 'Pricing', slug: '/pricing', status: 'Draft', updated: 'Jan 31, 2026' },
    { title: 'About', slug: '/about', status: 'Published', updated: 'Jan 12, 2026' },
  ];
  const MEDIA = [
    { name: 'logo.png', type: 'Image', size: '512 KB', status: 'Live', src: '/assets/logo.png' },
    { name: 'everest.png', type: 'Image', size: '3.1 MB', status: 'Live', src: '/assets/everest.png' },
    { name: 'pokhara.png', type: 'Image', size: '2.6 MB', status: 'Live', src: '/assets/pokhara.png' },
    { name: 'boudhanath.png', type: 'Image', size: '2.7 MB', status: 'Draft', src: '/assets/boudhanath.png' },
  ];
  const PRICING = [
    { plan: 'Explorer', price: '$0', status: 'Published' },
    { plan: 'Trail Pro', price: '$9/mo', status: 'Published' },
    { plan: 'Summit Team', price: '$29/mo', status: 'Draft' },
  ];
  const TRIPS = [
    { title: 'Kathmandu City Walk', days: '2 days', status: 'Published' },
    { title: 'Everest Base Camp', days: '12 days', status: 'Published' },
    { title: 'Annapurna Circuit', days: '14 days', status: 'Draft' },
  ];
  const NEWS = [
    { title: 'Hidden Gems in the Himalayas', author: 'Sarah J.', date: 'Jan 30, 2026', status: 'Published' },
    { title: 'Monsoon Travel Tips', author: 'Arjun N.', date: 'Jan 22, 2026', status: 'Draft' },
    { title: 'New Route Optimizer Update', author: 'Admin', date: 'Jan 18, 2026', status: 'Published' },
  ];
  const SETTINGS = [
    { key: 'Maintenance Mode', value: 'Off' },
    { key: 'User Registration', value: 'Enabled' },
    { key: 'Email Alerts', value: 'Enabled' },
    { key: 'Media Auto-Optimize', value: 'On' },
  ];
  const THEME = {
    primary: '#0ea5e9',
    secondary: '#f97316',
    background: '#f8fafc',
    font: 'Outfit / Syne',
    logo: '/assets/logo.png',
    favicon: '/assets/logo.png'
  };
  const HERO = {
    title: 'Explore Nepal with AI Guidance',
    subtitle: 'Plan smarter routes, discover hidden places, and travel like a local.',
    cta: 'Start Exploring',
    background: '/assets/everest.png'
  };
  const NAV_ITEMS = [
    { label: 'Home', path: '/', visible: true },
    { label: 'About', path: '/about', visible: true },
    { label: 'Features', path: '/features', visible: true },
    { label: 'News', path: '/news', visible: true },
    { label: 'Pricing', path: '/pricing', visible: false },
  ];
  const FOOTER_LINKS = [
    { label: 'About Us', url: '/about' },
    { label: 'Help Center', url: '/faq' },
    { label: 'Privacy Policy', url: '/privacy' },
    { label: 'Terms', url: '/terms' },
  ];
  const SEO = {
    title: 'ExploreMate - AI Tourist Guide',
    description: 'Personalized itineraries, smart routes, and authentic Nepal travel experiences.',
    ogTitle: 'ExploreMate',
    ogImage: '/assets/logo.png'
  };
  const FEATURES = [
    { name: 'Dashboard', enabled: true },
    { name: 'Trips', enabled: true },
    { name: 'News', enabled: true },
    { name: 'Pricing', enabled: false },
    { name: 'Admin', enabled: true },
  ];
  const SCHEDULED = [
    { item: 'Spring Campaign', type: 'Homepage Hero', date: 'Feb 10, 2026' },
    { item: 'Monsoon Safety Tips', type: 'News', date: 'Feb 18, 2026' },
    { item: 'Pricing Refresh', type: 'Pricing', date: 'Mar 01, 2026' },
  ];
  const AUDIT = [
    { action: 'Updated hero background', user: 'Root System', time: '2h ago' },
    { action: 'Unpublished Pricing page', user: 'Content Manager', time: 'Yesterday' },
    { action: 'Uploaded logo.png', user: 'Root System', time: 'Jan 30, 2026' },
  ];
  const TABS = [
    { key: 'users', label: 'Users', icon: Users },
    { key: 'roles', label: 'Roles', icon: ShieldCheck },
    { key: 'content', label: 'Pages & Content', icon: FileText },
    { key: 'media', label: 'Media', icon: Image },
    { key: 'pricing', label: 'Pricing', icon: DollarSign },
    { key: 'trips', label: 'Trips', icon: MapPin },
    { key: 'news', label: 'News', icon: Newspaper },
    { key: 'site', label: 'Site Theme', icon: Settings },
    { key: 'navigation', label: 'Navigation', icon: Menu },
    { key: 'footer', label: 'Footer', icon: Link },
    { key: 'seo', label: 'SEO', icon: Globe },
    { key: 'features', label: 'Feature Toggles', icon: ToggleLeft },
    { key: 'scheduler', label: 'Scheduler', icon: Calendar },
    { key: 'backup', label: 'Backup', icon: Database },
    { key: 'audit', label: 'Audit Log', icon: Activity },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderStatus = (status: string) => {
    const base = 'text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-widest whitespace-nowrap';
    if (status === 'Published' || status === 'Active' || status === 'Live') {
      return <span className={`${base} bg-emerald-500/10 text-emerald-500`}>{status}</span>;
    }
    if (status === 'Draft' || status === 'Limited' || status === 'Standby') {
      return <span className={`${base} bg-orange-500/10 text-orange-500`}>{status}</span>;
    }
    return <span className={`${base} bg-white/10 text-slate-400`}>{status}</span>;
  };

  const renderTabContent = () => {
    if (activeTab === 'users') {
      return (
        <>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">User Control</h2>
              <p className="text-xs text-slate-500">Create, edit, suspend, or delete user accounts.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-sky-600/20">
                <UserPlus size={14} /> Create User
              </button>
              <button className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 border border-white/10 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={14} /> Assign Role
              </button>
            </div>
          </div>
          <div className="relative overflow-x-auto lg:overflow-visible">
            <div className="block lg:hidden space-y-4">
              {USERS.map((user, i) => (
                <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/[0.08] transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 overflow-hidden shrink-0">
                        <img src={`https://i.pravatar.cc/150?u=${user.email}`} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{user.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono tracking-tighter truncate max-w-[150px]">{user.email}</div>
                      </div>
                    </div>
                    {renderStatus(user.status)}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-black/20 p-2 rounded-lg">
                      <div className="text-[8px] text-slate-500 uppercase font-bold tracking-widest mb-1">Rank</div>
                      <div className="text-[10px] font-mono font-bold text-slate-300">{user.rank}</div>
                    </div>
                    <div className="bg-black/20 p-2 rounded-lg">
                      <div className="text-[8px] text-slate-500 uppercase font-bold tracking-widest mb-1">Last Sync</div>
                      <div className="text-[10px] font-mono font-bold text-slate-300">{user.sync}</div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 border-t border-white/5 pt-3">
                    <button className="p-2 rounded-lg bg-sky-500/10 text-sky-400"><Edit size={14} /></button>
                    <button className="p-2 rounded-lg bg-red-500/10 text-red-400"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
            <table className="w-full text-left hidden lg:table">
              <thead>
                <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">
                  <th className="pb-4 pr-4">Identity</th>
                  <th className="pb-4 px-4">Status</th>
                  <th className="pb-4 px-4">System Rank</th>
                  <th className="pb-4 px-4">Last Connection</th>
                  <th className="pb-4 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {USERS.map((user, i) => (
                  <tr key={i} className="group hover:bg-white/5 transition-all">
                    <td className="py-5 pr-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 overflow-hidden ring-2 ring-transparent group-hover:ring-sky-500/50 transition-all shrink-0">
                          <img src={`https://i.pravatar.cc/150?u=${user.email}`} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-white truncate">{user.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono tracking-tighter truncate">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-4">{renderStatus(user.status)}</td>
                    <td className="py-5 px-4">
                      <span className="text-[10px] font-mono font-bold text-slate-400 whitespace-nowrap">{user.rank}</span>
                    </td>
                    <td className="py-5 px-4">
                      <span className="text-xs text-slate-500 whitespace-nowrap">{user.sync}</span>
                    </td>
                    <td className="py-5 pl-4 text-right">
                      <div className="flex justify-end gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 rounded-lg bg-white/5 hover:bg-sky-500/20 text-slate-400 hover:text-sky-400 transition-all"><Edit size={14} /></button>
                        <button className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      );
    }
    if (activeTab === 'roles') {
      return (
        <>
          <div className="flex items-start justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Role Management</h2>
              <p className="text-xs text-slate-500">Create roles and control permissions.</p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck size={14} /> Create Role
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {ROLES.map((role, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-bold text-white">{role.name}</div>
                  {renderStatus(role.status)}
                </div>
                <div className="text-xs text-slate-500 mb-4">Permissions: {role.perms}</div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-widest">
                  <span>{role.users} users</span>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-sky-400"><Edit size={14} /></button>
                    <button className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-red-400"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      );
    }
    if (activeTab === 'content') {
      return (
        <>
          <div className="flex items-start justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Pages & Content</h2>
              <p className="text-xs text-slate-500">Publish, update, or remove site content.</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <FileText size={14} /> Create Page
              </button>
              <button className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 border border-white/10 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Globe size={14} /> Publish
              </button>
            </div>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">
                <th className="pb-4 pr-4">Page</th>
                <th className="pb-4 px-4">Slug</th>
                <th className="pb-4 px-4">Status</th>
                <th className="pb-4 px-4">Updated</th>
                <th className="pb-4 pl-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {PAGES.map((page, i) => (
                <tr key={i} className="hover:bg-white/5 transition-all">
                  <td className="py-4 pr-4 text-sm font-bold text-white">{page.title}</td>
                  <td className="py-4 px-4 text-xs text-slate-400">{page.slug}</td>
                  <td className="py-4 px-4">{renderStatus(page.status)}</td>
                  <td className="py-4 px-4 text-xs text-slate-400">{page.updated}</td>
                  <td className="py-4 pl-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-sky-400"><Edit size={14} /></button>
                      <button className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-emerald-400"><Globe size={14} /></button>
                      <button className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-red-400"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      );
    }
    if (activeTab === 'media') {
      return (
        <>
          <div className="flex items-start justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Media Library</h2>
              <p className="text-xs text-slate-500">Upload, replace, or delete assets.</p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <Upload size={14} /> Upload Media
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MEDIA.map((asset, i) => (
              <div key={i} className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                <div className="h-36 bg-slate-900/60 flex items-center justify-center overflow-hidden">
                  {asset.src ? (
                    <img src={asset.src} alt={asset.name} className="w-full h-full object-cover" />
                  ) : (
                    <Image size={28} className="text-slate-600" />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-bold text-white truncate">{asset.name}</div>
                    {renderStatus(asset.status)}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest">{asset.type} • {asset.size}</div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-sky-400"><Edit size={14} /></button>
                    <button className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-red-400"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      );
    }
    if (activeTab === 'pricing') {
      return (
        <>
          <div className="flex items-start justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Pricing Control</h2>
              <p className="text-xs text-slate-500">Create, edit, and publish plans.</p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <DollarSign size={14} /> New Plan
            </button>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">
                <th className="pb-4 pr-4">Plan</th>
                <th className="pb-4 px-4">Price</th>
                <th className="pb-4 px-4">Status</th>
                <th className="pb-4 pl-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {PRICING.map((plan, i) => (
                <tr key={i} className="hover:bg-white/5 transition-all">
                  <td className="py-4 pr-4 text-sm font-bold text-white">{plan.plan}</td>
                  <td className="py-4 px-4 text-xs text-slate-400">{plan.price}</td>
                  <td className="py-4 px-4">{renderStatus(plan.status)}</td>
                  <td className="py-4 pl-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-sky-400"><Edit size={14} /></button>
                      <button className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-emerald-400"><Globe size={14} /></button>
                      <button className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-red-400"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      );
    }
    if (activeTab === 'trips') {
      return (
        <>
          <div className="flex items-start justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Trips & Itineraries</h2>
              <p className="text-xs text-slate-500">Manage curated trip content.</p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <MapPin size={14} /> Create Trip
            </button>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">
                <th className="pb-4 pr-4">Trip</th>
                <th className="pb-4 px-4">Duration</th>
                <th className="pb-4 px-4">Status</th>
                <th className="pb-4 pl-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {TRIPS.map((trip, i) => (
                <tr key={i} className="hover:bg-white/5 transition-all">
                  <td className="py-4 pr-4 text-sm font-bold text-white">{trip.title}</td>
                  <td className="py-4 px-4 text-xs text-slate-400">{trip.days}</td>
                  <td className="py-4 px-4">{renderStatus(trip.status)}</td>
                  <td className="py-4 pl-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-sky-400"><Edit size={14} /></button>
                      <button className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-emerald-400"><Globe size={14} /></button>
                      <button className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-red-400"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      );
    }
    if (activeTab === 'news') {
      return (
        <>
          <div className="flex items-start justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">News & Updates</h2>
              <p className="text-xs text-slate-500">Publish and manage articles.</p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <Newspaper size={14} /> New Article
            </button>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">
                <th className="pb-4 pr-4">Title</th>
                <th className="pb-4 px-4">Author</th>
                <th className="pb-4 px-4">Date</th>
                <th className="pb-4 px-4">Status</th>
                <th className="pb-4 pl-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {NEWS.map((article, i) => (
                <tr key={i} className="hover:bg-white/5 transition-all">
                  <td className="py-4 pr-4 text-sm font-bold text-white">{article.title}</td>
                  <td className="py-4 px-4 text-xs text-slate-400">{article.author}</td>
                  <td className="py-4 px-4 text-xs text-slate-400">{article.date}</td>
                  <td className="py-4 px-4">{renderStatus(article.status)}</td>
                  <td className="py-4 pl-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-sky-400"><Edit size={14} /></button>
                      <button className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-emerald-400"><Globe size={14} /></button>
                      <button className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-red-400"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      );
    }
    if (activeTab === 'settings') {
      return (
        <>
          <div className="flex items-start justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">System Settings</h2>
              <p className="text-xs text-slate-500">Control global configuration and security.</p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <Settings size={14} /> Save Settings
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {SETTINGS.map((setting, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">{setting.key}</div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-white">{setting.value}</div>
                  <button className="px-3 py-1.5 rounded-full bg-white/10 text-slate-300 text-[10px] font-bold uppercase tracking-widest">
                    Toggle
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-white">Maintenance Window</div>
              <div className="text-xs text-slate-500">Schedule downtime and notify users.</div>
            </div>
            <button className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 border border-white/10 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <Calendar size={14} /> Schedule
            </button>
          </div>
        </>
      );
    }
    if (activeTab === 'site') {
      return (
        <>
          <div className="flex items-start justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Site-wide Theme</h2>
              <p className="text-xs text-slate-500">Control colors, fonts, logo, and favicon.</p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <Settings size={14} /> Apply Theme
            </button>
          </div>
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-xs uppercase tracking-widest text-slate-500 mb-3">Colors</div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl" style={{ background: THEME.primary }}></div>
                <div className="text-sm font-bold text-white">Primary {THEME.primary}</div>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl" style={{ background: THEME.secondary }}></div>
                <div className="text-sm font-bold text-white">Secondary {THEME.secondary}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl border border-white/10" style={{ background: THEME.background }}></div>
                <div className="text-sm font-bold text-white">Background {THEME.background}</div>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-xs uppercase tracking-widest text-slate-500 mb-3">Brand Assets</div>
              <div className="flex items-center gap-4 mb-4">
                <img src={THEME.logo} alt="Logo" className="w-14 h-14 rounded-xl object-cover border border-white/10" />
                <div>
                  <div className="text-sm font-bold text-white">Logo</div>
                  <div className="text-[10px] text-slate-500">{THEME.logo}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <img src={THEME.favicon} alt="Favicon" className="w-10 h-10 rounded-lg object-cover border border-white/10" />
                <div>
                  <div className="text-sm font-bold text-white">Favicon</div>
                  <div className="text-[10px] text-slate-500">{THEME.favicon}</div>
                </div>
              </div>
              <div className="mt-4 text-xs text-slate-500">Font Stack: {THEME.font}</div>
            </div>
          </div>
          <div className="mt-6 p-5 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-xs uppercase tracking-widest text-slate-500 mb-3">Homepage Hero</div>
            <div className="grid md:grid-cols-[1.2fr_1fr] gap-4">
              <div>
                <div className="text-sm font-bold text-white mb-2">{HERO.title}</div>
                <div className="text-xs text-slate-500 mb-3">{HERO.subtitle}</div>
                <button className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold uppercase tracking-widest">
                  {HERO.cta}
                </button>
              </div>
              <div className="h-36 rounded-2xl overflow-hidden border border-white/10">
                <img src={HERO.background} alt="Hero background" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </>
      );
    }
    if (activeTab === 'navigation') {
      return (
        <>
          <div className="flex items-start justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Navigation</h2>
              <p className="text-xs text-slate-500">Manage menu items and visibility.</p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <Menu size={14} /> Add Item
            </button>
          </div>
          <div className="space-y-3">
            {NAV_ITEMS.map((item, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white">{item.label}</div>
                  <div className="text-[10px] text-slate-500">{item.path}</div>
                </div>
                <div className="flex items-center gap-2">
                  {renderStatus(item.visible ? 'Active' : 'Draft')}
                  <button className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-sky-400"><Edit size={14} /></button>
                  <button className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-red-400"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </>
      );
    }
    if (activeTab === 'footer') {
      return (
        <>
          <div className="flex items-start justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Footer Links</h2>
              <p className="text-xs text-slate-500">Edit links and social handles.</p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <Link size={14} /> Add Link
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {FOOTER_LINKS.map((link, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white">{link.label}</div>
                  <div className="text-[10px] text-slate-500">{link.url}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-sky-400"><Edit size={14} /></button>
                  <button className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-red-400"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </>
      );
    }
    if (activeTab === 'seo') {
      return (
        <>
          <div className="flex items-start justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">SEO & OpenGraph</h2>
              <p className="text-xs text-slate-500">Control metadata for search and sharing.</p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <Globe size={14} /> Save SEO
            </button>
          </div>
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">Site Title</div>
              <div className="text-sm font-bold text-white mb-4">{SEO.title}</div>
              <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">Description</div>
              <div className="text-xs text-slate-400">{SEO.description}</div>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">OpenGraph</div>
              <div className="text-sm font-bold text-white mb-2">{SEO.ogTitle}</div>
              <div className="h-28 rounded-xl overflow-hidden border border-white/10">
                <img src={SEO.ogImage} alt="OG image" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </>
      );
    }
    if (activeTab === 'features') {
      return (
        <>
          <div className="flex items-start justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Feature Toggles</h2>
              <p className="text-xs text-slate-500">Enable or disable site modules.</p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <ToggleLeft size={14} /> Save Toggles
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {FEATURES.map((feature, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="text-sm font-bold text-white">{feature.name}</div>
                {renderStatus(feature.enabled ? 'Active' : 'Draft')}
              </div>
            ))}
          </div>
        </>
      );
    }
    if (activeTab === 'scheduler') {
      return (
        <>
          <div className="flex items-start justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Content Scheduler</h2>
              <p className="text-xs text-slate-500">Queue publish dates and campaigns.</p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <Calendar size={14} /> New Schedule
            </button>
          </div>
          <div className="space-y-3">
            {SCHEDULED.map((item, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white">{item.item}</div>
                  <div className="text-[10px] text-slate-500">{item.type}</div>
                </div>
                <div className="text-xs text-slate-400">{item.date}</div>
              </div>
            ))}
          </div>
        </>
      );
    }
    if (activeTab === 'backup') {
      return (
        <>
          <div className="flex items-start justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Backup & Restore</h2>
              <p className="text-xs text-slate-500">Mock controls for export and rollback.</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Database size={14} /> Create Backup
              </button>
              <button className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 border border-white/10 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <RefreshCw size={14} /> Restore
              </button>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {['Jan 30, 2026 - Full Snapshot', 'Jan 22, 2026 - Media Only', 'Jan 15, 2026 - Content Only'].map((b, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="text-sm font-bold text-white">{b}</div>
                <button className="px-3 py-1.5 rounded-full bg-white/10 text-slate-300 text-[10px] font-bold uppercase tracking-widest">
                  Restore
                </button>
              </div>
            ))}
          </div>
        </>
      );
    }
    if (activeTab === 'audit') {
      return (
        <>
          <div className="flex items-start justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Audit Log</h2>
              <p className="text-xs text-slate-500">Track admin activity and changes.</p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 border border-white/10 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <Activity size={14} /> Export Log
            </button>
          </div>
          <div className="space-y-3">
            {AUDIT.map((entry, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white">{entry.action}</div>
                  <div className="text-[10px] text-slate-500">{entry.user}</div>
                </div>
                <div className="text-xs text-slate-400">{entry.time}</div>
              </div>
            ))}
          </div>
        </>
      );
    }
    return (
      <div className="text-slate-400 text-sm">Select a module to begin.</div>
    );
  };

  return (
    <div ref={containerRef} className="w-full min-h-screen bg-slate-950 text-slate-300 font-sans flex flex-col p-4 md:p-6 lg:p-8">
      {/* Hidden Admin Header */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between mb-8 pb-6 border-b border-white/5 gap-4">
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <button 
            onClick={onBack}
            className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/10 shrink-0"
          >
            {/* Fix: removed md:size prop */}
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
             <div className="w-10 h-10 sm:w-12 sm:h-12 bg-sky-600/20 rounded-xl sm:rounded-2xl flex items-center justify-center border border-sky-500/30 shrink-0">
                {/* Fix: removed sm:size prop */}
                <Shield className="text-sky-500" size={28} />
             </div>
             <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-display font-bold text-white leading-none truncate">Master Control</h1>
                <p className="text-[8px] sm:text-[10px] font-bold text-sky-500 uppercase tracking-[0.2em] mt-1 truncate">Authorized Access Only</p>
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
           <div className="hidden md:flex flex-col items-end mr-2 lg:mr-4">
              <span className="text-sm font-bold text-white">Root Administrator</span>
              <span className="text-[10px] text-emerald-500 font-mono tracking-tighter">● Online</span>
           </div>
           <button onClick={onBack} className="p-2.5 sm:p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20">
              {/* Fix: removed md:size prop */}
              <LogOut size={20} />
           </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
        {stats.map((s, i) => (
          <div key={i} className="admin-card bg-white/5 border border-white/10 p-5 md:p-6 rounded-[2rem] hover:bg-white/[0.08] transition-all relative overflow-hidden group shadow-lg">
             <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors"></div>
             <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl bg-white/5 ${s.color}`}>
                   {/* Fix: removed md:size prop */}
                   <s.icon size={24} />
                </div>
                <span className="text-[9px] md:text-[10px] font-bold px-2 py-1 rounded bg-white/5 text-slate-400 uppercase tracking-widest">{s.change}</span>
             </div>
             <div className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1 relative z-10">{s.label}</div>
             <div className="text-2xl md:text-3xl font-display font-bold text-white relative z-10">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto w-full flex-grow flex flex-col lg:flex-row gap-6 md:gap-8">
        {/* Main Content Area */}
        <div className="flex-grow bg-white/5 border border-white/10 rounded-[2.5rem] p-5 sm:p-8 admin-panel shadow-2xl relative overflow-hidden flex flex-col">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-sky-500/5 via-transparent to-transparent pointer-events-none"></div>
           
           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 relative z-10 gap-4">
             <div className="flex gap-4 border-b border-white/5 w-full sm:w-auto overflow-x-auto no-scrollbar">
               {TABS.map((tab) => (
                 <button 
                   key={tab.key}
                   onClick={() => setActiveTab(tab.key)}
                   className={`pb-4 px-2 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] transition-all relative flex items-center gap-2 ${activeTab === tab.key ? 'text-sky-400' : 'text-slate-500 hover:text-slate-300'}`}
                 >
                   <tab.icon size={12} />
                   {tab.label}
                   {activeTab === tab.key && <div className="absolute bottom-0 left-0 w-full h-1 bg-sky-500 rounded-full shadow-[0_0_12px_rgba(14,165,233,0.8)]"></div>}
                 </button>
               ))}
             </div>
             <div className="flex items-center gap-2 w-full sm:w-auto">
               <div className="bg-white/5 rounded-xl flex items-center px-3 py-2 border border-white/10 w-full sm:w-48 lg:w-64">
                 <Search size={14} className="text-slate-500 mr-2" />
                 <input type="text" placeholder="Search..." className="bg-transparent outline-none text-[11px] md:text-xs text-white w-full placeholder-slate-600" />
               </div>
               <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all shrink-0">
                 <Filter size={16} />
               </button>
             </div>
           </div>

           <div className="relative z-10">
             {renderTabContent()}
           </div>
        </div>

        {/* Sidebar Diagnostics */}
        <div className="w-full lg:w-80 space-y-6 shrink-0">
           <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-[0.2em]">
                   <AlertTriangle size={14} className="text-orange-500" /> Security Logs
                </h3>
                <button className="text-[8px] font-bold text-slate-500 hover:text-sky-400 transition-colors uppercase tracking-widest">Clear</button>
              </div>
              <div className="space-y-4">
                 {[
                    { msg: 'Auth Key Rotation', loc: 'Module: Core', time: '14:20' },
                    { msg: 'Geo-fence Trigger', loc: 'Zone: KTM-01', time: '13:05' },
                    { msg: 'Registry Scan', loc: 'DB: Main', time: '09:44' },
                 ].map((alert, i) => (
                    <div key={i} className="p-4 bg-white/5 rounded-2xl border-l-2 border-sky-500 hover:bg-white/[0.08] transition-colors cursor-default">
                       <div className="text-xs font-bold text-white mb-1.5">{alert.msg}</div>
                       <div className="text-[10px] text-slate-500 flex justify-between font-mono">
                          <span className="truncate mr-2">{alert.loc}</span>
                          <span className="shrink-0">{alert.time}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="bg-sky-600/10 border border-sky-500/20 rounded-[2.5rem] p-6 shadow-xl relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 transition-all"></div>
              <h3 className="text-xs font-bold text-sky-400 mb-6 flex items-center gap-2 uppercase tracking-[0.2em] relative z-10">
                 <CheckCircle size={14} /> Core Integrity
              </h3>
              <div className="space-y-5 relative z-10">
                 <div>
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest mb-1.5">
                       <span>Neural Engine</span>
                       <span className="text-emerald-500">Active</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                       <div className="w-[94%] h-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]"></div>
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest mb-1.5">
                       <span>Data Latency</span>
                       <span className="text-emerald-500">12ms</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                       <div className="w-[15%] h-full bg-emerald-500"></div>
                    </div>
                 </div>
              </div>
              <button className="w-full mt-8 py-3.5 rounded-2xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20 active:scale-95 uppercase tracking-widest relative z-10">
                 <RefreshCw size={14} /> System Sync
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
