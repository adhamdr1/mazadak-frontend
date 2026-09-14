import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { History, Gavel, Radio, AlertCircle, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';
import { useAuctionBids } from '../hooks/useAuctionBids';
import { BidHistoryItem } from './BidHistoryItem';
import { BidHistorySkeleton } from './BidHistorySkeleton';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/common/Button';
import { formatPrice } from '@/utils/formatters';
import type { AuctionStatus } from '@/features/auctions/types/auctions.types';

export interface AuctionBidHistoryProps {
  auctionId: string;
  auctionStatus?: AuctionStatus;
}

export const AuctionBidHistory: React.FC<AuctionBidHistoryProps> = ({
  auctionId,
  auctionStatus = 'ACTIVE',
}) => {
  const { t, i18n } = useTranslation('bids');
  const isRTL = i18n.dir() === 'rtl';
  const { user } = useAuth();
  const listContainerRef = useRef<HTMLDivElement>(null);

  const {
    bids,
    total,
    hasNextPage,
    canShowLess,
    isLoading,
    isFetching,
    error,
    loadMore,
    showLess,
    refetch,
  } = useAuctionBids(auctionId);

  const handleShowLess = () => {
    showLess();
    listContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section
      aria-label={t('sections.bidHistory')}
      className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:border-amber-500/60 dark:hover:border-amber-500/60 hover:shadow-md transition-all duration-300 space-y-3.5"
    >
      {/* Header with Title, Live Badge & Total Bids Pill */}
      <div className="flex items-center justify-between flex-wrap gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 shrink-0">
            <History className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {t('bidHistory.title')}
            </h3>

            {/* Real-time WS Stream Live Indicator */}
            {auctionStatus === 'ACTIVE' && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <Radio className="w-3 h-3 hidden sm:inline" />
                <span>{t('bidHistory.live')}</span>
              </span>
            )}
          </div>
        </div>

        {/* Total Bids Count Pill */}
        {total > 0 && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {isRTL
              ? total === 1
                ? t('bidHistory.totalBidsOne')
                : total === 2
                ? t('bidHistory.totalBidsTwo')
                : total >= 3 && total <= 10
                ? t('bidHistory.totalBidsFew', { count: formatPrice(total, true) })
                : t('bidHistory.totalBidsMany', { count: formatPrice(total, true) })
              : total === 1
              ? t('bidHistory.totalBids', { count: total })
              : t('bidHistory.totalBids_plural', { count: formatPrice(total, false) })}
          </span>
        )}
      </div>

      {/* Content Stream Area */}
      {isLoading ? (
        <BidHistorySkeleton count={3} />
      ) : error ? (
        <div className="py-6 text-center space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto border border-red-500/20">
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xs mx-auto">
            {error}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            {t('actions.viewHistory')}
          </Button>
        </div>
      ) : bids.length === 0 ? (
        <div className="py-8 text-center space-y-2 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto border border-slate-200 dark:border-slate-700">
            <Gavel className="w-5 h-5" />
          </div>
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300 px-4">
            {auctionStatus === 'PENDING'
              ? t('bidHistory.pendingEmpty')
              : auctionStatus === 'ENDED'
              ? t('bidHistory.endedEmpty')
              : t('bidHistory.empty')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Scrollable Container with Max Height */}
          <div
            ref={listContainerRef}
            className="space-y-2 max-h-[380px] sm:max-h-[440px] overflow-y-auto pe-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700"
          >
            {bids.map((bid, index) => (
              <BidHistoryItem
                key={bid._id || index}
                bid={bid}
                isWinning={index === 0 && (auctionStatus === 'ACTIVE' || auctionStatus === 'ENDED')}
                isLatest={index === 0}
                currentUserId={user?._id}
              />
            ))}
          </div>

          {/* Action Bar for Load More & Show Less */}
          {(hasNextPage || canShowLess) && (
            <div className="pt-1 flex items-center gap-2">
              {hasNextPage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadMore}
                  isLoading={isFetching}
                  leftIcon={<ChevronDown className="w-3.5 h-3.5 shrink-0" />}
                  className="flex-1 text-xs font-semibold py-2.5 border-slate-200 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500"
                >
                  {t('bidHistory.loadMore')}
                </Button>
              )}

              {canShowLess && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShowLess}
                  leftIcon={<ChevronUp className="w-3.5 h-3.5 shrink-0" />}
                  className="flex-1 text-xs font-medium py-2.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 border border-slate-200/60 dark:border-slate-800"
                >
                  {t('bidHistory.showLess')}
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default AuctionBidHistory;
