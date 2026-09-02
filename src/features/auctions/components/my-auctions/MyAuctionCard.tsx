import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Edit3,
  Trash2,
  ArrowUpRight,
  Trophy,
  ImageOff,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes.constants';
import type { Auction, AuctionStatus } from '../../types/auctions.types';
import { AuctionStatusBadge } from '../shared/AuctionStatusBadge';
import { CategoryBadge } from '../shared/CategoryBadge';
import { CountdownTimer } from '../shared/CountdownTimer';
import { PriceDisplay } from '../shared/PriceDisplay';
import { cn } from '@/utils/cn';

export interface MyAuctionCardProps {
  auction: Auction;
  isWonTab?: boolean;
  onCancelClick?: (auction: Auction) => void;
  className?: string;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1000&q=80';

export const MyAuctionCard: React.FC<MyAuctionCardProps> = ({
  auction,
  isWonTab = false,
  onCancelClick,
  className,
}) => {
  const { t } = useTranslation('auctions');
  const [imgError, setImgError] = useState(false);

  // Compute effective dynamic status to prevent desynchronization
  const effectiveStatus = useMemo<AuctionStatus>(() => {
    if (auction.status === 'ENDED' || auction.status === 'CANCELLED') {
      return auction.status;
    }
    const nowMs = Date.now();
    const endMs = new Date(auction.endTime).getTime();
    if (endMs <= nowMs) {
      return 'ENDED';
    }
    const startMs = new Date(auction.startTime).getTime();
    if (startMs > nowMs) {
      return 'PENDING';
    }
    return 'ACTIVE';
  }, [auction.status, auction.startTime, auction.endTime]);

  useEffect(() => {
    setImgError(false);
  }, [auction.images]);

  const primaryImage =
    !imgError && auction.images && auction.images.length > 0
      ? auction.images[0]
      : FALLBACK_IMAGE;

  const isPending = effectiveStatus === 'PENDING';
  const detailUrl = ROUTES.AUCTION_DETAIL(auction._id);

  return (
    <div
      className={cn(
        'group relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 transition-all duration-300 overflow-hidden flex flex-col',
        'shadow-sm hover:shadow-2xl hover:border-amber-500/70 hover:-translate-y-1',
        'dark:hover:border-amber-500/80 dark:hover:shadow-[0_12px_36px_rgba(245,158,11,0.22)] dark:hover:ring-1 dark:hover:ring-amber-500/40',
        className
      )}
    >
      {/* 1. Image Showcase Container */}
      <div className="relative overflow-hidden bg-slate-100 dark:bg-slate-950 shrink-0 select-none w-full aspect-[16/10]">
        {imgError ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-400 gap-2">
            <ImageOff className="w-8 h-8 opacity-60" />
            <span className="text-xs">{t('card.noImage')}</span>
          </div>
        ) : (
          <img
            src={primaryImage}
            alt={auction.title}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        )}

        {/* Gradient Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/20 pointer-events-none" />

        {/* Top Badges Overlay */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 z-10">
          <CategoryBadge category={auction.category} size="sm" variant="overlay" />

          {isWonTab ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-slate-950 shadow-md">
              <Trophy className="w-3.5 h-3.5" />
              <span>{t('myAuctions.winnerBadge')}</span>
            </span>
          ) : (
            <AuctionStatusBadge status={effectiveStatus} size="sm" />
          )}
        </div>

        {/* Bottom Countdown Overlay (Transparent, native pill styling) */}
        {(effectiveStatus === 'PENDING' || effectiveStatus === 'ACTIVE') && (
          <div className="absolute bottom-3 start-3 end-3 flex items-center justify-between gap-2 z-10">
            <CountdownTimer
              targetDate={effectiveStatus === 'PENDING' ? auction.startTime : auction.endTime}
              status={effectiveStatus}
              size="sm"
            />
          </div>
        )}
      </div>

      {/* 2. Content Details */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between gap-4">
        <div className="space-y-2">
          <Link to={detailUrl} className="block group-hover:text-amber-500 transition-colors">
            <h3
              dir="auto"
              className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 line-clamp-1 leading-snug"
            >
              {auction.title}
            </h3>
          </Link>
          <p
            dir="auto"
            className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed"
          >
            {auction.description}
          </p>
        </div>

        {/* 3. Price & Actions Row */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-end justify-between gap-2">
          <div>
            <PriceDisplay
              amount={auction.currentPrice || auction.startingPrice}
              label={
                effectiveStatus === 'PENDING'
                  ? t('card.startingPrice')
                  : isWonTab || effectiveStatus === 'ENDED'
                    ? t('myAuctions.finalPriceLabel')
                    : t('card.currentBid')
              }
              size="md"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {isPending && !isWonTab ? (
              <>
                <Link
                  to={ROUTES.EDIT_AUCTION(auction._id)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm shadow-amber-500/20 active:scale-95 transition-all duration-200"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{t('myAuctions.actionEdit')}</span>
                </Link>

                {onCancelClick && (
                  <button
                    type="button"
                    onClick={() => onCancelClick(auction)}
                    className="inline-flex items-center justify-center p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 text-xs font-bold active:scale-95 transition-all cursor-pointer"
                    title={t('myAuctions.actionCancel')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            ) : (
              <Link
                to={detailUrl}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm shadow-amber-500/20 active:scale-95 transition-all duration-200"
              >
                <span>{isWonTab ? t('myAuctions.actionViewWon') : t('card.viewDetails')}</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAuctionCard;
