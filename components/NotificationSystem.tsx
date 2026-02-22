import React, { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Bell, BellOff } from 'lucide-react';
import { useApp, type Notification } from '../context/AppContext';

// Toast notification component
const Toast = ({ 
  notification, 
  onClose 
}: { 
  notification: Notification; 
  onClose: () => void;
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const toastRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!toastRef.current) return;

    // Entrance animation
    gsap.fromTo(toastRef.current, 
      { x: 100, opacity: 0, scale: 0.9 },
      { x: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.7)' }
    );

    // Auto-exit after duration
    if (notification.duration) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        gsap.to(toastRef.current, {
          x: 100,
          opacity: 0,
          duration: 0.3,
          onComplete: onClose
        });
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification.duration, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    gsap.to(toastRef.current, {
      x: 100,
      opacity: 0,
      duration: 0.3,
      onComplete: onClose
    });
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-sky-500" />
  };

  const colors = {
    success: 'border-emerald-200 bg-emerald-50',
    error: 'border-red-200 bg-red-50',
    warning: 'border-amber-200 bg-amber-50',
    info: 'border-sky-200 bg-sky-50'
  };

  return (
    <div 
      ref={toastRef}
      className={`
        flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm
        ${colors[notification.type]}
        transform transition-all
      `}
    >
      {icons[notification.type]}
      <p className="flex-1 text-sm font-medium text-slate-700">{notification.message}</p>
      <button 
        onClick={handleClose}
        className="p-1 hover:bg-slate-200/50 rounded-lg transition-colors"
      >
        <X className="w-4 h-4 text-slate-500" />
      </button>
    </div>
  );
};

// Notification container
export const NotificationContainer = () => {
  const { state, removeNotification } = useApp();
  const notifications = state.ui.notifications;

  return (
    <div className="fixed top-20 right-4 z-[1000] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <Toast 
            notification={notification} 
            onClose={() => removeNotification(notification.id)} 
          />
        </div>
      ))}
    </div>
  );
};

// Notification bell with badge
export const NotificationBell = ({ 
  count = 0,
  onClick 
}: { 
  count?: number;
  onClick?: () => void;
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (count > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [count]);

  return (
    <button 
      onClick={onClick}
      className={`
        relative p-2 rounded-xl transition-all
        hover:bg-slate-100 active:scale-95
        ${isAnimating ? 'animate-bounce' : ''}
      `}
    >
      {count > 0 ? (
        <Bell className="w-5 h-5 text-slate-600" />
      ) : (
        <BellOff className="w-5 h-5 text-slate-400" />
      )}
      {count > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
};

// Loading spinner with variants
export const LoadingSpinner = ({ 
  size = 'md',
  variant = 'primary',
  className = '' 
}: { 
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'white';
  className?: string;
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const variants = {
    primary: 'border-sky-500 border-t-transparent',
    secondary: 'border-slate-300 border-t-slate-600',
    white: 'border-white border-t-transparent'
  };

  return (
    <div 
      className={`
        ${sizes[size]} border-2 ${variants[variant]} rounded-full 
        animate-spin ${className}
      `}
    />
  );
};

// Skeleton loader
export const Skeleton = ({ 
  className = '',
  variant = 'text'
}: { 
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}) => {
  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  };

  return (
    <div 
      className={`
        animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200
        bg-[length:200%_100%] animate-shimmer
        ${variants[variant]} ${className}
      `}
    />
  );
};

// Advanced button with loading state
export const AdvancedButton = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  className = ''
}: {
  children?: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const variants = {
    primary: 'bg-gradient-to-r from-sky-600 to-purple-600 text-white hover:shadow-lg hover:shadow-sky-500/25',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    outline: 'border-2 border-sky-500 text-sky-600 hover:bg-sky-50',
    ghost: 'text-slate-600 hover:bg-slate-100',
    danger: 'bg-red-500 text-white hover:bg-red-600'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-8 py-3.5 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      className={`
        inline-flex items-center justify-center gap-2 font-bold rounded-2xl
        transition-all duration-200
        ${variants[variant]} ${sizes[size]}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
        ${isPressed ? 'scale-95' : ''}
        ${className}
      `}
    >
      {loading ? (
        <LoadingSpinner size="sm" variant={variant === 'primary' || variant === 'danger' ? 'white' : 'primary'} />
      ) : icon}
      {children}
    </button>
  );
};

// Card with hover effects
export const AdvancedCard = ({
  children,
  className = '',
  hover = true,
  glow = false,
  onClick
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
}) => {
  return (
    <div 
      onClick={onClick}
      className={`
        bg-white rounded-3xl shadow-sm border border-slate-100
        transition-all duration-300
        ${hover ? 'hover:shadow-xl hover:-translate-y-1 hover:border-sky-200' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${on}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

// Avatar with status
export const Avatar = ({
  src,
  alt,
  size = 'md',
  status,
  className = ''
}: {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away' | 'busy';
  className?: string;
}) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  };

  const statusColors = {
    online: 'bg-emerald-500',
    offline: 'bg-slate-400',
    away: 'bg-amber-500',
    busy: 'bg-red-500'
  };

  const statusSizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4'
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div className={`
        ${sizes[size]} rounded-full overflow-hidden bg-gradient-to-br from-sky-500 to-purple-500
        flex items-center justify-center text-white font-bold
      `}>
        {src ? (
          <img src={src} alt={alt || ''} className="w-full h-full object-cover" />
        ) : (
          <span className={size === 'xl' ? 'text-2xl' : 'text-sm'}>{alt?.[0]?.toUpperCase() || '?'}</span>
        )}
      </div>
      {status && (
        <span className={`
          absolute bottom-0 right-0 ${statusSizes[size]} ${statusColors[status]}
          rounded-full border-2 border-white
        `} />
      )}
    </div>
  );
};

// Badge/Chip component
export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-sky-100 text-sky-700'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  return (
    <span className={`
      inline-flex items-center font-semibold rounded-full
      ${variants[variant]} ${sizes[size]} ${className}
    `}>
      {children}
    </span>
  );
};

// Progress bar with animation
export const ProgressBar = ({
  value = 0,
  max = 100,
  variant = 'primary',
  showLabel = false,
  className = ''
}: {
  value?: number;
  max?: number;
  variant?: 'primary' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  className?: string;
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const variants = {
    primary: 'bg-gradient-to-r from-sky-500 to-purple-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500'
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between mb-1 text-sm font-medium">
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${variants[variant]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Tabs component
export const Tabs = ({
  tabs,
  activeTab,
  onChange,
  className = ''
}: {
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}) => {
  return (
    <div className={`flex gap-1 p-1 bg-slate-100 rounded-2xl ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all
            ${activeTab === tab.id 
              ? 'bg-white text-sky-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
            }
          `}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
};

// Modal component
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) => {
  const modalRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      gsap.fromTo(modalRef.current,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div 
        ref={modalRef}
        className={`relative w-full ${sizes[size]} bg-white rounded-3xl shadow-2xl overflow-hidden`}
      >
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// Tooltip component
export const Tooltip = ({
  content,
  children,
  position = 'top'
}: {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`
          absolute z-50 px-3 py-1.5 bg-slate-900 text-white text-sm 
          rounded-lg whitespace-nowrap pointer-events-none
          ${positions[position]}
          animate-fade-in
        `}>
          {content}
        </div>
      )}
    </div>
  );
};

export default {
  NotificationContainer,
  NotificationBell,
  LoadingSpinner,
  Skeleton,
  AdvancedButton,
  AdvancedCard,
  Avatar,
  Badge,
  ProgressBar,
  Tabs,
  Modal,
  Tooltip
};
