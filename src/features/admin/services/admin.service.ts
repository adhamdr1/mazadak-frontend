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
};

export default adminService;
