'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../../lib/authContext'; // Adjusted path
import apiClient from '../../lib/apiClient'; // Adjusted path

interface AuthResponse {
  token: string;
  user: { // Define the user structure based on your /api/auth/github response
    id: string;
    email: string;
    role: string;
    github_id?: string;
  }
}

const GitHubCallbackContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading: authIsLoading, user: authUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('Processing authentication...');

  useEffect(() => {
    // If already logged in and somehow landed here, redirect.
    if (authUser && !authIsLoading) {
      router.replace('/dashboard_projects_page');
      return;
    }

    const code = searchParams.get('code');

    if (code) {
      apiClient<AuthResponse>('/auth/github', {
        method: 'POST',
        body: { code },
      })
        .then(data => {
          setMessage('Login successful! Redirecting...');
          login(data.token); // This will set user, token, and isLoading to false
          // The AuthContext useEffect or login function itself should handle redirecting on user state change
        })
        .catch(err => {
          console.error('GitHub callback error:', err);
          setError(`Authentication failed: ${err.message}. Please try logging in again.`);
          setMessage('');
        });
    } else {
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      setError(`GitHub OAuth failed: ${errorParam || 'No code received.'} ${errorDescription ? `- ${errorDescription}` : ''}`);
      setMessage('');
    }
  }, [searchParams, login, router, authUser, authIsLoading]);

  useEffect(() => {
    // Redirect when user is successfully set by login() and auth is no longer loading
    if (authUser && !authIsLoading) {
      router.replace('/dashboard_projects_page');
    }
  }, [authUser, authIsLoading, router]);


  if (authIsLoading && !error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">{message || "Loading authentication details..."}</p>
        {/* Optional: Add a spinner here */}
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4 text-center">
          <p className="font-bold">Authentication Error</p>
          <p>{error}</p>
          <button
            onClick={() => router.push('/login_page')}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Try Again
          </button>
        </div>
      )}
      {!error && !authUser && ( // Still processing or an unexpected state before error/success
         <p className="text-lg text-gray-600">{message}</p>
      )}
       {!error && authUser && ( // Successfully authenticated, about to redirect
         <p className="text-lg text-green-600">{message}</p>
      )}
    </div>
  );
};


// Wrap with Suspense for useSearchParams
const GitHubCallbackPage = () => {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><p>Loading callback...</p></div>}>
            <GitHubCallbackContent />
        </Suspense>
    );
};

export default GitHubCallbackPage;
