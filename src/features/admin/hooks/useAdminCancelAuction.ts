import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { adminService } from '../services/admin.service';

export interface CancelAuctionParams {
  auctionId: string;
  reason: string;
}

export const useAdminCancelAuction = () => {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, CancelAuctionParams>({
    mutationFn: ({ auctionId, reason }: CancelAuctionParams) =>
      adminService.cancelAuction(auctionId, reason),
    onSuccess: (_data, { auctionId }) => {
      // Invalidate admin auctions list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.AUCTIONS_ALL });
      // Invalidate admin stats
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.STATS });
      // Invalidate public auction details & lists if open
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUCTIONS.DETAIL(auctionId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUCTIONS.ALL });
    },
  });
};
