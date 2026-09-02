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
  Layers,
} from 'lucide-react';
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
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* 1. Breadcrumb Indicator */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
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

      {/* 2. Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Layers className="w-3.5 h-3.5" />
            <span>{t('myAuctions.title')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {t('myAuctions.title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {t('myAuctions.subtitle')}
          </p>
        </div>

        <Link to={ROUTES.CREATE_AUCTION}>
          <Button
            variant="accent"
            size="md"
            leftIcon={<PlusCircle className="w-4 h-4" />}
            className="shadow-sm shadow-amber-500/20 w-full sm:w-auto font-bold"
          >
            {t('myAuctions.createNewButton')}
          </Button>
        </Link>
      </div>

      {/* 3. Quick Metrics Overview */}
      <MyAuctionsStats stats={stats} />

      {/* 4. Filter, Search & Tabs Card */}
      <Card glass padding="lg" className="space-y-6 shadow-sm">
        <MyAuctionsFilterBar
          activeTab={activeTab}
          onTabChange={setTab}
          statusFilter={statusFilter}
          onStatusChange={setStatus}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearch}
          onResetFilters={resetFilters}
          totalCount={total}
        />

        {/* 5. Auctions Listing / Empty State */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
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
          <div className="py-14 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
              {hasActiveFilters ? (
                <PackageOpen className="w-8 h-8" />
              ) : activeTab === 'created' ? (
                <Gavel className="w-8 h-8" />
              ) : (
                <PackageOpen className="w-8 h-8" />
              )}
            </div>

            <div className="space-y-1.5">
              <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-200">
                {hasActiveFilters
                  ? t('myAuctions.noFilterResults')
                  : activeTab === 'created'
                    ? t('myAuctions.noCreated')
                    : t('myAuctions.noWon')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {hasActiveFilters
                  ? t('myAuctions.noFilterResultsHint')
                  : activeTab === 'created'
                    ? t('myAuctions.noCreatedHint')
                    : t('myAuctions.noWonHint')}
              </p>
            </div>

            <div className="pt-2">
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
                  <Button
                    variant="accent"
                    size="sm"
                    leftIcon={<Gavel className="w-4 h-4" />}
                  >
                    {t('myAuctions.browseAuctionsButton')}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
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
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-800 text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  {t('explore.showingResults', {
                    current: isRTL ? toLocalizedDigits(auctions.length, true) : auctions.length,
                    total: isRTL ? toLocalizedDigits(total, true) : total,
                  })}
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    leftIcon={<ChevronIcon className="w-3.5 h-3.5" />}
                  >
                    {t('explore.prevPage')}
                  </Button>

                  <span className="font-semibold px-2 text-slate-700 dark:text-slate-300">
                    {isRTL ? toLocalizedDigits(page, true) : page} /{' '}
                    {isRTL ? toLocalizedDigits(totalPages, true) : totalPages}
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

      {/* Cancel Confirmation Modal */}
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
