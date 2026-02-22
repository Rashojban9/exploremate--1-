import React, { useState } from 'react';
import { Navbar, Footer } from '../components/Navigation';
import { InputField } from '../components/SharedUI';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Globe, ArrowRight } from 'lucide-react';

const ContactPage = ({ onNavigate, isLoggedIn }: { onNavigate: (page: string) => void, isLoggedIn?: boolean }) => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const contactInfo = [
    { icon: Mail, label: 'Email', value: 'hello@exploremate.com', color: 'bg-sky-100 text-sky-600' },
    { icon: Phone, label: 'Phone', value: '+977 1-4567890', color: 'bg-emerald-100 text-emerald-600' },
    { icon: MapPin, label: 'Address', value: 'Thamel, Kathmandu, Nepal', color: 'bg-purple-100 text-purple-600' },
    { icon: Clock, label: 'Hours', value: 'Sun-Fri: 9AM - 6PM NPT', color: 'bg-orange-100 text-orange-600' },
  ];

  return (
    <div className="w-full relative bg-slate-50/50">
      <Navbar onNavigate={onNavigate} isLoggedIn={isLoggedIn} />

      {/* Hero */}
      <section className="relative pt-40 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-purple-50 to-pink-50"></div>
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100 text-sky-600 font-bold text-xs uppercase tracking-wider mb-6">
            <MessageSquare size={14} /> Get in Touch
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-slate-900 mb-6">Contact Us</h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">Have questions about your Nepal adventure? We're here to help you plan the perfect trip.</p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactInfo.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mb-4`}>
                  <item.icon size={22} />
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{item.label}</h3>
                <p className="text-slate-500 text-sm">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Contact Form + Map */}
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100">
              <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Send us a Message</h2>
              <p className="text-slate-500 mb-8">Fill out the form and we'll get back to you within 24 hours.</p>

              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send size={28} className="text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                  <p className="text-slate-500">We'll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-1">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <InputField label="Your Name" placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                    <InputField label="Email" type="email" placeholder="john@example.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                  </div>
                  <InputField label="Subject" placeholder="How can we help?" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} required />
                  <div className="mb-6">
                    <label className="block text-[0.7rem] font-bold uppercase tracking-[0.25em] mb-2 text-slate-400">Message</label>
                    <textarea
                      rows={5}
                      placeholder="Tell us about your travel plans..."
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full px-5 py-4 bg-white/70 border-2 border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-300 font-medium focus:border-sky-500 focus:ring-2 focus:ring-sky-200/60 resize-none"
                      required
                    />
                  </div>
                  <button type="submit" className="w-full py-4 bg-gradient-to-r from-sky-600 to-purple-600 text-white rounded-2xl font-bold hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    Send Message <ArrowRight size={18} />
                  </button>
                </form>
              )}
            </div>

            {/* Map placeholder */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
              <div className="h-full min-h-[400px] bg-gradient-to-br from-sky-100 to-purple-100 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Globe size={36} className="text-sky-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Visit Our Office</h3>
                  <p className="text-slate-500 mb-4">Thamel, Kathmandu, Nepal</p>
                  <p className="text-sm text-slate-400">Located in the heart of Kathmandu's tourist district</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default ContactPage;
