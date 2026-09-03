import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env.config';
import { authStorage } from '@/utils/storage.utils';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Bearer token if present
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Shared Single-Flight Promise instance to prevent race condition during token rotation
let refreshPromise: Promise<string | null> | null = null;

async function attemptTokenRefresh(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshToken = authStorage.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const refreshRes = await axios.post(
        env.apiUrl,
        {
          query: `
            mutation RefreshToken($refreshToken: String!) {
              refreshToken(refreshToken: $refreshToken) {
                accessToken
                refreshToken
                user {
                  _id
                  email
                  firstName
                  lastName
                  role
                }
              }
            }
          `,
          variables: { refreshToken },
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const authData = refreshRes.data?.data?.refreshToken;
      if (authData?.accessToken) {
        authStorage.setAuthTokens(authData.accessToken, authData.refreshToken, authData.user);
        return authData.accessToken;
      }
      return null;
    } catch {
      authStorage.clearAuth();
      window.dispatchEvent(new CustomEvent('mazadak:auth_expired'));
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// Response Interceptor: Handles both GraphQL 200 Auth errors and HTTP 401 errors
apiClient.interceptors.response.use(
  async (response) => {
    const originalConfig = response.config as CustomAxiosRequestConfig;

    // Check if GraphQL response contains UNAUTHENTICATED / UNAUTHORIZED in errors array
    const errors = response.data?.errors;
    if (Array.isArray(errors) && errors.length > 0) {
      const isAuthError = errors.some(
        (err: {
          extensions?: {
            code?: string;
            status?: number;
            response?: { statusCode?: number };
          };
          message?: string;
        }) =>
          err.extensions?.code === 'UNAUTHENTICATED' ||
          err.extensions?.code === 'UNAUTHORIZED' ||
          err.extensions?.status === 401 ||
          err.extensions?.response?.statusCode === 401 ||
          err.message === 'Unauthorized' ||
          err.message === 'UNAUTHENTICATED'
      );

      if (isAuthError && originalConfig && !originalConfig._retry) {
        originalConfig._retry = true;
        const newAccessToken = await attemptTokenRefresh();
        if (newAccessToken) {
          if (originalConfig.headers) {
            originalConfig.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return apiClient(originalConfig);
        }
      }
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const newAccessToken = await attemptTokenRefresh();
      if (newAccessToken) {
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);