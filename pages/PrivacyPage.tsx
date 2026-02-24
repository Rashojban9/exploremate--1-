import React from 'react';
import { Navbar, Footer } from '../components/Navigation';

const PrivacyPage = ({ onNavigate, isLoggedIn }: { onNavigate: (page: string) => void, isLoggedIn?: boolean }) => {
  return (
    <div className="w-full relative bg-slate-50/50">
      <Navbar onNavigate={onNavigate} isLoggedIn={isLoggedIn} />
      
      {/* Hero Section */}
      <section className="relative pt-28 pb-12 md:pt-32 md:pb-16 bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative max-w-4xl mx-auto px-4 md:px-8 py-10 md:py-20 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-3 md:mb-4">
            Privacy Policy
          </h1>
          <p className="text-base md:text-xl text-blue-100 px-2 md:px-0">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
          <p className="text-blue-200 mt-3 md:mt-4 text-sm md:text-base">Last updated: February 2026</p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-8 md:py-16">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-8 lg:p-12">
            
            <div className="mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4">1. Introduction</h2>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                ExploreMate ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our travel planning platform and services. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access our services.
              </p>
            </div>

            <div className="mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4">2. Information We Collect</h2>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-3 md:mb-4">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 ml-2 md:ml-4 text-sm md:text-base">
                <li><strong>Account Information:</strong> Name, email address, phone number, and profile photo when you create an account</li>
                <li><strong>Trip Information:</strong> Travel preferences, destinations, dates, accommodation preferences, and activity interests</li>
                <li><strong>Payment Information:</strong> Billing address and payment card details (processed securely through our payment partners)</li>
                <li><strong>Communication Data:</strong> Messages you send to us, including support inquiries and feedback</li>
                <li><strong>Device Information:</strong> Device type, operating system, browser type, and IP address</li>
              </ul>
            </div>

            <div className="mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4">3. How We Use Your Information</h2>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-3 md:mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 ml-2 md:ml-4 text-sm md:text-base">
                <li>Provide, maintain, and improve our travel planning services</li>
                <li>Process your transactions and send you related information</li>
                <li>Send you technical notices, updates, security alerts, and support messages</li>
                <li>Respond to your comments, questions, and provide customer service</li>
                <li>Communicate with you about products, services, offers, promotions, and events</li>
                <li>Monitor and analyze trends, usage, and activities in connection with our services</li>
                <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
              </ul>
            </div>

            <div className="mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4">4. Information Sharing</h2>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-3 md:mb-4">
                We may share your information with:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 ml-2 md:ml-4 text-sm md:text-base">
                <li><strong>Service Providers:</strong> Third-party vendors who provide services on our behalf (payment processing, data analysis, email delivery, hosting services)</li>
                <li><strong>Travel Partners:</strong> Hotels, airlines, tour operators, and other travel service providers necessary to complete your bookings</li>
                <li><strong>Business Transfers:</strong> In connection with any merger, sale of company assets, or acquisition</li>
                <li><strong>Legal Requirements:</strong> When required by law or in response to valid requests by public authorities</li>
              </ul>
            </div>

            <div className="mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4">5. Data Security</h2>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security. We use industry-standard SSL encryption for data transmission and store your personal information on secure servers with restricted access.
              </p>
            </div>

            <div className="mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4">6. Your Rights</h2>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-3 md:mb-4">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 ml-2 md:ml-4 text-sm md:text-base">
                <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate personal information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
                <li><strong>Data Portability:</strong> Request a copy of your data in a structured, machine-readable format</li>
                <li><strong>Opt-out:</strong> Opt-out of receiving marketing communications at any time</li>
              </ul>
            </div>

            <div className="mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4">7. Cookies and Tracking Technologies</h2>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                We use cookies and similar tracking technologies to track the activity on our service and hold certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.
              </p>
            </div>

            <div className="mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4">8. Third-Party Links</h2>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                Our service may contain links to third-party websites, services, or applications that are not operated by us. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services. We encourage you to review the privacy policy of every site you visit.
              </p>
            </div>

            <div className="mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4">9. Children's Privacy</h2>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and you believe your child has provided us with personal information, please contact us immediately.
              </p>
            </div>

            <div className="mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4">10. Changes to This Policy</h2>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "last updated" date at the top. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </div>

            <div className="border-t pt-6 md:pt-8">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4">Contact Us</h2>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-3 md:mb-4">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 ml-2 md:ml-4 text-sm md:text-base">
                <li>By email: privacy@exploremate.com</li>
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

export default PrivacyPage;
