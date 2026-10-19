import type { User, Address, UserRole, AuthProvider } from '@/features/auth/types/auth.types';
import type { Auction, AuctionStatus, AuctionCategory, AuctionsFilterInput } from '@/features/auctions/types/auctions.types';
import type {
  Transaction,
  TransactionType,
  TransactionStatus,
  PayoutMethod,
  WithdrawalStatus,
  WithdrawalResponse,
  PayoutDetails,
  TransactionsFilterInput,
  WithdrawalsFilterInput,
} from '@/features/wallet/types/wallet.types';
import type {
  DisputeData,
  DisputeStatus,
  DisputeReason,
  DisputeResolution,
  EscrowData,
  EscrowStatus,
  DisputeFilterInput,
  EscrowFilterInput,
} from '@/features/escrow/types/escrow.types';
import type { Review, ReviewStatus } from '@/features/reviews/types/reviews.types';

export type {
  User,
  Address,
  UserRole,
  AuthProvider,
  Auction,
  AuctionStatus,
  AuctionCategory,
  AuctionsFilterInput,
  Transaction,
  TransactionType,
  TransactionStatus,
  PayoutMethod,
  WithdrawalStatus,
  WithdrawalResponse,
  PayoutDetails,
  TransactionsFilterInput,
  WithdrawalsFilterInput,
  DisputeData,
  DisputeStatus,
  DisputeReason,
  DisputeResolution,
  EscrowData,
  EscrowStatus,
  DisputeFilterInput,
  EscrowFilterInput,
  Review,
  ReviewStatus,
};

export interface DashboardStats {
  totalUsers: number;
  verifiedUsers: number;
  activeAuctions: number;
  completedAuctions: number;
  cancelledAuctions: number;
  totalWalletBalance: number;
  todaysRevenue: number;
  totalTransactions: number;
  pendingWithdrawalsCount: number;
  pendingWithdrawalsAmount: number;
  totalCompletedPayouts: number;
  totalCollectedFees: number;
}

export interface TreasuryStats {
  totalWalletBalance: number;
  totalHeldInWallets: number;
  totalPendingWithdrawals: number;
  pendingWithdrawalsCount: number;
  heldInWallets?: number;
  totalHeldInEscrow: number;
  totalCompletedPayouts: number;
  totalCollectedFees: number;
}

export interface AdminUserDetails {
  user: User;
  wallet?: {
    _id: string;
    userId: string;
    balance: string;
    heldBalance: string;
    availableBalance: string;
    createdAt?: string;
    updatedAt?: string;
  };
  recentAuctions?: {
    items: Auction[];
    total: number;
    totalPages: number;
    hasNextPage: boolean;
  };
  recentTransactions?: {
    items: Transaction[];
    total: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}

export type AdminAdjustBalanceType = 'CREDIT' | 'DEBIT';

export interface AdminAdjustBalanceInput {
  userId: string;
  amount: number;
  type: AdminAdjustBalanceType;
  reason: string;
}

export interface AdminCompleteWithdrawalInput {
  withdrawalId: string;
  adminReference: string;
  receiptUrl: string;
}

export interface AdminRejectWithdrawalInput {
  withdrawalId: string;
  rejectionReason: string;
}

export interface ResolveDisputeInput {
  disputeId: string;
  decision: DisputeResolution;
  adminNotes?: string;
}

export interface UpdateDisputeStatusInput {
  disputeId: string;
  status: DisputeStatus;
}

export interface UsersFilterInput {
  search?: string;
  sort?: {
    field: 'CREATED_AT' | 'FIRST_NAME' | 'LAST_NAME';
    order: 'ASC' | 'DESC';
  };
  isBanned?: boolean;
  role?: UserRole;
  isEmailVerified?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface FindUserInput {
  id: string;
}

export interface AdminUpdateUserInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: Address;
}

export interface AdminPaginationInput {
  page?: number;
  limit?: number;
}

export interface AdminUsersPageData {
  items: User[];
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface AdminAuctionsPageData {
  items: Auction[];
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface AdminDisputesPageData {
  items: DisputeData[];
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface AdminEscrowsPageData {
  items: EscrowData[];
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface AdminWithdrawalsPageData {
  items: WithdrawalResponse[];
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface AdminTransactionsPageData {
  items: Transaction[];
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}
