import React, { useState } from 'react';
import { Navbar, Footer } from '../components/Navigation';

interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  title: string;
  location: string;
  description: string;
}

const galleryImages: GalleryImage[] = [
  {
    id: 1,
    src: '/assets/everest.png',
    alt: 'Mount Everest',
    title: 'Mount Everest',
    location: 'Solukhumbu District',
    description: 'The roof of the world at 8,848 meters'
  },
  {
    id: 2,
    src: '/assets/annapurna.png',
    alt: 'Annapurna Circuit',
    title: 'Annapurna Circuit',
    location: 'Annapurna Region',
    description: 'One of the most popular trekking routes'
  },
  {
    id: 3,
    src: '/assets/pokhara.png',
    alt: 'Pokhara Valley',
    title: 'Pokhara Valley',
    location: 'Gandaki Province',
    description: 'City of lakes and mountain views'
  },
  {
    id: 4,
    src: '/assets/chitwan.png',
    alt: 'Chitwan National Park',
    title: 'Chitwan National Park',
    location: 'Narayani Zone',
    description: 'UNESCO World Heritage Site'
  },
  {
    id: 5,
    src: '/assets/bhaktapur.png',
    alt: 'Bhaktapur Durbar Square',
    title: 'Bhaktapur Durbar Square',
    location: 'Bhaktapur District',
    description: 'Ancient Newar city and culture'
  },
  {
    id: 6,
    src: '/assets/boudhanath.png',
    alt: 'Boudhanath Stupa',
    title: 'Boudhanath Stupa',
    location: 'Kathmandu',
    description: 'Largest spherical stupa in the world'
  }
];

const GalleryPage = ({ onNavigate, isLoggedIn }: { onNavigate: (page: string) => void, isLoggedIn?: boolean }) => {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const filteredImages = filter === 'all' 
    ? galleryImages 
    : galleryImages.filter(img => img.location.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="w-full relative bg-slate-50/50">
      <Navbar onNavigate={onNavigate} isLoggedIn={isLoggedIn} />
      
      {/* Hero Section */}
      <section className="relative pt-28 pb-12 md:pt-32 md:pb-16 bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-3 md:mb-4">
            Explore Nepal
          </h1>
          <p className="text-base md:text-xl text-emerald-100 max-w-2xl">
            Discover the breathtaking beauty of Nepal through our collection of stunning destination images
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-4 md:py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
            {['all', 'kathmandu', 'pokhara', 'chitwan', 'solukhumbu'].map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-4 md:px-6 py-2 rounded-full text-sm md:text-base font-medium transition-all ${
                  filter === filterOption
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600'
                }`}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                onClick={() => setSelectedImage(image)}
                className="group relative overflow-hidden rounded-2xl cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                    <h3 className="text-lg md:text-2xl font-bold text-white mb-1">{image.title}</h3>
                    <p className="text-emerald-300 text-sm md:font-medium">{image.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-4 right-4 text-white text-4xl hover:text-emerald-400 transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            ×
          </button>
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="w-full h-auto rounded-lg shadow-2xl"
            />
            <div className="mt-4 md:mt-6 text-center">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{selectedImage.title}</h3>
              <p className="text-emerald-400 text-base md:text-lg mb-2">{selectedImage.location}</p>
              <p className="text-slate-300 text-sm md:text-base">{selectedImage.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="py-10 md:py-16 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4">
            Ready to Explore These Destinations?
          </h2>
          <p className="text-emerald-100 text-base md:text-lg mb-6 md:mb-8">
            Start planning your adventure to Nepal today
          </p>
          <button 
            onClick={() => onNavigate('trips')}
            className="px-6 md:px-8 py-3 md:py-4 bg-white text-emerald-700 font-bold rounded-full hover:bg-emerald-50 transition-colors"
          >
            Plan Your Trip
          </button>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default GalleryPage;
