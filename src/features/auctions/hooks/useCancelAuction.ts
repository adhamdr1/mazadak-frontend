import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { auctionsService } from '../services/auctions.service';
import { getLocalizedErrorMessage } from '@/utils/errorHandler';

export interface UseCancelAuctionOptions {
  onSuccess?: () => void;
}

export const useCancelAuction = (options?: UseCancelAuctionOptions) => {
  const { t } = useTranslation('auctions');
  const queryClient = useQueryClient();
  const [targetAuctionId, setTargetAuctionId] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (auctionId: string) => {
      return auctionsService.cancel(auctionId);
    },
    onSuccess: (_, auctionId) => {
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
      queryClient.invalidateQueries({ queryKey: ['my-auctions'] });
      queryClient.invalidateQueries({ queryKey: ['auction', auctionId] });
      options?.onSuccess?.();
    },
  });

  const cancel = useCallback(
    async (auctionId: string) => {
      setTargetAuctionId(auctionId);
      return mutation.mutateAsync(auctionId);
    },
    [mutation]
  );

  const errorMessage = mutation.error
    ? getLocalizedErrorMessage(mutation.error, t, 'auctions')
    : null;

  return {
    cancel,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: errorMessage,
    targetAuctionId,
    reset: mutation.reset,
  };
};

export default useCancelAuction;
