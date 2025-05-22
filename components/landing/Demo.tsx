'use client';

import React from 'react';

const Demo = () => {
  return (
    <section id="demo" className="py-16 md:py-24 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            See TokenBridge in Action
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Watch a quick demo to understand how TokenBridge can transform your design token workflow.
          </p>
        </div>
        <div className="aspect-w-16 aspect-h-9 bg-gray-300 rounded-lg shadow-xl overflow-hidden max-w-4xl mx-auto">
          {/* Placeholder for embedded video */}
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-xl">
              Demo Video Coming Soon!
            </p>
            {/* Example of an iframe for a YouTube video (replace src with actual video)
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ" // Replace with your video ID
              title="Demo Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            */}
          </div>
        </div>
         <p className="mt-8 text-center text-gray-600">
            Want a live demo for your team? <a href="mailto:sales@tokenbridge.example.com?subject=TokenBridge Demo Request" className="text-blue-600 hover:underline">Contact Sales</a>.
          </p>
      </div>
    </section>
  );
};

export default Demo;
