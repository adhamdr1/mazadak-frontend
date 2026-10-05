import { useQuery } from '@tanstack/react-query';
import { reviewsService } from '../services/reviews.service';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import type {
  ReviewsFilterInput,
  ReviewsSortInput,
  ReviewsPage,
} from '../types/reviews.types';

export interface UseMyWrittenReviewsOptions {
  page?: number;
  limit?: number;
  filter?: ReviewsFilterInput;
  sort?: ReviewsSortInput;
  enabled?: boolean;
}

export const useMyWrittenReviews = ({
  page = 1,
  limit = 10,
  filter,
  sort = { field: 'CREATED_AT', order: 'DESC' },
  enabled = true,
}: UseMyWrittenReviewsOptions = {}) => {
  return useQuery<ReviewsPage, Error>({
    queryKey: QUERY_KEYS.REVIEWS.MY_WRITTEN(page, limit, filter, sort),
    queryFn: () =>
      reviewsService.getMyWrittenReviews(
        { page, limit },
        filter,
        sort
      ),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes fresh in cache
    gcTime: 10 * 60 * 1000,
  });
};
