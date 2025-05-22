'use client';

import React from 'react';
import { CogIcon, CloudArrowUpIcon, CodeBracketSquareIcon, VariableIcon, ShieldCheckIcon, UsersIcon } from '@heroicons/react/24/outline'; // Example icons

const features = [
  {
    name: 'Figma Plugin Integration',
    description: 'Seamlessly connect your Figma local variables and styles with our intuitive plugin.',
    icon: CogIcon,
  },
  {
    name: 'Automated Token Sync',
    description: 'Keep your design tokens in sync with your codebase automatically. No more manual updates.',
    icon: CloudArrowUpIcon,
  },
  {
    name: 'Version Control',
    description: 'Track changes to your design tokens with version history and easily compare or revert to previous states.',
    icon: VariableIcon,
  },
  {
    name: 'Multiple Export Formats',
    description: 'Export tokens in various formats (JSON, CSS, SCSS, LESS, Tailwind) to fit your development workflow.',
    icon: CodeBracketSquareIcon,
  },
  {
    name: 'Secure Cloud Storage',
    description: 'Your token versions are securely stored in the cloud, accessible anytime by your team.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Team Collaboration',
    description: 'Designed for teams with different roles and access levels for projects and tokens (Pro & Team plans).',
    icon: UsersIcon,
  },
];

const Features = () => {
  return (
    <section id="features" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Why TokenBridge?
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Streamline your design-to-development handoff and maintain a single source of truth for your design system.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.name} className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200">
              <feature.icon className="h-12 w-12 text-blue-600 mb-4" aria-hidden="true" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.name}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
