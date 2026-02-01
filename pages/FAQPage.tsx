import React, { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { Navbar, Footer } from '../components/Navigation';

gsap.registerPlugin(ScrollTrigger);

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border-b border-slate-200 last:border-0 faq-fade-up">
      <button 
        className="w-full py-6 flex items-center justify-between text-left focus:outline-none group"
        onClick={onClick}
      >
        <span className={`text-lg font-bold transition-colors duration-300 ${isOpen ? 'text-sky-600' : 'text-slate-800 group-hover:text-sky-600'}`}>
          {question}
        </span>
        <div className={`p-2 rounded-full transition-all duration-300 ${isOpen ? 'bg-sky-100 text-sky-600 rotate-180' : 'bg-slate-50 text-slate-400 group-hover:bg-sky-50 group-hover:text-sky-500'}`}>
           <ChevronDown size={20} />
        </div>
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0'}`}
      >
        <p className="text-slate-600 leading-relaxed pr-8">
          {answer}
        </p>
      </div>
    </div>
  );
};

const FAQPage = ({ onNavigate, isLoggedIn }: { onNavigate: (page: string) => void, isLoggedIn?: boolean }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    const tl = gsap.timeline();

    // Modern Text Reveal
    tl.fromTo('.reveal-text-char', 
        { y: 50, opacity: 0, skewY: 10, rotateZ: 5 },
        { y: 0, opacity: 1, skewY: 0, rotateZ: 0, stagger: 0.02, duration: 1, ease: 'power4.out' }
    );

    gsap.utils.toArray('.faq-fade-up').forEach((elem: any) => {
      gsap.fromTo(elem, 
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.6, ease: 'power3.out',
          scrollTrigger: { trigger: elem, start: 'top 90%' }
        }
      );
    });
  }, []);

  const splitText = (text: string) => {
    return text.split('').map((char, index) => (
      <span key={index} className="reveal-text-char inline-block whitespace-pre origin-bottom will-change-transform">
        {char}
      </span>
    ));
  };

  const faqs = [
    {
      question: "How does the AI itinerary planner work?",
      answer: "Our AI analyzes millions of data points including weather, local events, crowd levels, and your personal preferences to create a custom day-by-day plan. It constantly learns from user feedback to refine its recommendations."
    },
    {
      question: "Is ExploreMate free to use?",
      answer: "Yes, our basic features including the AI itinerary planner (limited daily usage) and standard destination guides are free. We offer a Premium subscription for unlimited AI planning, offline maps, and exclusive local deals."
    },
    {
      question: "Can I use the app offline?",
      answer: "Premium users can download itineraries, maps, and translation packs for offline use. This is perfect for remote destinations like the Himalayas where internet access might be limited."
    },
    {
      question: "How do I cancel my subscription?",
      answer: "You can cancel your subscription at any time through your Profile settings. Your premium benefits will continue until the end of the current billing cycle."
    },
    {
      question: "Are the route optimizations real-time?",
      answer: "Yes! Our Route Optimizer integrates with real-time traffic data and public transport schedules to ensure you take the most efficient path, saving you time and money during your travels."
    },
    {
      question: "Can I collaborate with friends on a trip?",
      answer: "Absolutely. Our 'Group Plan' feature allows you to invite friends to your itinerary. Everyone can suggest stops, vote on activities, and split expenses directly within the app."
    }
  ];

  return (
    <div className="w-full relative">
       <Navbar onNavigate={onNavigate} isLoggedIn={isLoggedIn} />

       {/* FAQ Hero */}
       <section className="relative pt-40 pb-16 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 text-center">
             <div className="faq-fade-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100 text-sky-700 font-bold text-xs uppercase tracking-wider border border-sky-200 mb-6">
                <HelpCircle size={14} /> Help Center
             </div>
             <h1 className="faq-fade-up text-5xl md:text-6xl font-display font-bold text-slate-900 mb-6 overflow-hidden">
               {splitText("Frequently Asked Questions")}
             </h1>
             <p className="faq-fade-up text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
               Have questions? We're here to help. Find answers to the most common questions about ExploreMate features, pricing, and travel tools.
             </p>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-purple-200/20 filter blur-[100px] rounded-full -z-10"></div>
       </section>

       {/* FAQ List */}
       <section className="py-12 pb-24">
         <div className="max-w-3xl mx-auto px-4 md:px-8">
           <div className="glass-card rounded-[2rem] p-6 md:p-10 shadow-xl border-white/60">
             {faqs.map((faq, index) => (
               <FAQItem 
                 key={index}
                 question={faq.question}
                 answer={faq.answer}
                 isOpen={openIndex === index}
                 onClick={() => setOpenIndex(openIndex === index ? null : index)}
               />
             ))}
           </div>

           <div className="mt-12 text-center faq-fade-up">
             <p className="text-slate-500 mb-4">Still have questions?</p>
             <button onClick={() => onNavigate('about')} className="px-8 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:border-sky-300 hover:text-sky-600 transition-all shadow-sm">
               Contact Support
             </button>
           </div>
         </div>
       </section>

       <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default FAQPage;