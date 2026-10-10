/**
 * Admin Service
 * GraphQL API calls for Admin Module connected directly to NestJS GraphQL Backend.
 * Strictly adheres to `.agents/schema.gql` and `.agents/BACKEND_CONTRACT.md`.
 */

import { executeGraphQL } from '@/services/api/graphqlClient';
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
} from '../types/admin.types';

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
};

export default adminService;

