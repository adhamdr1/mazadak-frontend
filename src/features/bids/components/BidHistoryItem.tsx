import React from 'react';
import { useTranslation } from 'react-i18next';
import { Trophy, Clock, User as UserIcon, CheckCircle2 } from 'lucide-react';
import { formatPrice, formatBidTimestamp } from '@/utils/formatters';
import type { Bid } from '../types/bids.types';

export interface BidHistoryItemProps {
  bid: Bid;
  isWinning?: boolean;
  isLatest?: boolean;
  currentUserId?: string;
}

export const BidHistoryItem: React.FC<BidHistoryItemProps> = React.memo(({
  bid,
  isWinning = false,
  isLatest = false,
  currentUserId,
}) => {
  const { t, i18n } = useTranslation('bids');
  const isRTL = i18n.dir() === 'rtl';

  const isMyBid = Boolean(currentUserId && bid.bidderId && currentUserId === bid.bidderId);
  const winningStatus = isWinning;

  // Safe anonymized bidder identifier showing the last 6 characters of bidderId
  const rawId = bid.bidderId || '';
  const anonymizedSuffix = rawId.length > 6 ? rawId.slice(-6) : rawId;

  const formattedTimestamp = formatBidTimestamp(bid.createdAt, isRTL);

  return (
    <div
      className={`relative flex items-center justify-between p-3 rounded-xl transition-all duration-200 border ${
        winningStatus
          ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/30 dark:border-emerald-500/25 shadow-sm'
          : 'bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-amber-500/40 dark:hover:border-amber-500/30 hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
      }`}
    >
      {/* Bidder Profile & Info Column */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
            winningStatus
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              : isMyBid
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700'
          }`}
        >
          {winningStatus ? (
            <Trophy className="w-4 h-4" />
          ) : (
            <UserIcon className="w-4 h-4" />
          )}
        </div>

        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Anonymized Label — Clean borderless inline text with BiDi isolation */}
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {t('bidHistory.anonymousPrefix')}
            </span>
            <bdi
              dir="ltr"
              className="font-mono text-xs text-slate-500 dark:text-slate-400 inline-block tracking-tight"
            >
              ***{anonymizedSuffix}
            </bdi>

            {/* Authenticated User Self-Indicator Badge */}
            {isMyBid && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                {t('bidHistory.you')}
              </span>
            )}

            {/* Status Pill Badge */}
            {winningStatus ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" />
                {t('status.WINNING')}
              </span>
            ) : isLatest ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                {t('bidHistory.latest')}
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                {t('status.OUTBID')}
              </span>
            )}
          </div>

          {/* Clean High-Contrast Numeric Timestamp with Seconds */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <Clock className="w-3.5 h-3.5 text-amber-500/80 dark:text-amber-400/80 shrink-0" />
            <span className="font-mono text-xs font-semibold tracking-tight text-slate-700 dark:text-slate-200">
              {formattedTimestamp}
            </span>
          </div>
        </div>
      </div>

      {/* Bid Amount Column */}
      <div className="text-end shrink-0 ps-3">
        <div className="flex items-baseline justify-end gap-1">
          <span
            className={`text-base sm:text-lg font-bold tracking-tight ${
              winningStatus
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-900 dark:text-white'
            }`}
          >
            {formatPrice(bid.amount, isRTL)}
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t('currency.symbol')}
          </span>
        </div>
      </div>
    </div>
  );
});

BidHistoryItem.displayName = 'BidHistoryItem';

export default BidHistoryItem;
