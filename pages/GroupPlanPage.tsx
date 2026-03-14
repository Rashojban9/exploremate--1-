import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import {
  ArrowLeft, Plus, Users, MessageCircle, Heart, ThumbsUp, Calendar,
  MapPin, DollarSign, Send, MoreVertical, Clock, CheckCircle2, UserPlus,
  Copy, Loader2, Trash2, X, LogIn, PlusCircle, Receipt
} from 'lucide-react';
import {
  getGroupTrips, createGroupTrip, getGroupTripDetail, deleteGroupTrip,
  joinByInviteCode, proposeActivity, voteActivity, confirmActivity,
  deleteActivity as deleteActivityApi, sendMessage as sendMessageApi,
  addExpense as addExpenseApi, getMessages, getExpenses, getBudgetSummary,
  type GroupTripResponse, type GroupTripDetailResponse,
  type GroupTripActivityResponse, type GroupTripMessageResponse,
  type GroupTripExpenseResponse, type BudgetSummary,
  type GroupTripMemberResponse,
} from '../services/groupTripService';
import { getStoredSession } from '../services/storageService';

// ─── Types ────────────────────────────────────────────────────────────────────

type ActiveTab = 'itinerary' | 'chat' | 'budget';
type ModalType = 'create' | 'join' | 'activity' | 'expense' | null;

// ─── Component ────────────────────────────────────────────────────────────────

const GroupPlanPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Trip list or single trip view
  const [trips, setTrips] = useState<GroupTripResponse[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [tripDetail, setTripDetail] = useState<GroupTripDetailResponse | null>(null);

  // Chat & Budget (loaded separately for tabs)
  const [messages, setMessages] = useState<GroupTripMessageResponse[]>([]);
  const [expenses, setExpenses] = useState<GroupTripExpenseResponse[]>([]);
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null);

  // UI
  const [activeTab, setActiveTab] = useState<ActiveTab>('itinerary');
  const [newMessage, setNewMessage] = useState('');
  const [modal, setModal] = useState<ModalType>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Form fields
  const [formTripName, setFormTripName] = useState('');
  const [formDestination, setFormDestination] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formInviteCode, setFormInviteCode] = useState('');
  const [formActivityTitle, setFormActivityTitle] = useState('');
  const [formActivityTime, setFormActivityTime] = useState('');
  const [formActivityPrice, setFormActivityPrice] = useState('');
  const [formActivityImage, setFormActivityImage] = useState('');
  const [formExpenseTitle, setFormExpenseTitle] = useState('');
  const [formExpenseAmount, setFormExpenseAmount] = useState('');

  const currentUserEmail = getStoredSession()?.user?.email || '';

  // ─── Data Loading ─────────────────────────────────────────────────────────

  const loadTrips = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getGroupTrips();
      setTrips(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load group trips');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTripDetail = useCallback(async (tripId: string) => {
    try {
      setLoading(true);
      setError(null);
      const detail = await getGroupTripDetail(tripId);
      setTripDetail(detail);
    } catch (err: any) {
      setError(err.message || 'Failed to load trip detail');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (tripId: string) => {
    try {
      const msgs = await getMessages(tripId);
      setMessages(msgs);
    } catch { /* silent */ }
  }, []);

  const loadBudget = useCallback(async (tripId: string) => {
    try {
      const [exps, summary] = await Promise.all([
        getExpenses(tripId),
        getBudgetSummary(tripId),
      ]);
      setExpenses(exps);
      setBudgetSummary(summary);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  useEffect(() => {
    if (selectedTripId) {
      loadTripDetail(selectedTripId);
    }
  }, [selectedTripId, loadTripDetail]);

  useEffect(() => {
    if (selectedTripId && activeTab === 'chat') {
      loadMessages(selectedTripId);
      const interval = setInterval(() => loadMessages(selectedTripId), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedTripId, activeTab, loadMessages]);

  useEffect(() => {
    if (selectedTripId && activeTab === 'budget') {
      loadBudget(selectedTripId);
    }
  }, [selectedTripId, activeTab, loadBudget]);

  // ─── Animations ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (loading || !containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.group-header', { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' });
      gsap.fromTo('.member-avatar', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, stagger: 0.05, duration: 0.5, ease: 'back.out(1.5)', delay: 0.3 });
      gsap.fromTo('.activity-card', { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'power2.out', delay: 0.5 });
    }, containerRef);
    return () => ctx.revert();
  }, [loading, selectedTripId, tripDetail]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  // ─── Actions ────────────────────────────────────────────────────────────

  const handleCreateTrip = async () => {
    if (!formTripName.trim() || !formDestination.trim()) return;
    try {
      setActionLoading(true);
      const trip = await createGroupTrip({
        tripName: formTripName,
        destination: formDestination,
        description: formDescription,
        startDate: formStartDate,
        endDate: formEndDate,
      });
      setModal(null);
      resetForms();
      setSelectedTripId(trip.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinTrip = async () => {
    if (!formInviteCode.trim()) return;
    try {
      setActionLoading(true);
      const trip = await joinByInviteCode(formInviteCode);
      setModal(null);
      resetForms();
      setSelectedTripId(trip.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTrip = async () => {
    if (!selectedTripId) return;
    if (!confirm('Are you sure you want to delete this group trip? This cannot be undone.')) return;
    try {
      setActionLoading(true);
      await deleteGroupTrip(selectedTripId);
      setSelectedTripId(null);
      setTripDetail(null);
      await loadTrips();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleProposeActivity = async () => {
    if (!selectedTripId || !formActivityTitle.trim()) return;
    try {
      setActionLoading(true);
      await proposeActivity(selectedTripId, {
        title: formActivityTitle,
        scheduledTime: formActivityTime,
        price: formActivityPrice ? parseFloat(formActivityPrice) : 0,
        imageUrl: formActivityImage || undefined,
      });
      setModal(null);
      resetForms();
      await loadTripDetail(selectedTripId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleVote = async (activityId: string) => {
    if (!selectedTripId) return;
    try {
      await voteActivity(selectedTripId, activityId);
      await loadTripDetail(selectedTripId);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleConfirm = async (activityId: string) => {
    if (!selectedTripId) return;
    try {
      await confirmActivity(selectedTripId, activityId);
      await loadTripDetail(selectedTripId);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!selectedTripId) return;
    try {
      await deleteActivityApi(selectedTripId, activityId);
      await loadTripDetail(selectedTripId);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTripId || !newMessage.trim()) return;
    try {
      const session = getStoredSession();
      await sendMessageApi(selectedTripId, {
        text: newMessage,
        senderName: session?.user?.name || currentUserEmail.split('@')[0],
      });
      setNewMessage('');
      await loadMessages(selectedTripId);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddExpense = async () => {
    if (!selectedTripId || !formExpenseTitle.trim() || !formExpenseAmount) return;
    try {
      setActionLoading(true);
      await addExpenseApi(selectedTripId, {
        title: formExpenseTitle,
        amount: parseFloat(formExpenseAmount),
      });
      setModal(null);
      resetForms();
      await loadBudget(selectedTripId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const copyInviteCode = () => {
    if (tripDetail?.trip.inviteCode) {
      navigator.clipboard.writeText(tripDetail.trip.inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const resetForms = () => {
    setFormTripName(''); setFormDestination(''); setFormDescription('');
    setFormStartDate(''); setFormEndDate(''); setFormInviteCode('');
    setFormActivityTitle(''); setFormActivityTime(''); setFormActivityPrice('');
    setFormActivityImage(''); setFormExpenseTitle(''); setFormExpenseAmount('');
  };

  // ─── Loading/Error States ───────────────────────────────────────────────

  if (loading && !selectedTripId && trips.length === 0) {
    return (
      <div className="w-full min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-sm font-medium">Loading group trips...</span>
        </div>
      </div>
    );
  }

  // ─── Trip List View (no trip selected) ──────────────────────────────────

  if (!selectedTripId) {
    return (
      <div ref={containerRef} className="w-full min-h-screen bg-slate-50 flex flex-col">
        <div className="group-header bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button onClick={() => onNavigate('dashboard')} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-lg font-bold font-display text-slate-900">Group Trips</h1>
              <div className="w-9" />
            </div>
          </div>
        </div>

        <div className="flex-grow max-w-5xl mx-auto w-full p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-center justify-between">
              {error}
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600"><X size={16} /></button>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setModal('create')}
              className="flex-1 py-3 bg-sky-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-sky-700 transition-colors shadow-lg shadow-sky-600/20"
            >
              <PlusCircle size={18} /> New Group Trip
            </button>
            <button
              onClick={() => setModal('join')}
              className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:border-sky-300 hover:text-sky-600 transition-colors"
            >
              <LogIn size={18} /> Join with Code
            </button>
          </div>

          {/* Trip Cards */}
          {trips.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-40" />
              <h3 className="text-lg font-bold text-slate-500 mb-2">No Group Trips Yet</h3>
              <p className="text-sm">Create a new group trip or join one with an invite code.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {trips.map((trip) => (
                <button
                  key={trip.id}
                  onClick={() => setSelectedTripId(trip.id)}
                  className="activity-card w-full bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-left hover:shadow-md hover:border-sky-200 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg group-hover:text-sky-700 transition-colors">{trip.tripName}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <MapPin size={12} /> {trip.destination}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                      <Users size={12} /> {trip.memberCount}
                    </div>
                  </div>
                  {(trip.startDate || trip.endDate) && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar size={12} />
                      {trip.startDate || '—'} → {trip.endDate || '—'}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Modals */}
        {renderModal()}
      </div>
    );
  }

  // ─── Trip Detail View ───────────────────────────────────────────────────

  const trip = tripDetail?.trip;
  const members = tripDetail?.members || [];
  const activities = tripDetail?.activities || [];
  const isOwner = trip?.creatorEmail === currentUserEmail;

  return (
    <div ref={containerRef} className="w-full min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="group-header bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => { setSelectedTripId(null); setTripDetail(null); loadTrips(); }} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div className="text-center">
              <h1 className="text-lg font-bold font-display text-slate-900">{trip?.tripName || 'Loading...'}</h1>
              {trip && (
                <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
                  <MapPin size={12} /> {trip.destination}
                  {trip.startDate && (<><span>•</span><Calendar size={12} /> {trip.startDate} — {trip.endDate || '...'}</>)}
                </div>
              )}
            </div>
            <div className="relative">
              {isOwner && (
                <button onClick={handleDeleteTrip} className="p-2 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Delete Trip">
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-3 p-2 bg-red-50 text-red-600 rounded-lg text-xs flex items-center justify-between">
              {error}
              <button onClick={() => setError(null)}><X size={14} /></button>
            </div>
          )}

          <div className="flex items-center justify-between">
            {/* Members */}
            <div className="flex items-center gap-2">
              <div className="flex items-center -space-x-2">
                {members.slice(0, 5).map((m) => (
                  <div
                    key={m.id}
                    className="member-avatar w-8 h-8 rounded-full border-2 border-white relative z-0 hover:z-10 hover:scale-110 transition-transform cursor-pointer bg-sky-100 flex items-center justify-center"
                    title={`${m.displayName} (${m.role})`}
                  >
                    {m.avatarUrl ? (
                      <img src={m.avatarUrl} alt={m.displayName} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-sky-700">{m.displayName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                ))}
                {members.length > 5 && (
                  <div className="member-avatar w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">+{members.length - 5}</div>
                )}
              </div>
              {/* Invite code */}
              {trip?.inviteCode && (
                <button
                  onClick={copyInviteCode}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold hover:bg-sky-100 transition-colors"
                  title="Copy invite code"
                >
                  <Copy size={12} />
                  {copiedCode ? 'Copied!' : trip.inviteCode}
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-lg">
              {(['itinerary', 'chat', 'budget'] as ActiveTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all capitalize ${activeTab === tab ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-grow max-w-5xl mx-auto w-full p-4">
        {loading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
          </div>
        )}

        {/* ──── Itinerary Tab ──── */}
        {!loading && activeTab === 'itinerary' && (
          <div className="space-y-4 pb-20">
            {activities.map((item) => (
              <div key={item.id} className="activity-card bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4 relative overflow-hidden group">
                {item.status === 'CONFIRMED' && (
                  <div className="absolute top-0 right-0 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1">
                    <CheckCircle2 size={12} /> Confirmed
                  </div>
                )}

                {item.imageUrl && (
                  <div className="w-full sm:w-32 h-32 rounded-xl overflow-hidden shrink-0">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex-grow py-1">
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                    {item.scheduledTime && <span className="flex items-center gap-1"><Clock size={12} /> {item.scheduledTime}</span>}
                    <span>•</span>
                    <span className="flex items-center gap-1"><DollarSign size={12} /> {item.price > 0 ? `$${item.price}` : 'Free'}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>

                  <div className="flex items-center gap-2 mt-4">
                    <span className="text-xs font-medium text-slate-500">{item.voteCount} vote{item.voteCount !== 1 ? 's' : ''}</span>
                    {item.votedByEmails?.includes(currentUserEmail) && (
                      <span className="text-[10px] text-sky-500 font-bold">• You voted</span>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-4 gap-2">
                  <button
                    onClick={() => handleVote(item.id)}
                    className={`flex-1 sm:flex-none w-full p-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                      item.votedByEmails?.includes(currentUserEmail)
                        ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30 scale-105'
                        : 'bg-slate-50 text-slate-500 hover:bg-sky-50 hover:text-sky-600'
                    }`}
                  >
                    <ThumbsUp size={18} className={item.votedByEmails?.includes(currentUserEmail) ? 'fill-white' : ''} />
                    <span className="text-xs font-bold sm:hidden">Vote</span>
                  </button>
                  {isOwner && item.status !== 'CONFIRMED' && (
                    <button onClick={() => handleConfirm(item.id)} className="p-3 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors" title="Confirm">
                      <CheckCircle2 size={18} />
                    </button>
                  )}
                  {(isOwner || item.proposedByEmail === currentUserEmail) && (
                    <button onClick={() => handleDeleteActivity(item.id)} className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Delete">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {activities.length === 0 && (
              <div className="text-center py-16 text-slate-400">
                <MapPin className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium">No activities proposed yet</p>
              </div>
            )}

            <button
              onClick={() => setModal('activity')}
              className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold flex items-center justify-center gap-2 hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50 transition-all activity-card"
            >
              <Plus size={20} /> Propose New Activity
            </button>
          </div>
        )}

        {/* ──── Chat Tab ──── */}
        {!loading && activeTab === 'chat' && (
          <div className="h-[calc(100vh-200px)] flex flex-col bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {messages.length === 0 && (
                <div className="text-center py-16 text-slate-400">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="text-sm font-medium">No messages yet. Start the conversation!</p>
                </div>
              )}
              {messages.map((msg) => {
                const isMe = msg.senderEmail === currentUserEmail;
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`flex items-end gap-2 max-w-[80%] ${isMe ? 'flex-row-reverse' : ''}`}>
                      {!isMe && (
                        <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center shrink-0 mb-1">
                          <span className="text-xs font-bold text-sky-700">{msg.senderName.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                      <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? 'bg-sky-600 text-white rounded-tr-sm'
                          : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm shadow-sm'
                      }`}>
                        {!isMe && <div className="text-[10px] font-bold text-sky-600 mb-1">{msg.senderName}</div>}
                        {msg.text}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                      {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
              <div ref={chatEndRef}></div>
            </div>

            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-sky-400 focus:bg-white transition-all"
              />
              <button type="submit" className="p-2 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors shadow-lg shadow-sky-600/20">
                <Send size={18} />
              </button>
            </form>
          </div>
        )}

        {/* ──── Budget Tab ──── */}
        {!loading && activeTab === 'budget' && (
          <div className="space-y-6">
            <div className="bg-slate-900 text-white rounded-3xl p-8 relative overflow-hidden shadow-2xl">
              <div className="relative z-10 flex flex-col items-center text-center">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Total Expenses</span>
                <div className="text-5xl font-display font-bold mb-2">
                  ${budgetSummary?.totalCost?.toFixed(2) || '0.00'}
                </div>
                <div className="text-sm text-slate-400">
                  approx ${budgetSummary?.perPersonCost?.toFixed(2) || '0.00'} per person ({budgetSummary?.memberCount || 0} members)
                </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] pointer-events-none"></div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">Expense Breakdown</h3>
                <button
                  onClick={() => setModal('expense')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-sky-50 text-sky-700 rounded-lg text-xs font-bold hover:bg-sky-100 transition-colors"
                >
                  <Plus size={14} /> Add Expense
                </button>
              </div>
              {expenses.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <Receipt className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No expenses recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {expenses.map(exp => (
                    <div key={exp.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div>
                        <div className="font-bold text-sm text-slate-800">{exp.title}</div>
                        <div className="text-xs text-slate-500">Paid by {exp.paidByEmail === currentUserEmail ? 'You' : exp.paidByEmail.split('@')[0]}</div>
                      </div>
                      <div className="font-mono font-bold text-slate-900">${exp.amount.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {renderModal()}
    </div>
  );

  // ─── Modal Renderer ─────────────────────────────────────────────────────

  function renderModal() {
    if (!modal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => { setModal(null); resetForms(); }}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => { setModal(null); resetForms(); }} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>

          {modal === 'create' && (
            <>
              <h2 className="text-lg font-bold text-slate-900 mb-4">Create Group Trip</h2>
              <div className="space-y-3">
                <input value={formTripName} onChange={(e) => setFormTripName(e.target.value)} placeholder="Trip Name *" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-400 transition-all" />
                <input value={formDestination} onChange={(e) => setFormDestination(e.target.value)} placeholder="Destination *" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-400 transition-all" />
                <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Description (optional)" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-400 transition-all h-20 resize-none" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" value={formStartDate} onChange={(e) => setFormStartDate(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-400 transition-all" />
                  <input type="date" value={formEndDate} onChange={(e) => setFormEndDate(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-400 transition-all" />
                </div>
                <button onClick={handleCreateTrip} disabled={actionLoading || !formTripName.trim() || !formDestination.trim()} className="w-full py-3 bg-sky-600 text-white rounded-xl font-bold text-sm hover:bg-sky-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <PlusCircle size={16} />}
                  Create Trip
                </button>
              </div>
            </>
          )}

          {modal === 'join' && (
            <>
              <h2 className="text-lg font-bold text-slate-900 mb-4">Join Group Trip</h2>
              <div className="space-y-3">
                <input value={formInviteCode} onChange={(e) => setFormInviteCode(e.target.value.toUpperCase())} placeholder="Enter invite code" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-center font-mono tracking-widest uppercase focus:outline-none focus:border-sky-400 transition-all" maxLength={8} />
                <button onClick={handleJoinTrip} disabled={actionLoading || !formInviteCode.trim()} className="w-full py-3 bg-sky-600 text-white rounded-xl font-bold text-sm hover:bg-sky-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
                  Join Trip
                </button>
              </div>
            </>
          )}

          {modal === 'activity' && (
            <>
              <h2 className="text-lg font-bold text-slate-900 mb-4">Propose New Activity</h2>
              <div className="space-y-3">
                <input value={formActivityTitle} onChange={(e) => setFormActivityTitle(e.target.value)} placeholder="Activity Title *" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-400 transition-all" />
                <input value={formActivityTime} onChange={(e) => setFormActivityTime(e.target.value)} placeholder="Scheduled Time (e.g. Day 2 • 09:00 AM)" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-400 transition-all" />
                <input value={formActivityPrice} onChange={(e) => setFormActivityPrice(e.target.value)} placeholder="Price ($)" type="number" min="0" step="0.01" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-400 transition-all" />
                <input value={formActivityImage} onChange={(e) => setFormActivityImage(e.target.value)} placeholder="Image URL (optional)" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-400 transition-all" />
                <button onClick={handleProposeActivity} disabled={actionLoading || !formActivityTitle.trim()} className="w-full py-3 bg-sky-600 text-white rounded-xl font-bold text-sm hover:bg-sky-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  Propose Activity
                </button>
              </div>
            </>
          )}

          {modal === 'expense' && (
            <>
              <h2 className="text-lg font-bold text-slate-900 mb-4">Add Expense</h2>
              <div className="space-y-3">
                <input value={formExpenseTitle} onChange={(e) => setFormExpenseTitle(e.target.value)} placeholder="Expense Title *" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-400 transition-all" />
                <input value={formExpenseAmount} onChange={(e) => setFormExpenseAmount(e.target.value)} placeholder="Amount ($) *" type="number" min="0" step="0.01" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-400 transition-all" />
                <p className="text-[10px] text-slate-400">Expense will be split equally among all group members.</p>
                <button onClick={handleAddExpense} disabled={actionLoading || !formExpenseTitle.trim() || !formExpenseAmount} className="w-full py-3 bg-sky-600 text-white rounded-xl font-bold text-sm hover:bg-sky-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <DollarSign size={16} />}
                  Add Expense
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
};

export default GroupPlanPage;