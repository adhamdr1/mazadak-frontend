/**
 * Authentication Storage Utility
 * Manages access tokens, refresh tokens, and cached user profiles across localStorage and sessionStorage.
 * Ensures strict session isolation based on the 'Remember Me' user preference.
 */

export const authStorage = {
  /**
   * Retrieve active access token from persistent or session storage
   */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  },

  /**
   * Retrieve active refresh token from persistent or session storage
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
  },

  /**
   * Retrieve cached authenticated user from persistent or session storage
   */
  getUser<T = unknown>(): T | null {
    const raw = localStorage.getItem('mazadak_user') || sessionStorage.getItem('mazadak_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  /**
   * Store authentication payload.
   * If rememberMe is true: saves to localStorage (persists across browser restarts).
   * If rememberMe is false: saves to sessionStorage (destroyed upon closing tab/browser).
   * Cleans the alternative storage to prevent split-brain state.
   */
  setAuth(
    tokens: { accessToken: string; refreshToken: string; user?: unknown },
    rememberMe = false
  ): void {
    const targetStorage = rememberMe ? localStorage : sessionStorage;
    const cleanStorage = rememberMe ? sessionStorage : localStorage;

    cleanStorage.removeItem('access_token');
    cleanStorage.removeItem('refresh_token');
    cleanStorage.removeItem('mazadak_user');

    targetStorage.setItem('access_token', tokens.accessToken);
    targetStorage.setItem('refresh_token', tokens.refreshToken);
    if (tokens.user) {
      targetStorage.setItem('mazadak_user', JSON.stringify(tokens.user));
    }
  },

  /**
   * Update token pair during background token refresh, maintaining the current session storage type.
   */
  setAuthTokens(accessToken: string, refreshToken: string, user?: unknown): void {
    const isLocal = !!localStorage.getItem('refresh_token');
    const target = isLocal ? localStorage : sessionStorage;

    target.setItem('access_token', accessToken);
    target.setItem('refresh_token', refreshToken);
    if (user) {
      target.setItem('mazadak_user', JSON.stringify(user));
    }
  },

  /**
   * Clear all auth credentials and cached user profiles from both storages.
   */
  clearAuth(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('mazadak_user');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('mazadak_user');
  },
};
