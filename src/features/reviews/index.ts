/**
 * Reviews Feature Module — Public API
 */

// Types
export * from './types/reviews.types';

// Utilities
export * from './utils/reviews.utils';

// Services
export { reviewsService } from './services/reviews.service';

// Hooks
export { useUserReviews } from './hooks/useUserReviews';
export { useUserRatingStats } from './hooks/useUserRatingStats';
export type { UseUserReviewsOptions } from './hooks/useUserReviews';
export type { UseUserRatingStatsOptions } from './hooks/useUserRatingStats';

// Components
export { StarRating } from './components/StarRating';
export { RatingBreakdownCard } from './components/RatingBreakdownCard';
export { ReviewCard } from './components/ReviewCard';
export { ReviewFilters } from './components/ReviewFilters';
export { ReviewSkeleton } from './components/ReviewSkeleton';

export type { StarRatingProps } from './components/StarRating';
export type { RatingBreakdownCardProps } from './components/RatingBreakdownCard';
export type { ReviewCardProps } from './components/ReviewCard';
export type { ReviewFiltersProps } from './components/ReviewFilters';
export type { ReviewSkeletonProps } from './components/ReviewSkeleton';
