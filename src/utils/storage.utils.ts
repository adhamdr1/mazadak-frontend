/**
 * Authentication Storage Utility
 * Manages access tokens, refresh tokens, and cached user profiles across localStorage and sessionStorage.
 * Ensures strict session isolation based on the 'Remember Me' user preference.
 */

export const authStorage = {
  /**
   * Retrieve active access token from persistent or session storage.
   * Seamlessly auto-migrates existing session tokens to localStorage so opening links in new tabs works.
   */
  getAccessToken(): string | null {
    const localToken = localStorage.getItem('access_token');
    if (localToken) return localToken;

    const sessionToken = sessionStorage.getItem('access_token');
    if (sessionToken) {
      localStorage.setItem('access_token', sessionToken);
      const sessionRefresh = sessionStorage.getItem('refresh_token');
      if (sessionRefresh) localStorage.setItem('refresh_token', sessionRefresh);
      const sessionUser = sessionStorage.getItem('mazadak_user');
      if (sessionUser) localStorage.setItem('mazadak_user', sessionUser);
      return sessionToken;
    }
    return null;
  },

  /**
   * Retrieve active refresh token from persistent or session storage
   */
  getRefreshToken(): string | null {
    const localRefresh = localStorage.getItem('refresh_token');
    if (localRefresh) return localRefresh;
    return sessionStorage.getItem('refresh_token');
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
   * Defaults to localStorage to enable cross-tab browsing (open in new tab)
   * and persistent session across browser restarts.
   */
  setAuth(
    tokens: { accessToken: string; refreshToken: string; user?: unknown },
    rememberMe = true
  ): void {
    const isRemembered = rememberMe !== false;
    const targetStorage = isRemembered ? localStorage : sessionStorage;
    const cleanStorage = isRemembered ? sessionStorage : localStorage;

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
   * Update cached authenticated user profile in the active storage type.
   */
  setUser(user: unknown): void {
    const isLocal = !!localStorage.getItem('access_token') || !!localStorage.getItem('refresh_token');
    const target = isLocal ? localStorage : sessionStorage;
    target.setItem('mazadak_user', JSON.stringify(user));
  },

  /**
   * Remove cached user profile from all storages.
   */
  clearUser(): void {
    localStorage.removeItem('mazadak_user');
    sessionStorage.removeItem('mazadak_user');
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
