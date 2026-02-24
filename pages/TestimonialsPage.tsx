import React, { useState } from 'react';
import { Navbar, Footer } from '../components/Navigation';

interface Testimonial {
  id: number;
  name: string;
  location: string;
  avatar: string;
  rating: number;
  tripType: string;
  date: string;
  content: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Sarah Mitchell',
    location: 'United Kingdom',
    avatar: 'SM',
    rating: 5,
    tripType: 'Annapurna Circuit Trek',
    date: 'December 2025',
    content: 'Absolutely life-changing experience! The AI trip planner suggested the perfect itinerary for our fitness level. The guides were knowledgeable and the views were breathtaking. ExploreMate made everything so easy from planning to execution.'
  },
  {
    id: 2,
    name: 'Raj Patel',
    location: 'India',
    avatar: 'RP',
    rating: 5,
    tripType: 'Kathmandu to Pokhara Tour',
    date: 'November 2025',
    content: 'Fantastic service! The attention to detail was remarkable. Every accommodation was carefully chosen, and the transportation arrangements were seamless. Highly recommend for anyone visiting Nepal.'
  },
  {
    id: 3,
    name: 'Emma Johnson',
    location: 'Australia',
    avatar: 'EJ',
    rating: 5,
    tripType: 'Everest Base Camp Trek',
    date: 'October 2025',
    content: 'Dream come true! The team helped me plan this once-in-a-lifetime trip perfectly. The AI suggestions for altitude acclimatization were spot on. Already planning my next adventure with ExploreMate!'
  },
  {
    id: 4,
    name: 'Michael Chen',
    location: 'Canada',
    avatar: 'MC',
    rating: 4,
    tripType: 'Chitwan Wildlife Safari',
    date: 'September 2025',
    content: 'Great experience overall. The wildlife spotting was incredible - we saw rhinos, elephants, and even a Bengal tiger! The accommodation in the jungle was unique and comfortable.'
  },
  {
    id: 5,
    name: 'Lisa Thompson',
    location: 'USA',
    avatar: 'LT',
    rating: 5,
    tripType: 'Cultural Heritage Tour',
    date: 'August 2025',
    content: 'A perfect blend of culture and adventure. The personalized itinerary showed us hidden gems we never would have found on our own. The Buddhist monastery stay was a highlight!'
  },
  {
    id: 6,
    name: 'David Williams',
    location: 'Germany',
    avatar: 'DW',
    rating: 5,
    tripType: 'Mountain Biking Adventure',
    date: 'July 2025',
    content: 'Adrenaline-packed adventure! The routes suggested were challenging but achievable. Bike rentals and guides were top-notch. ExploreMate really knows their Nepal trails!'
  },
  {
    id: 7,
    name: 'Priya Sharma',
    location: 'Singapore',
    avatar: 'PS',
    rating: 5,
    tripType: 'Family Vacation Package',
    date: 'June 2025',
    content: 'Perfect for families! The itinerary kept everyone engaged - from my 8-year-old to my parents. elephant rides, paddle boating, and temple visits - there was something for everyone.'
  },
  {
    id: 8,
    name: 'James Anderson',
    location: 'United Kingdom',
    avatar: 'JA',
    rating: 4,
    tripType: 'Paragliding in Pokhara',
    date: 'May 2025',
    content: 'Incredible flying experience! The team arranged everything including transport from Kathmandu. The instructors were professional and safety was prioritized. Would love to go back for a longer trek!'
  },
  {
    id: 9,
    name: 'Maria Garcia',
    location: 'Spain',
    avatar: 'MG',
    rating: 5,
    tripType: 'Spiritual Journey',
    date: 'April 2025',
    content: 'A soul-stirring experience. The temples, monasteries, and spiritual guides were deeply meaningful. ExploreMate understood exactly what I was looking for in a spiritual retreat.'
  }
];

const ratingLabels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

