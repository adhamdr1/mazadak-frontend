import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { adminService } from '../services/admin.service';
import type { Review } from '../types/admin.types';

export const useAdminAuctionReviews = (auctionId?: string) => {
  return useQuery<Review[], Error>({
    queryKey: QUERY_KEYS.ADMIN.AUCTION_REVIEWS(auctionId || ''),
    queryFn: () => adminService.getAuctionReviews(auctionId || ''),
    enabled: Boolean(auctionId),
    staleTime: 1000 * 30, // 30 seconds
  });
};
