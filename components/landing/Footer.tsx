'use client';

import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h5 className="text-lg font-semibold text-white mb-4">TokenBridge</h5>
            <p className="text-sm">
              Streamlining design token management between Figma and your codebase.
              Built for teams that value consistency and efficiency.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-lg font-semibold text-white mb-4">Quick Links</h5>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#features" className="hover:text-blue-400 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-blue-400 transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#waitlist" className="hover:text-blue-400 transition-colors">
                  Join Waitlist
                </a>
              </li>
              <li>
                <a href="/docs_placeholder" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                  Documentation
                </a>
              </li>
            </ul>
          </div>

          {/* Contact / Legal */}
          <div>
            <h5 className="text-lg font-semibold text-white mb-4">Contact & Legal</h5>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:support@tokenbridge.example.com" className="hover:text-blue-400 transition-colors">
                  Support
                </a>
              </li>
              <li>
                <a href="/privacy-policy-placeholder" className="hover:text-blue-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms-of-service-placeholder" className="hover:text-blue-400 transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-700 text-center">
          <p className="text-sm">
            &copy; {currentYear} TokenBridge Inc. All rights reserved.
          </p>
          <p className="text-xs mt-1">
            Conceptual project for demonstration purposes.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
