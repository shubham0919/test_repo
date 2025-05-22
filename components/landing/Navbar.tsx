'use client';

import React from 'react';
import Link from 'next/link'; // Using Next.js Link for potential future navigation

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/landing_page" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
              TokenBridge
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a href="#features" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Features
              </a>
              <a href="#demo" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Demo
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Pricing
              </a>
              <a
                href="/docs_placeholder" // Placeholder for documentation link
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Docs
              </a>
               <Link href="/login_page" className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium shadow-sm">
                Sign In / App
              </Link>
            </div>
          </div>
          {/* Mobile menu button (optional, can be added later) */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
