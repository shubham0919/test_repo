import React from 'react';
import Navbar from '../../components/landing/Navbar'; // Adjusted path
import Hero from '../../components/landing/Hero'; // Adjusted path
import Features from '../../components/landing/Features'; // Adjusted path
import Pricing from '../../components/landing/Pricing'; // Adjusted path
import Demo from '../../components/landing/Demo'; // Adjusted path
import CTAWaitlist from '../../components/landing/CTAWaitlist'; // Adjusted path
import Footer from '../../components/landing/Footer'; // Adjusted path

// This page would conceptually be at the root path '/' or a specific landing path like '/landing'
// For App Router, if it's the root, it would be app/page.tsx.
// If it's under a group, it might be app/(marketing)/page.tsx.
// Using app/landing_page.tsx due to tool constraints.

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Demo />
        <Pricing />
        <CTAWaitlist />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
