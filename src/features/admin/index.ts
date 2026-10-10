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

// Schemas
export { adminAdjustBalanceSchema, type AdminAdjustBalanceFormData } from './schemas/adminAdjustBalance.schema';

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

// Pages
export { AdminDashboardPage } from './pages/AdminDashboardPage';
export { AdminUsersPage } from './pages/AdminUsersPage';

