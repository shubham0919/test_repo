'use client';

import React, { useState } from 'react';

const CTAWaitlist = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!email.trim() || !email.includes('@')) {
      setMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/waitlist', { // Assuming API route is at /api/waitlist
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Successfully joined the waitlist!' });
        setEmail(''); // Clear input on success
      } else {
        setMessage({ type: 'error', text: data.error || 'An error occurred. Please try again.' });
      }
    } catch (error) {
      console.error('Waitlist form submission error:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred. Please try again later.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="waitlist" className="py-16 md:py-24 bg-gradient-to-r from-blue-600 to-indigo-700">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-6">
          Be the First to Experience TokenBridge
        </h2>
        <p className="text-lg text-blue-100 mb-8">
          Join our waitlist to get early access, updates, and special launch offers.
          Help us shape the future of design token management!
        </p>

        <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
          <div className="flex flex-col sm:flex-row gap-4">
            <label htmlFor="email-address" className="sr-only">
              Email address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-auto w-full px-5 py-3 border border-transparent text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white rounded-md shadow-sm"
              placeholder="Enter your email"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="flex-none items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white disabled:opacity-70"
            >
              {isLoading ? 'Submitting...' : 'Join Waitlist'}
            </button>
          </div>
        </form>

        {message && (
          <div className={`mt-6 p-3 rounded-md text-sm ${
            message.type === 'success' ? 'bg-green-100 text-green-700' :
            message.type === 'error' ? 'bg-red-100 text-red-700' :
            'bg-blue-100 text-blue-700' // for 'info'
          }`}>
            {message.text}
          </div>
        )}
         <p className="mt-8 text-sm text-blue-200">
            We respect your privacy. No spam, unsubscribe anytime.
          </p>
      </div>
    </section>
  );
};

export default CTAWaitlist;
