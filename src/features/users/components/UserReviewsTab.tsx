import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';
import {
  RatingBreakdownCard,
  ReviewFilters,
  ReviewCard,
  ReviewSkeleton,
  useUserReviews,
  useUserRatingStats,
} from '@/features/reviews';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Button } from '@/components/common/Button';
import type {
  ReviewType,
  ReviewsSortField,
  SortOrder,
  ReviewsFilterInput,
  ReviewsSortInput,
} from '@/features/reviews/types/reviews.types';
import type { RatingStats } from '../types/users.types';

export interface UserReviewsTabProps {
  userId: string;
  page: number;
  onPageChange: (newPage: number) => void;
  ratingStats?: RatingStats;
  currentUserId?: string;
  className?: string;
}

export const UserReviewsTab: React.FC<UserReviewsTabProps> = ({
  userId,
  page,
  onPageChange,
  ratingStats,
  currentUserId,
  className = '',
}) => {
  const { t } = useTranslation(['reviews', 'users', 'common']);

  // Local filter states
  const [activeType, setActiveType] = useState<ReviewType | 'ALL'>('ALL');
  const [minRating, setMinRating] = useState<number>(0);
  const [sortField, setSortField] = useState<ReviewsSortField>('CREATED_AT');
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC');

  // Fetch updated rating stats if not passed or for fresh breakdown
  const { data: fetchedStats } = useUserRatingStats({
    userId,
    enabled: !ratingStats?.breakdown,
  });

  const effectiveStats = ratingStats?.breakdown ? ratingStats : (fetchedStats || ratingStats);

  // Compute filter input
  const filterInput: ReviewsFilterInput = {
    type: activeType === 'ALL' ? undefined : activeType,
    minRating: minRating > 0 ? minRating : undefined,
  };

  const sortInput: ReviewsSortInput = {
    field: sortField,
    order: sortOrder,
  };

  const limit = 8;
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useUserReviews({
    userId,
    page,
    limit,
    filter: filterInput,
    sort: sortInput,
  });

  const handleTypeChange = (type: ReviewType | 'ALL') => {
    setActiveType(type);
    onPageChange(1);
  };

  const handleMinRatingChange = (rating: number) => {
    setMinRating(rating);
    onPageChange(1);
  };

  const handleSortChange = (field: ReviewsSortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
    onPageChange(1);
  };

  const handleResetFilters = () => {
    setActiveType('ALL');
    setMinRating(0);
    setSortField('CREATED_AT');
    setSortOrder('DESC');
    onPageChange(1);
  };

  const reviews = data?.items || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 0;

  return (
    <div className={`space-y-6 sm:space-y-8 ${className}`}>
      {/* 1. Rating Overview & Breakdown Card */}
      <RatingBreakdownCard stats={effectiveStats} />

      {/* 2. Interactive Filter Bar */}
      <ReviewFilters
        activeType={activeType}
        onTypeChange={handleTypeChange}
        minRating={minRating}
        onMinRatingChange={handleMinRatingChange}
        sortField={sortField}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        onReset={handleResetFilters}
      />

      {/* 3. Reviews List Stream */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <ReviewSkeleton key={`rev-skel-${i}`} />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-3xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t('common:error', 'حدث خطأ')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {error?.message || t('users:personal.updateError')}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            {t('common:retry', 'إعادة المحاولة')}
          </Button>
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-8">
          <EmptyState
            icon={<MessageSquare className="w-8 h-8 text-slate-400" />}
            title={t('reviews:noReviewsFound', 'لا توجد تقييمات مطابقة للفلتر المحدد')}
            description={t('reviews:noReviewsFoundDesc', 'جرّب تغيير خيارات التصفية أو الفرز لعرض نتائج أخرى.')}
            size="md"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              currentUserId={currentUserId}
              showAuctionInfo={true}
            />
          ))}

          {/* Independent Reviews Pagination */}
          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              limit={limit}
              onPageChange={onPageChange}
              isLoading={isFetching}
            />
          )}
        </div>
      )}
    </div>
  );
};
