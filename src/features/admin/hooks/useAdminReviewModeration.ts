import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { adminService } from '../services/admin.service';
import type { Review } from '../types/admin.types';

export interface ModerationParams {
  reviewId: string;
  auctionId?: string;
}

export const useAdminReviewModeration = () => {
  const queryClient = useQueryClient();

  const hideMutation = useMutation<Review, Error, ModerationParams>({
    mutationFn: ({ reviewId }: ModerationParams) => adminService.hideReview(reviewId),
    onSuccess: (updatedReview, { auctionId }) => {
      if (auctionId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.ADMIN.AUCTION_REVIEWS(auctionId),
        });
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REVIEWS.ALL });
      if (updatedReview.reviewedUserId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.REVIEWS.USER_REVIEWS(updatedReview.reviewedUserId),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.REVIEWS.USER_STATS(updatedReview.reviewedUserId),
        });
      }
    },
  });

  const unhideMutation = useMutation<Review, Error, ModerationParams>({
    mutationFn: ({ reviewId }: ModerationParams) => adminService.unhideReview(reviewId),
    onSuccess: (updatedReview, { auctionId }) => {
      if (auctionId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.ADMIN.AUCTION_REVIEWS(auctionId),
        });
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REVIEWS.ALL });
      if (updatedReview.reviewedUserId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.REVIEWS.USER_REVIEWS(updatedReview.reviewedUserId),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.REVIEWS.USER_STATS(updatedReview.reviewedUserId),
        });
      }
    },
  });

  return {
    hideReview: hideMutation.mutateAsync,
    unhideReview: unhideMutation.mutateAsync,
    isHiding: hideMutation.isPending,
    isUnhiding: unhideMutation.isPending,
    isLoading: hideMutation.isPending || unhideMutation.isPending,
  };
};
