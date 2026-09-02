import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight, ImageOff } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/constants/routes.constants';
import { toLocalizedDigits } from '@/utils/formatters';
import type { Auction, AuctionStatus } from '../../types/auctions.types';
import { AuctionStatusBadge } from './AuctionStatusBadge';
import { CategoryBadge } from './CategoryBadge';
import { CountdownTimer } from './CountdownTimer';
import { PriceDisplay } from './PriceDisplay';

export interface AuctionCardProps {
  auction: Auction;
  viewMode?: 'grid' | 'list';
  onStatusExpire?: (auctionId: string) => void;
  className?: string;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1000&q=80';

export const AuctionCard: React.FC<AuctionCardProps> = ({
  auction,
  viewMode = 'grid',
  onStatusExpire,
  className,
}) => {
  const { t, i18n } = useTranslation('auctions');
  const isRTL = i18n.language?.startsWith('ar');
  const isListView = viewMode === 'list';
  const [imgError, setImgError] = useState(false);

  // Compute effective dynamic status (prevent active badge when time expired)
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

  // Reset image error state whenever auction images change
  useEffect(() => {
    setImgError(false);
  }, [auction.images]);

  const primaryImage =
    !imgError && auction.images && auction.images.length > 0
      ? auction.images[0]
      : FALLBACK_IMAGE;

  const detailUrl = ROUTES.AUCTION_DETAIL(auction._id);

  return (
    <div
      className={cn(
        'group relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 transition-all duration-300 overflow-hidden flex flex-col',
        'shadow-sm hover:shadow-2xl hover:border-amber-500/70 hover:-translate-y-1',
        'dark:hover:border-amber-500/80 dark:hover:shadow-[0_12px_36px_rgba(245,158,11,0.22)] dark:hover:ring-1 dark:hover:ring-amber-500/40',
        isListView ? 'md:flex-row md:items-stretch' : 'w-full',
        className
      )}
    >
      {/* Image Showcase Container with Strict Fixed Aspect Ratio */}
      <div
        className={cn(
          'relative overflow-hidden bg-slate-100 dark:bg-slate-950 shrink-0 select-none',
          isListView ? 'w-full md:w-80 h-56 md:h-auto' : 'w-full aspect-[16/10]'
        )}
      >
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

        {/* Top Badges Overlay (Adaptive Light / Dark Glass) */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 z-10">
          <CategoryBadge category={auction.category} size="sm" variant="overlay" />
          <AuctionStatusBadge status={effectiveStatus} size="sm" />
        </div>

        {/* Bottom Countdown & Photos Overlays */}
        <div className="absolute bottom-3 start-3 end-3 flex items-center justify-between gap-2 z-10">
          <CountdownTimer
            targetDate={effectiveStatus === 'PENDING' ? auction.startTime : auction.endTime}
            status={effectiveStatus}
            size="sm"
            onEnd={() => onStatusExpire?.(auction._id)}
          />
          {auction.images && auction.images.length > 1 && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/95 text-slate-800 border border-slate-200 shadow-sm backdrop-blur-md dark:bg-slate-900/90 dark:text-slate-200 dark:border-slate-700/80 shrink-0">
              {t('card.morePhotos', { count: isRTL ? toLocalizedDigits(auction.images.length - 1, true) : auction.images.length - 1 })}
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between gap-4">
        <div className="space-y-2">
          <Link to={detailUrl} className="block group-hover:text-amber-500 transition-colors">
            <h3 dir="auto" className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
              {auction.title}
            </h3>
          </Link>
          <p dir="auto" className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {auction.description}
          </p>
        </div>

        {/* Price & Action Section */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-end justify-between gap-2">
          <div>
            <PriceDisplay
              amount={auction.currentPrice || auction.startingPrice}
              label={
                effectiveStatus === 'PENDING'
                  ? t('card.startingPrice')
                  : t('card.currentBid')
              }
              size="md"
            />
          </div>

          {/* Action Button: Radiant Gold Accent */}
          <Link
            to={detailUrl}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm shadow-amber-500/20 active:scale-95 transition-all duration-200"
          >
            <span>{t('card.viewDetails')}</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuctionCard;
