import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ArrowRight, User, Eye, EyeOff, ShieldCheck, MapPin, AlertCircle } from 'lucide-react';
import { InputField, Logo } from '../components/SharedUI';
import { LOGIN_IMAGES } from '../assets/images';
import { loginUser, type AuthResponse } from '../services/api';

const LOGIN_SLIDES = [
  {
    id: 1,
    image: LOGIN_IMAGES.EVEREST,
    title: 'Mountain Intelligence',
    location: 'Solukhumbu, Nepal',
    description: 'Sync with real-time Himalayan data for your next extreme expedition.'
  },
  {
    id: 2,
    image: LOGIN_IMAGES.POKHARA,
    title: 'Lakeside Serenity',
    location: 'Pokhara, Nepal',
    description: 'Discover peaceful retreats curated by our adaptive AI guide.'
  },
  {
    id: 3,
    image: LOGIN_IMAGES.BOUDHANATH,
    title: 'Heritage Sync',
    location: 'Kathmandu Valley',
    description: 'Access encrypted history and cultural guides at every heritage site.'
  }
];

const DecodingHeader = ({ text, className }: { text: string; className?: string }) => {
  const elementRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const chars = text.split('');
    el.innerHTML = chars
      .map(
        (char) =>
          `<span class="char inline-block whitespace-pre opacity-0 blur-md translate-y-2 select-none" style="will-change: transform, filter, opacity;">${char === ' ' ? '&nbsp;' : char}</span>`
      )
      .join('');

    const charElements = el.querySelectorAll('.char');
    const scrambleSet = 'X@#%&0123456789ABCDEF!$*?/';

    const tl = gsap.timeline();
    tl.to(charElements, {
      duration: 0.6,
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      stagger: 0.02,
      ease: 'power2.out'
    });

    tl.to(
      charElements,
      {
        duration: 1,
        stagger: 0.03,
        onUpdate: function () {
          const progress = this.progress();
          charElements.forEach((charEl, i) => {
            const threshold = i / chars.length;
            if (progress < threshold) {
              if (chars[i] !== ' ') {
                charEl.textContent = scrambleSet[Math.floor(Math.random() * scrambleSet.length)];
                charEl.className = 'char inline-block whitespace-pre opacity-100 text-sky-400 blur-[1px]';
              }
            } else {
              charEl.innerHTML = chars[i] === ' ' ? '&nbsp;' : chars[i];
              charEl.className = 'char inline-block whitespace-pre opacity-100 text-slate-900 blur-0 transition-colors duration-300';
            }
          });
        }
      },
      '-=0.4'
    );

    return () => {
      tl.kill();
    };
  }, [text]);

  return <h1 ref={elementRef} className={className} aria-label={text}></h1>;
};

