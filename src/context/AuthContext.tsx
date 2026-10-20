import React, { useState, useEffect, useCallback } from 'react';
import { AuthContext, type AuthContextType } from './auth.context';
import { authService } from '@/features/auth/services/auth.service';
import { authStorage } from '@/utils/storage.utils';
import { queryClient } from '@/services/api/queryClient';
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

      // If stored user is missing createdAt, fetch fresh profile from me query
      if (!storedUser.createdAt) {
        authService
          .getMe()
          .then((freshUser) => {
            if (freshUser) {
              authStorage.setUser(freshUser);
              setUserState(freshUser);
            }
          })
          .catch(() => {
            // Silently ignore network failures on background refresh
          });
      }
    } else {
      authStorage.clearAuth();
      setUserState(null);
      setAccessToken(null);
    }
    setIsLoading(false);
  }, []);

  const setAuth = useCallback((response: AuthResponse, rememberMe = true) => {
    authStorage.setAuth(response, rememberMe);
    setAccessToken(response.accessToken);
    setUserState(response.user);
  }, []);

  const setUser = useCallback((newUser: User | null) => {
    if (newUser) {
      authStorage.setUser(newUser);
    } else {
      authStorage.clearUser();
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
      queryClient.clear();
      setAccessToken(null);
      setUserState(null);
    }
  }, []);

  // Listen for storage events across tabs (instant login/logout sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token' || e.key === 'mazadak_user') {
        const token = authStorage.getAccessToken();
        const storedUser = authStorage.getUser<User>();
        if (token && storedUser) {
          setAccessToken(token);
          setUserState(storedUser);
        } else {
          setAccessToken(null);
          setUserState(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
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

  // Listen for token refresh events from apiClient to synchronize in-tab React state
  useEffect(() => {
    const handleTokenRefreshed = (e: Event) => {
      const custom = e as CustomEvent<{ accessToken: string; user?: User }>;
      if (custom.detail?.accessToken) {
        setAccessToken(custom.detail.accessToken);
        if (custom.detail.user) {
          setUserState(custom.detail.user);
        }
      }
    };

    window.addEventListener('mazadak:token_refreshed', handleTokenRefreshed);
    return () => {
      window.removeEventListener('mazadak:token_refreshed', handleTokenRefreshed);
    };
  }, []);

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
