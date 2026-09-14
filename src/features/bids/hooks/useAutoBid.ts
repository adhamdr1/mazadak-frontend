/**
 * Auto-Bid Custom Hook
 * Manages fetching, setting, and cancelling automated bidding configurations
 * Follows Rule 6: "Component يرسم — Hook يفكر — Service يتكلم"
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { bidsService } from '../services/bids.service';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/feedback/useToast';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { ROUTES } from '@/constants/routes.constants';
import { getLocalizedErrorMessage, parseAppError, resolveCanonicalErrorCode } from '@/utils/errorHandler';
import type { AutoBid, UserWallet } from '../types/bids.types';

export function useAutoBid(auctionId?: string) {
  const { t } = useTranslation('bids');
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 1. Fetch current user's auto-bid configuration for this auction
  const {
    data: autoBid,
    isLoading: isFetching,
    isError: isFetchError,
    error: fetchError,
    refetch,
  } = useQuery<AutoBid | null>({
    queryKey: auctionId ? QUERY_KEYS.BIDS.MY_AUTO_BID(auctionId) : ['bids', 'my-auto-bid', 'none'],
    queryFn: () => (auctionId ? bidsService.getMyAutoBid(auctionId) : Promise.resolve(null)),
    enabled: Boolean(auctionId && isAuthenticated),
    staleTime: 10 * 1000,
  });

  // 1.1 Fetch current user's live wallet balance
  const {
    data: wallet,
    isLoading: isWalletLoading,
    refetch: refetchWallet,
  } = useQuery<UserWallet | null>({
    queryKey: QUERY_KEYS.WALLET.MY_WALLET,
    queryFn: () => (isAuthenticated ? bidsService.getMyWallet() : Promise.resolve(null)),
    enabled: Boolean(isAuthenticated),
    staleTime: 0,
  });

  // 2. Set Auto-Bid Mutation
  const setMutation = useMutation({
    mutationFn: async (maxAmount: number) => {
      if (!auctionId) throw new Error('AUCTION_NOT_FOUND');
      return bidsService.setAutoBid({ auctionId, maxAmount });
    },
    onSuccess: (newAutoBid) => {
      if (auctionId) {
        queryClient.setQueryData(QUERY_KEYS.BIDS.MY_AUTO_BID(auctionId), newAutoBid);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUCTIONS.DETAIL(auctionId) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BIDS.BY_AUCTION(auctionId) });
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BIDS.MY_BIDS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WALLET.MY_WALLET });
      toast.success(t('messages.autoBidSet'));
    },
    onError: (err: unknown) => {
      const parsed = parseAppError(err);
      const canonicalCode =
        resolveCanonicalErrorCode(parsed.message) ||
        resolveCanonicalErrorCode(parsed.code) ||
        parsed.code;

      const message =
        getLocalizedErrorMessage(err, t, 'bids') ||
        t('errors.UNKNOWN_ERROR', { defaultValue: 'An error occurred while configuring auto-bid' });

      if (canonicalCode === 'INSUFFICIENT_FUNDS') {
        toast.error(message, {
          action: {
            label: t('actions.depositNow'),
            onClick: () => navigate(ROUTES.WALLET_DEPOSIT),
          },
        });
      } else {
        toast.error(message);
      }
    },
  });

  // 3. Cancel Auto-Bid Mutation
  const cancelMutation = useMutation({
    mutationFn: () => {
      if (!auctionId) throw new Error('AUCTION_NOT_FOUND');
      return bidsService.cancelAutoBid({ auctionId });
    },
    onSuccess: () => {
      if (auctionId) {
        queryClient.setQueryData(QUERY_KEYS.BIDS.MY_AUTO_BID(auctionId), null);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUCTIONS.DETAIL(auctionId) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BIDS.BY_AUCTION(auctionId) });
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BIDS.MY_BIDS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WALLET.MY_WALLET });
      toast.success(t('messages.autoBidCancelled'));
    },
    onError: (err: unknown) => {
      const message =
        getLocalizedErrorMessage(err, t, 'bids') ||
        t('errors.UNKNOWN_ERROR', { defaultValue: 'An error occurred while cancelling auto-bid' });
      toast.error(message);
    },
  });

  const isActive = Boolean(autoBid && autoBid.status === 'ACTIVE');

  return {
    autoBid,
    wallet,
    isWalletLoading,
    isActive,
    isLoading: isFetching,
    isSetting: setMutation.isPending,
    isCancelling: cancelMutation.isPending,
    isFetchError,
    fetchError,
    setAutoBid: (maxAmount: number) => setMutation.mutateAsync(maxAmount),
    cancelAutoBid: () => cancelMutation.mutateAsync(),
    refetch,
    refetchWallet,
  };
}
