import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Gavel,
  ShieldCheck,
  Edit3,
  XCircle,
  LogIn,
  Trophy,
  Bot,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes.constants';
import { formatPrice, formatDateTime } from '@/utils/formatters';
import type { Auction, AuctionStatus } from '../../types/auctions.types';
import { PriceDisplay } from '../shared/PriceDisplay';
import { CountdownTimer } from '../shared/CountdownTimer';
import { Button } from '@/components/common/Button';

export interface AuctionBiddingCTAProps {
  auction: Auction;
  effectiveStatus: AuctionStatus;
  isSeller: boolean;
  isWinner: boolean;
  onCancelAuction?: () => void;
  isCancelling?: boolean;
  className?: string;
}

export const AuctionBiddingCTA: React.FC<AuctionBiddingCTAProps> = ({
  auction,
  effectiveStatus,
  isSeller,
  isWinner,
  onCancelAuction,
  isCancelling = false,
  className,
}) => {
  const { t, i18n } = useTranslation('auctions');
  const isRTL = i18n.language?.startsWith('ar');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const minIncrement = parseFloat(auction.minimumBidIncrement || '1000');
  const currentAmount = parseFloat(auction.currentPrice || auction.startingPrice || '0');
  const minNextBid = currentAmount + minIncrement;

  const [customBid, setCustomBid] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);

  // Progressive 1x, 2x, 3x minimum increment multiplier presets
  const presets = [
    minIncrement * 1,
    minIncrement * 2,
    minIncrement * 3,
  ];

  const handlePresetClick = (amount: number) => {
    setSelectedPreset(amount);
    setCustomBid((currentAmount + amount).toString());
  };

  const handleCustomBidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomBid(e.target.value);
    setSelectedPreset(null);
  };

  const handlePlaceBid = () => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }
    // Module 4: Live Bidding feature hook
  };

  return (
    <div
      className={cn(
        'rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-5 hover:border-amber-500/60 dark:hover:border-amber-500/60 transition-colors',
        className
      )}
    >
      {/* 1. Header Price & Countdown Block */}
      <div className="space-y-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-start justify-between gap-3">
          <div>
            <PriceDisplay
              amount={auction.currentPrice || auction.startingPrice}
              label={
                effectiveStatus === 'PENDING'
                  ? t('card.startingPrice')
                  : t('card.currentBid')
              }
              size="xl"
              variant={effectiveStatus === 'ENDED' ? 'default' : 'accent'}
            />
          </div>

          <div className="text-end">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block mb-1">
              {t('detail.minimumIncrementLabel')}
            </span>
            <span className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300">
              +{formatPrice(minIncrement, isRTL)} {t('currency.symbol')}
            </span>
          </div>
        </div>

        {/* Big Countdown Banner */}
        <CountdownTimer
          targetDate={effectiveStatus === 'PENDING' ? auction.startTime : auction.endTime}
          status={effectiveStatus}
          size="lg"
          variant="banner"
          className="w-full justify-center py-2.5"
        />
      </div>

      {/* 2. Seller Warning & Controls Banner (If viewing own auction) */}
      {isSeller && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 space-y-3 text-xs">
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              {effectiveStatus === 'PENDING'
                ? t('detail.sellerBannerPending')
                : effectiveStatus === 'ACTIVE'
                  ? t('detail.sellerBannerActive')
                  : t('detail.sellerBannerEnded')}
            </span>
          </div>

          {effectiveStatus === 'PENDING' && (
            <div className="flex items-center gap-2 pt-1">
              <Link to={ROUTES.EDIT_AUCTION(auction._id)} className="flex-1">
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                  className="text-xs"
                >
                  {t('detail.editAuction')}
                </Button>
              </Link>

              {onCancelAuction && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={onCancelAuction}
                  isLoading={isCancelling}
                  leftIcon={<XCircle className="w-3.5 h-3.5" />}
                  className="text-xs"
                >
                  {t('detail.cancelAuction')}
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. Winner Trophy Banner (Only if ENDED and current user is winner) */}
      {effectiveStatus === 'ENDED' && isWinner && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-950 dark:text-emerald-300 space-y-2">
          <div className="flex items-center gap-2 font-extrabold text-sm">
            <Trophy className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>{t('detail.wonBannerTitle')}</span>
          </div>
          <p className="text-xs leading-relaxed text-emerald-800 dark:text-emerald-400">
            {t('detail.wonBannerMessage')}
          </p>
          <Link to={ROUTES.MY_ESCROWS} className="block pt-1">
            <Button variant="accent" size="sm" fullWidth className="text-xs font-bold">
              {t('detail.proceedToEscrow')}
            </Button>
          </Link>
        </div>
      )}

      {/* 4. Concluded Banner (If ENDED and not winner) */}
      {effectiveStatus === 'ENDED' && !isWinner && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-center space-y-1.5">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            {t('countdown.ended')}
          </span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            {t('detail.sellerBannerEnded')}
          </p>
        </div>
      )}

      {/* 5. Pending State Banner (If PENDING and not seller) */}
      {effectiveStatus === 'PENDING' && !isSeller && (
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

      {/* 6. Active Bidding Form & Quick Presets (STRICTLY for ACTIVE auctions only) */}
      {effectiveStatus === 'ACTIVE' && !isSeller && (
        <div className="space-y-4">
          {/* Quick Increment Preset Chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {t('detail.biddingBoxTitle')}
            </span>
            <div className="grid grid-cols-3 gap-2">
              {presets.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handlePresetClick(amount)}
                  className={cn(
                    'py-2 px-2 rounded-xl text-xs font-bold border transition-all duration-150 text-center select-none font-mono',
                    selectedPreset === amount
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400'
                  )}
                >
                  +{formatPrice(amount, isRTL)}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Numeric Bid Input with Absolute Zero White Ring Flash */}
          <div className="relative">
            <input
              type="number"
              value={customBid}
              onChange={handleCustomBidChange}
              placeholder={`${t('detail.customBidPlaceholder')} (≥ ${formatPrice(minNextBid, isRTL)})`}
              className={cn(
                'w-full text-sm font-mono font-bold rounded-2xl border px-4 py-3 pe-12 transition-colors',
                '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
                'bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400',
                'border-slate-300 dark:border-slate-700',
                'outline-none focus:outline-none focus:border-amber-500 dark:focus:border-amber-500 ring-0 focus:ring-0 ring-offset-0 focus:ring-offset-0'
              )}
            />
            <span className="absolute end-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 select-none pointer-events-none">
              {t('currency.symbol')}
            </span>
          </div>

          {/* Place Bid Primary CTA Buttons */}
          {isAuthenticated ? (
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={handlePlaceBid}
                className="w-full bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm sm:text-base py-3.5 px-6 rounded-2xl  active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer select-none"
              >
                <Gavel className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                <span>{t('detail.placeBidButton')}</span>
              </button>

              <button
                type="button"
                className="w-full bg-slate-100 dark:bg-slate-800/90 hover:bg-amber-500/10 dark:hover:bg-amber-500/15 text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 border border-slate-200 dark:border-slate-700 hover:border-amber-500/50 dark:hover:border-amber-500/50 font-bold text-xs sm:text-sm py-3 px-4 rounded-2xl shadow-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer select-none"
              >
                <Bot className="w-4 h-4 text-amber-500" />
                <span>{t('detail.autoBidSetup')}</span>
              </button>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-center space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                {t('detail.loginToBidMessage')}
              </p>
              <Link to={ROUTES.LOGIN} className="block">
                <button
                  type="button"
                  className="w-full bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm py-3 px-5 rounded-2xl shadow-md shadow-amber-500/20 hover:shadow-amber-500/35 transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
                >
                  <LogIn className="w-4 h-4 stroke-[2.5]" />
                  <span>{t('detail.loginToBidButton')}</span>
                </button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* 7. Escrow & Platform Security Guarantee Badge */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="leading-snug">
          <span className="font-bold text-slate-800 dark:text-slate-200 block">
            {t('detail.escrowGuaranteeTitle')}
          </span>
          <span className="text-[11px]">
            {t('detail.escrowGuaranteeDesc')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuctionBiddingCTA;
