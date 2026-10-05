import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageSquare, AlertCircle, RefreshCw, Inbox, PenLine } from 'lucide-react';
import { RatingBreakdownCard } from './RatingBreakdownCard';
import { ReviewFilters } from './ReviewFilters';
import { ReviewCard } from './ReviewCard';
import { MyWrittenReviewCard } from './MyWrittenReviewCard';
import { ReviewSkeleton } from './ReviewSkeleton';
import { ReplyReviewModal } from './ReplyReviewModal';
import { useUserReviews } from '../hooks/useUserReviews';
import { useUserRatingStats } from '../hooks/useUserRatingStats';
import { useMyWrittenReviews } from '../hooks/useMyWrittenReviews';
import { useReviewSubscription } from '../hooks/useReviewSubscription';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Button } from '@/components/common/Button';
import type {
  Review,
  ReviewType,
  ReviewsSortField,
  SortOrder,
  ReviewsFilterInput,
  ReviewsSortInput,
  UserRatingStats,
} from '../types/reviews.types';

export interface UserReviewsSectionProps {
  userId: string;
  currentUserId?: string;
  ratingStats?: UserRatingStats;
  paginationMode?: 'url' | 'local';
  page?: number;
  onPageChange?: (newPage: number) => void;
  className?: string;
}

