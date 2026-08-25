import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env.config';

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
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor: Catch 401, perform Single-Use Token Refresh Rotation, and retry
apiClient.interceptors.response.use(
  (response) => {
    // Some GraphQL servers return 200 with UNAUTHORIZED in errors array
    if (response.data?.errors && response.data.errors.length > 0) {
      const isUnauthorized = response.data.errors.some(
        (err: { extensions?: { code?: string; status?: number } }) =>
          err.extensions?.code === 'UNAUTHORIZED' || err.extensions?.status === 401
      );
      if (isUnauthorized) {
        // Trigger auth expired if token is unrefreshable
      }
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          // Direct POST without interceptors to avoid loops
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
            localStorage.setItem('access_token', authData.accessToken);
            localStorage.setItem('refresh_token', authData.refreshToken);
            if (authData.user) {
              localStorage.setItem('mazadak_user', JSON.stringify(authData.user));
            }

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${authData.accessToken}`;
            }
            return apiClient(originalRequest);
          }
        } catch {
          // Refresh token expired or invalid (Single-Use invalidated)
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('mazadak_user');
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('mazadak:auth_expired'));
          }
        }
      } else {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('mazadak_user');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('mazadak:auth_expired'));
        }
      }
    }

    return Promise.reject(error);
  }
);