import { useQuery } from '@tanstack/react-query';
import { notificationsService } from '../services/notifications.service';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { useAuth } from '@/hooks/useAuth';
import type { NotificationCategory } from '../types/notifications.types';

export function useUnreadNotificationsCount(category?: NotificationCategory) {
  const { isAuthenticated } = useAuth();

  const query = useQuery<number, Error>({
    queryKey: QUERY_KEYS.NOTIFICATIONS.UNREAD_COUNT(category),
    queryFn: () => notificationsService.getUnreadNotificationsCount(category),
    enabled: isAuthenticated,
    staleTime: 60_000, // Kept fresh primarily by WebSocket events
    refetchOnWindowFocus: true,
  });

  return {
    unreadCount: query.data ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
}
