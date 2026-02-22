import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ArrowRight, ArrowLeft, User, Mail, ShieldCheck, Check, Globe, Smartphone, Sparkles } from 'lucide-react';
import { InputField } from '../components/SharedUI';
import { SIGNUP_IMAGES } from '../assets/images';
import { registerUser, type AuthResponse } from '../services/api';

const SIGNUP_STEPS = [
  { id: 1, title: 'Create Your Account', desc: 'Set up your profile to personalize your trips.', image: SIGNUP_IMAGES.BHAKTAPUR },
  { id: 2, title: 'Travel Preferences', desc: 'Choose what inspires you so we can tailor recommendations.', image: SIGNUP_IMAGES.ANNAPURNA },
  { id: 3, title: 'Review & Secure', desc: 'Confirm your details and secure your account.', image: SIGNUP_IMAGES.CHITWAN }
];

const SignupPage = ({ onSignup, onNavigate }: { onSignup: (auth: AuthResponse) => void; onNavigate: (page: string) => void }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const [error, setError] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo('.signup-card', { opacity: 0, y: 40, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'expo.out' });
  }, []);

  const moveToNextStep = () => {
    gsap.to('.step-content', {
      x: -20,
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        setStep((s) => s + 1);
        gsap.fromTo('.step-content', { x: 20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4 });
      }
    });
  };

  const handleNext = async () => {
    if (step < 3) {
      if (step === 1 && (!formData.name.trim() || !formData.email.trim())) {
        setError('Name and email are required to continue.');
        return;
      }
      setError('');
      moveToNextStep();
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const auth = await registerUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password
      });
      onSignup(auth);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to create account.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="w-full min-h-screen flex items-center justify-center px-4 py-10 sm:py-12 md:p-12 bg-[#f8fafc] overflow-hidden font-sans relative">
      <div className="absolute top-[-10%] right-[-5%] w-[70vw] h-[70vw] bg-sky-50 rounded-full blur-[140px] opacity-40"></div>

      <div className="signup-card w-full max-w-[1100px] bg-white rounded-[2.25rem] sm:rounded-[3rem] md:rounded-[4rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border border-white flex flex-col md:flex-row overflow-hidden relative z-10 min-h-[600px] sm:min-h-[650px]">
        <div className="w-full md:w-[50%] p-8 sm:p-12 lg:p-20 flex flex-col justify-center bg-white relative">
          <button
            onClick={() => (step > 1 ? setStep((s) => s - 1) : onNavigate('login'))}
            className="absolute top-10 left-10 p-3 rounded-full hover:bg-slate-50 text-slate-400 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={24} />
          </button>
          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className="absolute top-12 right-10 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-sky-600 transition-colors"
          >
            Back to Home
          </button>

          <div className="max-w-md mx-auto w-full">
            <div className="mb-10 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all duration-700 ${i <= step ? 'w-12 bg-sky-600' : 'w-4 bg-slate-100'}`} />
                ))}
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-slate-900 mb-3">{SIGNUP_STEPS[step - 1].title}</h1>
              <p className="text-slate-500 font-medium text-sm md:text-base leading-relaxed">{SIGNUP_STEPS[step - 1].desc}</p>
            </div>

            <div className="step-content space-y-6">
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <InputField
                    label="Legal Full Name"
                    placeholder="Tenzing Norgay"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    icon={<User size={18} />}
                  />
                  <InputField
                    label="Contact Sync Email"
                    type="email"
                    placeholder="explorer@nexus.ai"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    icon={<Mail size={18} />}
                  />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
                  <label className="block text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">Expedition Mode</label>
                  <div className="grid grid-cols-2 gap-4">
                    {['Cultural', 'Heritage', 'Extreme', 'Leisure'].map((lvl) => {
                      const selected = selectedModes.includes(lvl);
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setSelectedModes((prev) => (selected ? prev.filter((item) => item !== lvl) : [...prev, lvl]))}
                          className={`p-5 rounded-2xl border-2 text-sm font-bold transition-all text-center flex flex-col items-center gap-2 group ${
                            selected ? 'border-sky-500 text-sky-600 bg-sky-50' : 'border-slate-100 text-slate-600 hover:border-sky-500 hover:text-sky-600 hover:bg-sky-50'
                          }`}
                        >
                          <Sparkles size={16} className={selected ? 'text-sky-500' : 'text-slate-300 group-hover:text-sky-500'} />
                          {lvl}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <div className="p-8 bg-sky-50 rounded-[2rem] border border-sky-100 text-center">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-sky-100">
                      <ShieldCheck className="text-sky-600" size={40} />
                    </div>
                    <p className="text-sky-900 font-bold text-lg mb-1">Integrity Check Complete</p>
                    <p className="text-sky-600/70 text-sm">Your profile hash is ready for local sync.</p>
                  </div>
                  <InputField
                    label="Password"
                    type="password"
                    placeholder="********"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    icon={<ShieldCheck size={18} />}
                  />
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold">
                  {error}
                </div>
              )}

              <button
                onClick={handleNext}
                disabled={isLoading}
                className="w-full h-16 bg-slate-950 text-white rounded-2xl font-bold tracking-widest hover:bg-slate-800 transition-all duration-300 shadow-xl flex items-center justify-center gap-3 group mt-10 active:scale-[0.98]"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="uppercase text-xs tracking-widest">{step === 3 ? 'Create Account' : 'Next'}</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="hidden md:block w-[50%] relative bg-slate-950 overflow-hidden">
          <img
            src={SIGNUP_STEPS[step - 1].image}
            alt="Onboarding Background"
            className="w-full h-full object-cover transition-all duration-1000 scale-105 opacity-80"
            onError={(e) => {
              e.currentTarget.classList.add('hidden');
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-l from-slate-950/40 via-transparent to-transparent"></div>

          <div className="absolute top-12 right-12 flex gap-4">
            <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 text-white shadow-2xl">
              <Globe size={24} />
            </div>
            <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 text-white shadow-2xl">
              <Smartphone size={24} />
            </div>
          </div>

          <div className="absolute bottom-16 left-16 right-16 text-white">
            <div className="flex items-center gap-2 text-sky-400 font-bold uppercase tracking-[0.3em] text-[10px] mb-4">
              <Check size={14} className="bg-sky-400 text-slate-950 rounded-full p-0.5" /> Site Verified
            </div>
            <h3 className="text-4xl font-display font-bold mb-4 leading-tight">Authentic Exploration</h3>
            <p className="text-slate-300 text-base font-medium opacity-80 leading-relaxed max-w-sm">
              Access localized intelligence from your current node: {SIGNUP_STEPS[step - 1].title}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
