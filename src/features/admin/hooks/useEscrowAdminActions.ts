import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { adminService } from '../services/admin.service';
import type { EscrowData } from '../types/admin.types';

export interface AdminEscrowActionParams {
  escrowId: string;
  reason?: string;
}

export const useEscrowAdminActions = () => {
  const queryClient = useQueryClient();

  const releaseMutation = useMutation<EscrowData, Error, AdminEscrowActionParams>({
    mutationFn: ({ escrowId, reason }: AdminEscrowActionParams) =>
      adminService.releaseEscrow(escrowId, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.ESCROWS_ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.DISPUTES_ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.STATS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.TREASURY });
      if (data?._id) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ESCROW.DETAIL(data._id) });
      }
      if (data?.auctionId) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ESCROW.BY_AUCTION(data.auctionId) });
      }
    },
  });

  const refundMutation = useMutation<EscrowData, Error, AdminEscrowActionParams>({
    mutationFn: ({ escrowId, reason }: AdminEscrowActionParams) =>
      adminService.refundEscrow(escrowId, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.ESCROWS_ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.DISPUTES_ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.STATS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.TREASURY });
      if (data?._id) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ESCROW.DETAIL(data._id) });
      }
      if (data?.auctionId) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ESCROW.BY_AUCTION(data.auctionId) });
      }
    },
  });

  return {
    releaseEscrow: releaseMutation.mutateAsync,
    isReleasing: releaseMutation.isPending,
    refundEscrow: refundMutation.mutateAsync,
    isRefunding: refundMutation.isPending,
    isLoading: releaseMutation.isPending || refundMutation.isPending,
    error: releaseMutation.error || refundMutation.error,
  };
};
