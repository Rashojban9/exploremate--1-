
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { Shield, Users, Activity, LogOut, ArrowLeft, RefreshCw, Trash2, Edit, AlertTriangle, CheckCircle, Database, Server, Globe, Search, Filter, Image, FileText, Settings, Upload, UserPlus, ShieldCheck, DollarSign, MapPin, Newspaper, Calendar, Menu, Link, ToggleLeft, X, Eye, EyeOff, Ban, Check, Download, Clock, BarChart3, ChevronDown, ChevronUp, Mail, Phone, MapPinIcon, Bookmark, Lock, Unlock, UserCheck, UserX, AlertCircle, Info, Zap, HardDrive, Wifi, Bell, Palette, Key, Copy } from 'lucide-react';
import { AdvancedButton, Badge, Tabs, Avatar, LoadingSpinner, ProgressBar } from '../components/NotificationSystem';
import { GlowBorder, AnimatedCounter, RevealOnScroll } from '../components/AdvancedAnimations';
import { contentService, type PageContent } from '../services/contentService';
import { getAllUsers, type ProfileResponse } from '../services/authService';
import { getAdminStats, getContentStats, updateUser as adminUpdateUser, deleteUser as adminDeleteUser, getAllMedia, addMedia, updateMedia, deleteMedia, adminResetPassword, clearAllContent, type AdminStats, type ContentStats, type MediaItem } from '../services/adminService';
import { useApp } from '../context/AppContext';
import { post } from '../services/http';

// ─── Activity Log Entry ───────────────────────────────────────────────────────
interface ActivityEntry {
  id: string;
  action: string;
  target: string;
  details: string;
  timestamp: Date;
  type: 'user' | 'page' | 'media' | 'setting' | 'system';
  status: 'success' | 'error';
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({ label, value, change, icon: Icon, color, delay, gradient }: any) => (
  <RevealOnScroll direction="up" delay={delay}>
    <GlowBorder color="sky" className="p-1 rounded-2xl">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300">
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
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${gradient || ''}`} style={!gradient ? { backgroundColor: 'rgba(14, 165, 233, 0.1)' } : {}}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>
      </div>
    </GlowBorder>
  </RevealOnScroll>
);

// ─── User Row ─────────────────────────────────────────────────────────────────

const UserRow = ({ user, index, onEdit, onDelete, onToggleStatus, onView, selected, onSelect }: { 
  user: ProfileResponse; 
  index: number; 
  onEdit: (user: ProfileResponse) => void; 
  onDelete: (user: ProfileResponse) => void;
  onToggleStatus: (userId: string, field: 'enabled' | 'locked', current: boolean) => void;
  onView: (user: ProfileResponse) => void;
  selected: boolean;
  onSelect: (userId: string) => void;
}) => (
  <div className={`flex items-center justify-between p-4 rounded-xl hover:bg-sky-50 transition-all duration-200 group animate-slide-up ${selected ? 'bg-sky-50 ring-2 ring-sky-200' : 'bg-slate-50'}`} style={{ animationDelay: `${index * 0.05}s` }}>
    <div className="flex items-center gap-4">
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onSelect(user.id!)}
        className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
      />
      <div className="cursor-pointer" onClick={() => onView(user)}>
        <Avatar alt={user.name} src={user.profilePicture} size="md" status={user.enabled !== false ? 'online' : 'offline'} />
      </div>
      <div className="cursor-pointer" onClick={() => onView(user)}>
        <div className="font-bold text-slate-900 flex items-center gap-2">
          {user.name}
          {user.locked && <span title="Account Locked"><Ban size={14} className="text-red-500" /></span>}
          {user.role === 'ADMIN' && <span title="Admin"><Shield size={14} className="text-purple-500" /></span>}
        </div>
        <div className="text-sm text-slate-500">{user.email}</div>
      </div>
    </div>
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <button 
          onClick={() => onToggleStatus(user.id!, 'enabled', user.enabled !== false)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
            user.enabled !== false 
              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
          }`}
        >
          {user.enabled !== false ? <Check size={12} /> : <X size={12} />}
          {user.enabled !== false ? 'Enabled' : 'Disabled'}
        </button>
        
        <button 
          onClick={() => onToggleStatus(user.id!, 'locked', !!user.locked)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
            user.locked 
              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
              : 'bg-sky-100 text-sky-700 hover:bg-sky-200'
          }`}
        >
          {user.locked ? <Lock size={12} /> : <Unlock size={12} />}
          {user.locked ? 'Locked' : 'Unlocked'}
        </button>
      </div>
      
      <span className={`text-xs font-bold uppercase min-w-[80px] text-center px-2 py-1 rounded-full ${
        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
        user.role === 'CONTENT_MANAGER' ? 'bg-amber-100 text-amber-700' :
        user.role === 'SUPPORT' ? 'bg-sky-100 text-sky-700' :
        'bg-slate-100 text-slate-500'
      }`}>{user.role || 'USER'}</span>
      <span className="text-xs text-slate-400 min-w-[100px] text-right">
        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Synced'}
      </span>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onView(user)} className="p-2 hover:bg-white rounded-lg transition-colors" title="View details">
          <Eye size={16} className="text-slate-400 hover:text-sky-500" />
        </button>
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

const Modal = ({ isOpen, onClose, title, children, size = 'lg' }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl' }) => {
  if (!isOpen) return null;
  const sizeClasses = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' };
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} mx-4 animate-slide-up overflow-hidden max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100 flex-shrink-0">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

// ─── Toggle Switch Component ──────────────────────────────────────────────────

const ToggleSwitch = ({ enabled, onToggle, disabled = false }: { enabled: boolean; onToggle: () => void; disabled?: boolean }) => (
  <div 
    onClick={disabled ? undefined : onToggle}
    className={`w-12 h-6 ${enabled ? 'bg-sky-500' : 'bg-slate-200'} rounded-full relative cursor-pointer transition-colors ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${enabled ? 'right-0.5' : 'left-0.5'}`} />
  </div>
);

// ─── Settings Card ────────────────────────────────────────────────────────────

const SettingCard = ({ icon: Icon, iconColor, glowColor, title, description, toggle, action }: {
  icon: any; iconColor: string; glowColor: "sky" | "purple" | "sunset" | "emerald";
  title: string; description: string;
  toggle?: { enabled: boolean; onToggle: () => void; disabled?: boolean };
  action?: React.ReactNode;
}) => (
  <GlowBorder color={glowColor} className="p-1 rounded-2xl">
    <div className="bg-white rounded-xl p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColor}`}>
            <Icon size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500">{description}</p>
          </div>
        </div>
        {toggle && <ToggleSwitch enabled={toggle.enabled} onToggle={toggle.onToggle} disabled={toggle.disabled} />}
        {action && action}
      </div>
    </div>
  </GlowBorder>
);

