import { useQuery } from '@tanstack/react-query';
import { reviewsService } from '../services/reviews.service';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import type { UserRatingStats } from '../types/reviews.types';

export interface UseUserRatingStatsOptions {
  userId: string;
  enabled?: boolean;
}

export const useUserRatingStats = ({
  userId,
  enabled = true,
}: UseUserRatingStatsOptions) => {
  return useQuery<UserRatingStats, Error>({
    queryKey: QUERY_KEYS.REVIEWS.USER_STATS(userId),
    queryFn: () => reviewsService.getUserRatingStats(userId),
    enabled: Boolean(userId) && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes SWR cache
    gcTime: 15 * 60 * 1000,
  });
};
