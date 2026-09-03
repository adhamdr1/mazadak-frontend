import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  LoginPage,
  RegisterPage,
  GoogleRegisterPage,
  VerifyNoticePage,
  VerifyEmailPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  ReactivatePage,
  UpdatePasswordPage,
} from '@/features/auth';
import {
  AuctionListPage,
  AuctionDetailPage,
  CreateAuctionPage,
  EditAuctionPage,
  MyAuctionsPage,
} from '@/features/auctions';
import { HomePage } from '@/pages/HomePage';
import { AppLayout } from '@/components/layout/AppLayout';
import { GuestRoute } from './GuestRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { UnauthorizedPage } from '@/pages/UnauthorizedPage';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { ROUTES } from '@/constants/routes.constants';

export const AppRoutes: React.FC = () => {
  return (
    <>
      <ScrollToTop />
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
    </>
  );
};

export default AppRoutes;
