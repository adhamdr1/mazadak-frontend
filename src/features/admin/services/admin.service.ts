/**
 * Admin Service
 * GraphQL API calls for Admin Module connected directly to NestJS GraphQL Backend.
 * Strictly adheres to `.agents/schema.gql` and `.agents/BACKEND_CONTRACT.md`.
 */

import { executeGraphQL } from '@/services/api/graphqlClient';
import { subscribeToSubscription } from '@/services/websocket/socketClient';
import type {
  DashboardStats,
  TreasuryStats,
  AdminPaginationInput,
  AdminTransactionsPageData,
  TransactionsFilterInput,
  AdminUsersPageData,
  UsersFilterInput,
  AdminUserDetails,
  AdminAdjustBalanceInput,
  FindUserInput,
  AdminUpdateUserInput,
  User,
  AdminAuctionsPageData,
  AuctionsFilterInput,
  Review,
  AdminDisputesPageData,
  AdminEscrowsPageData,
  DisputeFilterInput,
  EscrowFilterInput,
  ResolveDisputeInput,
  UpdateDisputeStatusInput,
  DisputeData,
  EscrowData,
} from '../types/admin.types';
import type { DisputeStatusChangedPayload } from '@/features/escrow/types/escrow.types';

// ----------------------------------------------------
// GraphQL Operations (Batch 1: Dashboard, Treasury & Recent Activity)
// ----------------------------------------------------

const ADMIN_GET_DASHBOARD_STATS_QUERY = `
  query AdminGetDashboardStats {
    adminGetDashboardStats {
      totalUsers
      verifiedUsers
      activeAuctions
      completedAuctions
      cancelledAuctions
      totalWalletBalance
      todaysRevenue
      totalTransactions
      pendingWithdrawalsCount
      pendingWithdrawalsAmount
      totalCompletedPayouts
      totalCollectedFees
    }
  }
`;

const ADMIN_GET_TREASURY_STATS_QUERY = `
  query AdminGetTreasuryStats {
    adminGetTreasuryStats {
      totalWalletBalance
      totalHeldInWallets
      totalPendingWithdrawals
      pendingWithdrawalsCount
      totalHeldInEscrow
      totalCompletedPayouts
      totalCollectedFees
    }
  }
`;

const ADMIN_GET_TRANSACTIONS_QUERY = `
  query AdminGetTransactions($input: PaginationInput!, $filter: TransactionsFilterInput) {
    adminGetTransactions(input: $input, filter: $filter) {
      total
      totalPages
      hasNextPage
      items {
        _id
        walletId
        type
        amount
        currency
        status
        referenceId
        referenceType
        createdAt
      }
    }
  }
`;

// ----------------------------------------------------
// GraphQL Operations (Batch 2: User Management & Balance Adjustments)
// ----------------------------------------------------

const ADMIN_GET_USERS_QUERY = `
  query AdminGetUsers($input: PaginationInput!, $filter: UsersFilterInput) {
    adminGetUsers(input: $input, filter: $filter) {
      total
      totalPages
      hasNextPage
      items {
        _id
        firstName
        lastName
        email
        role
        authProvider
        phoneNumber
        dateOfBirth
        address {
          city
          street
        }
        isEmailVerified
        isBanned
        ratingStats {
          averageRating
          totalReviews
        }
        createdAt
      }
    }
  }
`;

const ADMIN_GET_USER_DETAILS_QUERY = `
  query AdminGetUserDetails($userId: ID!) {
    adminGetUserDetails(userId: $userId) {
      user {
        _id
        firstName
        lastName
        email
        role
        authProvider
        phoneNumber
        address {
          city
          street
        }
        isEmailVerified
        isBanned
        createdAt
      }
      wallet {
        _id
        userId
        balance
        heldBalance
        availableBalance
        createdAt
        updatedAt
      }
      recentAuctions {
        total
        totalPages
        hasNextPage
        items {
          _id
          title
          currentPrice
          status
          createdAt
        }
      }
      recentTransactions {
        total
        totalPages
        hasNextPage
        items {
          _id
          type
          amount
          currency
          status
          createdAt
        }
      }
    }
  }
`;

const ADMIN_TOGGLE_USER_BAN_MUTATION = `
  mutation AdminToggleUserBan($userId: ID!) {
    adminToggleUserBan(userId: $userId) {
      _id
      isBanned
    }
  }
`;

const ADMIN_ADJUST_USER_BALANCE_MUTATION = `
  mutation AdminAdjustUserBalance($input: AdminAdjustBalanceInput!) {
    adminAdjustUserBalance(input: $input) {
      _id
      userId
      balance
      heldBalance
      availableBalance
      updatedAt
    }
  }
`;

