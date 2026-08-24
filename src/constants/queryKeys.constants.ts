export const QUERY_KEYS = {
  AUTH: {
    ME: ['auth', 'me'] as const,
  },
  AUCTIONS: {
    ALL: ['auctions'] as const,
    DETAIL: (id: string) => ['auctions', id] as const,
    MY_AUCTIONS: ['auctions', 'my'] as const,
    MY_WON: ['auctions', 'won'] as const,
  },
  BIDS: {
    BY_AUCTION: (auctionId: string) => ['bids', auctionId] as const,
    MY_BIDS: ['bids', 'my'] as const,
    MY_AUTO_BID: (auctionId: string) => ['auto-bid', auctionId] as const,
  },
  WALLET: {
    MY_WALLET: ['wallet', 'my'] as const,
    TRANSACTIONS: ['wallet', 'transactions'] as const,
  },
  ESCROW: {
    MY_ESCROWS: ['escrow', 'my'] as const,
    BY_AUCTION: (auctionId: string) => ['escrow', 'auction', auctionId] as const,
    DETAIL: (id: string) => ['escrow', id] as const,
    DISPUTE: (id: string) => ['dispute', id] as const,
  },
  NOTIFICATIONS: {
    ALL: ['notifications'] as const,
    UNREAD_COUNT: ['notifications', 'unread-count'] as const,
  },
  CHAT: {
    MESSAGES: (auctionId: string) => ['chat', auctionId] as const,
  },
  REVIEWS: {
    USER_REVIEWS: (userId: string) => ['reviews', 'user', userId] as const,
    CAN_REVIEW: (auctionId: string) => ['reviews', 'can-review', auctionId] as const,
  },
  ADMIN: {
    STATS: ['admin', 'stats'] as const,
    USERS: ['admin', 'users'] as const,
    AUCTIONS: ['admin', 'auctions'] as const,
    DISPUTES: ['admin', 'disputes'] as const,
    TRANSACTIONS: ['admin', 'transactions'] as const,
  },
} as const;