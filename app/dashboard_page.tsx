'use client';

import React from 'react';
import { useAuth } from '../lib/authContext'; // Adjusted path

const DashboardHomePage = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard</h1>
      {user && (
        <p className="text-lg text-gray-700">
          Welcome back, <span className="font-semibold">{user.email}</span>!
        </p>
      )}
      <p className="mt-4 text-gray-600">
        Select a project from the sidebar or create a new one to get started.
      </p>
    </div>
  );
};

export default DashboardHomePage;