// ─── Main AdminPage ───────────────────────────────────────────────────────────

const AdminPage = ({ onBack }: { onBack: () => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('users');
  const { notify } = useApp();

  // Users state
  const [users, setUsers] = useState<ProfileResponse[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  // User edit modal
  const [editingUser, setEditingUser] = useState<ProfileResponse | null>(null);
  const [editRole, setEditRole] = useState('USER');
  const [isSavingUser, setIsSavingUser] = useState(false);

  // User delete modal
  const [deletingUser, setDeletingUser] = useState<ProfileResponse | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // User view modal
  const [viewingUser, setViewingUser] = useState<ProfileResponse | null>(null);

  // Add User modal
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'USER' });
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Bulk delete
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Pages state
  const [pages, setPages] = useState<PageContent[]>([]);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [editingPage, setEditingPage] = useState<PageContent | null>(null);
  const [isDeletingPage, setIsDeletingPage] = useState(false);
  const [deletingPageSlug, setDeletingPageSlug] = useState<string | null>(null);
  const [pageSearch, setPageSearch] = useState('');
  const [confirmDeletePage, setConfirmDeletePage] = useState<PageContent | null>(null);

  // Media state
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [isSavingMedia, setIsSavingMedia] = useState(false);
  const [deletingMedia, setDeletingMedia] = useState<MediaItem | null>(null);
  const [isDeletingMedia, setIsDeletingMedia] = useState(false);
  const [mediaSearch, setMediaSearch] = useState('');
  const [mediaTypeFilter, setMediaTypeFilter] = useState('all');

  // Stats state
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [contentStats, setContentStats] = useState<ContentStats | null>(null);
  const [isRefreshingStats, setIsRefreshingStats] = useState(false);

  // Settings State
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    emailNotifications: true,
    analyticsTracking: false,
    twoFactorAuth: false,
    autoBackup: true,
    rateLimiting: true,
    debugMode: false,
    darkModeDefault: false,
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Activity Log
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([]);
  const [activityFilter, setActivityFilter] = useState<string>('all');

  // ─── Activity Logger ──────────────────────────────────────────────────────
  const logActivity = useCallback((action: string, target: string, details: string, type: ActivityEntry['type'], status: ActivityEntry['status'] = 'success') => {
    setActivityLog(prev => [{
      id: Math.random().toString(36).substring(2, 9),
      action,
      target,
      details,
      timestamp: new Date(),
      type,
      status
    }, ...prev].slice(0, 100)); // Cap at 100 entries
  }, []);

  // ─── Load Stats ───────────────────────────────────────────────────────────
  const refreshStats = useCallback(async () => {
    setIsRefreshingStats(true);
    try {
      const [authStats, cStats] = await Promise.allSettled([
        getAdminStats(),
        getContentStats()
      ]);
      if (authStats.status === 'fulfilled') setAdminStats(authStats.value);
      if (cStats.status === 'fulfilled') setContentStats(cStats.value);
    } catch (e) {
      console.error('Failed to load stats', e);
    } finally {
      setIsRefreshingStats(false);
    }
  }, []);

  useEffect(() => { refreshStats(); }, []);

  // Load backend content settings
  useEffect(() => {
    if (activeTab === 'settings') {
      const loadSettings = async () => {
        const settingsPage = await contentService.getPageBySlug('system-settings');
        if (settingsPage && settingsPage.contentBlocks) {
          setSystemSettings(prev => ({
            ...prev,
            maintenanceMode: settingsPage.contentBlocks.maintenanceMode === 'true',
            emailNotifications: settingsPage.contentBlocks.emailNotifications !== 'false',
            analyticsTracking: settingsPage.contentBlocks.analyticsTracking === 'true',
            twoFactorAuth: settingsPage.contentBlocks.twoFactorAuth === 'true',
            autoBackup: settingsPage.contentBlocks.autoBackup !== 'false',
            rateLimiting: settingsPage.contentBlocks.rateLimiting !== 'false',
            debugMode: settingsPage.contentBlocks.debugMode === 'true',
            darkModeDefault: settingsPage.contentBlocks.darkModeDefault === 'true',
          }));
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
      const updatedBlocks: Record<string, string> = {};
      Object.entries({ ...systemSettings, [key]: newValue }).forEach(([k, v]) => {
        updatedBlocks[k] = String(v);
      });
      
      await contentService.updatePageContent('system-settings', {
        slug: 'system-settings',
        title: 'System Settings',
        contentBlocks: updatedBlocks,
        status: 'Published'
      });
      notify({ type: 'success', message: `${key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())} ${newValue ? 'enabled' : 'disabled'}`, duration: 3000 });
      logActivity('Updated Setting', key, `Set to ${newValue}`, 'setting');
    } catch (err) {
      console.error('Failed to save settings:', err);
      setSystemSettings(prev => ({ ...prev, [key]: !newValue }));
      notify({ type: 'error', message: 'Failed to save setting', duration: 3000 });
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

  // ─── Create User ─────────────────────────────────────────────────────────
  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      notify({ type: 'warning', message: 'Please fill all required fields', duration: 3000 });
      return;
    }
    setIsCreatingUser(true);
    try {
      await post<any>('/api/auth/admin/signup', {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
      }, true);
      notify({ type: 'success', message: `User "${newUser.name}" created successfully`, duration: 4000 });
      logActivity('Created User', newUser.email, `Role: ${newUser.role}`, 'user');
      setShowAddUser(false);
      setNewUser({ name: '', email: '', password: '', role: 'USER' });
      loadUsers();
      refreshStats();
    } catch (e: any) {
      console.error('Failed to create user', e);
      notify({ type: 'error', message: e.message || 'Failed to create user', duration: 4000 });
      logActivity('Create User Failed', newUser.email, e.message || 'Error', 'user', 'error');
    } finally {
      setIsCreatingUser(false);
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
      notify({ type: 'success', message: `User "${editingUser.name}" role updated to ${editRole}`, duration: 4000 });
      logActivity('Updated User Role', editingUser.email, `Changed to ${editRole}`, 'user');
      setEditingUser(null);
      loadUsers();
      refreshStats();
    } catch (e: any) {
      console.error('Failed to update user', e);
      notify({ type: 'error', message: e.message || 'Failed to update user', duration: 4000 });
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleConfirmDeleteUser = async () => {
    if (!deletingUser?.id) return;
    setIsDeletingUser(true);
    try {
      await adminDeleteUser(deletingUser.id);
      notify({ type: 'success', message: `User "${deletingUser.name}" deleted`, duration: 4000 });
      logActivity('Deleted User', deletingUser.email, `Removed from system`, 'user');
      setDeletingUser(null);
      loadUsers();
      refreshStats();
    } catch (e: any) {
      console.error('Failed to delete user', e);
      notify({ type: 'error', message: e.message || 'Failed to delete user', duration: 4000 });
    } finally {
      setIsDeletingUser(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, field: 'enabled' | 'locked', current: boolean) => {
    const user = users.find(u => u.id === userId);
    try {
      await adminUpdateUser(userId, { [field]: !current });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, [field]: !current } : u));
      notify({ type: 'success', message: `User ${field === 'enabled' ? (current ? 'disabled' : 'enabled') : (current ? 'unlocked' : 'locked')}`, duration: 3000 });
      logActivity(`Toggled ${field}`, user?.email || userId, `${field}: ${!current}`, 'user');
      refreshStats();
    } catch (e: any) {
      console.error(`Failed to toggle user ${field}`, e);
      notify({ type: 'error', message: `Failed to toggle user ${field}`, duration: 3000 });
    }
  };

  // ─── Bulk Operations ──────────────────────────────────────────────────────
  const handleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id!)));
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    let successCount = 0;
    let failCount = 0;
    for (const userId of selectedUsers) {
      try {
        await adminDeleteUser(userId);
        successCount++;
      } catch {
        failCount++;
      }
    }
    notify({ type: successCount > 0 ? 'success' : 'error', message: `Deleted ${successCount} users${failCount > 0 ? `, ${failCount} failed` : ''}`, duration: 4000 });
    logActivity('Bulk Delete', `${successCount} users`, `${failCount} failed`, 'user');
    setSelectedUsers(new Set());
    setShowBulkDelete(false);
    setIsBulkDeleting(false);
    loadUsers();
    refreshStats();
  };

  // ─── Export CSV ───────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    const header = 'Name,Email,Role,Status,Locked,Created\n';
    const rows = filteredUsers.map(u =>
      `"${u.name}","${u.email}","${u.role || 'USER'}","${u.enabled !== false ? 'Enabled' : 'Disabled'}","${u.locked ? 'Yes' : 'No'}","${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exploreMate_users_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    notify({ type: 'success', message: `Exported ${filteredUsers.length} users to CSV`, duration: 3000 });
    logActivity('Exported Users', 'CSV', `${filteredUsers.length} records`, 'system');
  };

  // ─── Page CRUD ────────────────────────────────────────────────────────────
  const handleSavePage = async () => {
    if (!editingPage) return;
    try {
      if (editingPage.updatedAt === '') {
        await contentService.createPage(editingPage);
        notify({ type: 'success', message: `Page "${editingPage.title}" created`, duration: 4000 });
        logActivity('Created Page', editingPage.slug, editingPage.title, 'page');
      } else {
        await contentService.updatePageContent(editingPage.slug, editingPage);
        notify({ type: 'success', message: `Page "${editingPage.title}" updated`, duration: 4000 });
        logActivity('Updated Page', editingPage.slug, editingPage.title, 'page');
      }
      setEditingPage(null);
      loadPages();
      const cStats = await getContentStats();
      setContentStats(cStats);
    } catch (e: any) {
      console.error('Failed to save page', e);
      notify({ type: 'error', message: e.message || 'Failed to save page', duration: 4000 });
    }
  };

  const handleDeletePage = async (page: PageContent) => {
    setConfirmDeletePage(page);
  };

  const handleConfirmDeletePage = async () => {
    if (!confirmDeletePage) return;
    setDeletingPageSlug(confirmDeletePage.slug);
    setIsDeletingPage(true);
    try {
      await contentService.deletePage(confirmDeletePage.slug);
      notify({ type: 'success', message: `Page "${confirmDeletePage.title}" deleted`, duration: 4000 });
      logActivity('Deleted Page', confirmDeletePage.slug, confirmDeletePage.title, 'page');
      loadPages();
      const cStats = await getContentStats();
      setContentStats(cStats);
    } catch (e: any) {
      console.error('Failed to delete page', e);
      notify({ type: 'error', message: e.message || 'Failed to delete page', duration: 4000 });
    } finally {
      setIsDeletingPage(false);
      setDeletingPageSlug(null);
      setConfirmDeletePage(null);
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
        notify({ type: 'success', message: `Media "${editingMedia.name}" updated`, duration: 4000 });
        logActivity('Updated Media', editingMedia.name, editingMedia.type, 'media');
      } else {
        await addMedia(editingMedia);
        notify({ type: 'success', message: `Media "${editingMedia.name}" uploaded`, duration: 4000 });
        logActivity('Uploaded Media', editingMedia.name, editingMedia.type, 'media');
      }
      setEditingMedia(null);
      loadMedia();
    } catch (e: any) {
      console.error('Failed to save media', e);
      notify({ type: 'error', message: e.message || 'Failed to save media', duration: 4000 });
    } finally {
      setIsSavingMedia(false);
    }
  };

  const handleConfirmDeleteMedia = async () => {
    if (!deletingMedia?.id) return;
    setIsDeletingMedia(true);
    try {
      await deleteMedia(deletingMedia.id);
      notify({ type: 'success', message: `Media "${deletingMedia.name}" deleted`, duration: 4000 });
      logActivity('Deleted Media', deletingMedia.name, deletingMedia.type, 'media');
      setDeletingMedia(null);
      loadMedia();
    } catch (e: any) {
      console.error('Failed to delete media', e);
      notify({ type: 'error', message: e.message || 'Failed to delete media', duration: 4000 });
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

  const filteredPages = pages.filter(p => {
    return pageSearch === '' || 
      p.title?.toLowerCase().includes(pageSearch.toLowerCase()) || 
      p.slug?.toLowerCase().includes(pageSearch.toLowerCase());
  });

  const filteredMedia = mediaItems.filter(m => {
    const matchesSearch = mediaSearch === '' || m.name?.toLowerCase().includes(mediaSearch.toLowerCase());
    const matchesType = mediaTypeFilter === 'all' || m.type === mediaTypeFilter;
    return matchesSearch && matchesType;
  });

  const filteredActivity = activityLog.filter(a => activityFilter === 'all' || a.type === activityFilter);

  const stats = [
    { label: 'System Users', value: adminStats?.totalUsers ?? 0, change: `${adminStats?.adminCount ?? 0} admins`, icon: Users, color: 'text-sky-500', gradient: 'bg-sky-50', delay: 0 },
    { label: 'Active Pages', value: contentStats?.totalPages ?? 0, change: `${contentStats?.publishedCount ?? 0} published`, icon: FileText, color: 'text-emerald-500', gradient: 'bg-emerald-50', delay: 0.1 },
    { label: 'Account Locks', value: adminStats?.lockedCount ?? 0, change: `${adminStats?.enabledCount ?? 0} enabled`, icon: Ban, color: 'text-orange-500', gradient: 'bg-orange-50', delay: 0.2 },
    { label: 'System Health', value: '100%', change: 'Stable', icon: Activity, color: 'text-purple-500', gradient: 'bg-purple-50', delay: 0.3 },
  ];

  // Build dynamic roles
  const roleCounts = users.reduce((acc, u) => {
    const role = u.role?.toUpperCase() || 'USER';
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const DYNAMIC_ROLES = [
    { name: 'Admin', key: 'ADMIN', users: roleCounts['ADMIN'] || 0, perms: 'Full access · All modules', status: 'Active', icon: Shield, color: 'bg-purple-100 text-purple-600' },
    { name: 'User', key: 'USER', users: roleCounts['USER'] || 0, perms: 'Standard access · Personal data', status: 'Active', icon: UserCheck, color: 'bg-sky-100 text-sky-600' },
    { name: 'Content Manager', key: 'CONTENT_MANAGER', users: roleCounts['CONTENT_MANAGER'] || 0, perms: 'Pages · News · Media', status: 'Active', icon: FileText, color: 'bg-amber-100 text-amber-600' },
    { name: 'Support', key: 'SUPPORT', users: roleCounts['SUPPORT'] || 0, perms: 'Users · Trips · Read-only', status: 'Limited', icon: ShieldCheck, color: 'bg-emerald-100 text-emerald-600' },
  ];
  
  const tabs = [
    { id: 'users', label: 'Users', icon: <Users size={16} /> },
    { id: 'roles', label: 'Roles', icon: <ShieldCheck size={16} /> },
    { id: 'pages', label: 'Pages', icon: <FileText size={16} /> },
    { id: 'media', label: 'Media', icon: <Image size={16} /> },
    { id: 'activity', label: 'Activity', icon: <Clock size={16} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
  ];

  const getActivityIcon = (type: ActivityEntry['type']) => {
    switch(type) {
      case 'user': return <Users size={14} className="text-sky-500" />;
      case 'page': return <FileText size={14} className="text-emerald-500" />;
      case 'media': return <Image size={14} className="text-purple-500" />;
      case 'setting': return <Settings size={14} className="text-amber-500" />;
      case 'system': return <Zap size={14} className="text-orange-500" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

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
              <button 
                onClick={refreshStats}
                className={`p-2 hover:bg-slate-100 rounded-xl transition-colors ${isRefreshingStats ? 'animate-spin' : ''}`}
                title="Refresh stats"
              >
                <RefreshCw className="w-4 h-4 text-slate-500" />
              </button>
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
        <div className="admin-panel bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8">
          
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
                      <div className="absolute top-12 left-0 z-10 bg-white rounded-xl shadow-lg border border-slate-200 py-2 min-w-[160px]">
                        {['all', 'USER', 'ADMIN', 'CONTENT_MANAGER', 'SUPPORT'].map(role => (
                          <button
                            key={role}
                            onClick={() => { setUserRoleFilter(role); setShowFilterMenu(false); }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-sky-50 transition-colors ${userRoleFilter === role ? 'text-sky-600 font-bold' : 'text-slate-700'}`}
                          >
                            {role === 'all' ? 'All Roles' : role.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <AdvancedButton variant="ghost" size="sm" icon={<RefreshCw size={16} />} onClick={loadUsers}>
                    Refresh
                  </AdvancedButton>
                </div>
                <div className="flex items-center gap-3">
                  {selectedUsers.size > 0 && (
                    <>
                      <span className="text-sm text-sky-600 font-bold">{selectedUsers.size} selected</span>
                      <AdvancedButton variant="danger" size="sm" icon={<Trash2 size={16} />} onClick={() => setShowBulkDelete(true)}>
                        Delete Selected
                      </AdvancedButton>
                    </>
                  )}
                  <AdvancedButton variant="ghost" size="sm" icon={<Download size={16} />} onClick={handleExportCSV}>
                    Export
                  </AdvancedButton>
                  <AdvancedButton variant="primary" size="sm" icon={<UserPlus size={16} />} onClick={() => setShowAddUser(true)}>
                    Add User
                  </AdvancedButton>
                </div>
              </div>

              {/* Select All */}
              <div className="flex items-center justify-between mb-3 px-4">
                <label className="flex items-center gap-3 text-sm text-slate-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filteredUsers.length > 0 && selectedUsers.size === filteredUsers.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  Select All
                </label>
                <span className="text-sm text-slate-400">{filteredUsers.length} of {users.length} users</span>
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
                    <UserRow 
                      key={user.id || i} 
                      user={user} 
                      index={i} 
                      onEdit={handleEditUser} 
                      onDelete={setDeletingUser}
                      onToggleStatus={handleToggleUserStatus}
                      onView={setViewingUser}
                      selected={selectedUsers.has(user.id!)}
                      onSelect={handleSelectUser}
                    />
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

              {/* Role distribution bar */}
              <div className="mb-8 p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 size={16} className="text-slate-400" />
                  <span className="text-sm font-bold text-slate-600">Role Distribution</span>
                </div>
                <div className="h-4 bg-slate-200 rounded-full overflow-hidden flex">
                  {DYNAMIC_ROLES.filter(r => r.users > 0).map((role, i) => {
                    const pct = users.length > 0 ? (role.users / users.length) * 100 : 0;
                    const colors = ['bg-purple-500', 'bg-sky-500', 'bg-amber-500', 'bg-emerald-500'];
                    return (
                      <div key={i} className={`${colors[i]} transition-all duration-500`} style={{ width: `${pct}%` }} title={`${role.name}: ${role.users} (${Math.round(pct)}%)`} />
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-4 mt-3">
                  {DYNAMIC_ROLES.map((role, i) => {
                    const colors = ['bg-purple-500', 'bg-sky-500', 'bg-amber-500', 'bg-emerald-500'];
                    return (
                      <span key={i} className="flex items-center gap-2 text-xs text-slate-500">
                        <span className={`w-3 h-3 rounded-full ${colors[i]}`} />
                        {role.name}: {role.users}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4">
                {DYNAMIC_ROLES.map((role, i) => (
                    <div key={i} className="flex items-center justify-between p-5 bg-slate-50 rounded-xl hover:bg-sky-50 transition-colors animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${role.color}`}>
                          <role.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-lg">{role.name}</div>
                          <div className="text-sm text-slate-500">{role.perms}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <span className="text-2xl font-bold text-slate-900">{role.users}</span>
                          <span className="text-sm text-slate-400 ml-1">users</span>
                        </div>
                        <Badge variant={role.status === 'Active' ? 'success' : 'warning'}>
                          {role.status}
                        </Badge>
                        <AdvancedButton
                          variant="ghost"
                          size="sm"
                          icon={<Eye size={16} />}
                          onClick={() => { setUserRoleFilter(role.key); setActiveTab('users'); }}
                        >
                          View
                        </AdvancedButton>
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
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-bold text-slate-900">Page Management</h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search pages..." 
                      value={pageSearch}
                      onChange={(e) => setPageSearch(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-slate-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-sky-500/20 w-48"
                    />
                  </div>
                </div>
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
                        <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase">Blocks</th>
                        <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase">Updated</th>
                        <th className="text-right py-3 px-4 text-xs font-bold text-slate-400 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPages.length === 0 && (
                        <tr><td colSpan={6} className="text-center py-8 text-slate-500 text-sm">{pages.length === 0 ? 'No pages found. Create one.' : 'No pages match search.'}</td></tr>
                      )}
                      {filteredPages.map((page, i) => (
                        <tr key={i} className="border-b border-slate-50 hover:bg-sky-50/50 transition-colors">
                          <td className="py-4 px-4 font-medium text-slate-900">{page.title}</td>
                          <td className="py-4 px-4 text-sm text-slate-500 font-mono">{page.slug}</td>
                          <td className="py-4 px-4">
                            <Badge variant={page.status === 'Published' ? 'success' : 'warning'}>
                              {page.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-500">
                            {Object.keys(page.contentBlocks || {}).length} blocks
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-500">{page.updatedAt ? new Date(page.updatedAt).toLocaleDateString() : '—'}</td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => setEditingPage(page)} className="p-2 hover:bg-white rounded-lg transition-colors" title="Edit page">
                                <Edit size={16} className="text-slate-400 hover:text-sky-500" />
                              </button>
                              <button 
                                onClick={() => handleDeletePage(page)} 
                                className="p-2 hover:bg-white rounded-lg transition-colors" 
                                title="Delete page"
                              >
                                <Trash2 size={16} className="text-red-400 hover:text-red-600" />
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
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-bold text-slate-900">Media Library</h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search media..." 
                      value={mediaSearch}
                      onChange={(e) => setMediaSearch(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-slate-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-sky-500/20 w-48"
                    />
                  </div>
                  <select 
                    value={mediaTypeFilter} 
                    onChange={(e) => setMediaTypeFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-sky-500/20"
                  >
                    <option value="all">All Types</option>
                    <option value="Image">Images</option>
                    <option value="Video">Videos</option>
                    <option value="Document">Documents</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <AdvancedButton variant="ghost" size="sm" icon={<RefreshCw size={16} />} onClick={loadMedia}>
                    Refresh
                  </AdvancedButton>
                  <AdvancedButton 
                    variant="primary" 
                    size="sm" 
                    icon={<Upload size={16} />}
                    onClick={() => setEditingMedia({ name: '', url: '', type: 'Image', sizeLabel: '0 KB', status: 'Live' })}
                  >
                    Upload
                  </AdvancedButton>
                </div>
              </div>
              
              {isLoadingMedia ? (
                <div className="flex justify-center p-12"><LoadingSpinner size="lg" /></div>
              ) : filteredMedia.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                    {mediaItems.length === 0 ? 'No media items found. Upload one to get started.' : 'No media matches the current filter.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMedia.map((item, i) => (
                      <div key={item.id || i} className="group bg-slate-50 rounded-xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                        <div className="aspect-video bg-slate-200 relative overflow-hidden">
                          {item.type === 'Image' ? (
                            <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              {item.type === 'Video' ? <Eye size={32} className="text-slate-400" /> : <FileText size={32} className="text-slate-400" />}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button onClick={() => setEditingMedia(item)} className="p-2 bg-white hover:bg-sky-50 rounded-lg transition-colors">
                              <Edit size={16} className="text-slate-600 hover:text-sky-600" />
                            </button>
                            <button onClick={() => window.open(item.url, '_blank')} className="p-2 bg-white hover:bg-sky-50 rounded-lg transition-colors">
                              <Eye size={16} className="text-slate-600" />
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

          {/* ─── ACTIVITY TAB ────────────────────────────────────────── */}
          {activeTab === 'activity' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900">Activity Log</h2>
                <div className="flex items-center gap-3">
                  <select 
                    value={activityFilter} 
                    onChange={(e) => setActivityFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-sky-500/20"
                  >
                    <option value="all">All Activities</option>
                    <option value="user">Users</option>
                    <option value="page">Pages</option>
                    <option value="media">Media</option>
                    <option value="setting">Settings</option>
                    <option value="system">System</option>
                  </select>
                  {activityLog.length > 0 && (
                    <AdvancedButton variant="ghost" size="sm" icon={<Trash2 size={16} />} onClick={() => { setActivityLog([]); notify({ type: 'info', message: 'Activity log cleared', duration: 2000 }); }}>
                      Clear
                    </AdvancedButton>
                  )}
                </div>
              </div>

              {filteredActivity.length === 0 ? (
                <div className="text-center py-16">
                  <Clock size={48} className="text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">No activity yet</p>
                  <p className="text-sm text-slate-400 mt-1">Actions you perform in the admin panel will appear here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredActivity.map((entry) => (
                    <div key={entry.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-sky-50/50 transition-colors">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${entry.status === 'error' ? 'bg-red-100' : 'bg-slate-100'}`}>
                        {entry.status === 'error' ? <AlertCircle size={14} className="text-red-500" /> : getActivityIcon(entry.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{entry.action}</span>
                          <span className="text-slate-400 text-sm">·</span>
                          <span className="text-sm text-slate-600 truncate">{entry.target}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{entry.details}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant={entry.status === 'error' ? 'error' : 'success'} size="sm">
                          {entry.status}
                        </Badge>
                        <span className="text-xs text-slate-400 min-w-[60px] text-right">{formatTimeAgo(entry.timestamp)}</span>
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
              <h2 className="text-lg font-bold text-slate-900 mb-2">System Settings</h2>
              <p className="text-sm text-slate-500 mb-8">Configure your platform behavior, security, and integrations</p>
              
              {/* General Section */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Server size={16} className="text-slate-400" />
                  <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">General</h3>
                </div>
                <div className="grid gap-4 max-w-3xl">
                  <SettingCard
                    icon={AlertTriangle} iconColor="bg-orange-100 text-orange-600" glowColor="sunset"
                    title="Maintenance Mode" description="Take the site offline for maintenance updates"
                    toggle={{ enabled: systemSettings.maintenanceMode, onToggle: () => handleToggleSetting('maintenanceMode'), disabled: isSavingSettings }}
                  />
                  <SettingCard
                    icon={Mail} iconColor="bg-sky-100 text-sky-600" glowColor="sky"
                    title="Email Notifications" description="Send email alerts for user signups and system events"
                    toggle={{ enabled: systemSettings.emailNotifications, onToggle: () => handleToggleSetting('emailNotifications'), disabled: isSavingSettings }}
                  />
                  <SettingCard
                    icon={BarChart3} iconColor="bg-purple-100 text-purple-600" glowColor="purple"
                    title="Analytics Tracking" description="Enable visitor analytics and usage tracking"
                    toggle={{ enabled: systemSettings.analyticsTracking, onToggle: () => handleToggleSetting('analyticsTracking'), disabled: isSavingSettings }}
                  />
                  <SettingCard
                    icon={Palette} iconColor="bg-slate-100 text-slate-600" glowColor="sky"
                    title="Dark Mode Default" description="Set dark mode as the default theme for new users"
                    toggle={{ enabled: systemSettings.darkModeDefault, onToggle: () => handleToggleSetting('darkModeDefault'), disabled: isSavingSettings }}
                  />
                </div>
              </div>

              {/* Security Section */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Shield size={16} className="text-slate-400" />
                  <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Security</h3>
                </div>
                <div className="grid gap-4 max-w-3xl">
                  <SettingCard
                    icon={Key} iconColor="bg-emerald-100 text-emerald-600" glowColor="emerald"
                    title="Two-Factor Authentication" description="Require 2FA for admin accounts"
                    toggle={{ enabled: systemSettings.twoFactorAuth, onToggle: () => handleToggleSetting('twoFactorAuth'), disabled: isSavingSettings }}
                  />
                  <SettingCard
                    icon={Shield} iconColor="bg-red-100 text-red-600" glowColor="sunset"
                    title="Rate Limiting" description="Limit API requests to prevent abuse (recommended)"
                    toggle={{ enabled: systemSettings.rateLimiting, onToggle: () => handleToggleSetting('rateLimiting'), disabled: isSavingSettings }}
                  />
                </div>
              </div>

              {/* System Section */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <HardDrive size={16} className="text-slate-400" />
                  <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">System</h3>
                </div>
                <div className="grid gap-4 max-w-3xl">
                  <SettingCard
                    icon={Database} iconColor="bg-sky-100 text-sky-600" glowColor="sky"
                    title="Auto Backup" description="Schedule automatic database backups daily"
                    toggle={{ enabled: systemSettings.autoBackup, onToggle: () => handleToggleSetting('autoBackup'), disabled: isSavingSettings }}
                  />
                  <SettingCard
                    icon={AlertCircle} iconColor="bg-amber-100 text-amber-600" glowColor="sunset"
                    title="Debug Mode" description="Enable verbose logging for development (disable in production)"
                    toggle={{ enabled: systemSettings.debugMode, onToggle: () => handleToggleSetting('debugMode'), disabled: isSavingSettings }}
                  />
                </div>
              </div>

              {/* Danger Zone */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle size={16} className="text-red-400" />
                  <h3 className="font-bold text-red-500 text-sm uppercase tracking-wider">Danger Zone</h3>
                </div>
                <div className="max-w-3xl p-5 border-2 border-dashed border-red-200 rounded-2xl bg-red-50/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900">Clear All Content</h4>
                      <p className="text-sm text-slate-500">Permanently delete all pages and media. This cannot be undone.</p>
                    </div>
                    <AdvancedButton 
                      variant="danger" 
                      size="sm" 
                      icon={<Trash2 size={16} />}
                      onClick={async () => {
                        if (!window.confirm('Are you absolutely sure? This will permanently delete ALL pages and media. Type OK to confirm.')) return;
                        try {
                          await clearAllContent();
                          notify({ type: 'success', message: 'All content cleared successfully', duration: 4000 });
                          logActivity('Cleared All Content', 'System', 'All pages and media deleted', 'system');
                          refreshStats();
                        } catch (e: any) {
                          notify({ type: 'error', message: e.message || 'Failed to clear content', duration: 4000 });
                          logActivity('Clear Content Failed', 'System', e.message || 'Error', 'system', 'error');
                        }
                      }}
                    >
                      Clear Data
                    </AdvancedButton>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── User Detail View Modal ──────────────────────────────────────── */}
      <Modal isOpen={!!viewingUser} onClose={() => setViewingUser(null)} title="User Details" size="xl">
        {viewingUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-6 p-5 bg-gradient-to-r from-sky-50 to-purple-50 rounded-xl">
              <Avatar alt={viewingUser.name} src={viewingUser.profilePicture} size="xl" status={viewingUser.enabled !== false ? 'online' : 'offline'} />
              <div className="flex-1">
                <div className="text-2xl font-bold text-slate-900">{viewingUser.name}</div>
                <div className="text-sm text-slate-500 mt-1">{viewingUser.title || 'No title set'}</div>
                <div className="flex items-center gap-3 mt-3">
                  <Badge variant={viewingUser.role === 'ADMIN' ? 'info' : 'default'}>{viewingUser.role || 'USER'}</Badge>
                  <Badge variant={viewingUser.enabled !== false ? 'success' : 'error'}>{viewingUser.enabled !== false ? 'Active' : 'Disabled'}</Badge>
                  {viewingUser.locked && <Badge variant="error">Locked</Badge>}
                </div>
              </div>
              <div className="flex gap-2">
                <AdvancedButton variant="ghost" size="sm" icon={<Edit size={16} />} onClick={() => { setViewingUser(null); handleEditUser(viewingUser); }}>
                  Edit
                </AdvancedButton>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <Mail size={16} className="text-slate-400" />
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase">Email</div>
                  <div className="text-sm text-slate-900">{viewingUser.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <Phone size={16} className="text-slate-400" />
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase">Phone</div>
                  <div className="text-sm text-slate-900">{viewingUser.phoneNumber || 'Not set'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <MapPin size={16} className="text-slate-400" />
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase">Location</div>
                  <div className="text-sm text-slate-900">{viewingUser.location || 'Not set'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <Calendar size={16} className="text-slate-400" />
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase">Joined</div>
                  <div className="text-sm text-slate-900">{viewingUser.createdAt ? new Date(viewingUser.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <DollarSign size={16} className="text-slate-400" />
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase">Budget</div>
                  <div className="text-sm text-slate-900">{viewingUser.budget ? `$${viewingUser.budget}` : 'Not set'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <Globe size={16} className="text-slate-400" />
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase">Travel Style</div>
                  <div className="text-sm text-slate-900">{viewingUser.travelStyle || 'Not set'}</div>
                </div>
              </div>
            </div>

            {/* Bio */}
            {viewingUser.bio && (
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="text-xs text-slate-400 font-bold uppercase mb-2">Bio</div>
                <p className="text-sm text-slate-700 leading-relaxed">{viewingUser.bio}</p>
              </div>
            )}

            {/* Interests */}
            {viewingUser.interests && viewingUser.interests.length > 0 && (
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="text-xs text-slate-400 font-bold uppercase mb-2">Interests</div>
                <div className="flex flex-wrap gap-2">
                  {viewingUser.interests.map((interest, i) => (
                    <Badge key={i} variant="info" size="sm">{interest}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <AdvancedButton 
                variant={viewingUser.enabled !== false ? 'secondary' : 'primary'} 
                size="sm" 
                icon={viewingUser.enabled !== false ? <UserX size={16} /> : <UserCheck size={16} />}
                onClick={() => { handleToggleUserStatus(viewingUser.id!, 'enabled', viewingUser.enabled !== false); setViewingUser({...viewingUser, enabled: viewingUser.enabled === false}); }}
              >
                {viewingUser.enabled !== false ? 'Disable Account' : 'Enable Account'}
              </AdvancedButton>
              <AdvancedButton 
                variant="danger" 
                size="sm" 
                icon={<Trash2 size={16} />}
                onClick={() => { setViewingUser(null); setDeletingUser(viewingUser); }}
              >
                Delete User
              </AdvancedButton>
            </div>
          </div>
        )}
      </Modal>

      {/* ─── Add User Modal ──────────────────────────────────────────────── */}
      <Modal isOpen={showAddUser} onClose={() => setShowAddUser(false)} title="Create New User">
        <div className="space-y-5">
          <div className="p-4 bg-sky-50 rounded-xl flex items-start gap-3">
            <Info size={18} className="text-sky-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-sky-800">New user will receive a welcome email with their credentials. They can change their password after first login.</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name *</label>
            <input type="text" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-sky-500/20" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address *</label>
            <input type="email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-sky-500/20" placeholder="john@example.com" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password *</label>
            <input type="password" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-sky-500/20" placeholder="Minimum 6 characters" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Role</label>
            <select value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})} className="w-full p-4 bg-slate-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-sky-500/20">
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
              <option value="CONTENT_MANAGER">Content Manager</option>
              <option value="SUPPORT">Support</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <AdvancedButton variant="ghost" size="sm" onClick={() => setShowAddUser(false)}>Cancel</AdvancedButton>
            <AdvancedButton variant="primary" size="sm" icon={<UserPlus size={16} />} onClick={handleCreateUser} disabled={isCreatingUser}>
              {isCreatingUser ? 'Creating...' : 'Create User'}
            </AdvancedButton>
          </div>
        </div>
      </Modal>

      {/* ─── Edit User Modal ─────────────────────────────────────────────── */}
      <Modal isOpen={!!editingUser} onClose={() => setEditingUser(null)} title="Edit User">
        {editingUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <Avatar alt={editingUser.name} src={editingUser.profilePicture} size="lg" />
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

      {/* ─── Bulk Delete Confirmation Modal ──────────────────────────────── */}
      <Modal isOpen={showBulkDelete} onClose={() => setShowBulkDelete(false)} title="Bulk Delete Users">
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-red-50 rounded-xl">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="font-bold text-red-900">Delete {selectedUsers.size} users?</p>
              <p className="text-sm text-red-700">
                This will permanently delete all selected users. This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <AdvancedButton variant="ghost" size="sm" onClick={() => setShowBulkDelete(false)}>Cancel</AdvancedButton>
            <AdvancedButton 
              variant="primary" 
              size="sm" 
              icon={<Trash2 size={16} />} 
              onClick={handleBulkDelete} 
              disabled={isBulkDeleting}
              className="!bg-red-600 hover:!bg-red-700"
            >
              {isBulkDeleting ? 'Deleting...' : `Delete ${selectedUsers.size} Users`}
            </AdvancedButton>
          </div>
        </div>
      </Modal>

      {/* ─── Delete Page Confirmation Modal ──────────────────────────────── */}
      <Modal isOpen={!!confirmDeletePage} onClose={() => setConfirmDeletePage(null)} title="Delete Page">
        {confirmDeletePage && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-red-50 rounded-xl">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="font-bold text-red-900">Delete this page?</p>
                <p className="text-sm text-red-700">
                  You are about to permanently delete <strong>{confirmDeletePage.title}</strong> (/{confirmDeletePage.slug}). All content blocks will be lost.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <AdvancedButton variant="ghost" size="sm" onClick={() => setConfirmDeletePage(null)}>Cancel</AdvancedButton>
              <AdvancedButton 
                variant="primary" 
                size="sm" 
                icon={<Trash2 size={16} />} 
                onClick={handleConfirmDeletePage} 
                disabled={isDeletingPage}
                className="!bg-red-600 hover:!bg-red-700"
              >
                {isDeletingPage ? 'Deleting...' : 'Delete Page'}
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
            {/* Preview */}
            {editingMedia.url && editingMedia.type === 'Image' && (
              <div className="aspect-video rounded-xl overflow-hidden bg-slate-100">
                <img src={editingMedia.url} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
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
