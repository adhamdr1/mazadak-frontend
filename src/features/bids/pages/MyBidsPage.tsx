import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ChevronRight,
  ChevronLeft,
  Gavel,
  TrendingUp,
  PackageOpen,
  Trophy,
  AlertCircle,
  History,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { EmptyState } from '@/components/feedback/EmptyState';
import { MyBidsStats } from '../components/MyBidsStats';
import { MyBidsFilters } from '../components/MyBidsFilters';
import { MyBidCard } from '../components/MyBidCard';
import { MyBidsSkeleton } from '../components/MyBidsSkeleton';
import { useMyBids } from '../hooks/useMyBids';
import { ROUTES } from '@/constants/routes.constants';
import { toLocalizedDigits } from '@/utils/formatters';

export const MyBidsPage: React.FC = () => {
  const { t, i18n } = useTranslation(['bids', 'common', 'auctions']);
  const { t: tCommon } = useTranslation('common');
  const isRTL = i18n.language?.startsWith('ar');
  const navigate = useNavigate();
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  const {
    statusFilter,
    sortOption,
    page,
    bids,
    total,
    totalPages,
    isLoading,
    error,
    stats,
    setStatus,
    setSort,
    setPage,
    resetFilters,
    refetch,
  } = useMyBids();

  // Dynamic SEO Title
  useEffect(() => {
    document.title = `${t('pageTitle')} — ${tCommon('appName')}`;
  }, [t, tCommon]);

  const hasActiveFilters = statusFilter !== 'ALL' || sortOption !== 'NEWEST';

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* 1. Unified Header & Quick Stats (Centered on half-screen, row on full-screen desktop) */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6">
        <div className="space-y-1.5 text-center lg:text-start">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {t('pageTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
            {t('myBids.subtitle')}
          </p>
        </div>

        {/* Compact Quick Stats (full width 3-column on half-screen, inline flex on desktop) */}
        <MyBidsStats
          stats={stats}
          activeStatus={statusFilter}
          onSelectStatus={setStatus}
          className="w-full lg:w-auto"
        />
      </div>

      {/* 3. Filter, Sort & Listings Container */}
      <Card
        glass
        padding="none"
        className="p-4 sm:p-6 lg:p-8 space-y-6 shadow-xs border-slate-200/90 dark:border-slate-800"
      >
        <MyBidsFilters
          statusFilter={statusFilter}
          sortOption={sortOption}
          onSortChange={setSort}
          onResetFilters={resetFilters}
        />

        {/* 5. Main Bids Grid / Empty State */}
        {isLoading ? (
          <MyBidsSkeleton />
        ) : error ? (
          <EmptyState
            icon={<AlertCircle className="text-amber-500" />}
            title={tCommon('error')}
            description={error}
            action={{
              label: tCommon('retry'),
              onClick: () => refetch(),
              variant: 'primary',
            }}
          />
        ) : bids.length === 0 ? (
          <EmptyState
            icon={
              hasActiveFilters ? (
                statusFilter === 'WINNING' ? (
                  <Trophy className="text-emerald-500" />
                ) : statusFilter === 'OUTBID' ? (
                  <History className="text-slate-400" />
                ) : (
                  <PackageOpen className="text-amber-500" />
                )
              ) : (
                <Gavel className="text-amber-500" />
              )
            }
            title={
              hasActiveFilters
                ? statusFilter === 'WINNING'
                  ? t('myBids.empty.winningTitle')
                  : statusFilter === 'OUTBID'
                    ? t('myBids.empty.outbidTitle')
                    : t('myBids.empty.allTitle')
                : t('myBids.empty.allTitle')
            }
            description={
              hasActiveFilters
                ? statusFilter === 'WINNING'
                  ? t('myBids.empty.winningDesc')
                  : statusFilter === 'OUTBID'
                    ? t('myBids.empty.outbidDesc')
                    : t('myBids.empty.allDesc')
                : t('myBids.empty.allDesc')
            }
            action={
              hasActiveFilters
                ? {
                    label: t('myBids.empty.clearFilters'),
                    onClick: resetFilters,
                    variant: 'outline',
                  }
                : {
                    label: t('myBids.empty.browseButton'),
                    onClick: () => navigate(ROUTES.AUCTIONS),
                    variant: 'accent',
                    icon: <TrendingUp className="w-4 h-4" />,
                  }
            }
          />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {bids.map((bid) => (
                <MyBidCard key={bid._id} bid={bid} />
              ))}
            </div>

            {/* 6. Pagination Bar */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-800 text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  {t('myBids.pagination.showingResults', {
                    current: isRTL ? toLocalizedDigits(bids.length, true) : bids.length,
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
                    {t('myBids.pagination.prev')}
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
                    {t('myBids.pagination.next')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default MyBidsPage;
