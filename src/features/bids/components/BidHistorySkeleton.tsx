import React from 'react';
import { useTranslation } from 'react-i18next';

export interface BidHistorySkeletonProps {
  count?: number;
}

export const BidHistorySkeleton: React.FC<BidHistorySkeletonProps> = ({ count = 4 }) => {
  const { t } = useTranslation('bids');

  return (
    <div
      className="space-y-3"
      role="status"
      aria-label={t('bidHistory.loadingHistory')}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 animate-pulse"
        >
          <div className="flex items-center gap-3">
            {/* Avatar skeleton */}
            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0 border border-slate-200/50 dark:border-slate-700/50" />

            {/* Info skeleton */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-4 w-24 sm:w-28 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-4 w-14 rounded-full bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="h-3 w-16 sm:w-20 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>

          {/* Amount skeleton */}
          <div className="h-6 w-20 sm:w-24 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      ))}
      <span className="sr-only">{t('bidHistory.loadingHistory')}</span>
    </div>
  );
};

export default BidHistorySkeleton;

