'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { api, setAccessToken } from '@/lib/api';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize AuthContext and run silent refresh
  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await api.post('/auth/refresh');
        const token = response.data.accessToken;
        
        setAccessToken(token);
        setAccessTokenState(token);

        // Fetch user profile + permissions here if they aren't included in the refresh token response
        // Usually, the refresh token or a subsequent /users/me request provides this.
        // Assuming the backend /auth/refresh doesn't return user, we fetch it:
        const userRes = await api.get('/auth/me'); // Or whatever the equivalent "me" route is in the backend
        setUser(userRes.data);

      } catch (error) {
        // Silent fail — they just aren't logged in
        setAccessToken(null);
        setAccessTokenState(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    const { accessToken: newAccessToken, user: loggedInUser } = response.data;
    
    setAccessToken(newAccessToken);
    setAccessTokenState(newAccessToken);
    setUser(loggedInUser);
    
    // Also fetch permissions explicitly if they aren't embedded in the user object yet
    try {
        const permRes = await api.get(`/users/${loggedInUser.id}/permissions`);
        setUser((prev: User | null) => prev ? { ...prev, permissions: permRes.data } : null);
    } catch (e) {
        console.error("Failed to fetch permissions on login", e);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setAccessToken(null);
      setAccessTokenState(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