const ADMIN_UPDATE_USER_MUTATION = `
  mutation AdminUpdateUser($targetUser: FindUserInput!, $input: UpdateUserInput!) {
    adminUpdateUser(targetUser: $targetUser, input: $input) {
      _id
      firstName
      lastName
      email
      phoneNumber
      isBanned
    }
  }
`;

const ADMIN_DELETE_USER_MUTATION = `
  mutation AdminDeleteUser($targetUser: FindUserInput!) {
    adminDeleteUser(targetUser: $targetUser)
  }
`;

// ----------------------------------------------------
// GraphQL Operations (Batch 3: Auctions Moderation & Reviews)
// ----------------------------------------------------

const ADMIN_GET_AUCTIONS_QUERY = `
  query AdminGetAuctions($input: PaginationInput!, $filter: AuctionsFilterInput) {
    adminGetAuctions(input: $input, filter: $filter) {
      total
      totalPages
      hasNextPage
      items {
        _id
        sellerId
        title
        description
        images
        category
        startingPrice
        minimumBidIncrement
        currentPrice
        status
        startTime
        endTime
        winnerId
        isFinalized
        adminActionReason
        createdAt
        updatedAt
      }
    }
  }
`;

const ADMIN_CANCEL_AUCTION_MUTATION = `
  mutation AdminCancelAuction($auctionId: ID!, $reason: String!) {
    adminCancelAuction(auctionId: $auctionId, reason: $reason)
  }
`;

const ADMIN_AUCTION_REVIEWS_QUERY = `
  query AdminAuctionReviews($auctionId: ID!) {
    adminAuctionReviews(auctionId: $auctionId) {
      _id
      auctionId
      reviewerId
      reviewedUserId
      type
      status
      overallRating
      criteria {
        itemAccuracy
        communication
        packaging
        smoothExperience
      }
      comment
      reply
      repliedAt
      publishedAt
      createdAt
      reviewer {
        id
        firstName
        lastName
        city
      }
      reviewedUser {
        id
        firstName
        lastName
        city
      }
    }
  }
`;

const ADMIN_HIDE_REVIEW_MUTATION = `
  mutation AdminHideReview($reviewId: ID!) {
    hideReview(reviewId: $reviewId) {
      _id
      status
    }
  }
`;

const ADMIN_UNHIDE_REVIEW_MUTATION = `
  mutation AdminUnhideReview($reviewId: ID!) {
    unhideReview(reviewId: $reviewId) {
      _id
      status
    }
  }
`;

// ----------------------------------------------------
// Service Methods Implementation
// ----------------------------------------------------

