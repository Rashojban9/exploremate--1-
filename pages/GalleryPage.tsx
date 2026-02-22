import React from 'react';
import { Navbar, Footer } from '../components/Navigation';

const GalleryPage = ({ onNavigate, isLoggedIn }: { onNavigate: (page: string) => void, isLoggedIn?: boolean }) => {
  return (
    <div className="w-full relative bg-slate-50/50">
      <Navbar onNavigate={onNavigate} isLoggedIn={isLoggedIn} />
      <section className="relative pt-40 pb-20 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h1 className="text-5xl font-display font-bold text-slate-900 mb-6">Gallery</h1>
          <p className="text-lg text-slate-600">Explore stunning destinations across Nepal.</p>
        </div>
      </section>
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default GalleryPage;
