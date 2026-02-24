import React from 'react';
import { Navbar, Footer } from '../components/Navigation';

const TermsPage = ({ onNavigate, isLoggedIn }: { onNavigate: (page: string) => void, isLoggedIn?: boolean }) => {
  return (
    <div className="w-full relative bg-slate-50/50">
      <Navbar onNavigate={onNavigate} isLoggedIn={isLoggedIn} />
      
      {/* Hero Section */}
      <section className="relative pt-28 pb-12 md:pt-32 md:pb-16 bg-gradient-to-br from-orange-900 via-red-800 to-pink-900">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative max-w-4xl mx-auto px-4 md:px-8 py-10 md:py-20 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-3 md:mb-4">
            Terms & Conditions
          </h1>
          <p className="text-base md:text-xl text-orange-100 px-2 md:px-0">
            Please read our terms of service carefully before using our platform
          </p>
          <p className="text-orange-200 mt-3 md:mt-4 text-sm md:text-base">Last updated: February 2026</p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-8 md:py-16">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-8 lg:p-12">
            
            <div className="mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4">1. Acceptance of Terms</h2>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                By accessing and using ExploreMate ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. Additionally, when using ExploreMate's services, you shall be subject to any posted guidelines or rules applicable to such services. If you do not agree to these Terms, you should not use our Service.
              </p>
            </div>

            <div className="mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4">2. Description of Service</h2>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-3 md:mb-4">
                ExploreMate is a comprehensive travel planning platform that provides:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 ml-2 md:ml-4 text-sm md:text-base">
                <li>AI-powered trip planning and itinerary creation</li>
                <li>Destination information and recommendations</li>
                <li>Hotel and accommodation booking assistance</li>
                <li>Transportation and tour booking services</li>
                <li>Travel community features and reviews</li>
                <li>Personalized travel suggestions based on preferences</li>
              </ul>
            </div>

            <div className="mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4">3. User Accounts and Registration</h2>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-3 md:mb-4">
                To access certain features of our Service, you may be required to create an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 ml-2 md:ml-4 text-sm md:text-base">
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Promptly update any changes to your information</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
            </div>

            <div className="mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4">4. User Conduct and Responsibilities</h2>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-3 md:mb-4">
                You agree NOT to:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 ml-2 md:ml-4 text-sm md:text-base">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Post or transmit harmful, threatening, or inappropriate content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Harass, abuse, or harm another person</li>
                <li>Collect or store personal data about other users</li>
              </ul>
            </div>

            <div className="mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4">5. Bookings and Payments</h2>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-3 md:mb-4">
                When you make a booking through ExploreMate:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 ml-2 md:ml-4 text-sm md:text-base">
                <li>You agree to provide accurate payment information</li>
                <li>All bookings are subject to availability</li>
                <li>Prices are subject to change without notice</li>
                <li>Cancellation policies vary by service provider</li>
                <li>Refunds are processed according to the specific booking terms</li>
                <li>You are responsible for reviewing booking details before confirmation</li>
              </ul>
            </div>

            <div className="mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4">6. Intellectual Property Rights</h2>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                The Service and its original content, features, and functionality are and will remain the exclusive property of ExploreMate and its licensors. The Service is protected by copyright, trademark, and other laws. Our trademarks and trade dress may not be used in connection with any product or service without prior written consent.
              </p>
            </div>

            <div className="mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4">7. User-Generated Content</h2>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-3 md:mb-4">
                You may submit reviews, comments, and other content ("User Content"). For User Content you submit:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 ml-2 md:ml-4 text-sm md:text-base">
                <li>You retain ownership of your User Content</li>
                <li>You grant us a worldwide, royalty-free license to use, display, and reproduce</li>
                <li>You warrant that you own or have rights to the content</li>
                <li>You are responsible for ensuring accuracy of submitted content</li>
                <li>We reserve the right to remove inappropriate content</li>
              </ul>
            </div>

            <div className="mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4">8. Disclaimers and Limitation of Liability</h2>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-3 md:mb-4">
                <strong>Disclaimer:</strong> The Service is provided "as is" without any warranties, express or implied. We do not warrant that the Service will be uninterrupted, secure, or error-free.
              </p>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-3 md:mb-4">
                <strong>Limitation of Liability:</strong> In no event shall ExploreMate, its officers, directors, employees, or agents be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
              </p>
            </div>

            <div className="mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4">9. Third-Party Services</h2>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                Our Service may contain links to third-party websites or services that are not owned or controlled by ExploreMate. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party websites or services. You acknowledge and agree that ExploreMate shall not be responsible or liable for any damage or loss caused by use of any third-party services.
              </p>
            </div>

            <div className="mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4">10. Indemnification</h2>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                You agree to defend, indemnify, and hold harmless ExploreMate and its officers, directors, employees, and agents from and against any claims, damages, obligations, losses, liabilities, costs, or debt, and expenses arising from: (a) your use of the Service; (b) your violation of any term of these Terms; (c) your violation of any third-party rights.
              </p>
            </div>

            <div className="mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4">11. Termination</h2>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
              </p>
            </div>

            <div className="mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4">12. Governing Law</h2>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                These Terms shall be governed and construed in accordance with the laws of Nepal, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
              </p>
            </div>

            <div className="mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4">13. Changes to Terms</h2>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any significant changes. By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms.
              </p>
            </div>

            <div className="border-t pt-6 md:pt-8">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4">Contact Us</h2>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-3 md:mb-4">
                If you have any questions about these Terms, please contact us:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 ml-2 md:ml-4 text-sm md:text-base">
                <li>By email: legal@exploremate.com</li>
                <li>By phone: +977-1-4XXXXXX</li>
                <li>Through our Contact page</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default TermsPage;
