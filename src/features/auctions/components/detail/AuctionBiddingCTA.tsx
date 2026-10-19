import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import {
  ShieldCheck,
  Edit3,
  XCircle,
  Trophy,
  Clock,
  Ban,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/constants/routes.constants';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { formatPrice, formatDateTime } from '@/utils/formatters';
import type { Auction, AuctionStatus } from '../../types/auctions.types';
import { PriceDisplay } from '../shared/PriceDisplay';
import { CountdownTimer } from '../shared/CountdownTimer';
import { LiveBiddingBox } from '@/features/bids/components/LiveBiddingBox';
import { useAuth } from '@/hooks/useAuth';

export interface AuctionBiddingCTAProps {
  auction: Auction;
  effectiveStatus: AuctionStatus;
  isSeller: boolean;
  isWinner: boolean;
  hasBids?: boolean;
  onCancelAuction?: () => void;
  onOpenAutoBid?: () => void;
  isCancelling?: boolean;
  className?: string;
}

export const AuctionBiddingCTA: React.FC<AuctionBiddingCTAProps> = ({
  auction,
  effectiveStatus,
  isSeller,
  isWinner,
  hasBids,
  onCancelAuction,
  onOpenAutoBid,
  isCancelling = false,
  className,
}) => {
  const { t, i18n } = useTranslation('auctions');
  const isRTL = i18n.language?.startsWith('ar');
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const queryClient = useQueryClient();

  const currentPriceNum = auction.currentPrice ? parseFloat(auction.currentPrice) : 0;
  const startingPriceNum = auction.startingPrice ? parseFloat(auction.startingPrice) : 0;
  const hasPriceIncreased = currentPriceNum > startingPriceNum;

  const isAuctionWithBids =
    hasBids ??
    Boolean(
      Boolean(auction.winnerId) ||
      hasPriceIncreased
    );

  const handleTimerExpired = () => {
    // Visual timer expiration: Real-time status changes and wallet captures are handled
    // purely event-driven by WebSocket subscriptions (auctionStatusChanged & walletUpdated).
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.AUCTIONS.DETAIL(auction._id),
    });
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.ESCROW.BY_AUCTION(auction._id),
    });
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.REVIEWS.CAN_REVIEW(auction._id),
    });
  };

  // Explicit cancellation tracking (Admin vs Seller)
  // Per business rules: Sellers can ONLY cancel auctions before start (PENDING) and with ZERO bids.
  // Any cancellation on an ACTIVE auction, an auction with bids, or with an adminActionReason is strictly by Administration.
  const isCancelled = effectiveStatus === 'CANCELLED' || auction.status === 'CANCELLED';
  const isCancelledByAdmin =
    isCancelled &&
    (Boolean(auction.adminActionReason) ||
      isAuctionWithBids ||
      effectiveStatus === 'ACTIVE' ||
      auction.status === 'ACTIVE');

  // Synchronous, glitch-free target date and timer status resolution
  const nowMs = Date.now();
  const startMs = new Date(auction.startTime).getTime();
  const endMs = new Date(auction.endTime).getTime();

  let activeTargetDate = auction.startTime;
  let activeTimerStatus: 'PENDING' | 'ACTIVE' | 'ENDED' | 'CANCELLED' = 'ENDED';

  if (isCancelled) {
    activeTimerStatus = 'CANCELLED';
    activeTargetDate = auction.endTime;
  } else if (effectiveStatus === 'PENDING' || (auction.status === 'PENDING' && nowMs < startMs)) {
    activeTargetDate = auction.startTime;
    activeTimerStatus = 'PENDING';
  } else if (
    effectiveStatus === 'ACTIVE' ||
    (auction.status === 'ACTIVE' && nowMs >= startMs && nowMs < endMs)
  ) {
    activeTargetDate = auction.endTime;
    activeTimerStatus = 'ACTIVE';
  } else {
    activeTargetDate = auction.endTime;
    activeTimerStatus = 'ENDED';
  }

  const priceLabel =
    isCancelled
      ? t('detail.startingPriceLabel')
      : activeTimerStatus === 'ENDED'
      ? isAuctionWithBids
        ? t('detail.finalPriceLabel')
        : t('detail.startingPriceLabel')
      : auction.currentPrice
      ? t('detail.currentPriceLabel')
      : t('detail.startingPriceLabel');

  return (
    <div
      className={cn(
        'rounded-3xl border p-6 space-y-6 shadow-sm transition-all duration-300',
        'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-amber-500/40 dark:hover:border-amber-500/40 hover:shadow-md',
        className
      )}
    >
      {/* 1. Header: Dynamic Live Price with Minimum Increment (hidden when ended) */}
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            {priceLabel}
          </span>
          <PriceDisplay
            amount={auction.currentPrice || auction.startingPrice}
            size="xl"
            variant="accent"
          />
        </div>
        {!isCancelled && activeTimerStatus !== 'ENDED' && auction.minimumBidIncrement && (
          <div className="text-end">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
              {t('detail.minIncrementLabel')}
            </span>
            <span className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300">
              +{formatPrice(auction.minimumBidIncrement, isRTL)}
            </span>
          </div>
        )}
      </div>

      {/* 2. Live Countdown Timer (Active & Pending only, suppressed when cancelled) */}
      {!isCancelled && activeTimerStatus !== 'ENDED' && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <CountdownTimer
            targetDate={activeTargetDate}
            status={activeTimerStatus}
            onEnd={handleTimerExpired}
            size="md"
            showLabel={true}
          />
        </div>
      )}

      {/* 3. Dedicated Cancellation Banner (Admin vs Seller) */}
      {isCancelled && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          {isCancelledByAdmin ? (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2 font-bold text-xs text-rose-600 dark:text-rose-400">
                <Ban className="w-4 h-4 shrink-0" />
                <span>
                  {t('detail.adminCancelledTitle', {
                    defaultValue: isRTL
                      ? 'تم إلغاء المزاد بقرار إداري'
                      : 'Auction Cancelled by Administration',
                  })}
                </span>
              </div>

              {auction.adminActionReason && (
                <div className="p-3 rounded-xl bg-rose-500/5 dark:bg-rose-950/20 border-s-2 border-rose-500/60 text-xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                    {t('detail.adminCancelledReason', {
                      defaultValue: isRTL ? 'سبب الإلغاء التوثيقي:' : 'Cancellation Reason:',
                    })}
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    "{auction.adminActionReason}"
                  </p>
                </div>
              )}

              <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                {t('detail.adminCancelledRefundNotice', {
                  defaultValue: isRTL
                    ? 'تم إيقاف المزاد ورد كامل مبالغ حجز المزايدات إلى محافظ المزايدين تلقائياً بواسطة النظام.'
                    : "The auction was terminated and all held bid deposits were automatically refunded to bidders' wallets.",
                })}
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-center space-y-2">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                <XCircle className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  {t('detail.sellerCancelledTitle', {
                    defaultValue: isRTL
                      ? 'تم إلغاء هذا المزاد بواسطة البائع'
                      : 'This auction was cancelled by the seller',
                  })}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t('detail.auctionCancelledMessage', {
                  defaultValue: isRTL
                    ? 'تم إلغاء هذا المزاد بواسطة البائع قبل وقت بدئه، وهو غير متاح للمزايدة.'
                    : 'This auction was cancelled by the seller before starting and is no longer accepting bids.',
                })}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 4. Seller Status & Management Panel (Strictly if logged-in user is seller and auction not cancelled) */}
      {isSeller && !isCancelled && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-extrabold text-xs">
            <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{t('detail.sellerNotice')}</span>
          </div>

          <p className="text-xs text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
            {activeTimerStatus === 'PENDING' && t('detail.sellerBannerPending')}
            {activeTimerStatus === 'ACTIVE' && t('detail.sellerBannerActive')}
            {activeTimerStatus === 'ENDED' &&
              (isAuctionWithBids
                ? t('detail.sellerBannerEndedWithWinner')
                : t('detail.sellerBannerEndedNoBids'))}
          </p>

          {activeTimerStatus === 'PENDING' && (
            <div className="flex items-center gap-2 pt-1">
              <Link
                to={ROUTES.EDIT_AUCTION(auction._id)}
                className="flex flex-1 items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{t('detail.editAuction')}</span>
              </Link>

              {onCancelAuction && (
                <button
                  type="button"
                  onClick={onCancelAuction}
                  disabled={isCancelling}
                  className="inline-flex items-center justify-center gap-1.5 bg-white dark:bg-slate-900 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 font-bold text-xs py-2.5 px-3.5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{t('detail.cancelAuction')}</span>
                </button>
              )}
            </div>
          )}

          {activeTimerStatus === 'ENDED' && isAuctionWithBids && (
            <div className="pt-2 border-t border-amber-500/20">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-900 dark:text-amber-300 leading-relaxed font-medium">
                  {t('detail.sellerWinnerInstructions')}
                </p>
              </div>
            </div>
          )}

          {activeTimerStatus === 'ENDED' && !isAuctionWithBids && (
            <div className="pt-1">
              <Link
                to={ROUTES.CREATE_AUCTION}
                className="flex items-center justify-center gap-2 w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <span>{t('myAuctions.createNewButton')}</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* 5. Winner Trophy Banner (Only if ENDED and current user is winner and not cancelled) */}
      {activeTimerStatus === 'ENDED' && isWinner && !isCancelled && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-950 dark:text-emerald-300 space-y-2">
          <div className="flex items-center gap-2 font-extrabold text-sm">
            <Trophy className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>{t('detail.wonBannerTitle')}</span>
          </div>
          <p className="text-xs leading-relaxed text-emerald-800 dark:text-emerald-400">
            {t('detail.wonBannerMessage')}
          </p>
        </div>
      )}

      {/* 6. Concluded Banner (STRICTLY If ENDED and NOT seller and NOT winner and NOT cancelled) */}
      {activeTimerStatus === 'ENDED' && !isSeller && !isWinner && !isCancelled && (
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-center space-y-1.5">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
            {isAuctionWithBids
              ? t('detail.buyerBannerEndedWithWinner')
              : t('detail.buyerBannerEndedNoBids')}
          </p>
        </div>
      )}

      {/* 7. Pending State Banner (If PENDING and not seller and not cancelled) */}
      {activeTimerStatus === 'PENDING' && !isSeller && !isCancelled && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-700 dark:text-amber-300 text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold">
            <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span>{t('status.PENDING')}</span>
          </div>
          <p className="text-[11px] leading-relaxed opacity-90">
            {t('countdown.startsIn')} {formatDateTime(auction.startTime, isRTL)}
          </p>
        </div>
      )}

      {/* 8. Active State for Admin (Read-only Supervision Mode) vs Buyers (Live Bidding Box) */}
      {activeTimerStatus === 'ACTIVE' && isAdmin && !isCancelled && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs font-black text-amber-600 dark:text-amber-400">
            <ShieldCheck className="w-4 h-4" />
            <span>{isRTL ? 'وضع الرقابة والمتابعة الإدارية' : 'Admin Supervision Mode'}</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            {isRTL
              ? 'المزاد نشط ويتلقى مزايدات حية. لا يمكن لحسابات الإدارة وضع مزايدات على المزادات.'
              : 'This auction is live. Administrative accounts cannot place bids on active auctions.'}
          </p>
        </div>
      )}

      {activeTimerStatus === 'ACTIVE' && !isSeller && !isAdmin && !isCancelled && (
        <LiveBiddingBox
          auction={auction}
          isSeller={isSeller}
          onOpenAutoBid={onOpenAutoBid}
        />
      )}
    </div>
  );
};

export default AuctionBiddingCTA;
