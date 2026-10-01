/**
 * Notification Categories supported by Mazadak
 */
export type NotificationCategory = 'AUCTIONS' | 'FINANCIAL' | 'ESCROW' | 'SYSTEM';

/**
 * All 23 In-App Notification Types matching schema.gql
 */
export type InAppNotificationType =
  | 'OUTBID'
  | 'AUCTION_WON'
  | 'AUCTION_ENDED_SELLER'
  | 'DEPOSIT_SUCCESSFUL'
  | 'WITHDRAWAL_COMPLETED'
  | 'WITHDRAWAL_REQUESTED'
  | 'WITHDRAWAL_REJECTED'
  | 'AUCTION_STARTED'
  | 'WELCOME'
  | 'NEW_BID'
  | 'AUCTION_CANCELLED'
  | 'AUCTION_CANCELLED_BY_ADMIN'
  | 'NEW_CHAT_MESSAGE'
  | 'REVIEW_RECEIVED'
  | 'REVIEW_REPLIED'
  | 'AUTO_BID_PLACED'
  | 'AUTO_BID_EXHAUSTED'
  | 'ESCROW_CREATED'
  | 'ESCROW_RELEASED'
  | 'ESCROW_REFUNDED'
  | 'DISPUTE_OPENED'
  | 'DISPUTE_RESOLVED'
  | 'DISPUTE_CANCELLED';

/**
 * Entities referenced by in-app notifications
 */
export type NotificationReferenceType =
  | 'AUCTION'
  | 'TRANSACTION'
  | 'WALLET'
  | 'REVIEW'
  | 'ESCROW'
  | 'DISPUTE'
  | 'WITHDRAWAL';

/**
 * In-App Notification entity matching GraphQL schema
 */
export interface InAppNotification {
  _id: string;
  userId: string;
  type: InAppNotificationType;
  category: NotificationCategory;
  title: string;
  body: string;
  isRead: boolean;
  referenceId: string | null;
  referenceType: NotificationReferenceType | null;
  createdAt: string;
}

/**
 * Paginated In-App Notifications Page Response
 */
export interface InAppNotificationsPage {
  items: InAppNotification[];
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}

/**
 * Sort order
 */
export type SortOrder = 'ASC' | 'DESC';

/**
 * Filter input for myNotifications query
 */
export interface NotificationsFilterInput {
  isRead?: boolean;
  category?: NotificationCategory;
  types?: InAppNotificationType[];
  sortOrder?: SortOrder;
}

/**
 * Pagination input
 */
export interface PaginationInput {
  page?: number;
  limit?: number;
}

/**
 * Payload broadcasted when a notification is marked read
 */
export interface NotificationReadPayload {
  notificationId: string | null;
  unreadCount: number;
  category: NotificationCategory | null;
}
