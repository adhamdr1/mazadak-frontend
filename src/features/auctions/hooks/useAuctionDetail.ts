import { useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { auctionsService } from '../services/auctions.service';
import { useAuth } from '@/hooks/useAuth';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import type { Auction, AuctionStatus } from '../types/auctions.types';

export function useAuctionDetail(id?: string) {
  const { t, i18n } = useTranslation('auctions');
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const query = useQuery({
    queryKey: id ? QUERY_KEYS.AUCTIONS.DETAIL(id) : ['auctions', 'detail', 'none'],
    queryFn: () => (id ? auctionsService.getById(id) : Promise.reject(new Error('NO_ID'))),
    enabled: Boolean(id),
    staleTime: 15 * 1000,
  });

  // Real-time status update subscription
  useEffect(() => {
    if (!id) return;
    const unsubscribe = auctionsService.subscribeToStatusChanges(id, (payload) => {
      queryClient.setQueryData<Auction>(QUERY_KEYS.AUCTIONS.DETAIL(id), (old) => {
        if (!old) return payload.auction;
        return {
          ...old,
          status: payload.auction.status,
          currentPrice: payload.auction.currentPrice || old.currentPrice,
          winnerId: payload.auction.winnerId ?? old.winnerId,
        };
      });
    });

    return () => {
      unsubscribe();
    };
  }, [id, queryClient]);

  // Compute dynamic effective status
  const effectiveStatus = useMemo<AuctionStatus | undefined>(() => {
    if (!query.data) return undefined;
    const { status, startTime, endTime } = query.data;
    if (status === 'ENDED' || status === 'CANCELLED') return status;

    const nowMs = Date.now();
    const endMs = new Date(endTime).getTime();
    if (endMs <= nowMs) return 'ENDED';

    const startMs = new Date(startTime).getTime();
    if (startMs > nowMs) return 'PENDING';

    return 'ACTIVE';
  }, [query.data]);

  const isSeller = Boolean(user && query.data && user._id === query.data.sellerId);
  const isWinner = Boolean(user && query.data && user._id === query.data.winnerId);

  const errorKey = query.error ? `errors.${query.error.message}` : null;
  const error = errorKey
    ? (i18n.exists(`auctions:${errorKey}`) ? t(errorKey) : t('errors.GENERIC_ERROR'))
    : null;

  return {
    auction: query.data,
    effectiveStatus,
    isLoading: query.isLoading,
    isError: query.isError,
    error,
    isSeller,
    isWinner,
    refetch: query.refetch,
  };
}
