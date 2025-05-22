'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../lib/authContext'; // Adjusted path
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
  const [redirectUri, setRedirectUri] = React.useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // This path needs to match what's configured in your GitHub OAuth App settings
      setRedirectUri(`${window.location.origin}/auth_callback_github`); 
    }
  }, []);


  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard_projects_page'); // Redirect to dashboard projects page
    }
  }, [user, isLoading, router]);

  const handleLogin = () => {
    if (!GITHUB_CLIENT_ID) {
      alert("GitHub Client ID is not configured. Please set NEXT_PUBLIC_GITHUB_CLIENT_ID in your environment.");
      return;
    }
    if (!redirectUri) {
        alert("Redirect URI not available. Please ensure you are running in a browser environment.");
        return;
    }
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user,user:email`;
    window.location.href = githubAuthUrl;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  if (user && !isLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <p className="text-lg text-gray-600">Already logged in. Redirecting to dashboard...</p>
        </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-lg rounded-lg text-center">
        <h1 className="text-2xl font-semibold mb-6">Login</h1>
        <p className="mb-6 text-gray-600">Welcome! Please login to continue.</p>
        <button
          onClick={handleLogin}
          disabled={!GITHUB_CLIENT_ID || !redirectUri}
          className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline disabled:opacity-50"
        >
          Login with GitHub
        </button>
        {(!GITHUB_CLIENT_ID || !redirectUri) && (
            <p className="text-red-500 text-sm mt-4">
                { !GITHUB_CLIENT_ID && "Error: GitHub Client ID not configured. " }
                { !redirectUri && "Error: Redirect URI not available."}
            </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
