import React from 'react';
import { useTranslation } from 'react-i18next';
import { Star, ShieldCheck, Award } from 'lucide-react';
import { StarRating } from './StarRating';
import { calculateBreakdownPercentage } from '../utils/reviews.utils';
import { toLocalizedDigits } from '@/utils/formatters';
import type { UserRatingStats } from '../types/reviews.types';

export interface RatingBreakdownCardProps {
  stats?: UserRatingStats;
  activeRole?: 'ALL' | 'SELLER' | 'BUYER';
  onRoleChange?: (role: 'ALL' | 'SELLER' | 'BUYER') => void;
  isLoading?: boolean;
  className?: string;
}

export const RatingBreakdownCard: React.FC<RatingBreakdownCardProps> = ({
  stats,
  activeRole = 'ALL',
  onRoleChange,
  isLoading = false,
  className = '',
}) => {
  const { t, i18n } = useTranslation(['reviews', 'common']);
  const isRTL = i18n.language?.startsWith('ar');

  if (isLoading) {
    return (
      <div
        className={`bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse ${className}`}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          <div className="md:col-span-2 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 bg-slate-100 dark:bg-slate-800 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Derive active average and review counts based on activeRole tab
  let currentAverage = stats?.averageRating ?? 0;
  let currentTotal = stats?.totalReviews ?? 0;

  if (activeRole === 'SELLER') {
    currentAverage = stats?.asSellerAverageRating ?? stats?.averageRating ?? 0;
    currentTotal = stats?.asSellerTotalReviews ?? 0;
  } else if (activeRole === 'BUYER') {
    currentAverage = stats?.asBuyerAverageRating ?? stats?.averageRating ?? 0;
    currentTotal = stats?.asBuyerTotalReviews ?? 0;
  }

  const breakdown = stats?.breakdown ?? {
    fiveStar: 0,
    fourStar: 0,
    threeStar: 0,
    twoStar: 0,
    oneStar: 0,
  };

  const totalReviewsCount = stats?.totalReviews ?? 0;

  const starTiers = [
    { stars: 5, count: breakdown.fiveStar },
    { stars: 4, count: breakdown.fourStar },
    { stars: 3, count: breakdown.threeStar },
    { stars: 2, count: breakdown.twoStar },
    { stars: 1, count: breakdown.oneStar },
  ];

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 lg:p-9 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-all duration-200 ${className}`}
    >
      {/* Header with Segmented Role Switcher in single row */}
      <div className="flex flex-row items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-800/80 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base sm:text-lg truncate">
              {t('reviews:overview.ratingSummary')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {t('reviews:subtitle')}
            </p>
          </div>
        </div>

        {onRoleChange && (
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/50 shrink-0">
            <button
              type="button"
              onClick={() => onRoleChange('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeRole === 'ALL'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t('reviews:overview.all')}
            </button>
            <button
              type="button"
              onClick={() => onRoleChange('SELLER')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeRole === 'SELLER'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t('reviews:overview.asSeller')}
            </button>
            <button
              type="button"
              onClick={() => onRoleChange('BUYER')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeRole === 'BUYER'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t('reviews:overview.asBuyer')}
            </button>
          </div>
        )}
      </div>

      {/* Main Stats Grid: Big Score + Bars Breakdown — Stays in single row even on split screen */}
      <div className="grid grid-cols-12 gap-3 sm:gap-6 lg:gap-8 items-center pt-6">
        {/* Left Column: Big Overall Score */}
        <div className="col-span-5 sm:col-span-4 flex flex-col items-center justify-center p-3.5 sm:p-6 rounded-2xl bg-radial from-amber-500/5 via-slate-50 to-transparent dark:from-amber-500/10 dark:via-slate-800/40 dark:to-transparent border border-slate-100 dark:border-slate-800/60 text-center">
          <div className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-slate-50 tabular-nums">
            {toLocalizedDigits(currentAverage.toFixed(1), isRTL)}
          </div>
          <div className="mt-1.5 sm:mt-2.5">
            <StarRating rating={currentAverage} size="md" />
          </div>
          <p className="mt-1.5 text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 line-clamp-1">
            {currentTotal > 0
              ? t('reviews:overview.basedOn', {
                  count: toLocalizedDigits(currentTotal, isRTL),
                })
              : t('reviews:overview.noReviewsYet', 'لا توجد تقييمات بعد')}
          </p>

          {currentTotal > 0 ? (
            <div className="mt-2.5 sm:mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t('reviews:card.verified')}</span>
            </div>
          ) : (
            <div className="mt-2.5 sm:mt-4 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              <span>{t('reviews:overview.newAccount', 'حساب جديد')}</span>
            </div>
          )}
        </div>

        {/* Right Column: 5-Star Distribution Bars */}
        <div className="col-span-7 sm:col-span-8 space-y-2 sm:space-y-3">
          {starTiers.map(({ stars, count }) => {
            const percentage = calculateBreakdownPercentage(count, totalReviewsCount);

            return (
              <div key={stars} className="flex items-center gap-2 sm:gap-3 text-xs">
                {/* Star Tier Label */}
                <div className="flex items-center gap-1 sm:gap-1.5 w-9 sm:w-12 shrink-0 font-bold text-slate-700 dark:text-slate-300 select-none text-[11px] sm:text-xs">
                  <span className="w-3 sm:w-4 text-center tabular-nums inline-block shrink-0">
                    {toLocalizedDigits(stars, isRTL)}
                  </span>
                  <Star className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                </div>

                {/* Progress Bar Container */}
                <div className="flex-1 h-2 sm:h-2.5 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden border border-slate-200/40 dark:border-slate-700/30">
                  <div
                    className="h-full bg-amber-500 bg-gradient-to-r from-amber-500 to-amber-400 dark:from-amber-500 dark:to-amber-400 rounded-full transition-all duration-500 ease-out shadow-xs"
                    style={{ width: `${percentage}%` }}
                    role="progressbar"
                    aria-valuenow={percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>

                {/* Percentage & Raw Count */}
                <div className="w-16 sm:w-20 text-end text-slate-500 dark:text-slate-400 tabular-nums shrink-0 font-medium text-[10px] sm:text-xs">
                  <span>{toLocalizedDigits(`${percentage}%`, isRTL)}</span>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 ms-1 inline-block">
                    ({toLocalizedDigits(count, isRTL)})
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
