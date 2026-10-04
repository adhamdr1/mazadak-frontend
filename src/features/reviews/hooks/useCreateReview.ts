import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { reviewsService } from '../services/reviews.service';
import { useToast } from '@/components/feedback/useToast';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import type { Review, CreateReviewInput } from '../types/reviews.types';

export function useCreateReview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation('reviews');

  return useMutation<Review, Error, CreateReviewInput>({
    mutationFn: (input: CreateReviewInput) => reviewsService.createReview(input),
    onSuccess: (newReview, variables) => {
      // 1. Invalidate all review queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REVIEWS.ALL });

      // 2. Invalidate eligibility for this specific auction
      if (variables.auctionId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.REVIEWS.CAN_REVIEW(variables.auctionId),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.AUCTIONS.DETAIL(variables.auctionId),
        });
      }

      // 3. Invalidate reviewed user stats & profile
      if (newReview.reviewedUserId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.REVIEWS.USER_STATS(newReview.reviewedUserId),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.USERS.PUBLIC_PROFILE(newReview.reviewedUserId),
        });
      }

      // 4. Show success toast explaining the Blind Review policy
      toast.success(
        t(
          'reviews:messages.reviewCreatedSuccess',
          'تم إرسال تقييمك بنجاح! سيتم نشره تلقائياً فور تقييم الطرف الآخر أو بانقضاء مهلة الـ 14 يوماً.'
        ),
        { duration: 5000 }
      );
    },
    onError: (err) => {
      const msg = err.message || '';
      let errorText = t('reviews:errors.DEFAULT_ERROR', 'حدث خطأ غير متوقع أثناء معالجة التقييم.');

      if (msg.includes('REVIEW_ALREADY_EXISTS')) {
        errorText = t('reviews:errors.REVIEW_ALREADY_EXISTS', 'لقد قمت بتقييم هذا المزاد مسبقاً.');
      } else if (msg.includes('REVIEW_WINDOW_EXPIRED')) {
        errorText = t(
          'reviews:errors.REVIEW_WINDOW_EXPIRED',
          'انتهت المهلة المحددة لتقييم هذه المعاملة (14 يوماً من انتهاء المزاد).'
        );
      } else if (msg.includes('CANNOT_REVIEW_YOURSELF')) {
        errorText = t('reviews:errors.CANNOT_REVIEW_YOURSELF', 'لا يمكنك تقييم نفسك.');
      } else if (msg.includes('AUCTION_NOT_ELIGIBLE_FOR_REVIEW')) {
        errorText = t(
          'reviews:errors.AUCTION_NOT_ELIGIBLE_FOR_REVIEW',
          'لا يمكن تقييم هذا المزاد في حالته الحالية.'
        );
      } else if (msg.includes('NOT_AUCTION_PARTICIPANT')) {
        errorText = t(
          'reviews:errors.NOT_AUCTION_PARTICIPANT',
          'عذراً، التقييم متاح فقط لأطراف المعاملة الفعلية (البائع والمشتري الفائز).'
        );
      } else if (msg) {
        errorText = msg;
      }

      toast.error(errorText);
    },
  });
}
