import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { GuestRoute } from './GuestRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';
import { AdminLayout } from '@/features/admin/components/layout/AdminLayout';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { PageLoader } from '@/components/feedback/PageLoader';
import { ROUTES } from '@/constants/routes.constants';

// ----------------------------------------------------
// Lazy Loaded Route Chunks (Direct Imports to avoid barrel bundles)
// ----------------------------------------------------

// 1. Auth Module Pages
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const GoogleRegisterPage = lazy(() => import('@/features/auth/pages/GoogleRegisterPage').then(m => ({ default: m.GoogleRegisterPage })));
const VerifyNoticePage = lazy(() => import('@/features/auth/pages/VerifyNoticePage').then(m => ({ default: m.VerifyNoticePage })));
const VerifyEmailPage = lazy(() => import('@/features/auth/pages/VerifyEmailPage').then(m => ({ default: m.VerifyEmailPage })));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('@/features/auth/pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const ReactivatePage = lazy(() => import('@/features/auth/pages/ReactivatePage').then(m => ({ default: m.ReactivatePage })));
const UpdatePasswordPage = lazy(() => import('@/features/auth/pages/UpdatePasswordPage').then(m => ({ default: m.UpdatePasswordPage })));

// 2. Auctions Module Pages
const AuctionListPage = lazy(() => import('@/features/auctions/pages/AuctionListPage').then(m => ({ default: m.AuctionListPage })));
const AuctionDetailPage = lazy(() => import('@/features/auctions/pages/AuctionDetailPage').then(m => ({ default: m.AuctionDetailPage })));
const CreateAuctionPage = lazy(() => import('@/features/auctions/pages/CreateAuctionPage').then(m => ({ default: m.CreateAuctionPage })));
const EditAuctionPage = lazy(() => import('@/features/auctions/pages/EditAuctionPage').then(m => ({ default: m.EditAuctionPage })));
const MyAuctionsPage = lazy(() => import('@/features/auctions/pages/MyAuctionsPage').then(m => ({ default: m.MyAuctionsPage })));

// 3. Bids Module Pages
const MyBidsPage = lazy(() => import('@/features/bids/pages/MyBidsPage').then(m => ({ default: m.MyBidsPage })));

// 4. Wallet Module Pages
const WalletPage = lazy(() => import('@/features/wallet/pages/WalletPage').then(m => ({ default: m.WalletPage })));
const DepositPage = lazy(() => import('@/features/wallet/pages/DepositPage').then(m => ({ default: m.DepositPage })));
const WithdrawPage = lazy(() => import('@/features/wallet/pages/WithdrawPage').then(m => ({ default: m.WithdrawPage })));
const WithdrawalsPage = lazy(() => import('@/features/wallet/pages/WithdrawalsPage').then(m => ({ default: m.WithdrawalsPage })));
const TransactionsPage = lazy(() => import('@/features/wallet/pages/TransactionsPage').then(m => ({ default: m.TransactionsPage })));

// 5. Escrow Module Pages
const MyEscrowsPage = lazy(() => import('@/features/escrow/pages/MyEscrowsPage').then(m => ({ default: m.MyEscrowsPage })));
const EscrowDetailPage = lazy(() => import('@/features/escrow/pages/EscrowDetailPage').then(m => ({ default: m.EscrowDetailPage })));
const OpenDisputePage = lazy(() => import('@/features/escrow/pages/OpenDisputePage').then(m => ({ default: m.OpenDisputePage })));
const DisputeDetailPage = lazy(() => import('@/features/escrow/pages/DisputeDetailPage').then(m => ({ default: m.DisputeDetailPage })));

// 6. Chat Module Pages
const MessagesPage = lazy(() => import('@/features/chat/pages/MessagesPage').then(m => ({ default: m.MessagesPage })));

// 7. Notifications Module Pages
const NotificationsPage = lazy(() => import('@/features/notifications/pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })));

// 8. Users Module Pages
const ProfilePage = lazy(() => import('@/features/users/pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const PublicUserPage = lazy(() => import('@/features/users/pages/PublicUserPage').then(m => ({ default: m.PublicUserPage })));

// 9. Admin Module Pages
const AdminDashboardPage = lazy(() => import('@/features/admin/pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminUsersPage = lazy(() => import('@/features/admin/pages/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })));
const AdminAuctionsPage = lazy(() => import('@/features/admin/pages/AdminAuctionsPage').then(m => ({ default: m.AdminAuctionsPage })));
const AdminDisputesPage = lazy(() => import('@/features/admin/pages/AdminDisputesPage').then(m => ({ default: m.AdminDisputesPage })));
const AdminFinancialsPage = lazy(() => import('@/features/admin/pages/AdminFinancialsPage').then(m => ({ default: m.AdminFinancialsPage })));
const AdminTransactionsPage = lazy(() => import('@/features/admin/pages/AdminTransactionsPage').then(m => ({ default: m.AdminTransactionsPage })));

const HomePage = lazy(() => import('@/pages/HomePage').then(m => ({ default: m.HomePage })));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const UnauthorizedPage = lazy(() => import('@/pages/UnauthorizedPage').then(m => ({ default: m.UnauthorizedPage })));
const BannedAccountPage = lazy(() => import('@/pages/BannedAccountPage').then(m => ({ default: m.BannedAccountPage })));

export const AppRoutes: React.FC = () => {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* 1. Main Platform Shell (With Global Responsive Navbar & Footer) */}
          <Route element={<AppLayout />}>
            {/* Public Landing & Marketplace Routes */}
            <Route path={ROUTES.HOME} element={<HomePage />} />
            <Route path={ROUTES.AUCTIONS} element={<AuctionListPage />} />
            <Route path={ROUTES.AUCTION_DETAIL()} element={<AuctionDetailPage />} />
            <Route path={ROUTES.USER_PUBLIC()} element={<PublicUserPage />} />

            {/* Authenticated / Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path={ROUTES.CREATE_AUCTION} element={<CreateAuctionPage />} />
              <Route path={ROUTES.EDIT_AUCTION()} element={<EditAuctionPage />} />
              <Route path={ROUTES.MY_AUCTIONS} element={<MyAuctionsPage />} />
              <Route path={ROUTES.MY_BIDS} element={<MyBidsPage />} />
              <Route path={ROUTES.WALLET} element={<WalletPage />} />
              <Route path={ROUTES.WALLET_DEPOSIT} element={<DepositPage />} />
              <Route path={ROUTES.WALLET_WITHDRAW} element={<WithdrawPage />} />
              <Route path={ROUTES.WALLET_WITHDRAWALS} element={<WithdrawalsPage />} />
              <Route path={ROUTES.WALLET_TRANSACTIONS} element={<TransactionsPage />} />
              <Route path={ROUTES.MY_ESCROWS} element={<MyEscrowsPage />} />
              <Route path={ROUTES.ESCROW_DETAIL()} element={<EscrowDetailPage />} />
              <Route path={ROUTES.OPEN_DISPUTE()} element={<OpenDisputePage />} />
              <Route path={ROUTES.DISPUTE_DETAIL()} element={<DisputeDetailPage />} />
              <Route path={ROUTES.MESSAGES} element={<MessagesPage />} />
              <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
              <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
              <Route path={ROUTES.UPDATE_PASSWORD} element={<UpdatePasswordPage />} />
            </Route>

            {/* Dedicated Account Suspension & Error Fallback Routes */}
            <Route path={ROUTES.BANNED} element={<BannedAccountPage />} />
            <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* 2. Guest Only Auth Routes (Login / Register / Google Completion) */}
          <Route element={<GuestRoute />}>
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
            <Route path={ROUTES.GOOGLE_REGISTER} element={<GoogleRegisterPage />} />
          </Route>

          {/* 3. Public Email Verification & Recovery Routes */}
          <Route path={ROUTES.VERIFY_NOTICE} element={<VerifyNoticePage />} />
          <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
          <Route path={ROUTES.CONFIRM_EMAIL} element={<VerifyEmailPage />} />
          <Route path={ROUTES.CONFIRM_EMAIL_ALT} element={<VerifyEmailPage />} />

          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
          <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
          <Route path={ROUTES.RESET_PASSWORD_ALT} element={<ResetPasswordPage />} />

          <Route path={ROUTES.REACTIVATE} element={<ReactivatePage />} />
          <Route path={ROUTES.CONFIRM_REACTIVATION} element={<ReactivatePage />} />
          <Route path={ROUTES.CONFIRM_REACTIVATION_ALT} element={<ReactivatePage />} />

          {/* 4. Dedicated Admin Control Center (Strict role: ADMIN + Dedicated AdminLayout) */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path={ROUTES.ADMIN.DASHBOARD} element={<AdminDashboardPage />} />
              <Route path={ROUTES.ADMIN.USERS} element={<AdminUsersPage />} />
              <Route path={ROUTES.ADMIN.AUCTIONS} element={<AdminAuctionsPage />} />
              <Route path={ROUTES.ADMIN.DISPUTES} element={<AdminDisputesPage />} />
              <Route path={ROUTES.ADMIN.FINANCIALS} element={<AdminFinancialsPage />} />
              <Route path={ROUTES.ADMIN.TRANSACTIONS} element={<AdminTransactionsPage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </>
  );
};

export default AppRoutes;
