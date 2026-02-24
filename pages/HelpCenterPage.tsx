import React, { useState } from 'react';
import { Navbar, Footer } from '../components/Navigation';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQ[] = [
  {
    id: 1,
    category: 'Getting Started',
    question: 'How do I create an account?',
    answer: 'Click on the "Sign Up" button in the top right corner of the homepage. Fill in your details including name, email, and password. You can also sign up using your Google or Facebook account for quicker registration.'
  },
  {
    id: 2,
    category: 'Getting Started',
    question: 'How do I plan my first trip?',
    answer: 'After logging in, navigate to the Trips page and click "Create New Trip". You can choose from our AI-suggested itineraries or create your own custom trip. Add destinations, activities, and set your travel dates.'
  },
  {
    id: 3,
    category: 'Trips',
    question: 'Can I modify my trip after booking?',
    answer: 'Yes, you can modify your trip details anytime before your travel date. Go to My Trips, select the trip you want to modify, and make changes. Some modifications may require additional payment depending on the service provider.'
  },
  {
    id: 4,
    category: 'Trips',
    question: 'How do I cancel a trip?',
    answer: 'Go to My Trips, select the trip you wish to cancel, and click the cancel button. Please note that cancellation policies vary by service provider. Refunds are processed within 7-14 business days.'
  },
  {
    id: 5,
    category: 'Payments',
    question: 'What payment methods are accepted?',
    answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. For Nepal-based payments, we also accept eSewa and Khalti.'
  },
  {
    id: 6,
    category: 'Payments',
    question: 'Is my payment information secure?',
    answer: 'Absolutely! We use industry-standard SSL encryption and are PCI-DSS compliant. Your payment information is never stored on our servers and is processed through secure payment gateways.'
  },
  {
    id: 7,
    category: 'Account',
    question: 'How do I reset my password?',
    answer: 'Click on "Forgot Password" on the login page, enter your registered email address, and we will send you a password reset link. The link expires after 24 hours for security purposes.'
  },
  {
    id: 8,
    category: 'Account',
    question: 'How can I delete my account?',
    answer: 'Go to Profile Settings > Account > Delete Account. Please note that this action is irreversible and all your data will be permanently deleted within 30 days.'
  },
  {
    id: 9,
    category: 'Nepal Travel',
    question: 'Do I need a visa to visit Nepal?',
    answer: 'Most nationalities can get a visa on arrival at Tribhuvan International Airport. You can also apply for an online visa before your trip. Tourist visas are available for 15, 30, and 90 days.'
  },
  {
    id: 10,
    category: 'Nepal Travel',
    question: 'What is the best time to visit Nepal?',
    answer: 'The best time to visit Nepal is from October to December for clear skies and mild temperatures, and from March to May for spring weather. Avoid the monsoon season (June-September) if possible.'
  }
];

const categories = ['All', 'Getting Started', 'Trips', 'Payments', 'Account', 'Nepal Travel'];

const HelpCenterPage = ({ onNavigate, isLoggedIn }: { onNavigate: (page: string) => void, isLoggedIn?: boolean }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full relative bg-slate-50/50">
      <Navbar onNavigate={onNavigate} isLoggedIn={isLoggedIn} />
      
      {/* Hero Section */}
      <section className="relative pt-28 pb-12 md:pt-32 md:pb-20 bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative max-w-4xl mx-auto px-4 md:px-8 py-10 md:py-20 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-3 md:mb-4">
            How can we help you?
          </h1>
          <p className="text-base md:text-xl text-indigo-100 mb-6 md:mb-8">
            Search our knowledge base or browse frequently asked questions
          </p>
          
          {/* Search Box */}
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 md:px-6 py-3 md:py-4 pl-10 md:pl-12 rounded-full text-base md:text-lg shadow-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
            />
            <svg className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-4 md:py-8 bg-white border-b sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 md:px-5 py-2 rounded-full text-sm md:text-base font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-8 md:py-16">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 md:mb-8 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-3 md:space-y-4">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                    className="w-full px-4 md:px-6 py-4 md:py-5 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1 pr-2">
                      <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                        {faq.category}
                      </span>
                      <h3 className="text-base md:text-lg font-semibold text-slate-900 mt-1">
                        {faq.question}
                      </h3>
                    </div>
                    <svg
                      className={`w-6 h-6 text-slate-400 transform transition-transform ${
                        expandedFAQ === faq.id ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedFAQ === faq.id && (
                    <div className="px-4 md:px-6 pb-4 md:pb-5">
                      <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-500 text-lg">No results found for your search.</p>
                <p className="text-slate-400 mt-2">Try different keywords or browse all categories.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact Support Section */}
      <section className="py-10 md:py-16 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4">
            Still need help?
          </h2>
          <p className="text-indigo-100 text-base md:text-lg mb-6 md:mb-8">
            Our support team is available 24/7 to assist you
          </p>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            <button 
              onClick={() => onNavigate('contact')}
              className="px-6 md:px-8 py-3 bg-white text-indigo-700 font-semibold rounded-full hover:bg-indigo-50 transition-colors"
            >
              Contact Support
            </button>
            <button 
              onClick={() => onNavigate('faq')}
              className="px-6 md:px-8 py-3 bg-indigo-700 text-white font-semibold rounded-full hover:bg-indigo-800 transition-colors"
            >
              View All FAQs
            </button>
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default HelpCenterPage;
