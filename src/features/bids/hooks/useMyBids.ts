import { useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { bidsService, WALLET_UPDATED_SUBSCRIPTION } from '../services/bids.service';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { useSocket } from '@/hooks/useSocket';
import { getLocalizedErrorMessage } from '@/utils/errorHandler';
import type { BidStatus, BidsFilterInput, BidsSortField, SortOrder } from '../types/bids.types';

export type MyBidsFilterStatus = 'ALL' | BidStatus;
export type MyBidsSortOption = 'NEWEST' | 'OLDEST' | 'HIGHEST_AMOUNT' | 'LOWEST_AMOUNT';

interface SortConfig {
  field: BidsSortField;
  order: SortOrder;
}

const SORT_MAP: Record<MyBidsSortOption, SortConfig> = {
  NEWEST: { field: 'CREATED_AT', order: 'DESC' },
  OLDEST: { field: 'CREATED_AT', order: 'ASC' },
  HIGHEST_AMOUNT: { field: 'AMOUNT', order: 'DESC' },
  LOWEST_AMOUNT: { field: 'AMOUNT', order: 'ASC' },
};

export const useMyBids = () => {
  const { t } = useTranslation('bids');
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { subscribe } = useSocket();

  // 1. URL-Persisted State (survives refresh, sharable, back/forward history)
  const rawStatus = searchParams.get('status')?.toUpperCase();
  const statusFilter: MyBidsFilterStatus =
    rawStatus === 'WINNING' || rawStatus === 'OUTBID' ? (rawStatus as BidStatus) : 'ALL';

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = 12;

  const rawSort = searchParams.get('sort')?.toUpperCase() as MyBidsSortOption;
  const sortOption: MyBidsSortOption = SORT_MAP[rawSort] ? rawSort : 'NEWEST';

  // 2. Build GraphQL filter input supported natively by backend
  const filterInput = useMemo<BidsFilterInput>(() => {
    const filter: BidsFilterInput = {};

    if (statusFilter !== 'ALL') {
      filter.status = statusFilter;
    }

    const sortConfig = SORT_MAP[sortOption];
    filter.sort = {
      field: sortConfig.field,
      order: sortConfig.order,
    };

    return filter;
  }, [statusFilter, sortOption]);

  // 3. Main paginated query for user's bids
  const {
    data: bidsPage,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      QUERY_KEYS.BIDS.MY_BIDS[0],
      QUERY_KEYS.BIDS.MY_BIDS[1],
      statusFilter,
      sortOption,
      page,
      limit,
    ],
    queryFn: () => bidsService.getMyBids({ page, limit }, filterInput),
    staleTime: 10 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 12 * 1000, // 12s smart background polling fallback
  });

  // 4. Consolidated statistics query for count metrics
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['bids', 'my', 'stats'],
    queryFn: () => bidsService.getMyBidsStats(),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });

  const stats = useMemo(
    () => ({
      totalBids: statsData?.totalBids ?? (bidsPage?.total ?? 0),
      winningBids: statsData?.winningBids ?? 0,
      outbidBids: statsData?.outbidBids ?? 0,
    }),
    [statsData, bidsPage?.total]
  );

  // 5. Real-time Multi-Tab and WebSocket Synchronization
  useEffect(() => {
    const triggerSync = () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BIDS.MY_BIDS });
      queryClient.invalidateQueries({ queryKey: ['bids', 'my', 'stats'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WALLET.MY_WALLET });
    };

    // A. Cross-Tab Instant BroadcastChannel Sync (e.g. Tab 1 bids -> Tab 2 updates in 5ms)
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        channel = new BroadcastChannel('mazadak_bids_channel');
        channel.onmessage = (event) => {
          if (event.data?.type === 'BID_PLACED') {
            triggerSync();
          }
        };
      }
    } catch {
      // BroadcastChannel unavailable
    }

    // B. Secondary storage event for browsers
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'mazadak_bids_sync') {
        triggerSync();
      }
    };
    window.addEventListener('storage', handleStorage);

    // C. WebSocket Live Subscription: Invalidate when backend triggers wallet balance updates
    const unsubscribeWallet = subscribe(
      { query: WALLET_UPDATED_SUBSCRIPTION },
      {
        next: () => {
          triggerSync();
        },
      }
    );

    return () => {
      if (channel) {
        channel.close();
      }
      window.removeEventListener('storage', handleStorage);
      unsubscribeWallet();
    };
  }, [queryClient, subscribe]);

  // 6. URL Mutators
  const handleSetPage = useCallback(
    (newPage: number) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (newPage <= 1) {
            next.delete('page');
          } else {
            next.set('page', String(newPage));
          }
          return next;
        },
        { replace: true }
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [setSearchParams]
  );

  const handleStatusChange = useCallback(
    (newStatus: MyBidsFilterStatus) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (newStatus === 'ALL') {
            next.delete('status');
          } else {
            next.set('status', newStatus);
          }
          next.delete('page');
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const handleSortChange = useCallback(
    (newSort: MyBidsSortOption) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (newSort === 'NEWEST') {
            next.delete('sort');
          } else {
            next.set('sort', newSort);
          }
          next.delete('page');
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const handleResetFilters = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('status');
        next.delete('sort');
        next.delete('page');
        return next;
      },
      { replace: true }
    );
  }, [setSearchParams]);

  return {
    statusFilter,
    sortOption,
    page,
    limit,
    bids: bidsPage?.items || [],
    total: bidsPage?.total || 0,
    totalPages: bidsPage?.totalPages || 1,
    hasNextPage: bidsPage?.hasNextPage || false,
    isLoading,
    isFetching,
    isLoadingStats,
    error: getLocalizedErrorMessage(error, t, 'bids'),
    stats,
    setStatus: handleStatusChange,
    setSort: handleSortChange,
    setPage: handleSetPage,
    resetFilters: handleResetFilters,
    refetch,
  };
};

export default useMyBids;
