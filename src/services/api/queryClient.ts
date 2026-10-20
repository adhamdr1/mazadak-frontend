import { QueryClient } from '@tanstack/react-query';

/**
 * Singleton QueryClient instance for TanStack Query.
 * Accessible across React components and non-React services (e.g. auth logout cache clearing).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
