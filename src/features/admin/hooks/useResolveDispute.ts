import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { adminService } from '../services/admin.service';
import type { ResolveDisputeInput, DisputeData } from '../types/admin.types';

export const useResolveDispute = () => {
  const queryClient = useQueryClient();

  return useMutation<DisputeData, Error, ResolveDisputeInput>({
    mutationFn: (input: ResolveDisputeInput) => adminService.resolveDispute(input),
    onSuccess: (data) => {
      // Invalidate admin disputes and escrows
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.DISPUTES_ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.ESCROWS_ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.STATS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.TREASURY });

      // Invalidate specific dispute and escrow if cached
      if (data?._id) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ESCROW.DISPUTE(data._id) });
      }
      if (data?.escrowId) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ESCROW.DETAIL(data.escrowId) });
      }
      if (data?.auctionId) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ESCROW.BY_AUCTION(data.auctionId) });
      }
    },
  });
};
