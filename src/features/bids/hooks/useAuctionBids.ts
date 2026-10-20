import { useState, useCallback } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { bidsService } from '../services/bids.service';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { useSocket } from '@/hooks/useSocket';
import { getLocalizedErrorMessage } from '@/utils/errorHandler';
import type { Bid } from '../types/bids.types';

export interface UseAuctionBidsOptions {
  initialLimit?: number;
}

export function useAuctionBids(
  auctionId: string,
  options?: UseAuctionBidsOptions
) {
  const { t } = useTranslation('bids');
  const { isConnected } = useSocket();

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

  // Bids history is synchronized reactively via central useAuctionDetail subscription updating the query cache
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