export const UserReviewsSection: React.FC<UserReviewsSectionProps> = ({
  userId,
  currentUserId,
  ratingStats,
  paginationMode = 'url',
  page: externalPage,
  onPageChange: externalOnPageChange,
  className = '',
}) => {
  const { t } = useTranslation(['reviews', 'common']);
  const [searchParams, setSearchParams] = useSearchParams();

  const isOwner = Boolean(currentUserId && currentUserId === userId);
  const [subTab, setSubTab] = useState<'received' | 'written'>('received');

  // 1. Pagination management for received reviews (url vs local mode)
  const [localPage, setLocalPage] = useState<number>(externalPage || 1);
  const [writtenPage, setWrittenPage] = useState<number>(1);

  const activePage =
    paginationMode === 'url'
      ? Math.max(1, parseInt(searchParams.get('reviewPage') || '1', 10))
      : (externalPage ?? localPage);

  const handlePageChange = (newPage: number) => {
    if (paginationMode === 'url') {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('reviewPage', newPage.toString());
      setSearchParams(nextParams);
    } else {
      setLocalPage(newPage);
    }
    externalOnPageChange?.(newPage);
  };

  // 2. Local filter states for received reviews
  const [activeType, setActiveType] = useState<ReviewType | 'ALL'>('ALL');
  const [minRating, setMinRating] = useState<number>(0);
  const [sortField, setSortField] = useState<ReviewsSortField>('CREATED_AT');
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC');

  // 3. Seller reply modal state
  const [selectedReviewForReply, setSelectedReviewForReply] = useState<Review | null>(null);

  // 4. Real-time WebSocket subscription for live review sync
  useReviewSubscription({
    userId,
    enabled: Boolean(userId),
  });

  // 5. Fetch updated rating stats if breakdown is missing
  const { data: fetchedStats } = useUserRatingStats({
    userId,
    enabled: !ratingStats?.breakdown,
  });

  const effectiveStats = ratingStats?.breakdown ? ratingStats : (fetchedStats || ratingStats);

  // 6. Query received reviews list
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
    page: activePage,
    limit,
    filter: filterInput,
    sort: sortInput,
    enabled: subTab === 'received',
  });

  // 7. Query my written reviews (only when isOwner and subTab === 'written')
  const {
    data: writtenData,
    isLoading: isWrittenLoading,
    isError: isWrittenError,
    error: writtenError,
    refetch: refetchWritten,
    isFetching: isWrittenFetching,
  } = useMyWrittenReviews({
    page: writtenPage,
    limit,
    enabled: isOwner && subTab === 'written',
  });

  const handleTypeChange = (type: ReviewType | 'ALL') => {
    setActiveType(type);
    handlePageChange(1);
  };

  const handleMinRatingChange = (rating: number) => {
    setMinRating(rating);
    handlePageChange(1);
  };

  const handleSortChange = (field: ReviewsSortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
    handlePageChange(1);
  };

  const handleResetFilters = () => {
    setActiveType('ALL');
    setMinRating(0);
    setSortField('CREATED_AT');
    setSortOrder('DESC');
    handlePageChange(1);
  };

  const reviews = data?.items || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 0;

  const writtenReviews = writtenData?.items || [];
  const writtenTotal = writtenData?.total || 0;
  const writtenTotalPages = writtenData?.totalPages || 0;

  return (
    <section aria-label={t('reviews:title', 'التقييمات والآراء')} className={`space-y-6 sm:space-y-8 ${className}`}>
      {/* 1. Unified Section Header Row (Title/Subtitle on one side, Owner Toggle on the other) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            {subTab === 'received' ? (
              <>
                <Inbox className="w-5 h-5 text-amber-500" />
                <span>{t('reviews:title', 'التقييمات والآراء')}</span>
              </>
            ) : (
              <>
                <PenLine className="w-5 h-5 text-amber-500" />
                <span>{t('reviews:myWritten.title', 'تقييماتي المكتوبة')}</span>
              </>
            )}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {subTab === 'received'
              ? t('reviews:subtitle', 'تقييمات وتجارب المشترين والبائعين الموثوقة')
              : t(
                  'reviews:myWritten.subtitle',
                  'التقييمات التي شاركتها مع أطراف المزادات التي خضتها، بما فيها التقييمات قيد المراجعة في نظام التقييم الأعمى.'
                )}
          </p>
        </div>

        {/* Owner Segmented Toggle Switch in the same row */}
        {isOwner && (
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setSubTab('received')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                subTab === 'received'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Inbox className="w-4 h-4 text-amber-500" />
              <span>{t('reviews:title', 'التقييمات المستلمة')}</span>
            </button>

            <button
              type="button"
              onClick={() => setSubTab('written')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                subTab === 'written'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <PenLine className="w-4 h-4 text-amber-500" />
              <span>{t('reviews:myWritten.title', 'تقييماتي المكتوبة')}</span>
            </button>
          </div>
        )}
      </div>

      {/* VIEW 1: RECEIVED REVIEWS */}
      {subTab === 'received' && (
        <>
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
                <ReviewSkeleton key={`rev-sec-skel-${i}`} />
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
                  {error?.message || t('reviews:errors.DEFAULT_ERROR', 'تعذر تحميل التقييمات.')}
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
                title={t('reviews:empty.noFilteredResultsTitle', 'لا توجد تقييمات مطابقة للفلتر المحدد')}
                description={t(
                  'reviews:empty.noFilteredResultsDesc',
                  'جرّب تغيير خيارات التصفية أو الفرز لعرض نتائج أخرى.'
                )}
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
                  onReplyClick={(rev) => setSelectedReviewForReply(rev)}
                />
              ))}

              {/* Independent Reviews Pagination */}
              {totalPages > 1 && (
                <Pagination
                  page={activePage}
                  totalPages={totalPages}
                  total={total}
                  limit={limit}
                  onPageChange={handlePageChange}
                  isLoading={isFetching}
                />
              )}
            </div>
          )}
        </>
      )}

      {/* VIEW 2: MY WRITTEN REVIEWS */}
      {subTab === 'written' && (
        <div className="space-y-6">

          {isWrittenLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <ReviewSkeleton key={`rev-written-skel-${i}`} />
              ))}
            </div>
          ) : isWrittenError ? (
            <div className="rounded-3xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 mx-auto flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t('common:error', 'حدث خطأ')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  {writtenError?.message || t('reviews:errors.DEFAULT_ERROR', 'تعذر تحميل تقييماتك.')}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchWritten()}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                {t('common:retry', 'إعادة المحاولة')}
              </Button>
            </div>
          ) : writtenReviews.length === 0 ? (
            <div className="py-8">
              <EmptyState
                icon={<PenLine className="w-8 h-8 text-slate-400" />}
                title={t('reviews:myWritten.empty', 'لم تقم بكتابة أي تقييمات حتى الآن')}
                description={t(
                  'reviews:myWritten.subtitle',
                  'عندما تشارك في مزادات وتكتمل معاملاتك، ستتمكن من تقييم الأطراف الأخرى وتتبع تقييماتك هنا.'
                )}
                size="md"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {writtenReviews.map((review) => (
                <MyWrittenReviewCard key={review._id} review={review} />
              ))}

              {writtenTotalPages > 1 && (
                <Pagination
                  page={writtenPage}
                  totalPages={writtenTotalPages}
                  total={writtenTotal}
                  limit={limit}
                  onPageChange={(p) => setWrittenPage(p)}
                  isLoading={isWrittenFetching}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. Seller Reply Modal */}
      {selectedReviewForReply && (
        <ReplyReviewModal
          isOpen={Boolean(selectedReviewForReply)}
          onClose={() => setSelectedReviewForReply(null)}
          review={selectedReviewForReply}
          onSuccess={() => setSelectedReviewForReply(null)}
        />
      )}
    </section>
  );
};