const TestimonialsPage = ({ onNavigate, isLoggedIn }: { onNavigate: (page: string) => void, isLoggedIn?: boolean }) => {
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const filteredTestimonials = filterRating 
    ? testimonials.filter(t => t.rating === filterRating)
    : testimonials;

  const averageRating = (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1);
  const totalReviews = testimonials.length;
  const fiveStarCount = testimonials.filter(t => t.rating === 5).length;

  return (
    <div className="w-full relative bg-slate-50/50">
      <Navbar onNavigate={onNavigate} isLoggedIn={isLoggedIn} />
      
      {/* Hero Section */}
      <section className="relative pt-28 pb-12 md:pt-32 md:pb-16 bg-gradient-to-br from-amber-900 via-orange-800 to-red-900">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative max-w-4xl mx-auto px-4 md:px-8 py-10 md:py-20 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-3 md:mb-4">
            What Our Travelers Say
          </h1>
          <p className="text-base md:text-xl text-amber-100">
            Real experiences from adventurers who explored Nepal with us
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 md:py-12 bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8 text-center">
            <div className="p-4 md:p-6">
              <div className="text-4xl md:text-5xl font-bold text-amber-600 mb-1 md:mb-2">{averageRating}</div>
              <div className="flex justify-center mb-1 md:mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg 
                    key={star} 
                    className={`w-5 h-5 md:w-6 md:h-6 ${star <= Math.round(Number(averageRating)) ? 'text-amber-400' : 'text-slate-300'}`}
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-slate-600 text-sm md:text-base">Average Rating</p>
            </div>
            <div className="p-4 md:p-6">
              <div className="text-4xl md:text-5xl font-bold text-amber-600 mb-1 md:mb-2">{totalReviews}+</div>
              <p className="text-slate-600 text-sm md:text-base">Happy Travelers</p>
            </div>
            <div className="p-4 md:p-6">
              <div className="text-4xl md:text-5xl font-bold text-amber-600 mb-1 md:mb-2">{fiveStarCount}</div>
              <p className="text-slate-600 text-sm md:text-base">5-Star Reviews</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-4 md:py-8 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
            <button
              onClick={() => setFilterRating(null)}
              className={`px-4 md:px-6 py-2 rounded-full text-sm md:text-base font-medium transition-all ${
                filterRating === null
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-amber-50 hover:text-amber-600'
              }`}
            >
              All Reviews
            </button>
            {[5, 4, 3].map((rating) => (
              <button
                key={rating}
                onClick={() => setFilterRating(filterRating === rating ? null : rating)}
                className={`px-4 md:px-6 py-2 rounded-full text-sm md:text-base font-medium transition-all flex items-center gap-1 md:gap-2 ${
                  filterRating === rating
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-amber-50 hover:text-amber-600'
                }`}
              >
                <svg className="w-4 h-4 md:w-5 md:h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {rating} Star ({testimonials.filter(t => t.rating === rating).length})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {filteredTestimonials.map((testimonial) => (
              <div 
                key={testimonial.id} 
                className="bg-white rounded-2xl shadow-lg p-4 md:p-8 hover:shadow-xl transition-shadow"
              >
                {/* Header */}
                <div className="flex items-center mb-3 md:mb-4">
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm md:text-lg">
                    {testimonial.avatar}
                  </div>
                  <div className="ml-3 md:ml-4">
                    <h3 className="font-semibold text-slate-900 text-sm md:text-base">{testimonial.name}</h3>
                    <p className="text-xs md:text-sm text-slate-500">{testimonial.location}</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center mb-3 md:mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg 
                        key={star} 
                        className={`w-4 h-4 md:w-5 md:h-5 ${star <= testimonial.rating ? 'text-amber-400' : 'text-slate-300'}`}
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-1 md:ml-2 text-xs md:text-sm text-slate-500">{ratingLabels[testimonial.rating - 1]}</span>
                </div>

                {/* Trip Type */}
                <div className="mb-3 md:mb-4">
                  <span className="inline-block px-2 md:px-3 py-1 bg-amber-100 text-amber-700 text-xs md:text-sm font-medium rounded-full">
                    {testimonial.tripType}
                  </span>
                </div>

                {/* Content */}
                <p className="text-slate-600 leading-relaxed text-sm md:text-base mb-3 md:mb-4">
                  "{testimonial.content}"
                </p>

                {/* Date */}
                <p className="text-xs md:text-sm text-slate-400">
                  {testimonial.date}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 md:py-16 bg-gradient-to-r from-amber-600 to-orange-600">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4">
            Share Your Experience
          </h2>
          <p className="text-amber-100 text-base md:text-lg mb-6 md:mb-8">
            Have you traveled with ExploreMate? We'd love to hear your story!
          </p>
          <button 
            onClick={() => onNavigate('contact')}
            className="px-6 md:px-8 py-3 md:py-4 bg-white text-amber-700 font-bold rounded-full hover:bg-amber-50 transition-colors"
          >
            Write a Review
          </button>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default TestimonialsPage;