const LoginPage = ({ onLogin, onNavigate }: { onLogin: (auth: AuthResponse) => void; onNavigate: (page: string) => void }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % LOGIN_SLIDES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    gsap.fromTo('.login-card', { opacity: 0, y: 60, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 1.4, ease: 'expo.out' });
    gsap.fromTo('.form-element', { x: -20, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.08, duration: 0.8, ease: 'power4.out', delay: 0.6 });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      setError('Credentials verification required.');
      gsap.to(formRef.current, { x: -6, duration: 0.08, repeat: 4, yoyo: true });
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // Demo Mode: Allow login without backend for development
      const isDemoUser = email.trim() === 'demo@exploremate.app' && password === 'Password@123';
      const isAdminUser = email.trim() === 'admin@exploremate.app' && password === 'Password@123';

      if (isDemoUser || isAdminUser) {
        // Simulate successful login with mock data
        const mockAuth = {
          token: 'demo-token-' + Date.now(),
          userId: isDemoUser ? 1 : 2,
          name: isDemoUser ? 'Demo User' : 'Admin',
          email: email.trim(),
          role: isAdminUser ? 'ADMIN' : 'USER'
        };

        // Store in localStorage
        localStorage.setItem('auth_token', mockAuth.token);
        localStorage.setItem('auth_user', JSON.stringify({
          id: mockAuth.userId,
          name: mockAuth.name,
          email: mockAuth.email,
          role: mockAuth.role
        }));

        // Simulate network delay for realistic feel
        await new Promise(resolve => setTimeout(resolve, 800));

        onLogin(mockAuth);
        return;
      }

      // Try real backend login for other credentials
      const auth = await loginUser({ email: email.trim(), password });
      onLogin(auth);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to sign in. Try demo credentials.';
      setError(message);
      gsap.to(formRef.current, { x: -6, duration: 0.08, repeat: 4, yoyo: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center px-4 py-10 sm:py-12 md:p-12 lg:p-20 bg-[#f8fafc] overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[80vw] h-[80vw] bg-sky-100 rounded-full blur-[130px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[60vw] h-[60vw] bg-indigo-50 rounded-full blur-[130px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="login-card w-full max-w-[1200px] bg-white rounded-[2.25rem] sm:rounded-[3rem] md:rounded-[4.5rem] shadow-[0_60px_100px_-20px_rgba(0,0,0,0.12)] border border-white flex flex-col md:flex-row overflow-hidden relative z-10 min-h-[620px] sm:min-h-[680px]">
        <div className="w-full md:w-[45%] p-8 sm:p-12 lg:p-20 flex flex-col justify-center bg-white relative">
          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className="form-element absolute top-8 left-8 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-sky-600 transition-colors"
          >
            Back to Home
          </button>
          <div className="mb-14">
            <div className="form-element inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 text-sky-600 font-bold text-[10px] uppercase tracking-[0.25em] mb-8 border border-sky-100/50">
              <ShieldCheck size={14} /> Secure Access Point
            </div>

            <DecodingHeader text="Welcome to ExploreMate" className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-slate-900 mb-6 leading-[1.05] tracking-tight min-h-[6rem] sm:min-h-[7rem]" />

            <p className="form-element text-slate-500 font-medium text-base max-w-sm leading-relaxed">
              Connect to our neural network for high-fidelity Himalayan travel coordination.
            </p>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            <div className="form-element group">
              <InputField
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<User size={18} className="group-hover:text-sky-500 transition-colors" />}
                required
              />
            </div>

            <div className="form-element group">
              <InputField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:text-sky-600 transition-colors focus:outline-none">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
                required
              />
            </div>

            {error && (
              <div className="form-element p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold animate-in slide-in-from-top-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="form-element w-full h-16 bg-slate-950 text-white rounded-2xl font-bold tracking-widest hover:bg-slate-800 transition-all duration-500 shadow-2xl flex items-center justify-center gap-3 group active:scale-[0.98] overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>

              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span className="text-sm uppercase tracking-wider">Synchronizing...</span>
                </div>
              ) : (
                <>
                  <span className="uppercase text-xs tracking-[0.3em]">Sign In</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
                </>
              )}
            </button>

            {/* Demo Credentials Section */}
            <div className="form-element mt-8 p-6 glass-card rounded-2xl border border-sky-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-gradient-to-r from-sky-500 to-purple-600 rounded-full animate-pulse"></div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Quick Access</h3>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('demo@exploremate.app');
                    setPassword('Password@123');
                  }}
                  className="w-full p-4 bg-gradient-to-r from-sky-50 to-purple-50 hover:from-sky-100 hover:to-purple-100 rounded-xl text-left transition-all border border-sky-100 hover:border-sky-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-sky-600 mb-1">Demo User</div>
                      <div className="text-[10px] text-slate-500 font-medium">demo@exploremate.app</div>
                    </div>
                    <div className="text-xs text-slate-400 group-hover:text-sky-600 transition-colors">Click to fill</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@exploremate.app');
                    setPassword('Password@123');
                  }}
                  className="w-full p-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-xl text-left transition-all border border-purple-100 hover:border-purple-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-purple-600 mb-1">Admin Access</div>
                      <div className="text-[10px] text-slate-500 font-medium">admin@exploremate.app</div>
                    </div>
                    <div className="text-xs text-slate-400 group-hover:text-purple-600 transition-colors">Click to fill</div>
                  </div>
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-[10px] text-slate-400 text-center mb-2">
                  Password: <span className="font-mono font-bold text-slate-600">Password@123</span>
                </p>
                <div className="flex items-center justify-center gap-2 text-[9px] text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                  <AlertCircle size={12} />
                  <span className="font-medium">Demo mode active - No backend required!</span>
                </div>
              </div>
            </div>

            <div className="form-element flex items-center justify-between text-[11px] font-bold pt-4 text-slate-400">
              <button type="button" onClick={() => onNavigate('signup')} className="hover:text-sky-600 transition-colors uppercase tracking-wider">
                Create Account
              </button>
              <button type="button" onClick={() => onNavigate('forgot-password')} className="hover:text-sky-600 transition-colors uppercase tracking-wider">
                Forgot Password
              </button>
            </div>
          </form>
        </div>

        <div className="hidden md:block w-[55%] relative bg-slate-950 overflow-hidden">
          {LOGIN_SLIDES.map((slide, index) => (
            <div key={slide.id} className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
              <img
                src={slide.image}
                alt={slide.title}
                className={`w-full h-full object-cover opacity-60 transition-transform duration-[15000ms] ease-linear ${index === currentSlide ? 'scale-110 translate-x-4' : 'scale-100'}`}
                onError={(e) => {
                  e.currentTarget.classList.add('hidden');
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
            </div>
          ))}

          <div className="absolute bottom-0 left-0 w-full p-16 lg:p-24 z-20">
            {LOGIN_SLIDES.map(
              (slide, index) =>
                index === currentSlide && (
                  <div key={slide.id} className="animate-in fade-in slide-in-from-bottom-12 duration-1200">
                    <div className="flex items-center gap-2 text-sky-400 font-bold uppercase tracking-[0.4em] text-[10px] mb-6">
                      <MapPin size={16} /> {slide.location}
                    </div>
                    <h2 className="text-4xl lg:text-6xl font-display font-bold text-white mb-6 leading-[1.1] tracking-tight">{slide.title}</h2>
                    <p className="text-slate-300 text-lg lg:text-xl max-w-md leading-relaxed opacity-80 font-medium">{slide.description}</p>
                  </div>
                )
            )}

            <div className="flex gap-3 mt-14">
              {LOGIN_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-1 rounded-full transition-all duration-700 ${i === currentSlide ? 'w-16 bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'w-4 bg-white/20 hover:bg-white/40'}`}
                />
              ))}
            </div>
          </div>

          <div className="absolute top-12 right-12 z-20">
            <div className="bg-white/10 backdrop-blur-2xl p-4 rounded-3xl border border-white/20 shadow-2xl">
              <Logo variant="white" className="w-12 h-12 opacity-90" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
