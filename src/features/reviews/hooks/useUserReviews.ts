import { useQuery } from '@tanstack/react-query';
import { reviewsService } from '../services/reviews.service';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import type {
  ReviewsFilterInput,
  ReviewsSortInput,
  ReviewsPage,
} from '../types/reviews.types';

export interface UseUserReviewsOptions {
  userId: string;
  page?: number;
  limit?: number;
  filter?: ReviewsFilterInput;
  sort?: ReviewsSortInput;
  enabled?: boolean;
}

export const useUserReviews = ({
  userId,
  page = 1,
  limit = 10,
  filter,
  sort = { field: 'CREATED_AT', order: 'DESC' },
  enabled = true,
}: UseUserReviewsOptions) => {
  return useQuery<ReviewsPage, Error>({
    queryKey: QUERY_KEYS.REVIEWS.USER_REVIEWS(userId, page, limit, filter, sort),
    queryFn: () =>
      reviewsService.getUserReviews(
        userId,
        { page, limit },
        filter,
        sort
      ),
    enabled: Boolean(userId) && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes fresh in cache
    gcTime: 15 * 60 * 1000,
  });
};
