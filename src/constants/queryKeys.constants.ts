export const QUERY_KEYS = {
  AUTH: {
    ME: ['auth', 'me'] as const,
  },
  AUCTIONS: {
    ALL: ['auctions'] as const,
    DETAIL: (id: string) => ['auctions', 'detail', id] as const,
    MY_AUCTIONS: ['auctions', 'my'] as const,
    MY_WON: ['auctions', 'won'] as const,
  },
  USERS: {
    PUBLIC_PROFILE: (userId: string) => ['users', 'public', userId] as const,
  },
  BIDS: {
    BY_AUCTION: (auctionId: string) => ['bids', auctionId] as const,
    MY_BIDS: ['bids', 'my'] as const,
    MY_AUTO_BID: (auctionId: string) => ['auto-bid', auctionId] as const,
  },
  WALLET: {
    MY_WALLET: ['wallet', 'my'] as const,
    TRANSACTIONS: ['wallet', 'transactions'] as const,
    FEE_PREVIEW: (amount: number, method: string) =>
      ['wallet', 'fee-preview', amount, method] as const,
    MY_WITHDRAWALS: (page?: number, filter?: Record<string, unknown>) =>
      ['wallet', 'withdrawals', page, filter] as const,
    WITHDRAWAL_DETAIL: (id: string) => ['wallet', 'withdrawal', id] as const,
  },
  ESCROW: {
    MY_ESCROWS: ['escrow', 'my'] as const,
    BY_AUCTION: (auctionId: string) => ['escrow', 'auction', auctionId] as const,
    DETAIL: (id: string) => ['escrow', id] as const,
    DISPUTE: (id: string) => ['dispute', id] as const,
    DISPUTE_BY_AUCTION: (auctionId: string) => ['dispute', 'auction', auctionId] as const,
  },
  NOTIFICATIONS: {
    ALL: ['notifications'] as const,
    LIST: (page?: number, limit?: number, filter?: Record<string, unknown>) =>
      ['notifications', 'list', page, limit, filter] as const,
    UNREAD_TOTAL: ['notifications', 'unread-total'] as const,
    UNREAD_COUNT: (category?: string) =>
      category
        ? (['notifications', 'unread-category', category] as const)
        : (['notifications', 'unread-total'] as const),
  },
  CHAT: {
    MESSAGES: (auctionId: string) => ['chat', auctionId] as const,
    READ_STATE: (auctionId: string) => ['chat', 'read-state', auctionId] as const,
    READ_STATES: (auctionId: string) => ['chat', 'read-states', auctionId] as const,
    MY_ROOMS: (page?: number) => ['chat', 'rooms', page] as const,
  },
  REVIEWS: {
    ALL: ['reviews'] as const,
    USER_REVIEWS: (
      userId: string,
      page?: number,
      limit?: number,
      filter?: unknown,
      sort?: unknown
    ) => ['reviews', 'user', userId, page, limit, filter, sort] as const,
    USER_STATS: (userId: string) => ['reviews', 'stats', userId] as const,
    CAN_REVIEW: (auctionId: string) => ['reviews', 'can-review', auctionId] as const,
    MY_WRITTEN: (
      page?: number,
      limit?: number,
      filter?: unknown,
      sort?: unknown
    ) => ['reviews', 'my-written', page, limit, filter, sort] as const,
    DETAIL: (id: string) => ['reviews', 'detail', id] as const,
  },
  ADMIN: {
    STATS: ['admin', 'stats'] as const,
    USERS: ['admin', 'users'] as const,
    AUCTIONS: ['admin', 'auctions'] as const,
    DISPUTES: ['admin', 'disputes'] as const,
    TRANSACTIONS: ['admin', 'transactions'] as const,
  },
} as const;