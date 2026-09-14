import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { bidsService } from '../services/bids.service';
import type { PlaceBidInput, Bid } from '../types/bids.types';
import { useToast } from '@/components/feedback/useToast';
import { getLocalizedErrorMessage, parseAppError, resolveCanonicalErrorCode } from '@/utils/errorHandler';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { ROUTES } from '@/constants/routes.constants';

export interface UsePlaceBidOptions {
  onSuccess?: (bid: Bid) => void;
  onError?: (error: unknown) => void;
}

export const usePlaceBid = (options?: UsePlaceBidOptions) => {
  const { t } = useTranslation('bids');
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (input: PlaceBidInput): Promise<Bid> => {
      return bidsService.placeBid(input);
    },
    onSuccess: (bid, variables) => {
      // 1. Toast success notification
      toast.success(t('messages.bidPlaced'));

      // 2. Invalidate cache for auction details, bids history, user's bids, and wallet
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.AUCTIONS.DETAIL(variables.auctionId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BIDS.BY_AUCTION(variables.auctionId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BIDS.MY_BIDS,
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.WALLET.MY_WALLET,
      });

      // 3. Broadcast to other open browser tabs (e.g. /my-bids page) for instant cross-tab sync
      try {
        if (typeof BroadcastChannel !== 'undefined') {
          const channel = new BroadcastChannel('mazadak_bids_channel');
          channel.postMessage({ type: 'BID_PLACED', auctionId: variables.auctionId });
          channel.close();
        }
        localStorage.setItem('mazadak_bids_sync', Date.now().toString());
      } catch {
        // Fallback gracefully if not supported
      }

      options?.onSuccess?.(bid);
    },
    onError: (err: unknown) => {
      const parsed = parseAppError(err);
      const canonicalCode =
        resolveCanonicalErrorCode(parsed.message) ||
        resolveCanonicalErrorCode(parsed.code) ||
        parsed.code;

      const localizedMessage =
        getLocalizedErrorMessage(err, t, 'bids') ||
        t('errors.UNKNOWN_ERROR', { defaultValue: 'An error occurred while placing your bid' });

      // Special handling for insufficient funds: Toast with CTA to deposit
      if (canonicalCode === 'INSUFFICIENT_FUNDS') {
        toast.error(localizedMessage, {
          action: {
            label: t('actions.depositNow'),
            onClick: () => navigate(ROUTES.WALLET_DEPOSIT),
          },
        });
      } else {
        toast.error(localizedMessage);
      }

      options?.onError?.(err);
    },
  });

  const placeBid = useCallback(
    async (input: PlaceBidInput) => {
      return mutation.mutateAsync(input);
    },
    [mutation]
  );

  return {
    placeBid,
    isPlacingBid: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error
      ? getLocalizedErrorMessage(mutation.error, t, 'bids')
      : null,
    rawError: mutation.error,
    reset: mutation.reset,
  };
};

export default usePlaceBid;