export const adminService = {
  /**
   * Fetches overall platform dashboard metrics & operational KPIs
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const data = await executeGraphQL<{ adminGetDashboardStats: DashboardStats }>(
      ADMIN_GET_DASHBOARD_STATS_QUERY
    );
    return data.adminGetDashboardStats;
  },

  /**
   * Fetches treasury, liquidity, and escrow balances
   */
  async getTreasuryStats(): Promise<TreasuryStats> {
    const data = await executeGraphQL<{ adminGetTreasuryStats: TreasuryStats }>(
      ADMIN_GET_TREASURY_STATS_QUERY
    );
    return data.adminGetTreasuryStats;
  },

  /**
   * Fetches audit log of system transactions (with pagination and filters)
   */
  async getTransactions(
    input: AdminPaginationInput = { page: 1, limit: 10 },
    filter?: TransactionsFilterInput
  ): Promise<AdminTransactionsPageData> {
    const data = await executeGraphQL<{ adminGetTransactions: AdminTransactionsPageData }>(
      ADMIN_GET_TRANSACTIONS_QUERY,
      { input, filter }
    );
    return data.adminGetTransactions;
  },

  /**
   * Fetches paginated user list with full server-side filters (Batch 2)
   */
  async getAdminUsers(
    input: AdminPaginationInput = { page: 1, limit: 10 },
    filter?: UsersFilterInput
  ): Promise<AdminUsersPageData> {
    const data = await executeGraphQL<{ adminGetUsers: AdminUsersPageData }>(
      ADMIN_GET_USERS_QUERY,
      { input, filter }
    );
    return data.adminGetUsers;
  },

  /**
   * Fetches comprehensive user management profile including wallet & recent activity
   */
  async getAdminUserDetails(userId: string): Promise<AdminUserDetails> {
    const data = await executeGraphQL<{ adminGetUserDetails: AdminUserDetails }>(
      ADMIN_GET_USER_DETAILS_QUERY,
      { userId }
    );
    return data.adminGetUserDetails;
  },

  /**
   * Toggles user ban status (active -> banned or banned -> active)
   */
  async toggleUserBan(userId: string): Promise<{ _id: string; isBanned: boolean }> {
    const data = await executeGraphQL<{ adminToggleUserBan: { _id: string; isBanned: boolean } }>(
      ADMIN_TOGGLE_USER_BAN_MUTATION,
      { userId }
    );
    return data.adminToggleUserBan;
  },

  /**
   * Manually adjusts a user's wallet balance (CREDIT or DEBIT) with mandatory reason
   */
  async adjustUserBalance(input: AdminAdjustBalanceInput): Promise<AdminUserDetails['wallet']> {
    const data = await executeGraphQL<{ adminAdjustUserBalance: AdminUserDetails['wallet'] }>(
      ADMIN_ADJUST_USER_BALANCE_MUTATION,
      { input }
    );
    return data.adminAdjustUserBalance;
  },

  /**
   * Admin updates a user's details
   */
  async updateUser(targetUser: FindUserInput, input: AdminUpdateUserInput): Promise<User> {
    const data = await executeGraphQL<{ adminUpdateUser: User }>(
      ADMIN_UPDATE_USER_MUTATION,
      { targetUser, input }
    );
    return data.adminUpdateUser;
  },

  /**
   * Admin deletes a user account
   */
  async deleteUser(targetUser: FindUserInput): Promise<boolean> {
    const data = await executeGraphQL<{ adminDeleteUser: boolean }>(
      ADMIN_DELETE_USER_MUTATION,
      { targetUser }
    );
    return data.adminDeleteUser;
  },

  /**
   * Fetches paginated auctions with full server-side filters (Batch 3)
   */
  async getAdminAuctions(
    input: AdminPaginationInput = { page: 1, limit: 10 },
    filter?: AuctionsFilterInput
  ): Promise<AdminAuctionsPageData> {
    const data = await executeGraphQL<{ adminGetAuctions: AdminAuctionsPageData }>(
      ADMIN_GET_AUCTIONS_QUERY,
      { input, filter }
    );
    return data.adminGetAuctions;
  },

  /**
   * Cancels an auction administratively with a mandatory documented reason (>= 10 chars)
   */
  async cancelAuction(auctionId: string, reason: string): Promise<boolean> {
    const data = await executeGraphQL<{ adminCancelAuction: boolean }>(
      ADMIN_CANCEL_AUCTION_MUTATION,
      { auctionId, reason }
    );
    return data.adminCancelAuction;
  },

  /**
   * Fetches reviews associated with an auction for moderation
   */
  async getAuctionReviews(auctionId: string): Promise<Review[]> {
    const data = await executeGraphQL<{ adminAuctionReviews: Review[] }>(
      ADMIN_AUCTION_REVIEWS_QUERY,
      { auctionId }
    );
    return data.adminAuctionReviews;
  },

  /**
   * Hides a violating review
   */
  async hideReview(reviewId: string): Promise<Review> {
    const data = await executeGraphQL<{ hideReview: Review }>(
      ADMIN_HIDE_REVIEW_MUTATION,
      { reviewId }
    );
    return data.hideReview;
  },

  /**
   * Unhides a previously hidden review
   */
  async unhideReview(reviewId: string): Promise<Review> {
    const data = await executeGraphQL<{ unhideReview: Review }>(
      ADMIN_UNHIDE_REVIEW_MUTATION,
      { reviewId }
    );
    return data.unhideReview;
  },

  // ----------------------------------------------------
  // Batch 4: Disputes & Escrow Operations
  // ----------------------------------------------------

  /**
   * Fetches all disputes across the platform with server filters and pagination
   */
  async getAllDisputes(
    input: AdminPaginationInput = { page: 1, limit: 10 },
    filter?: DisputeFilterInput
  ): Promise<AdminDisputesPageData> {
    const data = await executeGraphQL<{ allDisputes: AdminDisputesPageData }>(
      ADMIN_ALL_DISPUTES_QUERY,
      { input, filter }
    );
    return data.allDisputes;
  },

  /**
   * Fetches all escrow contracts across the platform with server filters and pagination
   */
  async getAllEscrows(
    input: AdminPaginationInput = { page: 1, limit: 10 },
    filter?: EscrowFilterInput
  ): Promise<AdminEscrowsPageData> {
    const data = await executeGraphQL<{ allEscrows: AdminEscrowsPageData }>(
      ADMIN_ALL_ESCROWS_QUERY,
      { input, filter }
    );
    return data.allEscrows;
  },

  /**
   * Resolves a financial dispute with admin decision (REFUND_BUYER or PAY_SELLER) and optional notes
   */
  async resolveDispute(input: ResolveDisputeInput): Promise<DisputeData> {
    const data = await executeGraphQL<{ resolveDispute: DisputeData }>(
      ADMIN_RESOLVE_DISPUTE_MUTATION,
      { input }
    );
    return data.resolveDispute;
  },

  /**
   * Updates dispute status (e.g. to UNDER_REVIEW)
   */
  async updateDisputeStatus(input: UpdateDisputeStatusInput): Promise<DisputeData> {
    const data = await executeGraphQL<{ updateDisputeStatus: DisputeData }>(
      ADMIN_UPDATE_DISPUTE_STATUS_MUTATION,
      { input }
    );
    return data.updateDisputeStatus;
  },

  /**
   * Manually releases held escrow funds to seller
   */
  async releaseEscrow(escrowId: string, reason?: string): Promise<EscrowData> {
    const data = await executeGraphQL<{ releaseEscrow: EscrowData }>(
      ADMIN_RELEASE_ESCROW_MUTATION,
      { escrowId, reason }
    );
    return data.releaseEscrow;
  },

  /**
   * Manually refunds held escrow funds to buyer
   */
  async refundEscrow(escrowId: string, reason?: string): Promise<EscrowData> {
    const data = await executeGraphQL<{ refundEscrow: EscrowData }>(
      ADMIN_REFUND_ESCROW_MUTATION,
      { escrowId, reason }
    );
    return data.refundEscrow;
  },

  /**
   * Subscribes to real-time dispute status changes.
   * When disputeId is omitted, acts as a Global Admin Feed for all platform disputes.
   */
  subscribeToDisputeStatusChanged(
    handlers: {
      next: (payload: DisputeStatusChangedPayload) => void;
      error?: (err: unknown) => void;
      complete?: () => void;
    },
    token?: string | null,
    disputeId?: string
  ): () => void {
    return subscribeToSubscription<{ disputeStatusChanged: DisputeStatusChangedPayload }>(
      {
        query: ADMIN_DISPUTE_STATUS_CHANGED_SUBSCRIPTION,
        variables: disputeId ? { disputeId } : {},
      },
      {
        next: (data: { disputeStatusChanged: DisputeStatusChangedPayload }) => {
          if (data?.disputeStatusChanged) {
            handlers.next(data.disputeStatusChanged);
          }
        },
        error: handlers.error,
        complete: handlers.complete,
      },
      token
    );
  },
};

