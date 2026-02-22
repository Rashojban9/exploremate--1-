
import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Shield, Users, Activity, LogOut, ArrowLeft, RefreshCw, Trash2, Edit, AlertTriangle, CheckCircle, Database, Server, Globe, Search, Filter, Image, FileText, Settings, Upload, UserPlus, ShieldCheck, DollarSign, MapPin, Newspaper, Calendar, Menu, Link, ToggleLeft } from 'lucide-react';
import { AdvancedButton, Badge, Tabs, Avatar, LoadingSpinner } from '../components/NotificationSystem';
import { GlowBorder, AnimatedCounter, RevealOnScroll } from '../components/AdvancedAnimations';

const StatCard = ({ label, value, change, icon: Icon, color, delay }: any) => (
  <RevealOnScroll direction="up" delay={delay}>
    <GlowBorder color="sky" className="p-1 rounded-2xl">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
            <div className="text-3xl font-bold text-slate-900">
              {isNaN(Number(value)) ? value : <AnimatedCounter end={parseFloat(value.replace(/[^0-9.]/g, ''))} suffix={value.includes('%') ? '%' : ''} />}
            </div>
            <span className={`text-xs font-bold mt-2 inline-flex items-center gap-1 ${
              change === 'Stable' || change === 'Low' ? 'text-emerald-600' : 
              change.includes('+') ? 'text-sky-600' : 'text-slate-400'
            }`}>
              {change === 'Stable' || change === 'Low' ? <CheckCircle size={12} /> : null}
              {change}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-xl bg-${color}/10 flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>
      </div>
    </GlowBorder>
  </RevealOnScroll>
);

