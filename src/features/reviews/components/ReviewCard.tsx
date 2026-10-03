import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  MessageSquare,
  CornerDownLeft,
  CornerDownRight,
  ShieldCheck,
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
import type { Review, ReviewCriteria } from '../types/reviews.types';

export interface ReviewCardProps {
  review: Review;
  currentUserId?: string;
  onReplyClick?: (review: Review) => void;
  showAuctionInfo?: boolean;
  className?: string;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  currentUserId,
  onReplyClick,
  showAuctionInfo = true,
  className = '',
}) => {
  const { t, i18n } = useTranslation(['reviews', 'common']);
  const isRTL = i18n.language?.startsWith('ar');

  const reviewerName = review.reviewer
    ? `${review.reviewer.firstName} ${review.reviewer.lastName}`.trim()
    : t('common:user', 'مستخدم مزادك');

  const reviewerInitials = reviewerName
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const typeLabel = getReviewTypeLabel(review.type, t);
  const statusBadge = getReviewStatusBadgeProps(review.status, t);

  const canReply =
    Boolean(currentUserId) &&
    currentUserId === review.reviewedUserId &&
    !review.reply &&
    review.status === 'PUBLISHED' &&
    Boolean(onReplyClick);

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
      className={`bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 ${className}`}
    >
      {/* Top Bar: Reviewer Info + Badges + Date */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-3">
          {/* Avatar with luxury gradient */}
          <div className="w-11 h-11 rounded-full bg-linear-to-br from-amber-500 to-amber-600 text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0 select-none">
            {reviewerInitials || 'MZ'}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                {reviewerName}
              </h4>
              {review.reviewer?.city && (
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  • {review.reviewer.city}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <span className="inline-flex items-center text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {typeLabel}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums">
                {formatRelativeTime(review.createdAt, isRTL)}
              </span>
            </div>
          </div>
        </div>

        {/* Right side: Overall Star Rating + Optional Status Badge */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {review.status !== 'PUBLISHED' && (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadge.colorClass}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dotClass}`} />
              {statusBadge.label}
            </span>
          )}

          <div className="flex items-center gap-1.5 bg-amber-500/10 dark:bg-amber-500/15 px-2.5 py-1 rounded-xl border border-amber-500/20">
            <StarRating rating={review.overallRating} size="xs" />
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 tabular-nums">
              {toLocalizedDigits(review.overallRating.toFixed(1), isRTL)}
            </span>
          </div>
        </div>
      </div>

      {/* Optional Blind Review Notice for PENDING state */}
      {review.status === 'PENDING' && (
        <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{t('reviews:card.blindNotice')}</span>
        </div>
      )}

      {/* Review Comment Text */}
      {review.comment ? (
        <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
          {review.comment}
        </p>
      ) : (
        <p className="mt-4 text-xs italic text-slate-400 dark:text-slate-500">
          {t('reviews:overview.ratingSummary')} ({toLocalizedDigits(review.overallRating, isRTL)} / 5)
        </p>
      )}

      {/* Criteria Breakdown Pills */}
      {criteriaList.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/40 flex flex-wrap gap-2">
          {criteriaList.map(({ key, score }) => (
            <div
              key={key}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs"
            >
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                {getCriteriaLabel(key, t)}:
              </span>
              <div className="flex items-center gap-1">
                <StarRating rating={score} size="xs" />
                <span className="text-slate-700 dark:text-slate-200 font-bold tabular-nums text-[11px]">
                  {toLocalizedDigits(score, isRTL)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Associated Auction Snippet */}
      {showAuctionInfo && review.auction && (
        <div className="mt-4 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
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
                {t('reviews:card.auctionTitle')}
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

      {/* Official Reply Bubble */}
      {review.reply && (
        <div className="mt-4 ms-3 sm:ms-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 relative">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <CornerIcon className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('reviews:card.sellerReply')}</span>
            </div>
            {review.repliedAt && (
              <span className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums">
                {formatRelativeTime(review.repliedAt, isRTL)}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {review.reply}
          </p>
        </div>
      )}

      {/* Action Button: Reply to Review (if eligible) */}
      {canReply && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex justify-end">
          <button
            type="button"
            onClick={() => onReplyClick?.(review)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-all border border-amber-500/20 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{t('reviews:card.replyButton')}</span>
          </button>
        </div>
      )}
    </article>
  );
};
