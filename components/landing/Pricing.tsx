'use client';

import React from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';

const tiers = [
  {
    name: 'Free',
    priceMonthly: '$0',
    description: 'For individuals and small projects getting started with design tokens.',
    features: [
      '1 Project',
      'Up to 50 Tokens',
      'Manual Sync',
      'Basic Export Options',
      'Community Support',
    ],
    cta: 'Get Started for Free',
    href: '/login_page', // Link to app login/signup for free tier
    mostPopular: false,
  },
  {
    name: 'Pro',
    priceMonthly: '$10',
    description: 'For professionals and growing teams needing more power and automation.',
    features: [
      'Up to 5 Projects',
      'Up to 500 Tokens per Project',
      'Automated Sync with SaaS Backend',
      'Version History (30 days)',
      'All Export Options',
      'Email Support',
    ],
    cta: 'Choose Pro',
    href: '#waitlist', // Link to waitlist for now, eventually to Stripe checkout
    mostPopular: true,
  },
  {
    name: 'Team',
    priceMonthly: '$30',
    description: 'For larger organizations requiring advanced collaboration and control.',
    features: [
      'Unlimited Projects',
      'Unlimited Tokens',
      'Automated Sync & GitHub Integration',
      'Full Version History',
      'Advanced Export Options & Webhooks',
      'Priority Support & Team Management',
    ],
    cta: 'Choose Team',
    href: '#waitlist', // Link to waitlist for now, eventually to Stripe checkout
    mostPopular: false,
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the plan that’s right for you. All plans start with a free trial period for Pro features.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-x-8">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`flex flex-col rounded-2xl shadow-lg p-8 ${
                tier.mostPopular ? 'border-2 border-blue-600 ring-2 ring-blue-600' : 'border border-gray-200'
              } bg-white`}
            >
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-gray-900">{tier.name}</h3>
                {tier.mostPopular && (
                  <p className="absolute top-0 -translate-y-1/2 transform rounded-full bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white">
                    Most Popular
                  </p>
                )}
                <p className="mt-4 flex items-baseline text-gray-900">
                  <span className="text-4xl font-extrabold tracking-tight">{tier.priceMonthly}</span>
                  <span className="ml-1 text-xl font-semibold text-gray-500">/month</span>
                </p>
                <p className="mt-6 text-gray-500">{tier.description}</p>

                {/* Features */}
                <ul role="list" className="mt-8 space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <div className="flex-shrink-0">
                        <CheckIcon className="h-6 w-6 text-green-500" aria-hidden="true" />
                      </div>
                      <p className="ml-3 text-base text-gray-700">{feature}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={tier.href}
                className={`mt-10 block w-full rounded-lg px-6 py-4 text-center text-lg font-medium ${
                  tier.mostPopular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-blue-700 hover:bg-gray-200'
                }`}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>
         <p className="mt-12 text-center text-gray-600">
            All paid plans will start with a 14-day free trial of the selected tier. No credit card required for trial.
          </p>
      </div>
    </section>
  );
};

export default Pricing;
