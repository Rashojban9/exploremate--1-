import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ArrowLeft, Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import { InputField } from '../components/SharedUI';

const ForgotPasswordPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(containerRef.current,
      { opacity: 0, y: 30, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" }
    );
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!email) return;
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 1500);
  };

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
         {isSent ? (
             <div className="text-center py-8 animate-in fade-in zoom-in duration-500">
                 <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                     <CheckCircle2 size={40} />
                 </div>
                 <h2 className="text-2xl font-bold text-slate-900 mb-2">Check your inbox</h2>
                 <p className="text-slate-500 mb-8">
                     We've sent a password reset link to <br/> <span className="font-bold text-slate-700">{email}</span>
                 </p>
                 <button 
                    onClick={() => onNavigate('login')}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
                 >
                    Back to Login
                 </button>
             </div>
         ) : (
             <form onSubmit={handleSubmit}>
                 <div className="text-center mb-10">
                     <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
                         <Mail size={32} />
                     </div>
                     <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">Forgot Password?</h1>
                     <p className="text-slate-500 text-sm">
                         No worries! Enter your email address and we'll send you a link to reset your password.
                     </p>
                 </div>

                 <InputField 
                    label="Email Address" 
                    type="email" 
                    placeholder="name@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                    icon={<Mail size={18} />}
                 />

                 <button 
                    type="submit" 
                    disabled={isLoading} 
                    className={`w-full py-4 bg-sky-600 text-white rounded-2xl font-bold hover:bg-sky-700 transition-all shadow-lg shadow-sky-600/20 flex items-center justify-center gap-2 mt-6 ${isLoading ? 'opacity-90 cursor-not-allowed' : ''}`}
                 >
                    {isLoading ? 'Sending Link...' : 'Send Reset Link'}
                    {!isLoading && <ArrowRight size={20} />}
                 </button>
             </form>
         )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;