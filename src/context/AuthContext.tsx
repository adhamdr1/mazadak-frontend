import React, { useState, useEffect, useCallback } from 'react';
import { AuthContext, type AuthContextType } from './auth.context';
import { authService } from '@/features/auth/services/auth.service';
import { authStorage } from '@/utils/storage.utils';
import type { User, AuthResponse } from '@/features/auth/types/auth.types';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(() => {
    return authStorage.getUser<User>();
  });

  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return authStorage.getAccessToken();
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize and verify session on load
  useEffect(() => {
    const token = authStorage.getAccessToken();
    const storedUser = authStorage.getUser<User>();

    if (token && storedUser) {
      setUserState(storedUser);
      setAccessToken(token);
    } else {
      authStorage.clearAuth();
      setUserState(null);
      setAccessToken(null);
    }
    setIsLoading(false);
  }, []);

  const setAuth = useCallback((response: AuthResponse, rememberMe = false) => {
    authStorage.setAuth(response, rememberMe);
    setAccessToken(response.accessToken);
    setUserState(response.user);
  }, []);

  const setUser = useCallback((newUser: User | null) => {
    if (newUser) {
      const isLocal = !!localStorage.getItem('access_token');
      const storage = isLocal ? localStorage : sessionStorage;
      storage.setItem('mazadak_user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('mazadak_user');
      sessionStorage.removeItem('mazadak_user');
    }
    setUserState(newUser);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = authStorage.getRefreshToken();
    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      authStorage.clearAuth();
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
