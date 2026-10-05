import { useQuery } from '@tanstack/react-query';
import { reviewsService } from '../services/reviews.service';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import type { CanReviewAuctionResponse } from '../types/reviews.types';

export interface UseCanReviewAuctionOptions {
  auctionId?: string;
  enabled?: boolean;
}

/**
 * Pre-eligibility check hook for reviewing an auction.
 * Configured with `staleTime: 0` to guarantee fresh eligibility verification.
 */
export const useCanReviewAuction = ({
  auctionId,
  enabled = true,
}: UseCanReviewAuctionOptions) => {
  return useQuery<CanReviewAuctionResponse, Error>({
    queryKey: QUERY_KEYS.REVIEWS.CAN_REVIEW(auctionId || ''),
    queryFn: () => reviewsService.canReviewAuction(auctionId!),
    enabled: Boolean(auctionId) && enabled,
    staleTime: 0, // Always fetch fresh eligibility status
    gcTime: 5 * 60 * 1000,
  });
};
