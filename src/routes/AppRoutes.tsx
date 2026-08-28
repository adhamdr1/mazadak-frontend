import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Gavel,
  LogIn,
  UserPlus,
  ShieldCheck,
  User,
  LogOut,
  KeyRound,
  HelpCircle,
  RefreshCw,
  MailCheck,
  CheckCircle2,
  Lock,
  AlertOctagon,
} from 'lucide-react';
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
import { AuctionListPage, AuctionDetailPage } from '@/features/auctions';
import { GuestRoute } from './GuestRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { UnauthorizedPage } from '@/pages/UnauthorizedPage';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes.constants';

// Clean Landing Page Component to test Auth & Routes interactively
const HomePage: React.FC = () => {
  const { t } = useTranslation('common');
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
            <Gavel className="w-5 h-5" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">
            {t('appName')}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <ThemeToggle />

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <User className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono">
                  {user?.role}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                leftIcon={<LogOut className="w-3.5 h-3.5" />}
              >
                {t('nav.logout')}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to={ROUTES.LOGIN}>
                <Button variant="ghost" size="sm" leftIcon={<LogIn className="w-3.5 h-3.5" />}>
                  {t('nav.login')}
                </Button>
              </Link>
              <Link to={ROUTES.REGISTER}>
                <Button variant="accent" size="sm" leftIcon={<UserPlus className="w-3.5 h-3.5" />}>
                  {t('nav.register')}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Showcase */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 flex flex-col items-center justify-center text-center">
        <Card glass padding="lg" className="w-full shadow-2xl space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {t('home.title')}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
              {t('home.subtitle')}
            </p>
          </div>

          {/* Action Button to Auctions */}
          <div className="pt-2">
            <Link to={ROUTES.AUCTIONS}>
              <Button variant="accent" size="lg" leftIcon={<Gavel className="w-4 h-4" />}>
                {t('nav.auctions')} →
              </Button>
            </Link>
          </div>

          {/* Quick Links Showcase with Professional SVG Icons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              {t('home.allPagesTitle')}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <Link to={ROUTES.LOGIN} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 transition-colors font-medium flex items-center justify-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                <span>{t('home.loginLink')}</span>
              </Link>
              <Link to={ROUTES.REGISTER} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 transition-colors font-medium flex items-center justify-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5 text-amber-500" />
                <span>{t('home.registerLink')}</span>
              </Link>
              <Link to={ROUTES.FORGOT_PASSWORD} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 transition-colors font-medium flex items-center justify-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>{t('home.forgotPasswordLink')}</span>
              </Link>
              <Link to={ROUTES.REACTIVATE} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 transition-colors font-medium flex items-center justify-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
                <span>{t('home.reactivateLink')}</span>
              </Link>
              <Link to={ROUTES.VERIFY_NOTICE} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 transition-colors font-medium flex items-center justify-center gap-1.5">
                <MailCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>{t('home.verifyNoticeLink')}</span>
              </Link>
              <Link to={`${ROUTES.VERIFY_EMAIL}?token=demo_token`} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 transition-colors font-medium flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>{t('home.verifyEmailLink')}</span>
              </Link>
              <Link
                to={ROUTES.FORGOT_PASSWORD}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 transition-colors font-medium flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>{t('home.resetPasswordLink')}</span>
              </Link>
              <Link
                to={ROUTES.UPDATE_PASSWORD}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 transition-colors font-medium flex items-center justify-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                <span>{t('home.updatePasswordLink')}</span>
              </Link>
              <Link to="/404-test" className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-red-500 transition-colors font-medium text-red-500 flex items-center justify-center gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5 text-red-500" />
                <span>{t('home.notFoundLink')}</span>
              </Link>
            </div>
          </div>
        </Card>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-400 dark:text-slate-600">
        © {new Date().getFullYear()} Mazadak Platform. All rights reserved.
      </footer>
    </div>
  );
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Home / Landing Showcase & Auction Routes */}
      <Route path={ROUTES.HOME} element={<HomePage />} />
      <Route path={ROUTES.AUCTIONS} element={<AuctionListPage />} />
      <Route path={ROUTES.AUCTION_DETAIL()} element={<AuctionDetailPage />} />

      {/* Guest Only Routes (Redirect to / if logged in) */}
      <Route element={<GuestRoute />}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        {/* Google OAuth registration completion — public but only valid with a token */}
        <Route path={ROUTES.GOOGLE_REGISTER} element={<GoogleRegisterPage />} />
      </Route>

      {/* Authenticated / Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path={ROUTES.UPDATE_PASSWORD} element={<UpdatePasswordPage />} />
      </Route>

      {/* Public / Token Recovery Routes */}
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

      {/* 403 & 404 Fallback Routes */}
      <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
