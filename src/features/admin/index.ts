/**
 * Admin Feature Module
 * Core Exports for Module 11 (Admin)
 */

// Types & Contracts
export * from './types/admin.types';

// Utilities
export * from './utils/admin.utils';

// Services
export { adminService } from './services/admin.service';

// Hooks
export { useAdminDashboardStats } from './hooks/useAdminDashboardStats';
export { useAdminTreasuryStats } from './hooks/useAdminTreasuryStats';
export { useAdminTransactions } from './hooks/useAdminTransactions';
export { useAdminUsers } from './hooks/useAdminUsers';
export { useAdminUserDetails } from './hooks/useAdminUserDetails';
export { useAdminToggleBan } from './hooks/useAdminToggleBan';
export { useAdminAdjustBalance } from './hooks/useAdminAdjustBalance';
export { useAdminAuctions } from './hooks/useAdminAuctions';
export { useAdminCancelAuction } from './hooks/useAdminCancelAuction';
export { useAdminAuctionReviews } from './hooks/useAdminAuctionReviews';
export { useAdminReviewModeration } from './hooks/useAdminReviewModeration';
export { useAdminDisputes } from './hooks/useAdminDisputes';
export { useAdminEscrows } from './hooks/useAdminEscrows';
export { useResolveDispute } from './hooks/useResolveDispute';
export { useUpdateDisputeStatus } from './hooks/useUpdateDisputeStatus';
export { useEscrowAdminActions } from './hooks/useEscrowAdminActions';
export { useAdminDisputesSubscription } from './hooks/useAdminDisputesSubscription';
export { useAdminWithdrawals } from './hooks/useAdminWithdrawals';
export { useAdminWithdrawalActions } from './hooks/useAdminWithdrawalActions';
export { useAdminWithdrawalSubscription } from './hooks/useAdminWithdrawalSubscription';

// Schemas
export { adminAdjustBalanceSchema, type AdminAdjustBalanceFormData } from './schemas/adminAdjustBalance.schema';
export { adminCancelAuctionSchema, type AdminCancelAuctionFormData } from './schemas/adminCancelAuction.schema';
export { adminResolveDisputeSchema, type AdminResolveDisputeFormData } from './schemas/adminResolveDispute.schema';
export { adminCompleteWithdrawalSchema, type AdminCompleteWithdrawalFormData } from './schemas/adminCompleteWithdrawal.schema';
export { adminRejectWithdrawalSchema, type AdminRejectWithdrawalFormData } from './schemas/adminRejectWithdrawal.schema';

// Components
export { AdminLayout } from './components/layout/AdminLayout';
export { AdminSidebar } from './components/layout/AdminSidebar';
export { AdminHeader } from './components/layout/AdminHeader';
export { StatKpiCard } from './components/dashboard/StatKpiCard';
export { TreasuryKpiCard } from './components/dashboard/TreasuryKpiCard';
export { RecentActivityFeed } from './components/dashboard/RecentActivityFeed';
export { AdminUsersTable } from './components/users/AdminUsersTable';
export { UserDetailsDrawer } from './components/users/UserDetailsDrawer';
export { AdjustBalanceModal } from './components/users/AdjustBalanceModal';
export { BanUserConfirmModal } from './components/users/BanUserConfirmModal';
export { AdminAuctionsTable } from './components/auctions/AdminAuctionsTable';
export { AdminCancelAuctionModal } from './components/auctions/AdminCancelAuctionModal';
export { AuctionReviewsModerationModal } from './components/auctions/AuctionReviewsModerationModal';
export { AdminDisputesTable } from './components/disputes/AdminDisputesTable';
export { AdminEscrowsTable } from './components/disputes/AdminEscrowsTable';
export { DisputeResolveModal } from './components/disputes/DisputeResolveModal';
export { TreasuryOverviewSection } from './components/financials/TreasuryOverviewSection';
export { WithdrawalsTable } from './components/financials/WithdrawalsTable';
export { CompleteWithdrawalModal } from './components/financials/CompleteWithdrawalModal';
export { RejectWithdrawalModal } from './components/financials/RejectWithdrawalModal';
export { TransactionsAuditTable } from './components/financials/TransactionsAuditTable';

// Pages
export { AdminDashboardPage } from './pages/AdminDashboardPage';
export { AdminUsersPage } from './pages/AdminUsersPage';
export { AdminAuctionsPage } from './pages/AdminAuctionsPage';
export { AdminDisputesPage } from './pages/AdminDisputesPage';
export { AdminFinancialsPage } from './pages/AdminFinancialsPage';
export { AdminTransactionsPage } from './pages/AdminTransactionsPage';