// ----------------------------------------------------
// GraphQL Operations (Batch 4: Disputes & Escrow)
// ----------------------------------------------------

const ADMIN_ALL_DISPUTES_QUERY = `
  query AdminAllDisputes($input: PaginationInput, $filter: DisputeFilterInput) {
    allDisputes(input: $input, filter: $filter) {
      total
      totalPages
      hasNextPage
      items {
        _id
        escrowId
        auctionId
        openedById
        againstUserId
        reason
        description
        evidenceUrls
        status
        adminDecision
        adminNotes
        resolvedAt
        createdAt
        updatedAt
      }
    }
  }
`;

const ADMIN_ALL_ESCROWS_QUERY = `
  query AdminAllEscrows($input: PaginationInput, $filter: EscrowFilterInput) {
    allEscrows(input: $input, filter: $filter) {
      total
      totalPages
      hasNextPage
      items {
        _id
        auctionId
        buyerId
        sellerId
        amount
        currency
        status
        inspectionPeriodEndsAt
        inspectionDurationHours
        releasedAt
        refundedAt
        releaseReason
        disputeId
        createdAt
        updatedAt
        auction {
          _id
          title
          images
          currentPrice
          startingPrice
        }
      }
    }
  }
`;

const ADMIN_RESOLVE_DISPUTE_MUTATION = `
  mutation AdminResolveDispute($input: ResolveDisputeInput!) {
    resolveDispute(input: $input) {
      _id
      escrowId
      auctionId
      openedById
      againstUserId
      reason
      description
      evidenceUrls
      status
      adminDecision
      adminNotes
      resolvedAt
      createdAt
      updatedAt
    }
  }
`;

const ADMIN_UPDATE_DISPUTE_STATUS_MUTATION = `
  mutation AdminUpdateDisputeStatus($input: UpdateDisputeStatusInput!) {
    updateDisputeStatus(input: $input) {
      _id
      status
    }
  }
`;

const ADMIN_RELEASE_ESCROW_MUTATION = `
  mutation AdminReleaseEscrow($escrowId: ID!, $reason: String) {
    releaseEscrow(escrowId: $escrowId, reason: $reason) {
      _id
      status
      releasedAt
      releaseReason
    }
  }
`;

const ADMIN_REFUND_ESCROW_MUTATION = `
  mutation AdminRefundEscrow($escrowId: ID!, $reason: String) {
    refundEscrow(escrowId: $escrowId, reason: $reason) {
      _id
      status
      refundedAt
      releaseReason
    }
  }
`;

const ADMIN_DISPUTE_STATUS_CHANGED_SUBSCRIPTION = `
  subscription AdminDisputeStatusChanged($disputeId: ID) {
    disputeStatusChanged(disputeId: $disputeId) {
      disputeId
      escrowId
      auctionId
      status
      adminDecision
      adminNotes
      resolvedAt
    }
  }
`;

export default adminService;

