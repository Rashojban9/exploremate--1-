import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ArrowLeft, Plus, Users, MessageCircle, Heart, ThumbsUp, Calendar, MapPin, DollarSign, Send, MoreVertical, Clock, CheckCircle2, UserPlus } from 'lucide-react';

// Mock Data
const INITIAL_MEMBERS = [
  { id: 1, name: "You", img: "https://i.pravatar.cc/150?img=32" },
  { id: 2, name: "Sarah", img: "https://i.pravatar.cc/150?img=5" },
  { id: 3, name: "Arjun", img: "https://i.pravatar.cc/150?img=11" },
  { id: 4, name: "Maya", img: "https://i.pravatar.cc/150?img=9" },
];

const INITIAL_ACTIVITIES = [
  { 
    id: 1, 
    title: "Paragliding from Sarangkot", 
    time: "Day 2 • 09:00 AM", 
    price: 80, 
    votes: 4, 
    votedBy: [1, 2, 3, 4],
    image: "https://images.unsplash.com/photo-1596323679427-4a0082729e2e?auto=format&fit=crop&q=80&w=400",
    status: 'confirmed'
  },
  { 
    id: 2, 
    title: "Boating on Phewa Lake", 
    time: "Day 2 • 04:00 PM", 
    price: 15, 
    votes: 3, 
    votedBy: [1, 3, 4],
    image: "https://images.unsplash.com/photo-1546853899-709e50423661?auto=format&fit=crop&q=80&w=400",
    status: 'proposed'
  },
  { 
    id: 3, 
    title: "World Peace Pagoda Hike", 
    time: "Day 3 • 07:00 AM", 
    price: 0, 
    votes: 2, 
    votedBy: [2, 4],
    image: "https://images.unsplash.com/photo-1572455792344-937740e25442?auto=format&fit=crop&q=80&w=400",
    status: 'proposed'
  }
];

const INITIAL_MESSAGES = [
  { id: 1, user: "Sarah", text: "Are we sure about the hike? It might be rainy.", time: "10:30 AM" },
  { id: 2, user: "Arjun", text: "Checked the weather on ExploreMate, looks clear!", time: "10:32 AM" },
];

const GroupPlanPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState<'itinerary' | 'chat' | 'budget'>('itinerary');

  // Animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Header
      tl.fromTo('.group-header', 
        { y: -30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      );

      // Members
      tl.fromTo('.member-avatar',
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, stagger: 0.05, duration: 0.5, ease: 'back.out(1.5)' },
        "-=0.5"
      );

      // Cards
      tl.fromTo('.activity-card',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'power2.out' },
        "-=0.3"
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  const handleVote = (id: number) => {
    setActivities(prev => prev.map(act => {
      if (act.id === id) {
        const hasVoted = act.votedBy.includes(1); // Assuming current user ID is 1
        return {
          ...act,
          votes: hasVoted ? act.votes - 1 : act.votes + 1,
          votedBy: hasVoted ? act.votedBy.filter(uid => uid !== 1) : [...act.votedBy, 1]
        };
      }
      return act;
    }));
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg = {
      id: Date.now(),
      user: "You",
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, msg]);
    setNewMessage("");
  };

  return (
    <div ref={containerRef} className="w-full min-h-screen bg-slate-50 flex flex-col">
      
      {/* Header */}
      <div className="group-header bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => onNavigate('dashboard')} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div className="text-center">
              <h1 className="text-lg font-bold font-display text-slate-900">Pokhara Adventure 2024</h1>
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
                <Calendar size={12} /> Oct 15 - Oct 18
              </div>
            </div>
            <button className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
              <MoreVertical size={20} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center -space-x-2">
              {INITIAL_MEMBERS.map((m) => (
                <div key={m.id} className="member-avatar w-8 h-8 rounded-full border-2 border-white relative z-0 hover:z-10 hover:scale-110 transition-transform cursor-pointer" title={m.name}>
                  <img src={m.img} alt={m.name} className="w-full h-full rounded-full object-cover" />
                </div>
              ))}
              <button className="member-avatar w-8 h-8 rounded-full bg-slate-100 border-2 border-white border-dashed flex items-center justify-center text-slate-400 hover:text-sky-600 hover:border-sky-300 transition-colors">
                <UserPlus size={14} />
              </button>
            </div>
            
            <div className="flex bg-slate-100 p-1 rounded-lg">
               <button 
                 onClick={() => setActiveTab('itinerary')}
                 className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'itinerary' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 Itinerary
               </button>
               <button 
                 onClick={() => setActiveTab('chat')}
                 className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'chat' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 Chat
               </button>
               <button 
                 onClick={() => setActiveTab('budget')}
                 className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'budget' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 Budget
               </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-grow max-w-5xl mx-auto w-full p-4">
        
        {/* Itinerary Tab */}
        {activeTab === 'itinerary' && (
          <div className="space-y-4 pb-20">
             {activities.map((item) => (
               <div key={item.id} className="activity-card bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4 relative overflow-hidden group">
                  {item.status === 'confirmed' && (
                    <div className="absolute top-0 right-0 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1">
                      <CheckCircle2 size={12} /> Confirmed
                    </div>
                  )}
                  
                  <div className="w-full sm:w-32 h-32 rounded-xl overflow-hidden shrink-0">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-grow py-1">
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                       <span className="flex items-center gap-1"><Clock size={12} /> {item.time}</span>
                       <span>•</span>
                       <span className="flex items-center gap-1"><DollarSign size={12} /> {item.price > 0 ? `$${item.price}` : 'Free'}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                    
                    <div className="flex items-center gap-2 mt-4">
                       <div className="flex -space-x-1.5">
                          {item.votedBy.slice(0, 3).map((uid) => {
                             const user = INITIAL_MEMBERS.find(m => m.id === uid);
                             return user ? (
                               <img key={uid} src={user.img} className="w-6 h-6 rounded-full border-2 border-white" alt={user.name} />
                             ) : null;
                          })}
                          {item.votes > 3 && (
                             <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">+{item.votes - 3}</div>
                          )}
                       </div>
                       <span className="text-xs font-medium text-slate-500">{item.votes} votes</span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-4 gap-2">
                     <button 
                       onClick={() => handleVote(item.id)}
                       className={`flex-1 sm:flex-none w-full p-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                         item.votedBy.includes(1) 
                         ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30 scale-105' 
                         : 'bg-slate-50 text-slate-500 hover:bg-sky-50 hover:text-sky-600'
                       }`}
                     >
                        <ThumbsUp size={18} className={item.votedBy.includes(1) ? 'fill-white' : ''} />
                        <span className="text-xs font-bold sm:hidden">Vote</span>
                     </button>
                     <button className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                        <Heart size={18} />
                     </button>
                  </div>
               </div>
             ))}

             <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold flex items-center justify-center gap-2 hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50 transition-all activity-card">
                <Plus size={20} /> Propose New Activity
             </button>
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="h-[calc(100vh-200px)] flex flex-col bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
             <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                {messages.map((msg) => {
                   const isMe = msg.user === "You";
                   return (
                     <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`flex items-end gap-2 max-w-[80%] ${isMe ? 'flex-row-reverse' : ''}`}>
                           {!isMe && (
                              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mb-1">
                                 <img src={INITIAL_MEMBERS.find(m => m.name === msg.user)?.img} alt={msg.user} className="w-full h-full object-cover" />
                              </div>
                           )}
                           <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                              isMe 
                              ? 'bg-sky-600 text-white rounded-tr-sm' 
                              : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm shadow-sm'
                           }`}>
                              {msg.text}
                           </div>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
                     </div>
                   );
                })}
                <div ref={chatEndRef}></div>
             </div>
             
             <form onSubmit={sendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2">
                <button type="button" className="p-2 text-slate-400 hover:text-sky-600 transition-colors">
                   <Plus size={20} />
                </button>
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-sky-400 focus:bg-white transition-all"
                />
                <button type="button" onClick={sendMessage} className="p-2 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors shadow-lg shadow-sky-600/20">
                   <Send size={18} />
                </button>
             </form>
          </div>
        )}

        {/* Budget Tab (Simplified) */}
        {activeTab === 'budget' && (
           <div className="space-y-6">
              <div className="bg-slate-900 text-white rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                 <div className="relative z-10 flex flex-col items-center text-center">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Total Estimated Cost</span>
                    <div className="text-5xl font-display font-bold mb-2">$345.00</div>
                    <div className="text-sm text-slate-400">approx $86.25 per person</div>
                 </div>
                 <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] pointer-events-none"></div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                 <h3 className="font-bold text-slate-900 mb-4">Cost Breakdown</h3>
                 <div className="space-y-3">
                    {activities.map(act => (
                       <div key={act.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-lg overflow-hidden">
                                <img src={act.image} className="w-full h-full object-cover" alt="" />
                             </div>
                             <div>
                                <div className="font-bold text-sm text-slate-800">{act.title}</div>
                                <div className="text-xs text-slate-500">{act.status === 'confirmed' ? 'Approved' : 'Pending'}</div>
                             </div>
                          </div>
                          <div className="font-mono font-bold text-slate-900">${act.price}</div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        )}

      </div>
    </div>
  );
};

export default GroupPlanPage;