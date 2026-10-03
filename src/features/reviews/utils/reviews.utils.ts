import type { TFunction } from 'i18next';
import type { ReviewCriteria, ReviewStatus, ReviewType } from '../types/reviews.types';

/**
 * Rounds a rating (0 to 5) to the nearest half star (0, 0.5, 1.0, ..., 5.0)
 */
export function roundToHalfStar(rating: number): number {
  if (typeof rating !== 'number' || isNaN(rating) || rating <= 0) return 0;
  if (rating >= 5) return 5;
  return Math.round(rating * 2) / 2;
}

/**
 * Calculates percentage safely against division by zero
 */
export function calculateBreakdownPercentage(count: number, total: number): number {
  if (!total || total <= 0 || !count || count <= 0) return 0;
  return Math.min(100, Math.round((count / total) * 100));
}

/**
 * Returns translated display label for review types
 */
export function getReviewTypeLabel(type: ReviewType, t: TFunction): string {
  if (type === 'BUYER_TO_SELLER') {
    return t('reviews:card.buyerReview', 'تقييم مشتري');
  }
  return t('reviews:card.sellerReview', 'تقييم بائع');
}

/**
 * Returns localized title for individual criteria
 */
export function getCriteriaLabel(key: keyof ReviewCriteria, t: TFunction): string {
  switch (key) {
    case 'itemAccuracy':
      return t('reviews:criteria.itemAccuracy', 'مطابقة الوصف');
    case 'communication':
      return t('reviews:criteria.communication', 'التواصل والاستجابة');
    case 'packaging':
      return t('reviews:criteria.packaging', 'التغليف والشحن');
    case 'smoothExperience':
      return t('reviews:criteria.smoothExperience', 'سلاسة التجربة');
    default:
      return String(key);
  }
}

/**
 * Returns localized description for individual criteria
 */
export function getCriteriaDescription(key: keyof ReviewCriteria, t: TFunction): string {
  switch (key) {
    case 'itemAccuracy':
      return t('reviews:criteria.itemAccuracyDesc', 'مدى تطابق السلعة مع الصور والمواصفات');
    case 'communication':
      return t('reviews:criteria.communicationDesc', 'سرعة التجاوب والاحترافية');
    case 'packaging':
      return t('reviews:criteria.packagingDesc', 'جودة حماية وتغليف السلعة');
    case 'smoothExperience':
      return t('reviews:criteria.smoothExperienceDesc', 'سهولة إتمام الصفقة دون تعقيدات');
    default:
      return '';
  }
}

/**
 * Returns badge configuration for review status
 */
export function getReviewStatusBadgeProps(status: ReviewStatus, t: TFunction) {
  switch (status) {
    case 'PUBLISHED':
      return {
        label: t('reviews:card.publishedBadge', 'منشور'),
        colorClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        dotClass: 'bg-emerald-500',
      };
    case 'PENDING':
      return {
        label: t('reviews:card.pendingBadge', 'قيد المراجعة (تقييم أعمى)'),
        colorClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        dotClass: 'bg-amber-500',
      };
    case 'HIDDEN':
    default:
      return {
        label: t('reviews:card.hiddenBadge', 'مخفي'),
        colorClass: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
        dotClass: 'bg-slate-400',
      };
  }
}
