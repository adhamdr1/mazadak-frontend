import { useQuery } from '@tanstack/react-query';
import { notificationsService } from '../services/notifications.service';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import type {
  NotificationsFilterInput,
  PaginationInput,
  InAppNotificationsPage,
} from '../types/notifications.types';

export interface UseNotificationsOptions {
  page?: number;
  limit?: number;
  filter?: NotificationsFilterInput;
  enabled?: boolean;
}

export function useNotifications({
  page = 1,
  limit = 10,
  filter,
  enabled = true,
}: UseNotificationsOptions = {}) {
  const pagination: PaginationInput = { page, limit };

  const query = useQuery<InAppNotificationsPage, Error>({
    queryKey: QUERY_KEYS.NOTIFICATIONS.LIST(page, limit, filter as Record<string, unknown>),
    queryFn: () => notificationsService.getMyNotifications(pagination, filter),
    enabled,
    staleTime: 30_000, // 30 seconds fresh time, relies on real-time WS events
  });

  return {
    notifications: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    totalPages: query.data?.totalPages ?? 0,
    hasNextPage: query.data?.hasNextPage ?? false,
    page,
    limit,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
