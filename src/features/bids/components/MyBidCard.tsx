import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  Trophy,
  Clock,
  Tag,
  Image as ImageIcon,
  History,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { auctionsService } from '@/features/auctions/services/auctions.service';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { ROUTES } from '@/constants/routes.constants';
import { formatPrice, formatDateTime, formatRelativeTime } from '@/utils/formatters';
import { cn } from '@/utils/cn';
import type { Bid } from '../types/bids.types';

export interface MyBidCardProps {
  bid: Bid;
}

export const MyBidCard: React.FC<MyBidCardProps> = ({ bid }) => {
  const { t, i18n } = useTranslation(['bids', 'auctions', 'common']);
  const isRTL = i18n.language?.startsWith('ar');

  // Lightweight cached query for the corresponding auction details
  const {
    data: auction,
    isLoading: isLoadingAuction,
    isError: isAuctionError,
  } = useQuery({
    queryKey: QUERY_KEYS.AUCTIONS.DETAIL(bid.auctionId),
    queryFn: () => auctionsService.getById(bid.auctionId),
    staleTime: 2 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const isWinning = bid.status === 'WINNING';
  const auctionStatus = auction?.status;
  const isAuctionActive = auctionStatus === 'ACTIVE';
  const isAuctionEnded = auctionStatus === 'ENDED';

  const auctionImage = auction?.images?.[0];

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between rounded-2xl p-4 sm:p-5 transition-all duration-200',
        'bg-white dark:bg-slate-900',
        'border border-slate-200/90 dark:border-slate-800 shadow-xs',
        'hover:border-amber-500/60 dark:hover:border-amber-500/50 hover:shadow-md hover:shadow-amber-500/5'
      )}
    >
      <div className="space-y-4">
        {/* Top Section: Fixed-Dimension Thumbnail + Title & Status */}
        <div className="flex items-start gap-3.5">
          {/* Robust Fixed-Dimension Image Container (resilient across mobile & split screen) */}
          <Link
            to={ROUTES.AUCTION_DETAIL(bid.auctionId)}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 aspect-square bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 transition-transform duration-200 group-hover:scale-[1.02]"
          >
            {auctionImage ? (
              <img
                src={auctionImage}
                alt={auction?.title || 'Auction thumbnail'}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : isLoadingAuction ? (
              <div className="w-full h-full animate-pulse bg-slate-200 dark:bg-slate-800" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <ImageIcon className="w-6 h-6 opacity-40" />
              </div>
            )}
          </Link>

          {/* Details & Status Badge */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              {/* Category or Auction ID */}
              {auction?.category ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  <Tag className="w-3 h-3 text-amber-500" />
                  <span className="truncate">{t(`auctions:categories.${auction.category}`, auction.category)}</span>
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 font-mono">#{bid.auctionId.slice(-6)}</span>
              )}

              {/* Status Badge: Emerald for Leading, Calm Neutral for Previous */}
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 border transition-colors',
                  isWinning
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                )}
              >
                {isWinning ? (
                  <>
                    <Trophy className="w-3 h-3 text-emerald-500" />
                    <span>{t('status.WINNING')}</span>
                  </>
                ) : (
                  <>
                    <History className="w-3 h-3 text-slate-400" />
                    <span>{t('status.OUTBID')}</span>
                  </>
                )}
              </span>
            </div>

            {/* Auction Title */}
            <Link
              to={ROUTES.AUCTION_DETAIL(bid.auctionId)}
              className="block font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 hover:text-amber-500 dark:hover:text-amber-400 line-clamp-1 transition-colors"
            >
              {isLoadingAuction ? (
                <span className="inline-block h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              ) : isAuctionError ? (
                <span className="text-slate-500 dark:text-slate-400 italic text-xs">
                  {t('myBids.card.auctionUnavailable')}
                </span>
              ) : (
                auction?.title || `${t('myBids.card.viewAuction')} #${bid.auctionId.slice(-6)}`
              )}
            </Link>

            {/* Auction Stage Indicator */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium text-[10px] border',
                  isAuctionActive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : isAuctionEnded
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                )}
              >
                {isAuctionActive
                  ? t('myBids.card.auctionActive')
                  : isAuctionEnded
                    ? t('myBids.card.auctionEnded')
                    : isAuctionError
                      ? t('myBids.card.auctionUnavailable')
                      : t('myBids.card.auctionPending')}
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Comparison Grid */}
        <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
          {/* User Bid Amount */}
          <div className="space-y-0.5">
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              {t('myBids.card.myBid')}
            </span>
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                {formatPrice(bid.amount, isRTL)}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {t('currency.symbol')}
              </span>
            </div>
          </div>

          {/* Current Auction Price */}
          <div className="space-y-0.5 border-s border-slate-200 dark:border-slate-700 ps-3">
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              {t('myBids.card.currentPrice')}
            </span>
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                {formatPrice(auction?.currentPrice ?? bid.amount, isRTL)}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {t('currency.symbol')}
              </span>
            </div>
          </div>
        </div>

        {/* Bid Placed Time */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
          <div className="flex items-center gap-1.5" title={formatDateTime(bid.createdAt, isRTL)}>
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-[11px]">
              {formatRelativeTime(bid.createdAt, isRTL)}
            </span>
          </div>

          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
            {formatDateTime(bid.createdAt, isRTL, { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Unified Action Button */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800">
        <Link
          to={ROUTES.AUCTION_DETAIL(bid.auctionId)}
          className={cn(
            'group/btn w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 select-none cursor-pointer shadow-2xs',
            isAuctionActive
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 hover:shadow-md hover:shadow-amber-500/20 active:scale-[0.99]'
              : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 border border-slate-200 dark:border-slate-700/80 hover:border-amber-500/30 dark:hover:border-amber-500/30'
          )}
        >
          {isAuctionActive ? (
            <>
              <span>{t('myBids.card.viewAuction')}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 transition-transform duration-200 group-hover/btn:translate-x-0.5 rtl:group-hover/btn:-translate-x-0.5" />
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover/btn:text-amber-500 transition-colors" />
              <span>{t('myBids.card.viewDetails')}</span>
            </>
          )}
        </Link>
      </div>
    </div>
  );
};

export default MyBidCard;
