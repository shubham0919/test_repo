'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation'; // For App Router

interface User {
  id: string;
  email: string;
  role: string;
  github_id?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (jwtToken: string) => void;
  logout: () => void;
  triggerAuthCheck: () => void; // New function to manually trigger auth check
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = async (jwtToken: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setToken(jwtToken);
        localStorage.setItem('jwtToken', jwtToken);
      } else {
        throw new Error('Failed to fetch user');
      }
    } catch (error) {
      console.error('Auth fetch user error:', error);
      setUser(null);
      setToken(null);
      localStorage.removeItem('jwtToken');
      // Optionally redirect to login if on a protected route
      if (!pathname?.startsWith('/login') && !pathname?.startsWith('/auth/callback')) {
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to manually trigger auth check
  const triggerAuthCheck = () => {
    const storedToken = localStorage.getItem('jwtToken');
    if (storedToken) {
      fetchUser(storedToken);
    } else {
      setIsLoading(false); // No token, so not loading
      if (!pathname?.startsWith('/login') && !pathname?.startsWith('/auth/callback')) {
        router.push('/login');
      }
    }
  };


  useEffect(() => {
    const storedToken = localStorage.getItem('jwtToken');
    if (storedToken) {
      fetchUser(storedToken);
    } else {
      setIsLoading(false);
      // Redirect to login if not on a public route and no token
      if (!pathname?.startsWith('/login') && !pathname?.startsWith('/auth/callback')) {
        router.push('/login');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]); // Rerun on pathname change to protect routes

  const login = (jwtToken: string) => {
    fetchUser(jwtToken);
    // The actual redirect to dashboard will happen after user is set and isLoading is false
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('jwtToken');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, triggerAuthCheck }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
