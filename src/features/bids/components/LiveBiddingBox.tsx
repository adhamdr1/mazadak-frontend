import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Gavel, Bot, LogIn, Crown } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes.constants';
import { formatPrice, toLocalizedDigits, normalizeArabicDigits } from '@/utils/formatters';
import { Button } from '@/components/common/Button';
import { useToast } from '@/components/feedback/useToast';
import { usePlaceBid } from '../hooks/usePlaceBid';
import { useLiveBids } from '../hooks/useLiveBids';
import type { Auction } from '@/features/auctions/types/auctions.types';

export interface LiveBiddingBoxProps {
  auction: Auction;
  isSeller: boolean;
  onOpenAutoBid?: () => void;
  className?: string;
}

const toCents = (val: string | number | null | undefined, fallback = 0): number => {
  const num = typeof val === 'number' ? val : parseFloat(val ?? '');
  const parsed = Math.round(num * 100);
  return isNaN(parsed) ? fallback * 100 : parsed;
};

export const LiveBiddingBox: React.FC<LiveBiddingBoxProps> = ({
  auction,
  isSeller,
  onOpenAutoBid,
  className,
}) => {
  const { t, i18n } = useTranslation(['bids', 'auctions', 'common']);
  const isRTL = i18n.language?.startsWith('ar');
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { isLeadingBidder } = useLiveBids(auction._id);
  const { placeBid, isPlacingBid } = usePlaceBid({
    onSuccess: () => {
      setCustomBid('');
      setSelectedPreset(null);
    },
  });

  const minIncrementCents = toCents(auction.minimumBidIncrement, 10);
  const currentAmountCents = toCents(auction.currentPrice || auction.startingPrice, 0);
  const minNextBidCents = currentAmountCents + minIncrementCents;
  const minNextBid = minNextBidCents / 100;
  const minIncrement = minIncrementCents / 100;

  const [customBid, setCustomBid] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);

  // Progressive 1x, 2x, 3x minimum increment multiplier presets
  const presets = [
    minIncrement * 1,
    minIncrement * 2,
    minIncrement * 3,
  ];

  const handlePresetClick = (incrementAmount: number) => {
    setSelectedPreset(incrementAmount);
    const totalCents = currentAmountCents + Math.round(incrementAmount * 100);
    setCustomBid((totalCents / 100).toString());
  };

  const handleCustomBidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const normalized = normalizeArabicDigits(raw).replace(/[^0-9.]/g, '');
    const parts = normalized.split('.');
    const sanitized = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : normalized;
    setCustomBid(sanitized);
    setSelectedPreset(null);
  };

  const handlePlaceBidSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }

    if (isSeller) {
      return;
    }

    const enteredAmount = customBid.trim() ? parseFloat(customBid) : minNextBid;
    if (isNaN(enteredAmount) || enteredAmount <= 0) {
      toast.error(t('bids:validation.invalidNumber'));
      return;
    }

    if (enteredAmount < minNextBid) {
      toast.error(t('bids:validation.minBid', { min: formatPrice(minNextBid, isRTL) }));
      return;
    }

    await placeBid({
      auctionId: auction._id,
      amount: enteredAmount,
    });
  };

  // If user is the seller, they cannot bid on their own auction
  if (isSeller) {
    return null;
  }

  // If user is not authenticated, render login prompt
  if (!isAuthenticated) {
    return (
      <div
        className={cn(
          'p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-center space-y-3',
          className
        )}
      >
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
          {t('auctions:detail.loginToBidMessage')}
        </p>
        <Button
          to={ROUTES.LOGIN}
          variant="accent"
          size="md"
          fullWidth
          leftIcon={<LogIn className="w-4 h-4 stroke-[2.5]" />}
        >
          {t('bids:form.buttons.loginToBid')}
        </Button>
      </div>
    );
  }

  const isUserLeading = isLeadingBidder || (auction.winnerId === user?._id);
  const displayBidValue = isRTL && customBid ? toLocalizedDigits(customBid, true) : customBid;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Leading Bidder Indicator Banner */}
      {isUserLeading && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 dark:text-emerald-300 flex items-center gap-2.5">
          <Crown className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div className="text-xs font-bold leading-tight">
            {t('bids:messages.leadingNotice')}
          </div>
        </div>
      )}

      {/* Quick Increment Preset Chips */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          {t('bids:form.labels.quickIncrements')}
        </span>
        <div className="grid grid-cols-3 gap-2">
          {presets.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => handlePresetClick(amount)}
              className={cn(
                'py-2 px-2 rounded-xl text-xs font-bold border transition-all duration-150 text-center select-none font-mono cursor-pointer',
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

      {/* Custom Numeric Bid Input */}
      <form onSubmit={handlePlaceBidSubmit} className="space-y-3">
        <div className="relative">
          <input
            type="text"
            inputMode="decimal"
            value={displayBidValue}
            onChange={handleCustomBidChange}
            placeholder={`${t('bids:form.placeholders.customBid')} (≥ ${formatPrice(minNextBid, isRTL)})`}
            className={cn(
              'w-full text-sm font-mono font-bold rounded-2xl border px-4 py-3 pe-12 transition-colors',
              'bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400',
              'border-slate-300 dark:border-slate-700',
              'outline-none focus:outline-none focus:border-amber-500 dark:focus:border-amber-500 ring-0 focus:ring-0 ring-offset-0 focus:ring-offset-0'
            )}
          />
          <span className="absolute end-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 select-none pointer-events-none">
            {t('bids:currency.symbol')}
          </span>
        </div>

        {/* Place Bid Primary CTA Button */}
        <div className="space-y-2.5 pt-1">
          <Button
            type="submit"
            variant="accent"
            size="lg"
            fullWidth
            isLoading={isPlacingBid}
            disabled={isPlacingBid || (isUserLeading && !customBid.trim())}
            leftIcon={<Gavel className="w-4 h-4 stroke-[2.5]" />}
            className="shadow-md shadow-amber-500/20 hover:shadow-amber-500/35 font-black text-sm sm:text-base py-3.5"
          >
            {isUserLeading && !customBid.trim()
              ? t('bids:form.buttons.leadingBidder')
              : t('bids:form.buttons.placeBid')}
          </Button>

          {/* Auto-Bid Trigger Button */}
          {onOpenAutoBid && (
            <Button
              type="button"
              variant="outline"
              size="md"
              fullWidth
              onClick={onOpenAutoBid}
              leftIcon={<Bot className="w-4 h-4 text-amber-500" />}
              className="border-slate-200 dark:border-slate-700 hover:border-amber-500/50 dark:hover:border-amber-500/50 font-bold text-xs sm:text-sm py-3"
            >
              {t('bids:form.buttons.setAutoBid')}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default LiveBiddingBox;
