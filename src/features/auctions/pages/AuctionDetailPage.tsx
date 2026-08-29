import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Gavel,
  User,
  LogOut,
  LogIn,
  UserPlus,
  PlusCircle,
  AlertTriangle,
} from 'lucide-react';
import { useAuctionDetail } from '../hooks/useAuctionDetail';
import { AuctionImageGallery } from '../components/detail/AuctionImageGallery';
import { AuctionInfoSection } from '../components/detail/AuctionInfoSection';
import { AuctionDescription } from '../components/detail/AuctionDescription';
import { AuctionTermsSection } from '../components/detail/AuctionTermsSection';
import { AuctionSellerCard } from '../components/detail/AuctionSellerCard';
import { AuctionBiddingCTA } from '../components/detail/AuctionBiddingCTA';
import { AuctionDetailSkeleton } from '../components/detail/AuctionDetailSkeleton';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes.constants';

export const AuctionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation('auctions');
  const { t: tCommon } = useTranslation('common');
  const { user, isAuthenticated, logout } = useAuth();

  const {
    auction,
    effectiveStatus,
    isLoading,
    isError,
    error,
    isSeller,
    isWinner,
  } = useAuctionDetail(id);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link to={ROUTES.HOME} className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 group-hover:scale-105 transition-transform">
              <Gavel className="w-5 h-5" />
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              {tCommon('appName')}
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold">
            <Link
              to={ROUTES.HOME}
              className="text-slate-600 dark:text-slate-400 hover:text-amber-500 transition-colors"
            >
              {tCommon('nav.home')}
            </Link>
            <Link
              to={ROUTES.AUCTIONS}
              className="text-amber-500 font-bold border-b-2 border-amber-500 pb-0.5"
            >
              {t('title')}
            </Link>
            {isAuthenticated && (
              <Link
                to={ROUTES.MY_AUCTIONS}
                className="text-slate-600 dark:text-slate-400 hover:text-amber-500 transition-colors"
              >
                {t('myAuctions.title')}
              </Link>
            )}
          </nav>

          {/* User & Settings Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link to={ROUTES.CREATE_AUCTION}>
                  <Button
                    variant="accent"
                    size="sm"
                    leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
                    className="hidden sm:inline-flex"
                  >
                    {t('create.title')}
                  </Button>
                </Link>

                <div className="hidden lg:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <User className="w-3.5 h-3.5 text-amber-500" />
                  <span>{user?.firstName}</span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  leftIcon={<LogOut className="w-3.5 h-3.5" />}
                  className="text-xs text-slate-500 hover:text-red-500"
                >
                  {tCommon('nav.logout')}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link to={ROUTES.LOGIN}>
                  <Button variant="ghost" size="sm" leftIcon={<LogIn className="w-3.5 h-3.5" />}>
                    {tCommon('nav.login')}
                  </Button>
                </Link>
                <Link to={ROUTES.REGISTER}>
                  <Button variant="accent" size="sm" leftIcon={<UserPlus className="w-3.5 h-3.5" />}>
                    {tCommon('nav.register')}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link to={ROUTES.HOME} className="hover:text-amber-500 transition-colors">
            {tCommon('nav.home')}
          </Link>
          <span>/</span>
          <Link to={ROUTES.AUCTIONS} className="hover:text-amber-500 transition-colors">
            {t('title')}
          </Link>
          {auction && (
            <>
              <span>/</span>
              <span className="text-slate-800 dark:text-slate-200 font-semibold truncate max-w-xs sm:max-w-md">
                {auction.title}
              </span>
            </>
          )}
        </nav>

        {/* Loading State */}
        {isLoading && <AuctionDetailSkeleton />}

        {/* Error / Not Found State */}
        {isError && !isLoading && (
          <div className="py-16 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold">{t('detail.notFoundTitle')}</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              {error || t('detail.notFoundMessage')}
            </p>
            <div className="pt-2">
              <Link to={ROUTES.AUCTIONS}>
                <Button variant="accent" size="md">
                  {t('detail.backToAuctions')}
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Auction Loaded Details */}
        {auction && effectiveStatus && (
          <>
            {/* Primary 2-Column Grid: Visual Showcase & Specifications vs Sticky Action Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              {/* Left Column: Visual Showcase, Meta Specs, & Item Description */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                {/* Image Gallery Showcase */}
                <AuctionImageGallery
                  images={auction.images}
                  title={auction.title}
                  category={auction.category}
                  status={effectiveStatus}
                />

                {/* Title & Specifications Grid */}
                <AuctionInfoSection auction={auction} />

                {/* Detailed Item Description */}
                <AuctionDescription description={auction.description} />
              </div>

              {/* Right Column: Sticky Action Box & Seller Card */}
              <div className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-24 self-start">
                {/* Bidding CTA & Countdown Card */}
                <AuctionBiddingCTA
                  auction={auction}
                  effectiveStatus={effectiveStatus}
                  isSeller={isSeller}
                  isWinner={isWinner}
                />

                {/* Verified Seller Profile Card — strictly visible for buyers and guests */}
                {!isSeller && (
                  <AuctionSellerCard
                    sellerId={auction.sellerId}
                    canContact={isWinner}
                  />
                )}
              </div>
            </div>

            {/* Dedicated Bottom Section: Auction Terms & Platform Rules */}
            <section aria-label="Auction Terms">
              <AuctionTermsSection />
            </section>
          </>
        )}
      </main>

      {/* Global Footer with 100% Localized Text */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-400 dark:text-slate-600 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>{tCommon('footerCopyright')}</span>
          <div className="flex items-center gap-4 text-xs font-medium">
            <Link to={ROUTES.HOME} className="hover:text-amber-500 transition-colors">
              {tCommon('nav.home')}
            </Link>
            <Link to={ROUTES.AUCTIONS} className="hover:text-amber-500 transition-colors">
              {t('title')}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuctionDetailPage;
