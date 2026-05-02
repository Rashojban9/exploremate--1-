import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Bell, ArrowLeft, Check, Trash2, Calendar, User, Mountain, Compass, AlertTriangle, Info, Clock, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { clearAllNotifications, deleteNotification, markAsRead, markAllAsRead } from '../services/notificationService';

const NotificationsPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { state, dispatch, markBackendNotificationRead, markAllBackendNotificationsRead, removeBackendNotification, clearAllBackendNotifications } = useApp();
  const notifications = state.ui.backendNotifications;
  
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isClearing, setIsClearing] = useState(false);

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
  }, [filter, notifications.length]); // Re-animate when filter or length changes

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    try {
      // Optimistic update
      markAllBackendNotificationsRead();
      // API call
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleClearAll = async () => {
    if (notifications.length === 0 || isClearing) return;
    setIsClearing(true);
    try {
      // Optimistic update
      clearAllBackendNotifications();
      // API call
      await clearAllNotifications();
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Optimistic update
      removeBackendNotification(id);
      // API call
      await deleteNotification(id);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const toggleRead = async (id: string, isCurrentlyRead: boolean) => {
    if (isCurrentlyRead) return; // Only toggle from unread to read, not back
    try {
      // Optimistic update
      markBackendNotificationRead(id);
      // API call
      await markAsRead(id);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
      switch(type) {
          case 'error':
          case 'warning': return <AlertTriangle size={20} className="text-white" />;
          case 'success': return <CheckCircle2 size={20} className="text-white" />;
          case 'reminder': return <Clock size={20} className="text-white" />;
          default: return <Info size={20} className="text-white" />;
      }
  };

  const getNotificationColor = (type: string) => {
      switch(type) {
          case 'error': return 'bg-red-500 shadow-red-500/30';
          case 'warning': return 'bg-amber-500 shadow-amber-500/30';
          case 'success': return 'bg-emerald-500 shadow-emerald-500/30';
          case 'reminder': return 'bg-orange-500 shadow-orange-500/30';
          default: return 'bg-sky-500 shadow-sky-500/30';
      }
  };
  
  const getRelativeTime = (dateStr: string): string => {
    const target = new Date(dateStr).getTime();
    if (Number.isNaN(target)) return 'recently';
    const diffMs = Date.now() - target;
    const minute = 60_000;
    const hour = 60 * minute;
    const day = 24 * hour;
    if (diffMs < minute) return 'just now';
    if (diffMs < hour) return `${Math.floor(diffMs / minute)}m ago`;
    if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`;
    return `${Math.floor(diffMs / day)}d ago`;
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
         <div className="flex items-center gap-2">
           <button 
              onClick={handleClearAll} 
              disabled={isClearing || notifications.length === 0}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                notifications.length === 0 ? 'text-slate-400 bg-slate-100 cursor-not-allowed' : 'text-red-600 bg-red-50 hover:bg-red-100'
              }`}
           >
              <Trash2 size={14} /> <span className="hidden sm:inline">Clear All</span>
           </button>
           <button 
              onClick={handleMarkAllRead} 
              disabled={unreadCount === 0}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                unreadCount === 0 ? 'text-slate-400 bg-slate-100 cursor-not-allowed' : 'text-sky-600 bg-sky-50 hover:bg-sky-100'
              }`}
           >
              <Check size={14} /> <span className="hidden sm:inline">Mark all read</span>
           </button>
         </div>
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
                        onClick={() => toggleRead(note.id, note.read)}
                        className={`notif-item group relative p-5 rounded-[1.5rem] border transition-all duration-300 ${!note.read ? 'cursor-pointer' : ''} flex gap-5 items-start ${
                            !note.read 
                            ? 'bg-white border-sky-100 shadow-lg shadow-sky-500/5' 
                            : 'bg-slate-50/50 border-slate-100 hover:bg-white hover:shadow-md'
                        }`}
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${getNotificationColor(note.type)}`}>
                            {getNotificationIcon(note.type)}
                        </div>
                        
                        <div className="flex-grow pt-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className={`font-bold text-lg truncate pr-2 ${!note.read ? 'text-slate-900' : 'text-slate-600'}`}>
                                    {note.title || note.message}
                                </h3>
                                <span className="text-xs font-bold text-slate-400 whitespace-nowrap ml-2 mt-1">{getRelativeTime(note.createdAt)}</span>
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed pr-8">
                                {note.message}
                            </p>
                        </div>

                        {/* Unread Indicator */}
                        {!note.read && (
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 w-3 h-3 bg-sky-500 rounded-full shadow-[0_0_10px_rgba(14,165,233,0.5)]"></div>
                        )}

                        {/* Delete Button (Hover) */}
                        <button 
                            onClick={(e) => handleDelete(note.id, e)}
                            className="absolute right-2 top-2 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                            title="Delete notification"
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