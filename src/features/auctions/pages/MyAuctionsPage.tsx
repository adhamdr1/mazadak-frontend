import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  PlusCircle,
  Home,
  ChevronRight,
  ChevronLeft,
  Gavel,
  PackageOpen,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { MyAuctionsStats } from '../components/my-auctions/MyAuctionsStats';
import { MyAuctionsFilterBar } from '../components/my-auctions/MyAuctionsFilterBar';
import { MyAuctionCard } from '../components/my-auctions/MyAuctionCard';
import { CancelAuctionModal } from '../components/shared/CancelAuctionModal';
import { useMyAuctions } from '../hooks/useMyAuctions';
import { useCancelAuction } from '../hooks/useCancelAuction';
import { ROUTES } from '@/constants/routes.constants';
import type { Auction } from '../types/auctions.types';
import { toLocalizedDigits } from '@/utils/formatters';

export const MyAuctionsPage: React.FC = () => {
  const { t, i18n } = useTranslation(['auctions', 'common']);
  const { t: tCommon } = useTranslation('common');
  const isRTL = i18n.language?.startsWith('ar');
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const [auctionToCancel, setAuctionToCancel] = useState<Auction | null>(null);

  const {
    activeTab,
    statusFilter,
    categoryFilter,
    searchQuery,
    page,
    auctions,
    total,
    totalPages,
    isLoading,
    stats,
    setTab,
    setStatus,
    setCategory,
    setSearch,
    setPage,
    resetFilters,
    refetch,
  } = useMyAuctions();

  const {
    cancel,
    isLoading: isCancelling,
    error: cancelError,
    reset: resetCancelState,
  } = useCancelAuction({
    onSuccess: () => {
      setAuctionToCancel(null);
      refetch();
    },
  });

  const handleOpenCancelModal = (auction: Auction) => {
    resetCancelState();
    setAuctionToCancel(auction);
  };

  const handleCloseCancelModal = () => {
    if (isCancelling) return;
    setAuctionToCancel(null);
    resetCancelState();
  };

  const handleConfirmCancel = async (auctionId: string) => {
    try {
      await cancel(auctionId);
    } catch {
      // Error handled by hook
    }
  };

  const hasActiveFilters = statusFilter !== 'ALL' || searchQuery.trim().length > 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800/80 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo size="md" />

            {/* Breadcrumb indicator */}
            <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-400 ms-4 ps-4 border-s border-slate-200 dark:border-slate-800">
              <Link
                to={ROUTES.HOME}
                className="hover:text-amber-500 transition-colors flex items-center gap-1"
              >
                <Home className="w-3.5 h-3.5" />
                <span>{tCommon('nav.home')}</span>
              </Link>
              <ChevronIcon className="w-3 h-3 text-slate-400" />
              <Link to={ROUTES.AUCTIONS} className="hover:text-amber-500 transition-colors">
                {tCommon('nav.auctions')}
              </Link>
              <ChevronIcon className="w-3 h-3 text-slate-400" />
              <span className="text-amber-500 font-bold">{t('myAuctions.title')}</span>
            </div>
          </div>

          {/* Actions & Settings */}
          <div className="flex items-center gap-2.5">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link to={ROUTES.CREATE_AUCTION}>
              <Button
                variant="accent"
                size="sm"
                leftIcon={<PlusCircle className="w-4 h-4" />}
                className="shadow-sm shadow-amber-500/20"
              >
                {t('myAuctions.createNewButton')}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Page Title & Subtitle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Gavel className="w-3.5 h-3.5" />
              <span>{t('myAuctions.title')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              {t('myAuctions.title')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {t('myAuctions.subtitle')}
            </p>
          </div>
        </div>

        {/* 3. Summary Stats Cards */}
        <MyAuctionsStats stats={stats} />

        {/* 4. Filter & Tabs Bar */}
        <Card glass padding="lg" className="shadow-sm space-y-6">
          <MyAuctionsFilterBar
            activeTab={activeTab}
            statusFilter={statusFilter}
            categoryFilter={categoryFilter}
            searchQuery={searchQuery}
            totalCount={total}
            onTabChange={setTab}
            onStatusChange={setStatus}
            onCategoryChange={setCategory}
            onSearchChange={setSearch}
            onResetFilters={resetFilters}
          />

          {/* 5. Auction Cards Grid / Loading / Empty States */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-4 space-y-4 animate-pulse"
                >
                  <div className="aspect-[16/10] bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/2" />
                  <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
                </div>
              ))}
            </div>
          ) : auctions.length === 0 ? (
            <div className="py-14 text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
                <PackageOpen className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100">
                  {hasActiveFilters
                    ? t('myAuctions.noFilterResults')
                    : activeTab === 'created'
                      ? t('myAuctions.noCreated')
                      : t('myAuctions.noWon')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {hasActiveFilters
                    ? t('myAuctions.noFilterResultsHint')
                    : activeTab === 'created'
                      ? t('myAuctions.noCreatedHint')
                      : t('myAuctions.noWonHint')}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                {hasActiveFilters ? (
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    {t('myAuctions.clearFilters')}
                  </Button>
                ) : activeTab === 'created' ? (
                  <Link to={ROUTES.CREATE_AUCTION}>
                    <Button
                      variant="accent"
                      size="sm"
                      leftIcon={<PlusCircle className="w-4 h-4" />}
                    >
                      {t('myAuctions.createNewButton')}
                    </Button>
                  </Link>
                ) : (
                  <Link to={ROUTES.AUCTIONS}>
                    <Button variant="accent" size="sm">
                      {t('myAuctions.browseAuctionsButton')}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {auctions.map((auction) => (
                  <MyAuctionCard
                    key={auction._id}
                    auction={auction}
                    isWonTab={activeTab === 'won'}
                    onCancelClick={handleOpenCancelModal}
                  />
                ))}
              </div>

              {/* 6. Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {t('explore.pageInfo', {
                      page: toLocalizedDigits(page, isRTL),
                      totalPages: toLocalizedDigits(totalPages, isRTL),
                      total: toLocalizedDigits(total, isRTL),
                    })}
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                      leftIcon={<ArrowIcon className="w-3.5 h-3.5" />}
                    >
                      {t('explore.prevPage')}
                    </Button>

                    <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold">
                      {toLocalizedDigits(page, isRTL)} / {toLocalizedDigits(totalPages, isRTL)}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage(page + 1)}
                      rightIcon={<ChevronIcon className="w-3.5 h-3.5" />}
                    >
                      {t('explore.nextPage')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </main>

      {/* 7. Footer */}
      <footer className="w-full py-6 text-center text-xs text-slate-400 dark:text-slate-600 border-t border-slate-200/80 dark:border-slate-800/80 mt-auto">
        {tCommon('footerCopyright')}
      </footer>

      {/* 8. Cancel Confirmation Modal */}
      <CancelAuctionModal
        isOpen={Boolean(auctionToCancel)}
        auction={auctionToCancel}
        isLoading={isCancelling}
        error={cancelError}
        onClose={handleCloseCancelModal}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
};

export default MyAuctionsPage;
