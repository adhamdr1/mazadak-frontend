import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { GuestRoute } from './GuestRoute';
import { ProtectedRoute } from './ProtectedRoute';
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
const TransactionsPage = lazy(() => import('@/features/wallet/pages/TransactionsPage').then(m => ({ default: m.TransactionsPage })));

// 5. General Platform Pages
const HomePage = lazy(() => import('@/pages/HomePage').then(m => ({ default: m.HomePage })));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const UnauthorizedPage = lazy(() => import('@/pages/UnauthorizedPage').then(m => ({ default: m.UnauthorizedPage })));

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

            {/* Authenticated / Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path={ROUTES.CREATE_AUCTION} element={<CreateAuctionPage />} />
              <Route path={ROUTES.EDIT_AUCTION()} element={<EditAuctionPage />} />
              <Route path={ROUTES.MY_AUCTIONS} element={<MyAuctionsPage />} />
              <Route path={ROUTES.MY_BIDS} element={<MyBidsPage />} />
              <Route path={ROUTES.WALLET} element={<WalletPage />} />
              <Route path={ROUTES.WALLET_DEPOSIT} element={<DepositPage />} />
              <Route path={ROUTES.WALLET_WITHDRAW} element={<WithdrawPage />} />
              <Route path={ROUTES.WALLET_TRANSACTIONS} element={<TransactionsPage />} />
              <Route path={ROUTES.UPDATE_PASSWORD} element={<UpdatePasswordPage />} />
            </Route>
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

          {/* 4. Error Fallback Routes */}
          <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
};

export default AppRoutes;
