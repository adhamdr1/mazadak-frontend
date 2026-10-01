import { executeGraphQL } from '@/services/api/graphqlClient';
import { subscribeToSubscription } from '@/services/websocket/socketClient';
import type {
  InAppNotification,
  InAppNotificationsPage,
  NotificationsFilterInput,
  PaginationInput,
  NotificationCategory,
  NotificationReadPayload,
} from '../types/notifications.types';

// ==========================================
// GraphQL Operations (Fragments & Queries)
// ==========================================

export const NOTIFICATION_FIELDS_FRAGMENT = `
  fragment NotificationFields on InAppNotification {
    _id
    userId
    type
    category
    title
    body
    isRead
    referenceId
    referenceType
    createdAt
  }
`;

export const MY_NOTIFICATIONS_QUERY = `
  ${NOTIFICATION_FIELDS_FRAGMENT}
  query MyNotifications($input: PaginationInput!, $filter: NotificationsFilterInput) {
    myNotifications(input: $input, filter: $filter) {
      total
      totalPages
      hasNextPage
      items {
        ...NotificationFields
      }
    }
  }
`;

export const UNREAD_NOTIFICATIONS_COUNT_QUERY = `
  query UnreadNotificationsCount($category: NotificationCategory) {
    unreadNotificationsCount(category: $category)
  }
`;

export const MARK_NOTIFICATION_AS_READ_MUTATION = `
  mutation MarkNotificationAsRead($notificationId: ID!) {
    markNotificationAsRead(notificationId: $notificationId) {
      _id
      isRead
      category
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_AS_READ_MUTATION = `
  mutation MarkAllNotificationsAsRead {
    markAllNotificationsAsRead
  }
`;

export const NOTIFICATION_ADDED_SUBSCRIPTION = `
  ${NOTIFICATION_FIELDS_FRAGMENT}
  subscription OnNotificationAdded {
    notificationAdded {
      ...NotificationFields
    }
  }
`;

export const NOTIFICATION_READ_STATUS_UPDATED_SUBSCRIPTION = `
  subscription OnNotificationReadStatusUpdated {
    notificationReadStatusUpdated {
      notificationId
      unreadCount
      category
    }
  }
`;

// ==========================================
// Notifications Service Implementation
// ==========================================

export const notificationsService = {
  /**
   * Fetches paginated in-app notifications with optional server-side filtering
   */
  async getMyNotifications(
    input: PaginationInput = { page: 1, limit: 10 },
    filter?: NotificationsFilterInput
  ): Promise<InAppNotificationsPage> {
    const data = await executeGraphQL<{ myNotifications: InAppNotificationsPage }>(
      MY_NOTIFICATIONS_QUERY,
      { input, filter }
    );
    return data.myNotifications;
  },

  /**
   * Fetches total unread notifications count, or unread count for a specific category tab
   */
  async getUnreadNotificationsCount(category?: NotificationCategory): Promise<number> {
    const data = await executeGraphQL<{ unreadNotificationsCount: number }>(
      UNREAD_NOTIFICATIONS_COUNT_QUERY,
      { category }
    );
    return data.unreadNotificationsCount;
  },

  /**
   * Marks a single notification as read
   */
  async markNotificationAsRead(
    notificationId: string
  ): Promise<{ _id: string; isRead: boolean; category: NotificationCategory }> {
    const data = await executeGraphQL<{
      markNotificationAsRead: { _id: string; isRead: boolean; category: NotificationCategory };
    }>(MARK_NOTIFICATION_AS_READ_MUTATION, { notificationId });
    return data.markNotificationAsRead;
  },

  /**
   * Marks all user notifications as read
   */
  async markAllNotificationsAsRead(): Promise<boolean> {
    const data = await executeGraphQL<{ markAllNotificationsAsRead: boolean }>(
      MARK_ALL_NOTIFICATIONS_AS_READ_MUTATION
    );
    return data.markAllNotificationsAsRead;
  },

  /**
   * Subscribes to real-time incoming notifications (+1 counter / toast event)
   */
  subscribeToNotificationAdded(
    handlers: {
      next: (data: { notificationAdded: InAppNotification }) => void;
      error?: (err: unknown) => void;
      complete?: () => void;
    },
    token?: string | null
  ): () => void {
    return subscribeToSubscription<{ notificationAdded: InAppNotification }>(
      {
        query: NOTIFICATION_ADDED_SUBSCRIPTION,
      },
      handlers,
      token
    );
  },

  /**
   * Subscribes to real-time read status updates (-1 counter / cross-device sync)
   */
  subscribeToNotificationReadStatusUpdated(
    handlers: {
      next: (data: { notificationReadStatusUpdated: NotificationReadPayload }) => void;
      error?: (err: unknown) => void;
      complete?: () => void;
    },
    token?: string | null
  ): () => void {
    return subscribeToSubscription<{
      notificationReadStatusUpdated: NotificationReadPayload;
    }>(
      {
        query: NOTIFICATION_READ_STATUS_UPDATED_SUBSCRIPTION,
      },
      handlers,
      token
    );
  },
};
