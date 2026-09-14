import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, ArrowUp, X } from 'lucide-react';
import { toLocalizedDigits } from '@/utils/formatters';

export interface NewAuctionsBannerProps {
  count: number;
  onRefresh: () => void;
  onDismiss?: () => void;
  className?: string;
}

export const NewAuctionsBanner: React.FC<NewAuctionsBannerProps> = ({
  count,
  onRefresh,
  onDismiss,
  className = '',
}) => {
  const { t, i18n } = useTranslation('auctions');
  const isRTL = i18n.language?.startsWith('ar');

  if (count <= 0) return null;

  // Format plural message properly for Arabic / English
  const getBannerText = () => {
    if (isRTL) {
      if (count === 1) return t('feed.newAuctionOne');
      if (count === 2) return t('feed.newAuctionTwo');
      if (count >= 3 && count <= 10) {
        return t('feed.newAuctionFew', { count: toLocalizedDigits(count, true) });
      }
      return t('feed.newAuctionMany', { count: toLocalizedDigits(count, true) });
    }
    return count === 1
      ? t('feed.newAuctionOne')
      : t('feed.newAuctionPlural', { count });
  };

  return (
    <div
      className={`sticky top-20 z-20 flex items-center justify-center my-3 px-2 transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="inline-flex items-center gap-2 p-1.5 pe-2.5 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-800 dark:text-slate-100 shadow-md dark:shadow-slate-950/40 border border-slate-200/90 dark:border-slate-800 hover:border-amber-500/60 dark:hover:border-amber-500/60 transition-all duration-200">
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-2.5 text-xs sm:text-sm font-semibold ps-2 py-0.5 text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 focus:outline-hidden transition-colors"
          title={t('feed.clickToRefresh')}
        >
          {/* Subtle Sparkle Badge with live pulsing dot */}
          <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/25 shrink-0">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          </span>

          {/* Count Text */}
          <span className="font-bold text-slate-900 dark:text-white">
            {getBannerText()}
          </span>

          {/* Clean Accent CTA Button */}
          <span className="inline-flex items-center gap-1 font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs transition-colors">
            <span>{t('feed.clickToRefresh')}</span>
            <ArrowUp className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          </span>
        </button>

        {/* Optional Dismiss Action */}
        {onDismiss && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            aria-label={t('feed.dismiss')}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-hidden"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default NewAuctionsBanner;