const UserRow = ({ user, index }: { user: any; index: number }) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-sky-50 transition-colors group animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
    <div className="flex items-center gap-4">
      <Avatar alt={user.name} size="md" status={user.status === 'Online' ? 'online' : 'offline'} />
      <div>
        <div className="font-bold text-slate-900">{user.name}</div>
        <div className="text-sm text-slate-500">{user.email}</div>
      </div>
    </div>
    <div className="flex items-center gap-6">
      <Badge variant={user.status === 'Online' ? 'success' : user.status === 'Active' ? 'info' : 'default'}>
        {user.status}
      </Badge>
      <span className="text-xs font-bold text-slate-400 uppercase">{user.rank}</span>
      <span className="text-xs text-slate-400">{user.sync}</span>
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-2 hover:bg-white rounded-lg transition-colors">
          <Edit size={16} className="text-slate-400" />
        </button>
        <button className="p-2 hover:bg-white rounded-lg transition-colors">
          <Trash2 size={16} className="text-red-400" />
        </button>
      </div>
    </div>
  </div>
);

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
    { label: 'System Users', value: '4,129', change: '+8%', icon: Users, color: 'text-sky-500', delay: 0 },
    { label: 'Network Uptime', value: '100%', change: 'Stable', icon: Activity, color: 'text-emerald-500', delay: 0.1 },
    { label: 'Compute Load', value: '18%', change: 'Low', icon: Server, color: 'text-orange-500', delay: 0.2 },
    { label: 'Secure Storage', value: '1.2TB', change: '82%', icon: Database, color: 'text-purple-500', delay: 0.3 },
  ];

  const USERS = [
    { name: 'Root System', email: 'owner@exploremate.ai', status: 'Online', rank: 'MASTER', sync: 'Real-time' },
    { name: 'Sarah J.', email: 'sarah.j@travel.net', status: 'Standby', rank: 'LEVEL 2', sync: '12m ago' },
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
    { name: 'everest.png', type: 'Image', size: '2.9 MB', status: 'Live', src: '/assets/everest.png' },
    { name: 'pokhara.png', type: 'Image', size: '2.4 MB', status: 'Live', src: '/assets/pokhara.png' },
  ];

  const tabs = [
    { id: 'users', label: 'Users', icon: <Users size={16} /> },
    { id: 'roles', label: 'Roles', icon: <ShieldCheck size={16} /> },
    { id: 'pages', label: 'Pages', icon: <FileText size={16} /> },
    { id: 'media', label: 'Media', icon: <Image size={16} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button 
                onClick={onBack}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900">Admin Console</h1>
                  <p className="text-xs text-slate-500">Master Control Panel</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="success">System Operational</Badge>
              <AdvancedButton variant="ghost" size="sm" onClick={onBack} icon={<LogOut size={16} />}>
                Logout
              </AdvancedButton>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-6" />
        
        {/* Content */}
        <div className="admin-panel bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {activeTab === 'users' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search users..." 
                      className="pl-10 pr-4 py-2.5 bg-slate-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                  <AdvancedButton variant="secondary" size="sm" icon={<Filter size={16} />}>
                    Filter
                  </AdvancedButton>
                </div>
                <AdvancedButton variant="primary" size="sm" icon={<UserPlus size={16} />}>
                  Add User
                </AdvancedButton>
              </div>
              <div className="space-y-3">
                {USERS.map((user, i) => (
                  <UserRow key={i} user={user} index={i} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900">Role Management</h2>
                <AdvancedButton variant="primary" size="sm" icon={<ShieldCheck size={16} />}>
                  Create Role
                </AdvancedButton>
              </div>
              <div className="grid gap-4">
                {ROLES.map((role, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-sky-50 transition-colors animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                          <ShieldCheck className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{role.name}</div>
                          <div className="text-sm text-slate-500">{role.perms}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-500">{role.users} users</span>
                        <Badge variant={role.status === 'Active' ? 'success' : 'warning'}>
                          {role.status}
                        </Badge>
                      </div>
                    </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'pages' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900">Page Management</h2>
                <AdvancedButton variant="primary" size="sm" icon={<Upload size={16} />}>
                  New Page
                </AdvancedButton>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase">Title</th>
                      <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase">Slug</th>
                      <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase">Status</th>
                      <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase">Updated</th>
                      <th className="text-right py-3 px-4 text-xs font-bold text-slate-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PAGES.map((page, i) => (
                      <tr key={i} className="border-b border-slate-50 hover:bg-sky-50/50 transition-colors">
                        <td className="py-4 px-4 font-medium text-slate-900">{page.title}</td>
                        <td className="py-4 px-4 text-sm text-slate-500 font-mono">{page.slug}</td>
                        <td className="py-4 px-4">
                          <Badge variant={page.status === 'Published' ? 'success' : 'warning'}>
                            {page.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-500">{page.updated}</td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-2 hover:bg-white rounded-lg transition-colors">
                              <Edit size={16} className="text-slate-400" />
                            </button>
                            <button className="p-2 hover:bg-white rounded-lg transition-colors">
                              <Globe size={16} className="text-sky-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900">Media Library</h2>
                <AdvancedButton variant="primary" size="sm" icon={<Upload size={16} />}>
                  Upload
                </AdvancedButton>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {MEDIA.map((item, i) => (
                    <div key={i} className="group bg-slate-50 rounded-xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                      <div className="aspect-video bg-slate-200 relative overflow-hidden">
                        <img src={item.src} alt={item.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button className="p-2 bg-white rounded-lg">
                            <Edit size={16} className="text-slate-600" />
                          </button>
                          <button className="p-2 bg-white rounded-lg">
                            <Trash2 size={16} className="text-red-500" />
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="font-medium text-slate-900 truncate">{item.name}</div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-slate-500">{item.type}</span>
                          <span className="text-xs text-slate-500">{item.size}</span>
                          <Badge variant="success" size="sm">{item.status}</Badge>
                        </div>
                      </div>
                    </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-6">System Settings</h2>
              <div className="grid gap-6 max-w-2xl">
                <GlowBorder color="sky" className="p-1 rounded-2xl">
                  <div className="bg-white rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900">Maintenance Mode</h3>
                        <p className="text-sm text-slate-500">Enable to put site in maintenance mode</p>
                      </div>
                      <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer">
                        <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-all" />
                      </div>
                    </div>
                  </div>
                </GlowBorder>
                
                <GlowBorder color="purple" className="p-1 rounded-2xl">
                  <div className="bg-white rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900">Email Notifications</h3>
                        <p className="text-sm text-slate-500">Receive email alerts for user activity</p>
                      </div>
                      <div className="w-12 h-6 bg-sky-500 rounded-full relative cursor-pointer">
                        <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 transition-all" />
                      </div>
                    </div>
                  </div>
                </GlowBorder>
                
                <GlowBorder color="sunset" className="p-1 rounded-2xl">
                  <div className="bg-white rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900">Analytics Tracking</h3>
                        <p className="text-sm text-slate-500">Enable Google Analytics tracking</p>
                      </div>
                      <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer">
                        <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-all" />
                      </div>
                    </div>
                  </div>
                </GlowBorder>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
