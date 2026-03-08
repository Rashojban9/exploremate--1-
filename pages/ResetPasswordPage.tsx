import { gsap } from 'gsap';
import { ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { InputField } from '../components/SharedUI';
import { resetPassword } from '../services/authService';

const ResetPasswordPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Get token from URL - use useState to handle SSR/client hydration
  const [token, setToken] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get('token'));
  }, []);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(containerRef.current,
      { opacity: 0, y: 30, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" }
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid reset token');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(token, password);
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 relative z-10">
        <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid Link</h2>
          <p className="text-slate-500 mb-6">This password reset link is invalid or has expired.</p>
          <button 
            onClick={() => onNavigate('login')}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative z-10">
       <button 
        onClick={() => onNavigate('login')}
        className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 text-slate-500 hover:text-sky-600 transition-colors font-bold z-50 bg-white/80 px-4 py-2 rounded-full backdrop-blur-md shadow-sm"
      >
        <ArrowLeft size={18} /> Back to Login
      </button>

      <div ref={containerRef} className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 md:p-12 relative overflow-hidden">
         {/* Success State */}
         {isSuccess ? (
             <div className="text-center py-8 animate-in fade-in zoom-in duration-500">
                 <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                     <CheckCircle2 size={40} />
                 </div>
                 <h2 className="text-2xl font-bold text-slate-900 mb-2">Password Reset!</h2>
                 <p className="text-slate-500 mb-8">
                     Your password has been successfully reset.
                 </p>
                 <button 
                    onClick={() => onNavigate('login')}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
                 >
                    Go to Login
                 </button>
             </div>
         ) : (
             <form onSubmit={handleSubmit}>
                 <div className="text-center mb-10">
                     <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
                         <Lock size={32} />
                     </div>
                     <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">Reset Password</h1>
                     <p className="text-slate-500 text-sm">
                         Enter your new password below.
                     </p>
                 </div>

                 <InputField 
                    label="New Password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter new password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                    icon={<Lock size={18} />}
                 />

                 <InputField 
                    label="Confirm Password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Confirm new password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required 
                    icon={<Lock size={18} />}
                 />

                 {error && (
                   <p className="text-red-500 text-sm mt-2">{error}</p>
                 )}

                 <button 
                    type="submit" 
                    disabled={isLoading} 
                    className={`w-full py-4 bg-sky-600 text-white rounded-2xl font-bold hover:bg-sky-700 transition-all shadow-lg shadow-sky-600/20 mt-6 ${isLoading ? 'opacity-90 cursor-not-allowed' : ''}`}
                 >
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                 </button>
             </form>
         )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
