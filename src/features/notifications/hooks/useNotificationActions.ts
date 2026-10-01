import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '../services/notifications.service';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import type { InAppNotification, InAppNotificationsPage } from '../types/notifications.types';

export function useNotificationActions() {
  const queryClient = useQueryClient();

  const markReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      notificationsService.markNotificationAsRead(notificationId),
    onSuccess: (updated) => {
      // Ensure all list queries have the updated notification marked as read
      queryClient.setQueriesData<InAppNotificationsPage>(
        { queryKey: ['notifications', 'list'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((item) =>
              item._id === updated._id ? { ...item, isRead: true } : item
            ),
          };
        }
      );
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsService.markAllNotificationsAsRead(),
    onSuccess: () => {
      // Zero out all unread count queries immediately
      queryClient.setQueriesData<number>(
        { queryKey: ['notifications', 'unread-total'] },
        () => 0
      );
      queryClient.setQueriesData<number>(
        { queryKey: ['notifications', 'unread-category'] },
        () => 0
      );

      // Mark all items as read across all cached lists
      queryClient.setQueriesData<InAppNotificationsPage>(
        { queryKey: ['notifications', 'list'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((item) => ({ ...item, isRead: true })),
          };
        }
      );
    },
  });

  const markAsRead = (notification: InAppNotification) => {
    // Only optimistically decrement unread counter if item was unread
    if (!notification.isRead) {
      queryClient.setQueriesData<number>(
        { queryKey: QUERY_KEYS.NOTIFICATIONS.UNREAD_TOTAL, exact: true },
        (old = 1) => Math.max(0, old - 1)
      );

      if (notification.category) {
        queryClient.setQueriesData<number>(
          { queryKey: QUERY_KEYS.NOTIFICATIONS.UNREAD_COUNT(notification.category), exact: true },
          (old = 1) => Math.max(0, old - 1)
        );
      }

      // Optimistically update list queries
      queryClient.setQueriesData<InAppNotificationsPage>(
        { queryKey: ['notifications', 'list'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((item) =>
              item._id === notification._id ? { ...item, isRead: true } : item
            ),
          };
        }
      );
    }

    return markReadMutation.mutateAsync(notification._id);
  };

  const markAllAsRead = () => {
    // Optimistic reset
    queryClient.setQueriesData<number>(
      { queryKey: ['notifications', 'unread-total'] },
      () => 0
    );
    queryClient.setQueriesData<number>(
      { queryKey: ['notifications', 'unread-category'] },
      () => 0
    );

    queryClient.setQueriesData<InAppNotificationsPage>(
      { queryKey: ['notifications', 'list'] },
      (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item) => ({ ...item, isRead: true })),
        };
      }
    );

    return markAllReadMutation.mutateAsync();
  };

  return {
    markAsRead,
    markAllAsRead,
    isMarkingRead: markReadMutation.isPending,
    isMarkingAllRead: markAllReadMutation.isPending,
  };
}
