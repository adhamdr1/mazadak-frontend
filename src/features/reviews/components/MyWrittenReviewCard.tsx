import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShieldAlert,
  CornerDownLeft,
  CornerDownRight,
  Package,
} from 'lucide-react';
import { StarRating } from './StarRating';
import {
  getReviewTypeLabel,
  getReviewStatusBadgeProps,
  getCriteriaLabel,
} from '../utils/reviews.utils';
import {
  formatRelativeTime,
  toLocalizedDigits,
  formatPrice,
} from '@/utils/formatters';
import { ROUTES } from '@/constants/routes.constants';
import { UserAvatar } from '@/features/users';
import type { Review, ReviewCriteria } from '../types/reviews.types';

export interface MyWrittenReviewCardProps {
  review: Review;
  className?: string;
}

export const MyWrittenReviewCard: React.FC<MyWrittenReviewCardProps> = ({
  review,
  className = '',
}) => {
  const { t, i18n } = useTranslation(['reviews', 'common']);
  const isRTL = i18n.language?.startsWith('ar');

  const reviewedUserName = review.reviewedUser
    ? `${review.reviewedUser.firstName} ${review.reviewedUser.lastName}`.trim()
    : t('common:user', 'مستخدم مزادك');

  const typeLabel = getReviewTypeLabel(review.type, t);
  const statusBadge = getReviewStatusBadgeProps(review.status, t);

  // Criteria entries
  const criteriaList: Array<{ key: keyof ReviewCriteria; score: number }> = [];
  if (review.criteria) {
    (['itemAccuracy', 'communication', 'packaging', 'smoothExperience'] as const).forEach(
      (key) => {
        const val = review.criteria?.[key];
        if (typeof val === 'number' && val > 0) {
          criteriaList.push({ key, score: val });
        }
      }
    );
  }

  const CornerIcon = isRTL ? CornerDownLeft : CornerDownRight;

  return (
    <article
      className={`bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 space-y-4 ${className}`}
    >
      {/* Top Bar: Reviewed User Info + Badges + Date */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-3">
          {review.reviewedUser?.id ? (
            <Link
              to={ROUTES.USER_PUBLIC(review.reviewedUser.id)}
              className="shrink-0 hover:scale-105 transition-transform"
              title={reviewedUserName}
            >
              <UserAvatar
                firstName={review.reviewedUser.firstName}
                lastName={review.reviewedUser.lastName}
                userId={review.reviewedUser.id}
                size="md"
              />
            </Link>
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-400 shrink-0">
              MZ
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                {t('reviews:myWritten.reviewedUser', 'المستخدم المُقيَّم:')}
              </span>
              {review.reviewedUser?.id ? (
                <Link
                  to={ROUTES.USER_PUBLIC(review.reviewedUser.id)}
                  className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base hover:text-amber-500 transition-colors"
                >
                  {reviewedUserName}
                </Link>
              ) : (
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                  {reviewedUserName}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {typeLabel}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums">
                {formatRelativeTime(review.createdAt, isRTL)}
              </span>
            </div>
          </div>
        </div>

        {/* Rating and Status Badge */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadge.colorClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dotClass}`} />
            {statusBadge.label}
          </span>

          <div className="flex items-center gap-1.5 bg-amber-500/10 dark:bg-amber-500/15 px-2.5 py-1 rounded-xl border border-amber-500/20">
            <StarRating rating={review.overallRating} size="xs" />
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 tabular-nums">
              {toLocalizedDigits(review.overallRating.toFixed(1), isRTL)}
            </span>
          </div>
        </div>
      </div>

      {/* Blind Review Notice for PENDING state */}
      {review.status === 'PENDING' && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">
              {t('reviews:card.pendingBadge', 'قيد المراجعة (نظام التقييم الأعمى)')}
            </p>
            <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-300">
              {t(
                'reviews:card.blindNotice',
                'التقييم في مرحلة المراجعة المتبادلة وسيتم نشره تلقائياً فور تقييم الطرف الآخر أو انقضاء الـ 14 يوماً.'
              )}
            </p>
          </div>
        </div>
      )}

      {/* Review Comment Text */}
      {review.comment ? (
        <p
          dir="auto"
          className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line text-start"
        >
          {review.comment}
        </p>
      ) : (
        <p className="text-xs italic text-slate-400 dark:text-slate-500">
          {t('reviews:overview.ratingSummary', 'تقييم بالنجوم دون تعليق')} ({toLocalizedDigits(review.overallRating, isRTL)} / 5)
        </p>
      )}

      {/* Criteria Breakdown Grid - Full width 4 columns on desktop, 2 columns on tablet/half-screen, 1 column on mobile */}
      {criteriaList.length > 0 && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/40">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 w-full">
            {criteriaList.map(({ key, score }) => (
              <div
                key={key}
                className="flex items-center justify-between gap-2 px-3 py-2 sm:py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs w-full min-w-0"
              >
                <span
                  className="text-slate-600 dark:text-slate-400 font-medium truncate"
                  title={getCriteriaLabel(key, t)}
                >
                  {getCriteriaLabel(key, t)}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <StarRating rating={score} size="xs" />
                  <span className="text-slate-700 dark:text-slate-200 font-bold tabular-nums text-[11px]">
                    {toLocalizedDigits(score, isRTL)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Associated Auction Snippet */}
      {review.auction && (
        <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            {review.auction.images?.[0] ? (
              <img
                src={review.auction.images[0]}
                alt={review.auction.title}
                className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                <Package className="w-4 h-4 text-slate-400" />
              </div>
            )}
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                {t('reviews:card.auctionTitle', 'المزاد المرتبط:')}
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                {review.auction.title}
              </p>
            </div>
          </div>

          <div className="text-end shrink-0">
            <span className="text-amber-600 dark:text-amber-400 font-bold tabular-nums">
              {formatPrice(review.auction.currentPrice, isRTL)} {t('common:currency.egp', 'ج.م')}
            </span>
          </div>
        </div>
      )}

      {/* Seller Reply if present */}
      {review.reply && (
        <div className="ms-3 sm:ms-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <CornerIcon className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('reviews:card.sellerReply', 'رد البائع')}</span>
            </div>
            {review.repliedAt && (
              <span className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums">
                {formatRelativeTime(review.repliedAt, isRTL)}
              </span>
            )}
          </div>
          <p
            dir="auto"
            className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line text-start"
          >
            {review.reply}
          </p>
        </div>
      )}
    </article>
  );
};
