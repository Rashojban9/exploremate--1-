import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Bell, ArrowLeft, Check, Trash2, Calendar, User, Mountain, Compass, AlertTriangle, Info, Clock, CheckCircle2, X } from 'lucide-react';

interface Notification {
  id: number;
  type: 'alert' | 'info' | 'success' | 'reminder';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    type: 'alert',
    title: 'Rain Alert',
    message: 'Heavy rain expected in Pokhara tomorrow. Consider rescheduling outdoor treks.',
    time: '10 min ago',
    read: false
  },
  {
    id: 2,
    type: 'success',
    title: 'Trip Confirmed',
    message: 'Your booking for "Kathmandu Heritage Walk" has been confirmed.',
    time: '2 hours ago',
    read: false
  },
  {
    id: 3,
    type: 'reminder',
    title: 'Upcoming Flight',
    message: 'Flight to Lukla departs in 2 days. Check your packing list.',
    time: '5 hours ago',
    read: true
  },
  {
    id: 4,
    type: 'info',
    title: 'New Feature',
    message: 'Try our new offline maps for the Annapurna Circuit.',
    time: '1 day ago',
    read: true
  },
  {
    id: 5,
    type: 'reminder',
    title: 'Review your recent trip',
    message: 'How was your visit to Swayambhunath? Leave a review to help others.',
    time: '2 days ago',
    read: true
  }
];

const NotificationsPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = filter === 'all' ? notifications : notifications.filter(n => !n.read);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Header Animation
      tl.fromTo('.notif-header', 
          { y: -30, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      );

      // List Items Animation
      if (filteredNotifications.length > 0) {
          tl.fromTo('.notif-item',
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'power2.out' },
            "-=0.4"
          );
      }
      
      // Bottom Nav Animation
      tl.fromTo('.dash-nav-mobile',
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
          "-=0.6"
      );
    }, containerRef);
    
    return () => ctx.revert();
  }, [filter]); // Re-animate when filter changes

  const handleMarkAllRead = () => {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number, e: React.MouseEvent) => {
      e.stopPropagation();
      setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const toggleRead = (id: number) => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  const getNotificationIcon = (type: string) => {
      switch(type) {
          case 'alert': return <AlertTriangle size={20} className="text-white" />;
          case 'success': return <CheckCircle2 size={20} className="text-white" />;
          case 'reminder': return <Clock size={20} className="text-white" />;
          default: return <Info size={20} className="text-white" />;
      }
  };

  const getNotificationColor = (type: string) => {
      switch(type) {
          case 'alert': return 'bg-red-500 shadow-red-500/30';
          case 'success': return 'bg-emerald-500 shadow-emerald-500/30';
          case 'reminder': return 'bg-orange-500 shadow-orange-500/30';
          default: return 'bg-sky-500 shadow-sky-500/30';
      }
  };

  const navItems = [
    { label: 'Explore', icon: Compass, page: 'dashboard' },
    { label: 'Saved', icon: Mountain, page: 'saved' },
    { label: 'Trips', icon: Calendar, page: 'trips' },
    { label: 'Profile', icon: User, page: 'profile' }
  ];

  return (
    <div ref={containerRef} className="relative w-full min-h-screen p-4 pb-24 md:p-8 flex flex-col items-center bg-slate-50/50">
      
      {/* Header */}
      <div className="notif-header w-full max-w-2xl flex items-center justify-between mb-8 z-20 sticky top-0 bg-slate-50/90 backdrop-blur-md py-4 rounded-b-2xl md:static md:bg-transparent md:p-0">
         <div className="flex items-center gap-4">
             <button 
                onClick={() => onNavigate('dashboard')} 
                className="p-2 rounded-full bg-white text-slate-500 hover:text-sky-600 shadow-sm border border-slate-100 transition-colors"
             >
                 <ArrowLeft size={20} />
             </button>
             <div>
                <h1 className="text-2xl font-display font-bold text-slate-900">Notifications</h1>
                <p className="text-xs text-slate-500 font-bold">{unreadCount} unread alerts</p>
             </div>
         </div>
         <button 
            onClick={handleMarkAllRead} 
            className="text-xs font-bold text-sky-600 bg-sky-50 px-3 py-1.5 rounded-lg hover:bg-sky-100 transition-colors flex items-center gap-1"
         >
            <Check size={14} /> Mark all read
         </button>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-2xl z-10">
        
        {/* Filters */}
        <div className="notif-header flex gap-4 mb-6 px-2">
            <button 
                onClick={() => setFilter('all')}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${filter === 'all' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
            >
                All
            </button>
            <button 
                onClick={() => setFilter('unread')}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${filter === 'unread' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
            >
                Unread
            </button>
        </div>

        {/* List */}
        <div className="space-y-4">
            {filteredNotifications.length > 0 ? (
                filteredNotifications.map((note) => (
                    <div 
                        key={note.id} 
                        onClick={() => toggleRead(note.id)}
                        className={`notif-item group relative p-5 rounded-[1.5rem] border transition-all duration-300 cursor-pointer flex gap-5 items-start ${
                            !note.read 
                            ? 'bg-white border-sky-100 shadow-lg shadow-sky-500/5' 
                            : 'bg-slate-50/50 border-slate-100 hover:bg-white hover:shadow-md'
                        }`}
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${getNotificationColor(note.type)}`}>
                            {getNotificationIcon(note.type)}
                        </div>
                        
                        <div className="flex-grow pt-1">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className={`font-bold text-lg ${!note.read ? 'text-slate-900' : 'text-slate-600'}`}>
                                    {note.title}
                                </h3>
                                <span className="text-xs font-bold text-slate-400 whitespace-nowrap ml-2">{note.time}</span>
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed max-w-[90%]">
                                {note.message}
                            </p>
                        </div>

                        {/* Unread Indicator */}
                        {!note.read && (
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 w-3 h-3 bg-sky-500 rounded-full shadow-[0_0_10px_rgba(14,165,233,0.5)]"></div>
                        )}

                        {/* Delete Button (Hover) */}
                        <button 
                            onClick={(e) => deleteNotification(note.id, e)}
                            className="absolute right-2 top-2 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))
            ) : (
                <div className="notif-item flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-6">
                        <Bell size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">All Caught Up!</h3>
                    <p className="text-slate-500 max-w-xs mx-auto">You have no {filter === 'unread' ? 'unread' : ''} notifications at the moment.</p>
                </div>
            )}
        </div>

      </div>

      {/* Bottom Nav (Mobile Only) */}
      <div className="dash-nav-mobile md:hidden fixed bottom-4 left-4 right-4 bg-gradient-to-tr from-sky-600 via-blue-600 to-sky-700 backdrop-blur-xl border border-white/20 py-4 px-8 rounded-2xl shadow-xl shadow-sky-900/20 z-50 flex items-center justify-between ring-1 ring-white/20">
        {navItems.map((item, i) => {
           return (
            <button 
                key={item.label} 
                onClick={() => onNavigate(item.page)}
                className={`flex flex-col items-center gap-1 transition-all duration-300 relative p-2 rounded-xl text-sky-200 hover:text-white hover:bg-white/10`}
            >
                <item.icon size={24} className="transition-all duration-300" strokeWidth={2} />
            </button>
           );
        })}
      </div>
    </div>
  );
};

export default NotificationsPage;