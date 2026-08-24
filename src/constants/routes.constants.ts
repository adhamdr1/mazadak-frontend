export const ROUTES = {
  HOME: '/',
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_EMAIL: '/verify-email',
  VERIFY_NOTICE: '/verify-notice',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  REACTIVATE: '/reactivate',

  // Auctions
  AUCTIONS: '/auctions',
  AUCTION_DETAIL: (id: string = ':id') => `/auctions/${id}`,
  CREATE_AUCTION: '/auctions/create',
  EDIT_AUCTION: (id: string = ':id') => `/auctions/${id}/edit`,
  MY_AUCTIONS: '/my-auctions',
  MY_WON_AUCTIONS: '/my-won-auctions',

  // Bids
  MY_BIDS: '/my-bids',

  // Wallet
  WALLET: '/wallet',
  WALLET_DEPOSIT: '/wallet/deposit',
  WALLET_WITHDRAW: '/wallet/withdraw',
  WALLET_TRANSACTIONS: '/wallet/transactions',

  // Escrow & Disputes
  MY_ESCROWS: '/my-escrows',
  ESCROW_DETAIL: (id: string = ':id') => `/escrow/${id}`,
  OPEN_DISPUTE: (id: string = ':id') => `/escrow/${id}/dispute`,
  DISPUTE_DETAIL: (id: string = ':id') => `/disputes/${id}`,

  // Chat & Notifications
  MESSAGES: '/messages',
  NOTIFICATIONS: '/notifications',

  // Users & Profile
  PROFILE: '/profile',
  USER_PUBLIC: (id: string = ':id') => `/users/${id}`,

  // Admin
  ADMIN: {
    DASHBOARD: '/admin',
    USERS: '/admin/users',
    AUCTIONS: '/admin/auctions',
    DISPUTES: '/admin/disputes',
    TRANSACTIONS: '/admin/transactions',
  },
} as const;