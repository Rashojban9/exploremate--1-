import React, { useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Particle System for advanced visual effects
export const ParticleField = ({ 
  count = 50, 
  className = "",
  color = "#0ea5e9",
  speed = 1
}: { 
  count?: number;
  className?: string;
  color?: string;
  speed?: number;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const particles = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const createParticles = () => {
      const container = containerRef.current;
      if (!container) return;
      
      for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'absolute w-1 h-1 rounded-full';
        particle.style.backgroundColor = color;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.opacity = `${Math.random() * 0.5 + 0.2}`;
        particle.style.transition = `all ${2 + Math.random() * 3}s ease-in-out`;
        
        container.appendChild(particle);
        particles.current.push(particle);

        // Animate particles
        setInterval(() => {
          particle.style.transform = `translate(${(Math.random() - 0.5) * 100}px, ${(Math.random() - 0.5) * 100}px)`;
          particle.style.opacity = `${Math.random() * 0.5 + 0.2}`;
        }, 3000 + Math.random() * 2000);
      }
    };

    createParticles();

    return () => {
      particles.current.forEach(p => p.remove());
      particles.current = [];
    };
  }, [count, color]);

  return <div ref={containerRef} className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} />;
};

// Mouse-following glow effect
export const MouseGlow = ({ className = "" }: { className?: string }) => {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!glowRef.current) return;
      gsap.to(glowRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.5,
        ease: 'power2.out'
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      ref={glowRef}
      className={`fixed w-96 h-96 bg-gradient-to-r from-sky-400/20 to-purple-400/20 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2 ${className}`}
      style={{ transform: 'translate(-50%, -50%)' }}
    />
  );
};

// Scroll-based parallax section
export const ParallaxSection = ({
  children,
  speed = 0.5,
  className = ""
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    gsap.to(section, {
      yPercent: speed * 100,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  }, [speed]);

  return (
    <div ref={sectionRef} className={className}>
      {children}
    </div>
  );
};

// Advanced animated counter
export const AnimatedCounter = ({
  end,
  duration = 2,
  suffix = "",
  prefix = ""
}: {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}) => {
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!countRef.current) return;

    const obj = { value: 0 };
    gsap.to(obj, {
      value: end,
      duration: duration,
      ease: 'power2.out',
      onUpdate: () => {
        if (countRef.current) {
          countRef.current.textContent = `${prefix}${Math.round(obj.value).toLocaleString()}${suffix}`;
        }
      }
    });
  }, [end, duration, prefix, suffix]);

  return <span ref={countRef} className="tabular-nums" />;
};

// Reveal animation wrapper
export const RevealOnScroll = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.8,
  threshold = 0.2
}: {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale';
  delay?: number;
  duration?: number;
  threshold?: number;
}) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const getInitialState = () => {
      switch (direction) {
        case 'up': return { y: 50, opacity: 0 };
        case 'down': return { y: -50, opacity: 0 };
        case 'left': return { x: 50, opacity: 0 };
        case 'right': return { x: -50, opacity: 0 };
        case 'scale': return { scale: 0.8, opacity: 0 };
        default: return { y: 50, opacity: 0 };
      }
    };

    gsap.set(element, getInitialState());

    gsap.to(element, {
      ...(direction === 'scale' 
        ? { scale: 1, opacity: 1 } 
        : { x: 0, y: 0, opacity: 1 }
      ),
      duration: duration,
      delay: delay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: element,
        start: `top ${100 - threshold * 100}`,
        toggleActions: 'play none none reverse'
      }
    });
  }, [direction, delay, duration, threshold]);

  return <div ref={elementRef}>{children}</div>;
};

// Staggered list animation
export const StaggeredList = ({
  children,
  stagger = 0.1,
  className = ""
}: {
  children: React.ReactNode[];
  stagger?: number;
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = container.children;
    gsap.fromTo(items, 
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: stagger,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: container,
          start: 'top 80%'
        }
      }
    );
  }, [stagger]);

  return <div ref={containerRef} className={className}>{children}</div>;
};

// Magnetic button effect
export const MagneticButton = ({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(button, {
        x: x * 0.3,
        y: y * 0.3,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    const handleMouseLeave = () => {
      gsap.to(button, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.5)'
      });
    };

    button.addEventListener('mousemove', handleMouseMove);
    button.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      button.removeEventListener('mousemove', handleMouseMove);
      button.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <button ref={buttonRef} className={className}>
      {children}
    </button>
  );
};

