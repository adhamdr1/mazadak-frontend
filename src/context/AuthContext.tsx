import React, { useState, useEffect, useCallback } from 'react';
import { AuthContext, type AuthContextType } from './auth.context';
import { authService } from '@/features/auth/services/auth.service';
import type { User, AuthResponse } from '@/features/auth/types/auth.types';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('mazadak_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return localStorage.getItem('access_token');
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize and verify session on load
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('mazadak_user');

    if (token && storedUser) {
      try {
        setUserState(JSON.parse(storedUser));
        setAccessToken(token);
      } catch {
        localStorage.removeItem('mazadak_user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    }
    setIsLoading(false);
  }, []);

  const setAuth = useCallback((response: AuthResponse) => {
    localStorage.setItem('access_token', response.accessToken);
    localStorage.setItem('refresh_token', response.refreshToken);
    localStorage.setItem('mazadak_user', JSON.stringify(response.user));

    setAccessToken(response.accessToken);
    setUserState(response.user);
  }, []);

  const setUser = useCallback((newUser: User | null) => {
    if (newUser) {
      localStorage.setItem('mazadak_user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('mazadak_user');
    }
    setUserState(newUser);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('mazadak_user');

      setAccessToken(null);
      setUserState(null);
    }
  }, []);

  // Listen for unauthorized broadcast events from apiClient interceptor
  useEffect(() => {
    const handleAuthExpired = () => {
      logout();
    };

    window.addEventListener('mazadak:auth_expired', handleAuthExpired);
    return () => {
      window.removeEventListener('mazadak:auth_expired', handleAuthExpired);
    };
  }, [logout]);

  const value: AuthContextType = {
    user,
    accessToken,
    isAuthenticated: !!accessToken && !!user,
    isLoading,
    setAuth,
    setUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
