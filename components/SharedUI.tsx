import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  error?: string;
}

export const InputField: React.FC<InputFieldProps> = ({ label, icon, error, className, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`group relative mb-6`}>
      <label 
        className={`block text-[0.7rem] font-bold uppercase tracking-[0.25em] mb-2 transition-colors duration-300 ${
          isFocused ? 'text-sky-600' : 'text-slate-400'
        }`}
      >
        {label}
      </label>
      <div className="relative">
        <input
          {...props}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className={`
            w-full px-5 py-4 bg-white/70 border-2 rounded-2xl text-sm sm:text-base text-slate-900 placeholder-slate-400 outline-none transition-all duration-300 font-medium backdrop-blur
            ${error 
              ? 'border-red-400 bg-red-50/80' 
              : isFocused 
                ? 'border-sky-500 bg-white shadow-[0_18px_40px_-18px_rgba(14,165,233,0.35)] ring-2 ring-sky-200/60' 
                : 'border-slate-200 hover:border-sky-300 hover:bg-white'
            }
            ${className}
          `}
        />
        {icon && (
          <div className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${isFocused ? 'text-sky-500' : 'text-slate-400'}`}>
            {icon}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500 font-medium animate-pulse">{error}</p>}
    </div>
  );
};

export const GlobalAestheticBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-sunset-50"></div>
    <div
      className="absolute inset-0 opacity-[0.28]"
      style={{
        backgroundImage:
          "radial-gradient(600px 300px at 10% 10%, rgba(14,165,233,0.18), transparent 60%), radial-gradient(700px 350px at 90% 20%, rgba(248,113,113,0.16), transparent 60%), radial-gradient(500px 400px at 50% 90%, rgba(251,146,60,0.12), transparent 60%)"
      }}
    ></div>
    <div
      className="absolute inset-0 opacity-[0.25] mix-blend-multiply"
      style={{
        backgroundImage:
          "linear-gradient(120deg, rgba(15,23,42,0.03) 0%, rgba(15,23,42,0.02) 40%, rgba(15,23,42,0.05) 100%)"
      }}
    ></div>
    <div className="absolute top-[-10%] left-[-5%] w-[60vw] h-[60vw] bg-sky-200/35 rounded-full mix-blend-multiply filter blur-[120px] animate-pulse" style={{ animationDuration: '10s' }}></div>
    <div className="absolute bottom-[-20%] right-[-10%] w-[55vw] h-[55vw] bg-sunset-300/30 rounded-full mix-blend-multiply filter blur-[120px] animate-pulse" style={{ animationDuration: '14s', animationDelay: '1.2s' }}></div>
    <div className="absolute top-[35%] right-[25%] w-[22vw] h-[22vw] bg-white/70 rounded-full mix-blend-overlay filter blur-[70px]"></div>
  </div>
);

export const Logo = ({ className = "w-12 h-12", variant = "default" }: { className?: string, variant?: "default" | "white" }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={variant === "white" ? "#fff" : "#0ea5e9"} />
          <stop offset="100%" stopColor={variant === "white" ? "#e0f2fe" : "#0369a1"} />
        </linearGradient>
        <clipPath id="circleClip">
          <circle cx="50" cy="50" r="48" />
        </clipPath>
      </defs>
      
      {/* Background Circle */}
      <circle cx="50" cy="50" r="48" fill={variant === "white" ? "rgba(255,255,255,0.1)" : "url(#logoGrad)"} stroke={variant === "white" ? "white" : "#0284c7"} strokeWidth="2" />
      
      <g clipPath="url(#circleClip)">
        {/* Mountains */}
        <path d="M10 80 L40 30 L60 55 L80 25 L110 80 Z" fill={variant === "white" ? "white" : "rgba(255,255,255,0.3)"} opacity="0.6" />
        <path d="M-10 90 L30 40 L55 70 L85 35 L120 90 Z" fill={variant === "white" ? "white" : "rgba(255,255,255,0.5)"} opacity="0.8" />
        
        {/* Prayer Flags (Stylized Curve) */}
        <path d="M20 35 Q50 45 80 35" stroke={variant === "white" ? "white" : "rgba(255,255,255,0.8)"} strokeWidth="1.5" fill="none" />
        <rect x="25" y="36" width="6" height="8" fill={variant === "white" ? "white" : "#38bdf8"} transform="rotate(5 25 36)" opacity="0.9" />
        <rect x="40" y="40" width="6" height="8" fill={variant === "white" ? "white" : "#f59e0b"} transform="rotate(2 40 40)" opacity="0.9" />
        <rect x="55" y="40" width="6" height="8" fill={variant === "white" ? "white" : "#ef4444"} transform="rotate(-2 55 40)" opacity="0.9" />
        <rect x="70" y="36" width="6" height="8" fill={variant === "white" ? "white" : "#22c55e"} transform="rotate(-5 70 36)" opacity="0.9" />

        {/* Winding Path */}
        <path d="M50 100 Q60 85 45 75 T55 55" stroke={variant === "white" ? "white" : "#bae6fd"} strokeWidth="4" fill="none" opacity="0.4" />
        
        {/* Pagoda (Left side) */}
        <path d="M15 75 L25 75 L20 65 Z M17 68 L23 68 L20 60 Z" fill={variant === "white" ? "white" : "rgba(255,255,255,0.9)"} />
      </g>
      
      {/* Central Map Pin */}
      <path 
        d="M50 68 C50 68 38 56 38 46 C38 39.37 43.37 34 50 34 C56.63 34 62 39.37 62 46 C62 56 50 68 50 68Z" 
        fill={variant === "white" ? "white" : "#0284c7"} 
        stroke={variant === "white" ? "#0ea5e9" : "white"} 
        strokeWidth="2"
      />
      <circle cx="50" cy="46" r="4" fill={variant === "white" ? "#0ea5e9" : "white"} />
    </svg>
  );
};
