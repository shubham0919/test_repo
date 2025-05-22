'use client';

import React from 'react';

const Hero = () => {
  return (
    <section id="hero" className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
          TokenBridge: Sync Design Tokens Seamlessly
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-10">
          Stop manually updating design tokens. TokenBridge connects your Figma variables to your codebase,
          automating your workflow and ensuring consistency across platforms.
        </p>
        <div className="flex justify-center space-x-4">
          <a
            href="#waitlist"
            className="bg-white text-blue-700 hover:bg-blue-50 font-semibold py-3 px-8 rounded-lg shadow-md text-lg transition duration-150 ease-in-out"
          >
            Join the Waitlist
          </a>
          <a
            href="#features"
            className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-700 font-semibold py-3 px-8 rounded-lg text-lg transition duration-150 ease-in-out"
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