// Text reveal animation
export const TextReveal = ({
  text,
  className = "",
  as: Component = 'div'
}: {
  text: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}) => {
  const words = text.split(' ');

  return (
    <Component className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-2">
          <span className="inline-block animate-text-reveal" style={{ animationDelay: `${i * 0.05}s` }}>
            {word}
          </span>
        </span>
      ))}
    </Component>
  );
};

// Smooth scroll wrapper
export const SmoothScroll = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const html = document.documentElement;
    html.style.scrollBehavior = 'smooth';
    return () => {
      html.style.scrollBehavior = 'auto';
    };
  }, []);

  return <>{children}</>;
};

// Intersection observer hook
export const useInView = (threshold = 0.2) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = React.useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isInView };
};

// Progress scroll indicator
export const ScrollProgress = ({ className = "" }: { className?: string }) => {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!progressRef.current) return;
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      progressRef.current.style.width = `${progress}%`;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`fixed top-0 left-0 h-1 bg-gradient-to-r from-sky-500 to-purple-500 z-[1000] ${className}`}>
      <div ref={progressRef} className="h-full bg-gradient-to-r from-sky-400 to-purple-400 w-0 transition-all duration-100" />
    </div>
  );
};

// 3D Tilt card effect
export const TiltCard = ({
  children,
  className = "",
  perspective = 1000
}: {
  children: React.ReactNode;
  className?: string;
  perspective?: number;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / centerY * -10;
      const rotateY = (x - centerX) / centerX * 10;

      gsap.to(card, {
        rotateX,
        rotateY,
        duration: 0.5,
        ease: 'power2.out'
      });
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.5)'
      });
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div style={{ perspective }} className={className}>
      <div ref={cardRef} style={{ transformStyle: 'preserve-3d' }}>
        {children}
      </div>
    </div>
  );
};

// Wave background effect
export const WaveBackground = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <svg className="absolute bottom-0 w-full h-32 text-sky-100" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path fill="currentColor" fillOpacity="1" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
      </svg>
      <svg className="absolute bottom-0 w-full h-24 text-purple-100" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path fill="currentColor" fillOpacity="0.5" d="M0,256L48,245.3C96,235,192,213,288,192C384,171,480,149,576,165.3C672,181,768,235,864,234.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
      </svg>
    </div>
  );
};

// Typing effect
export const Typewriter = ({
  text,
  className = "",
  speed = 50,
  cursor = true
}: {
  text: string;
  className?: string;
  speed?: number;
  cursor?: boolean;
}) => {
  const [displayedText, setDisplayedText] = React.useState('');

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span className={className}>
      {displayedText}
      {cursor && <span className="animate-pulse">|</span>}
    </span>
  );
};

// Floating element
export const FloatingElement = ({
  children,
  className = "",
  floatDuration = 6,
  floatDistance = 20
}: {
  children: React.ReactNode;
  className?: string;
  floatDuration?: number;
  floatDistance?: number;
}) => {
  return (
    <div 
      className={`animate-float ${className}`}
      style={{ 
        animationDuration: `${floatDuration}s`,
        animationDelay: `${Math.random() * 2}s`
      }}
    >
      {children}
    </div>
  );
};

// Shimmer effect wrapper
export const ShimmerEffect = ({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer bg-[length:200%_100%]" />
      {children}
    </div>
  );
};

// Noise texture overlay
export const NoiseOverlay = ({ className = "" }: { className?: string }) => {
  return (
    <div 
      className={`absolute inset-0 pointer-events-none opacity-[0.03] ${className}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
      }}
    />
  );
};

// Glow border effect
export const GlowBorder = ({
  children,
  className = "",
  color = "sky"
}: {
  children: React.ReactNode;
  className?: string;
  color?: "sky" | "purple" | "sunset" | "emerald";
}) => {
  const colors = {
    sky: 'from-sky-400 to-sky-600',
    purple: 'from-purple-400 to-purple-600',
    sunset: 'from-orange-400 to-pink-500',
    emerald: 'from-emerald-400 to-teal-500'
  };

  return (
    <div className={`relative group ${className}`}>
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${colors[color]} rounded-2xl opacity-30 group-hover:opacity-100 blur transition-all duration-500 group-hover:blur-md`} />
      <div className="relative">
        {children}
      </div>
    </div>
  );
};

export default {
  ParticleField,
  MouseGlow,
  ParallaxSection,
  AnimatedCounter,
  RevealOnScroll,
  StaggeredList,
  MagneticButton,
  TextReveal,
  SmoothScroll,
  useInView,
  ScrollProgress,
  TiltCard,
  WaveBackground,
  Typewriter,
  FloatingElement,
  ShimmerEffect,
  NoiseOverlay,
  GlowBorder
};
