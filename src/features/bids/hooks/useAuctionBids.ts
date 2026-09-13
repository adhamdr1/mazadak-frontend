import { useState, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { bidsService, BID_ADDED_SUBSCRIPTION } from '../services/bids.service';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { useSocket } from '@/hooks/useSocket';
import { getLocalizedErrorMessage } from '@/utils/errorHandler';
import type { Bid, BidAddedPayload, BidsPage } from '../types/bids.types';

export interface UseAuctionBidsOptions {
  initialLimit?: number;
}

export function useAuctionBids(
  auctionId: string,
  options?: UseAuctionBidsOptions
) {
  const { t } = useTranslation('bids');
  const queryClient = useQueryClient();
  const { subscribe, isConnected } = useSocket();

  const initialLimit = options?.initialLimit ?? 10;
  const [limit, setLimit] = useState(initialLimit);

  // 1. Query auction bids strictly sorted by creation time (newest first)
  const query = useQuery({
    queryKey: [...QUERY_KEYS.BIDS.BY_AUCTION(auctionId), 'history', { limit }],
    queryFn: () =>
      auctionId
        ? bidsService.getAuctionBids(
            auctionId,
            { page: 1, limit },
            { sort: { field: 'CREATED_AT', order: 'DESC' } }
          )
        : Promise.resolve({ items: [], total: 0, totalPages: 0, hasNextPage: false }),
    enabled: Boolean(auctionId),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });

  // 2. Direct real-time WebSocket subscription for live bids prepend & status updates
  useEffect(() => {
    if (!auctionId) return;

    const unsubscribe = subscribe<{ bidAdded: BidAddedPayload }>(
      {
        query: BID_ADDED_SUBSCRIPTION,
        variables: { auctionId },
      },
      {
        next: (data) => {
          if (!data?.bidAdded) return;
          const payload = data.bidAdded;

          // Seamlessly update all matching queries for this auction's bids in cache
          queryClient.setQueriesData<BidsPage>(
            { queryKey: QUERY_KEYS.BIDS.BY_AUCTION(auctionId) },
            (old) => {
              if (!old) {
                return {
                  items: [payload.bid],
                  total: payload.bidCount,
                  totalPages: 1,
                  hasNextPage: false,
                };
              }

              // Deduplicate if already present
              const filtered = old.items.filter((b) => b._id !== payload.bid._id);

              // Demote all prior bids to OUTBID since the newly incoming bid is the current WINNING leader
              const updatedPrevious = filtered.map((b) => ({
                ...b,
                status: 'OUTBID' as const,
              }));

              return {
                ...old,
                items: [payload.bid, ...updatedPrevious],
                total: Math.max(payload.bidCount, (old.total ?? 0) + 1),
              };
            }
          );
        },
        error: (err) => {
          console.warn('AuctionBidHistory: WebSocket subscription error:', err);
        },
      }
    );

    // Clean up WebSocket listener when unmounting or switching auctions
    return () => {
      unsubscribe();
    };
  }, [auctionId, subscribe, queryClient]);

  const rawItems: Bid[] = query.data?.items || [];
  const bids: Bid[] = [...rawItems].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const total = query.data?.total || 0;
  const hasNextPage = total > bids.length;
  const canShowLess = limit > initialLimit;


  const loadMore = useCallback(() => {
    if (hasNextPage && !query.isFetching) {
      setLimit((prev) => prev + 10);
    }
  }, [hasNextPage, query.isFetching]);

  const showLess = useCallback(() => {
    setLimit(initialLimit);
  }, [initialLimit]);

  const localizedError = getLocalizedErrorMessage(query.error, t, 'bids');

  return {
    bids,
    total,
    hasNextPage,
    canShowLess,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isSocketConnected: isConnected,
    error: localizedError,
    loadMore,
    showLess,
    refetch: query.refetch,
  };
}

export default useAuctionBids;
