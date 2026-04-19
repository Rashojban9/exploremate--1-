
import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Shield, Users, Activity, LogOut, ArrowLeft, RefreshCw, Trash2, Edit, AlertTriangle, CheckCircle, Database, Server, Globe, Search, Filter, Image, FileText, Settings, Upload, UserPlus, ShieldCheck, DollarSign, MapPin, Newspaper, Calendar, Menu, Link, ToggleLeft, X, Eye, EyeOff, Ban, Check } from 'lucide-react';
import { AdvancedButton, Badge, Tabs, Avatar, LoadingSpinner } from '../components/NotificationSystem';
import { GlowBorder, AnimatedCounter, RevealOnScroll } from '../components/AdvancedAnimations';
import { contentService, type PageContent } from '../services/contentService';
import { getAllUsers, type ProfileResponse } from '../services/authService';
import { getAdminStats, getContentStats, updateUser as adminUpdateUser, deleteUser as adminDeleteUser, getAllMedia, addMedia, updateMedia, deleteMedia, type AdminStats, type ContentStats, type MediaItem } from '../services/adminService';

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({ label, value, change, icon: Icon, color, delay }: any) => (
  <RevealOnScroll direction="up" delay={delay}>
    <GlowBorder color="sky" className="p-1 rounded-2xl">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
            <div className="text-3xl font-bold text-slate-900">
              {typeof value === 'number' ? <AnimatedCounter end={value} /> : value}
            </div>
            <span className={`text-xs font-bold mt-2 inline-flex items-center gap-1 ${
              change === 'Stable' || change === 'Low' ? 'text-emerald-600' : 
              change.includes && change.includes('+') ? 'text-sky-600' : 'text-slate-400'
            }`}>
              {change === 'Stable' || change === 'Low' ? <CheckCircle size={12} /> : null}
              {change}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center`} style={{ backgroundColor: 'rgba(14, 165, 233, 0.1)' }}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>
      </div>
    </GlowBorder>
  </RevealOnScroll>
);

// ─── User Row ─────────────────────────────────────────────────────────────────

const UserRow = ({ user, index, onEdit, onDelete }: { user: ProfileResponse; index: number; onEdit: (user: ProfileResponse) => void; onDelete: (user: ProfileResponse) => void }) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-sky-50 transition-colors group animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
    <div className="flex items-center gap-4">
      <Avatar alt={user.name} size="md" status={'online'} />
      <div>
        <div className="font-bold text-slate-900">{user.name}</div>
        <div className="text-sm text-slate-500">{user.email}</div>
      </div>
    </div>
    <div className="flex items-center gap-6">
      <Badge variant={'success'}>
        Active
      </Badge>
      <span className="text-xs font-bold text-slate-400 uppercase">{user.role || 'USER'}</span>
      <span className="text-xs text-slate-400">
        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Synced'}
      </span>
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(user)} className="p-2 hover:bg-white rounded-lg transition-colors" title="Edit user">
          <Edit size={16} className="text-slate-400 hover:text-sky-500" />
        </button>
        <button onClick={() => onDelete(user)} className="p-2 hover:bg-white rounded-lg transition-colors" title="Delete user">
          <Trash2 size={16} className="text-red-400 hover:text-red-600" />
        </button>
      </div>
    </div>
  </div>
);

// ─── Modal ────────────────────────────────────────────────────────────────────

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-slide-up overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// ─── Main AdminPage ───────────────────────────────────────────────────────────

const AdminPage = ({ onBack }: { onBack: () => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('users');

  // Users state
  const [users, setUsers] = useState<ProfileResponse[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // User edit modal
  const [editingUser, setEditingUser] = useState<ProfileResponse | null>(null);
  const [editRole, setEditRole] = useState('USER');
  const [isSavingUser, setIsSavingUser] = useState(false);

  // User delete modal
  const [deletingUser, setDeletingUser] = useState<ProfileResponse | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // Pages state
  const [pages, setPages] = useState<PageContent[]>([]);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [editingPage, setEditingPage] = useState<PageContent | null>(null);
  const [isDeletingPage, setIsDeletingPage] = useState(false);
  const [deletingPageSlug, setDeletingPageSlug] = useState<string | null>(null);

  // Media state
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [isSavingMedia, setIsSavingMedia] = useState(false);
  const [deletingMedia, setDeletingMedia] = useState<MediaItem | null>(null);
  const [isDeletingMedia, setIsDeletingMedia] = useState(false);

  // Stats state
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [contentStats, setContentStats] = useState<ContentStats | null>(null);

  // Settings State
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    emailNotifications: true,
    analyticsTracking: false
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // ─── Load Stats ───────────────────────────────────────────────────────────
  useEffect(() => {
    const loadStats = async () => {
      try {
        const [authStats, cStats] = await Promise.allSettled([
          getAdminStats(),
          getContentStats()
        ]);
        if (authStats.status === 'fulfilled') setAdminStats(authStats.value);
        if (cStats.status === 'fulfilled') setContentStats(cStats.value);
      } catch (e) {
        console.error('Failed to load stats', e);
      }
    };
    loadStats();
  }, []);

  // Load backend content settings
  useEffect(() => {
    if (activeTab === 'settings') {
      const loadSettings = async () => {
        const settingsPage = await contentService.getPageBySlug('system-settings');
        if (settingsPage && settingsPage.contentBlocks) {
          setSystemSettings({
            maintenanceMode: settingsPage.contentBlocks.maintenanceMode === 'true',
            emailNotifications: settingsPage.contentBlocks.emailNotifications !== 'false',
            analyticsTracking: settingsPage.contentBlocks.analyticsTracking === 'true'
          });
        }
      };
      loadSettings();
    }
  }, [activeTab]);

  const handleToggleSetting = async (key: keyof typeof systemSettings) => {
    const newValue = !systemSettings[key];
    setSystemSettings(prev => ({ ...prev, [key]: newValue }));
    
    setIsSavingSettings(true);
    try {
      const updatedBlocks = {
        maintenanceMode: String(key === 'maintenanceMode' ? newValue : systemSettings.maintenanceMode),
        emailNotifications: String(key === 'emailNotifications' ? newValue : systemSettings.emailNotifications),
        analyticsTracking: String(key === 'analyticsTracking' ? newValue : systemSettings.analyticsTracking)
      };
      
      await contentService.updatePageContent('system-settings', {
        slug: 'system-settings',
        title: 'System Settings',
        contentBlocks: updatedBlocks,
        status: 'Published'
      });
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // ─── Load Data on Tab Change ──────────────────────────────────────────────
  useEffect(() => {
    if (activeTab === 'pages') loadPages();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'media') loadMedia();
  }, [activeTab]);

  const loadPages = async () => {
    setIsLoadingPages(true);
    try {
      const data = await contentService.getAllPages();
      setPages(data);
    } catch (e) {
      console.error('Failed to load pages', e);
    } finally {
      setIsLoadingPages(false);
    }
  };

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const data = await getAllUsers();
      setUsers(data || []);
    } catch (e) {
      console.error('Failed to load users', e);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // ─── User CRUD ────────────────────────────────────────────────────────────
  const handleEditUser = (user: ProfileResponse) => {
    setEditingUser(user);
    setEditRole(user.role || 'USER');
  };

  const handleSaveUserEdit = async () => {
    if (!editingUser?.id) return;
    setIsSavingUser(true);
    try {
      await adminUpdateUser(editingUser.id, { role: editRole });
      setEditingUser(null);
      loadUsers();
      // Refresh stats
      const stats = await getAdminStats();
      setAdminStats(stats);
    } catch (e) {
      console.error('Failed to update user', e);
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleConfirmDeleteUser = async () => {
    if (!deletingUser?.id) return;
    setIsDeletingUser(true);
    try {
      await adminDeleteUser(deletingUser.id);
      setDeletingUser(null);
      loadUsers();
      const stats = await getAdminStats();
      setAdminStats(stats);
    } catch (e) {
      console.error('Failed to delete user', e);
    } finally {
      setIsDeletingUser(false);
    }
  };

  // ─── Page CRUD ────────────────────────────────────────────────────────────
  const handleSavePage = async () => {
    if (!editingPage) return;
    try {
      if (editingPage.updatedAt === '') {
        // New page
        await contentService.createPage(editingPage);
      } else {
        await contentService.updatePageContent(editingPage.slug, editingPage);
      }
      setEditingPage(null);
      loadPages();
      const cStats = await getContentStats();
      setContentStats(cStats);
    } catch (e) {
      console.error('Failed to save page', e);
    }
  };

  const handleDeletePage = async (slug: string) => {
    setDeletingPageSlug(slug);
    setIsDeletingPage(true);
    try {
      await contentService.deletePage(slug);
      loadPages();
      const cStats = await getContentStats();
      setContentStats(cStats);
    } catch (e) {
      console.error('Failed to delete page', e);
    } finally {
      setIsDeletingPage(false);
      setDeletingPageSlug(null);
    }
  };

  // ─── Media CRUD ───────────────────────────────────────────────────────────
  const loadMedia = async () => {
    setIsLoadingMedia(true);
    try {
      const data = await getAllMedia();
      setMediaItems(data);
    } catch (e) {
      console.error('Failed to load media', e);
    } finally {
      setIsLoadingMedia(false);
    }
  };

  const handleSaveMedia = async () => {
    if (!editingMedia) return;
    setIsSavingMedia(true);
    try {
      if (editingMedia.id) {
        await updateMedia(editingMedia.id, editingMedia);
      } else {
        await addMedia(editingMedia);
      }
      setEditingMedia(null);
      loadMedia();
    } catch (e) {
      console.error('Failed to save media', e);
    } finally {
      setIsSavingMedia(false);
    }
  };

  const handleConfirmDeleteMedia = async () => {
    if (!deletingMedia?.id) return;
    setIsDeletingMedia(true);
    try {
      await deleteMedia(deletingMedia.id);
      setDeletingMedia(null);
      loadMedia();
    } catch (e) {
      console.error('Failed to delete media', e);
    } finally {
      setIsDeletingMedia(false);
    }
  };

  // ─── Animations ───────────────────────────────────────────────────────────
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

  // ─── Computed Values ──────────────────────────────────────────────────────
  const filteredUsers = users.filter(u => {
    const matchesSearch = userSearch === '' || 
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) || 
      u.email?.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === 'all' || u.role?.toUpperCase() === userRoleFilter.toUpperCase();
    return matchesSearch && matchesRole;
  });

  const stats = [
    { label: 'System Users', value: adminStats?.totalUsers ?? 0, change: `${adminStats?.adminCount ?? 0} admins`, icon: Users, color: 'text-sky-500', delay: 0 },
    { label: 'Active Pages', value: contentStats?.totalPages ?? 0, change: `${contentStats?.publishedCount ?? 0} published`, icon: FileText, color: 'text-emerald-500', delay: 0.1 },
    { label: 'Network Uptime', value: '100%', change: 'Stable', icon: Activity, color: 'text-orange-500', delay: 0.2 },
    { label: 'Secure Storage', value: '1.2TB', change: '82%', icon: Database, color: 'text-purple-500', delay: 0.3 },
  ];

  // Build dynamic roles
  const roleCounts = users.reduce((acc, u) => {
    const role = u.role?.toUpperCase() || 'USER';
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const DYNAMIC_ROLES = [
    { name: 'Admin', key: 'ADMIN', users: roleCounts['ADMIN'] || 0, perms: 'Full access', status: 'Active' },
    { name: 'User', key: 'USER', users: roleCounts['USER'] || 0, perms: 'Standard access', status: 'Active' },
    { name: 'Content Manager', key: 'CONTENT_MANAGER', users: roleCounts['CONTENT_MANAGER'] || 0, perms: 'Pages, News, Media', status: 'Active' },
    { name: 'Support', key: 'SUPPORT', users: roleCounts['SUPPORT'] || 0, perms: 'Users, Trips', status: 'Limited' },
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
          
          {/* ─── USERS TAB ───────────────────────────────────────────── */}
          {activeTab === 'users' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search users..." 
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-10 pr-4 py-2.5 bg-slate-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-sky-500/20 w-64"
                    />
                  </div>
                  <div className="relative">
                    <AdvancedButton variant="secondary" size="sm" icon={<Filter size={16} />} onClick={() => setShowFilterMenu(!showFilterMenu)}>
                      {userRoleFilter === 'all' ? 'Filter' : userRoleFilter}
                    </AdvancedButton>
                    {showFilterMenu && (
                      <div className="absolute top-12 left-0 z-10 bg-white rounded-xl shadow-lg border border-slate-200 py-2 min-w-[140px]">
                        {['all', 'USER', 'ADMIN'].map(role => (
                          <button
                            key={role}
                            onClick={() => { setUserRoleFilter(role); setShowFilterMenu(false); }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-sky-50 transition-colors ${userRoleFilter === role ? 'text-sky-600 font-bold' : 'text-slate-700'}`}
                          >
                            {role === 'all' ? 'All Roles' : role}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <AdvancedButton variant="ghost" size="sm" icon={<RefreshCw size={16} />} onClick={loadUsers}>
                    Refresh
                  </AdvancedButton>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">{filteredUsers.length} of {users.length} users</span>
                </div>
              </div>
              <div className="space-y-3">
                {isLoadingUsers ? (
                  <div className="flex justify-center p-12"><LoadingSpinner size="lg" /></div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    {users.length === 0 ? 'No users found in database.' : 'No users match the current filter.'}
                  </div>
                ) : (
                  filteredUsers.map((user, i) => (
                    <UserRow key={user.id || i} user={user} index={i} onEdit={handleEditUser} onDelete={setDeletingUser} />
                  ))
                )}
              </div>
            </div>
          )}

          {/* ─── ROLES TAB ───────────────────────────────────────────── */}
          {activeTab === 'roles' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900">Role Management</h2>
                <span className="text-sm text-slate-400">{users.length} total users across all roles</span>
              </div>
              <div className="grid gap-4">
                {DYNAMIC_ROLES.map((role, i) => (
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
                        <span className="text-sm text-slate-500 font-semibold">{role.users} users</span>
                        <Badge variant={role.status === 'Active' ? 'success' : 'warning'}>
                          {role.status}
                        </Badge>
                      </div>
                    </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── PAGES TAB (list) ────────────────────────────────────── */}
          {activeTab === 'pages' && !editingPage && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900">Page Management</h2>
                <div className="flex items-center gap-3">
                  <AdvancedButton variant="ghost" size="sm" icon={<RefreshCw size={16} />} onClick={loadPages}>
                    Refresh
                  </AdvancedButton>
                  <AdvancedButton variant="primary" size="sm" icon={<Upload size={16} />} onClick={() => setEditingPage({ slug: '', title: '', status: 'Draft', contentBlocks: {}, updatedAt: '' })}>
                    New Page
                  </AdvancedButton>
                </div>
              </div>
              {isLoadingPages ? (
                <div className="flex justify-center p-12"><LoadingSpinner size="lg" /></div>
              ) : (
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
                      {pages.length === 0 && (
                        <tr><td colSpan={5} className="text-center py-8 text-slate-500 text-sm">No pages found. Create one.</td></tr>
                      )}
                      {pages.map((page, i) => (
                        <tr key={i} className="border-b border-slate-50 hover:bg-sky-50/50 transition-colors">
                          <td className="py-4 px-4 font-medium text-slate-900">{page.title}</td>
                          <td className="py-4 px-4 text-sm text-slate-500 font-mono">{page.slug}</td>
                          <td className="py-4 px-4">
                            <Badge variant={page.status === 'Published' ? 'success' : 'warning'}>
                              {page.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-500">{page.updatedAt ? new Date(page.updatedAt).toLocaleDateString() : '—'}</td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => setEditingPage(page)} className="p-2 hover:bg-white rounded-lg transition-colors" title="Edit page">
                                <Edit size={16} className="text-slate-400 hover:text-sky-500" />
                              </button>
                              <button 
                                onClick={() => handleDeletePage(page.slug)} 
                                className="p-2 hover:bg-white rounded-lg transition-colors" 
                                title="Delete page"
                                disabled={isDeletingPage && deletingPageSlug === page.slug}
                              >
                                {isDeletingPage && deletingPageSlug === page.slug 
                                  ? <LoadingSpinner size="sm" /> 
                                  : <Trash2 size={16} className="text-red-400 hover:text-red-600" />
                                }
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ─── PAGES TAB (editor) ──────────────────────────────────── */}
          {activeTab === 'pages' && editingPage && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <button onClick={() => setEditingPage(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                  </button>
                  <h2 className="text-lg font-bold text-slate-900">
                    {editingPage.updatedAt === '' ? 'Create New Page' : `Edit Page: ${editingPage.title}`}
                  </h2>
                </div>
                <div className="flex gap-3">
                  <AdvancedButton variant="ghost" size="sm" onClick={() => setEditingPage(null)}>Cancel</AdvancedButton>
                  <AdvancedButton variant="primary" size="sm" icon={<CheckCircle size={16}/>} onClick={handleSavePage}>
                    {editingPage.updatedAt === '' ? 'Create Page' : 'Save Changes'}
                  </AdvancedButton>
                </div>
              </div>

              <div className="space-y-6 max-w-4xl">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Internal Title</label>
                    <input type="text" value={editingPage.title} onChange={(e) => setEditingPage({...editingPage, title: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-sky-500/20" placeholder="Page Title" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">URL Slug</label>
                    <input type="text" value={editingPage.slug} onChange={(e) => setEditingPage({...editingPage, slug: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-sky-500/20 font-mono" placeholder="page-slug" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                  <select value={editingPage.status} onChange={(e) => setEditingPage({...editingPage, status: e.target.value as any})} className="w-full p-4 bg-slate-50 border-0 rounded-xl text-sm">
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900">Content Blocks</h3>
                    <button 
                      onClick={() => {
                        const newKey = prompt('Enter block identifier (e.g. hero_title):');
                        if (newKey) setEditingPage({...editingPage, contentBlocks: {...(editingPage.contentBlocks || {}), [newKey]: ''}});
                      }}
                      className="text-xs font-bold text-sky-600 bg-sky-50 px-3 py-1.5 rounded-lg hover:bg-sky-100"
                    >
                      + Add Block
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {Object.entries(editingPage.contentBlocks || {}).map(([key, value]) => (
                      <div key={key} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">{key}</span>
                          <button 
                            onClick={() => {
                              const newBlocks = {...editingPage.contentBlocks};
                              delete newBlocks[key];
                              setEditingPage({...editingPage, contentBlocks: newBlocks});
                            }}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                        <textarea 
                          value={value} 
                          onChange={(e) => setEditingPage({...editingPage, contentBlocks: {...editingPage.contentBlocks, [key]: e.target.value}})}
                          className="w-full min-h-[100px] p-3 bg-slate-50 border-0 rounded-lg text-sm text-slate-700 resize-y focus:ring-2 focus:ring-sky-500/20"
                        />
                      </div>
                    ))}
                    {Object.keys(editingPage.contentBlocks || {}).length === 0 && (
                        <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                            No content blocks defined. Add a block to store dynamic text, HTML, or URLs.
                        </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── MEDIA TAB ───────────────────────────────────────────── */}
          {activeTab === 'media' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900">Media Library</h2>
                <AdvancedButton 
                  variant="primary" 
                  size="sm" 
                  icon={<Upload size={16} />}
                  onClick={() => setEditingMedia({ name: '', url: '', type: 'Image', sizeLabel: '0 KB', status: 'Live' })}
                >
                  Upload
                </AdvancedButton>
              </div>
              
              {isLoadingMedia ? (
                <div className="flex justify-center p-12"><LoadingSpinner size="lg" /></div>
              ) : mediaItems.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                    No media items found. Upload one to get started.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mediaItems.map((item, i) => (
                      <div key={item.id || i} className="group bg-slate-50 rounded-xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                        <div className="aspect-video bg-slate-200 relative overflow-hidden">
                          <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button onClick={() => setEditingMedia(item)} className="p-2 bg-white hover:bg-sky-50 rounded-lg transition-colors">
                              <Edit size={16} className="text-slate-600 hover:text-sky-600" />
                            </button>
                            <button onClick={() => setDeletingMedia(item)} className="p-2 bg-white hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 size={16} className="text-red-500 hover:text-red-700" />
                            </button>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="font-medium text-slate-900 truncate" title={item.name}>{item.name}</div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-slate-500">{item.type}</span>
                            <span className="text-xs text-slate-500">{item.sizeLabel}</span>
                            <Badge variant={item.status === 'Archived' ? 'warning' : 'success'} size="sm">{item.status}</Badge>
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── SETTINGS TAB ────────────────────────────────────────── */}
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
                      <div 
                        onClick={() => handleToggleSetting('maintenanceMode')}
                        className={`w-12 h-6 ${systemSettings.maintenanceMode ? 'bg-sky-500' : 'bg-slate-200'} rounded-full relative cursor-pointer transition-colors ${isSavingSettings ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${systemSettings.maintenanceMode ? 'right-0.5' : 'left-0.5'}`} />
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
                      <div 
                        onClick={() => handleToggleSetting('emailNotifications')}
                        className={`w-12 h-6 ${systemSettings.emailNotifications ? 'bg-sky-500' : 'bg-slate-200'} rounded-full relative cursor-pointer transition-colors ${isSavingSettings ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${systemSettings.emailNotifications ? 'right-0.5' : 'left-0.5'}`} />
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
                      <div 
                        onClick={() => handleToggleSetting('analyticsTracking')}
                        className={`w-12 h-6 ${systemSettings.analyticsTracking ? 'bg-sky-500' : 'bg-slate-200'} rounded-full relative cursor-pointer transition-colors ${isSavingSettings ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${systemSettings.analyticsTracking ? 'right-0.5' : 'left-0.5'}`} />
                      </div>
                    </div>
                  </div>
                </GlowBorder>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Edit User Modal ─────────────────────────────────────────────── */}
      <Modal isOpen={!!editingUser} onClose={() => setEditingUser(null)} title="Edit User">
        {editingUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <Avatar alt={editingUser.name} size="lg" />
              <div>
                <div className="font-bold text-slate-900 text-lg">{editingUser.name}</div>
                <div className="text-sm text-slate-500">{editingUser.email}</div>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Role</label>
              <select 
                value={editRole} 
                onChange={(e) => setEditRole(e.target.value)}
                className="w-full p-4 bg-slate-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
                <option value="CONTENT_MANAGER">Content Manager</option>
                <option value="SUPPORT">Support</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <AdvancedButton variant="ghost" size="sm" onClick={() => setEditingUser(null)}>Cancel</AdvancedButton>
              <AdvancedButton variant="primary" size="sm" icon={<CheckCircle size={16} />} onClick={handleSaveUserEdit} disabled={isSavingUser}>
                {isSavingUser ? 'Saving...' : 'Save Changes'}
              </AdvancedButton>
            </div>
          </div>
        )}
      </Modal>

      {/* ─── Delete User Confirmation Modal ──────────────────────────────── */}
      <Modal isOpen={!!deletingUser} onClose={() => setDeletingUser(null)} title="Delete User">
        {deletingUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-red-50 rounded-xl">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="font-bold text-red-900">Are you sure?</p>
                <p className="text-sm text-red-700">
                  You are about to permanently delete <strong>{deletingUser.name}</strong> ({deletingUser.email}). This action cannot be undone.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <AdvancedButton variant="ghost" size="sm" onClick={() => setDeletingUser(null)}>Cancel</AdvancedButton>
              <AdvancedButton 
                variant="primary" 
                size="sm" 
                icon={<Trash2 size={16} />} 
                onClick={handleConfirmDeleteUser} 
                disabled={isDeletingUser}
                className="!bg-red-600 hover:!bg-red-700"
              >
                {isDeletingUser ? 'Deleting...' : 'Delete User'}
              </AdvancedButton>
            </div>
          </div>
        )}
      </Modal>
      {/* ─── Delete Media Confirmation Modal ──────────────────────────────── */}
      <Modal isOpen={!!deletingMedia} onClose={() => setDeletingMedia(null)} title="Delete Media">
        {deletingMedia && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-red-50 rounded-xl">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="font-bold text-red-900">Are you sure?</p>
                <p className="text-sm text-red-700">
                  You are about to permanently delete <strong>{deletingMedia.name}</strong>. This action cannot be undone.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <AdvancedButton variant="ghost" size="sm" onClick={() => setDeletingMedia(null)}>Cancel</AdvancedButton>
              <AdvancedButton 
                variant="primary" 
                size="sm" 
                icon={<Trash2 size={16} />} 
                onClick={handleConfirmDeleteMedia} 
                disabled={isDeletingMedia}
                className="!bg-red-600 hover:!bg-red-700"
              >
                {isDeletingMedia ? 'Deleting...' : 'Delete Media'}
              </AdvancedButton>
            </div>
          </div>
        )}
      </Modal>

      {/* ─── Add/Edit Media Modal ─────────────────────────────────────────── */}
      <Modal isOpen={!!editingMedia} onClose={() => setEditingMedia(null)} title={editingMedia?.id ? "Edit Media" : "Upload Media"}>
        {editingMedia && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Internal Name</label>
              <input type="text" value={editingMedia.name} onChange={(e) => setEditingMedia({...editingMedia, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-sky-500/20" placeholder="e.g. Hero Image" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Image URL</label>
              <input type="text" value={editingMedia.url} onChange={(e) => setEditingMedia({...editingMedia, url: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-sky-500/20" placeholder="https://..." />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Type</label>
                  <select value={editingMedia.type} onChange={(e) => setEditingMedia({...editingMedia, type: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-sky-500/20">
                    <option value="Image">Image</option>
                    <option value="Video">Video</option>
                    <option value="Document">Document</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                  <select value={editingMedia.status} onChange={(e) => setEditingMedia({...editingMedia, status: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-sky-500/20">
                    <option value="Live">Live</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Size Label</label>
              <input type="text" value={editingMedia.sizeLabel} onChange={(e) => setEditingMedia({...editingMedia, sizeLabel: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-sky-500/20" placeholder="e.g. 512 KB" />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <AdvancedButton variant="ghost" size="sm" onClick={() => setEditingMedia(null)}>Cancel</AdvancedButton>
              <AdvancedButton variant="primary" size="sm" icon={<CheckCircle size={16} />} onClick={handleSaveMedia} disabled={isSavingMedia}>
                {isSavingMedia ? 'Saving...' : 'Save Media'}
              </AdvancedButton>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default AdminPage;
