
import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Shield, Users, Activity, LogOut, ArrowLeft, RefreshCw, Trash2, Edit, AlertTriangle, CheckCircle, Database, Server, Terminal, Zap, Globe, Search, Filter } from 'lucide-react';

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
              <div className="flex gap-6 border-b border-white/5 w-full sm:w-auto">
                 {['users', 'security', 'traffic'].map(tab => (
                    <button 
                       key={tab}
                       onClick={() => setActiveTab(tab)}
                       className={`pb-4 px-2 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] transition-all relative ${activeTab === tab ? 'text-sky-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                       {tab}
                       {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-sky-500 rounded-full shadow-[0_0_12px_rgba(14,165,233,0.8)]"></div>}
                    </button>
                 ))}
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                 <div className="bg-white/5 rounded-xl flex items-center px-3 py-2 border border-white/10 w-full sm:w-48 lg:w-64">
                    <Search size={14} className="text-slate-500 mr-2" />
                    <input type="text" placeholder="Search registry..." className="bg-transparent outline-none text-[11px] md:text-xs text-white w-full placeholder-slate-600" />
                 </div>
                 <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all shrink-0">
                    <Filter size={16} />
                 </button>
              </div>
           </div>

           {/* Mobile View: Cards | Tablet+ View: Table */}
           <div className="relative z-10 overflow-x-auto lg:overflow-visible">
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
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-widest ${
                          user.status === 'Online' || user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'
                      }`}>
                        {user.status}
                      </span>
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

              {/* Desktop Table View */}
              <table className="w-full text-left hidden lg:table">
                 <thead>
                    <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">
                       <th className="pb-4 pr-4">Identity</th>
                       <th className="pb-4 px-4">Status</th>
                       <th className="pb-4 px-4">System Rank</th>
                       <th className="pb-4 px-4">Last Connection</th>
                       <th className="pb-4 pl-4 text-right">Registry</th>
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
                          <td className="py-5 px-4">
                             <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-widest whitespace-nowrap ${
                                user.status === 'Online' || user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'
                             }`}>
                                {user.status}
                             </span>
                          </td>
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
