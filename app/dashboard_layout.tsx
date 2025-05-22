'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../lib/authContext'; // Adjusted path
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar'; // Adjusted path

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login_page'); // Redirect to login if not authenticated
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">Loading dashboard...</p>
        {/* You can add a global spinner here */}
      </div>
    );
  }

  if (!user) {
    // User is not authenticated, and loading is complete.
    // The useEffect above should have already initiated a redirect.
    // This is a fallback or can show a message if redirect takes time.
    return (
        <div className="flex items-center justify-center min-h-screen">
            <p className="text-lg text-gray-600">Redirecting to login...</p>
        </div>
    );
  }

  // User is authenticated, render the dashboard layout
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto ml-64 bg-gray-50"> 
        {/* ml-64 is to offset for the sidebar width */}
        {children}
      </main>
    </div>
  );
}
