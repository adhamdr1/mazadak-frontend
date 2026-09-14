import { useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { auctionsService } from '../services/auctions.service';
import { bidsService } from '@/features/bids/services/bids.service';
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

  // 1. Real-time status update subscription
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
      // Re-sync wallet when auction ends/finalizes or status updates
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WALLET.MY_WALLET });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BIDS.MY_AUTO_BID(id) });
    });

    return () => {
      unsubscribe();
    };
  }, [id, queryClient]);

  // 2. Real-time live bid price update subscription (for Seller, Bidders, and Visitors)
  useEffect(() => {
    if (!id) return;
    const unsubscribe = bidsService.subscribeToBidAdded(id, {
      next: (data) => {
        if (!data?.bidAdded) return;
        const payload = data.bidAdded;
        queryClient.setQueryData<Auction>(QUERY_KEYS.AUCTIONS.DETAIL(id), (old) => {
          if (!old) return old;
          return {
            ...old,
            currentPrice: payload.currentPrice.toString(),
            winnerId: payload.leadingBidderId ?? old.winnerId,
          };
        });
        // Re-sync wallet and auto-bid on live bids
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WALLET.MY_WALLET });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BIDS.MY_AUTO_BID(id) });
      },
      error: (err) => {
        console.warn('WebSocket bidAdded subscription error in useAuctionDetail:', err);
      },
    });

    return () => {
      unsubscribe();
    };
  }, [id, queryClient]);

  // 3. Initial bids query to resolve real-time leading/winning bidder
  const bidsQuery = useQuery({
    queryKey: id ? QUERY_KEYS.BIDS.BY_AUCTION(id) : ['bids', 'by-auction', 'none'],
    queryFn: () =>
      id
        ? bidsService.getAuctionBids(id, { page: 1, limit: 1 })
        : Promise.resolve({ items: [], total: 0, totalPages: 0, hasNextPage: false }),
    enabled: Boolean(id),
    staleTime: 15 * 1000,
  });

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

  const latestLeadingBidderId =
    query.data?.winnerId ||
    (bidsQuery.data?.items && bidsQuery.data.items.length > 0
      ? bidsQuery.data.items[0].bidderId
      : null);

  const currentPriceNum = query.data?.currentPrice ? parseFloat(query.data.currentPrice) : 0;
  const startingPriceNum = query.data?.startingPrice ? parseFloat(query.data.startingPrice) : 0;
  const hasPriceIncreased = currentPriceNum > startingPriceNum;
  const totalBidsCount = bidsQuery.data?.total ?? (bidsQuery.data?.items ? bidsQuery.data.items.length : 0);

  const hasBids = Boolean(
    Boolean(query.data?.winnerId) ||
    (totalBidsCount > 0) ||
    hasPriceIncreased
  );

  const isSeller = Boolean(user && query.data && user._id === query.data.sellerId);
  const isWinner = Boolean(
    user &&
    ((query.data?.winnerId && user._id === query.data.winnerId) ||
      (effectiveStatus === 'ENDED' && latestLeadingBidderId && user._id === latestLeadingBidderId))
  );

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
    hasBids,
    refetch: query.refetch,
  };
}
