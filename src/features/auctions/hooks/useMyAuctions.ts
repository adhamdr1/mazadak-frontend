import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { auctionsService } from '../services/auctions.service';
import { getLocalizedErrorMessage } from '@/utils/errorHandler';
import type {
  AuctionCategory,
  AuctionStatus,
  AuctionsFilterInput,
  AuctionsSortField,
  SortOrder,
} from '../types/auctions.types';

export type MyAuctionsTab = 'created' | 'won';
export type FilterStatus = 'ALL' | AuctionStatus;

export const useMyAuctions = () => {
  const { t } = useTranslation('auctions');
  const [searchParams, setSearchParams] = useSearchParams();

  // URL-persisted state
  const activeTab = (searchParams.get('tab') as MyAuctionsTab) || 'created';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 12;

  // Local filter states
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<AuctionCategory | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Build filter input
  const filterInput = useMemo<AuctionsFilterInput>(() => {
    const filter: AuctionsFilterInput = {};

    if (statusFilter !== 'ALL') {
      filter.status = statusFilter;
    }

    if (categoryFilter) {
      filter.category = categoryFilter;
    }

    if (searchQuery.trim()) {
      filter.search = searchQuery.trim();
    }

    filter.sort = {
      field: 'CREATED_AT' as AuctionsSortField,
      order: 'DESC' as SortOrder,
    };

    return filter;
  }, [statusFilter, categoryFilter, searchQuery]);

  // Main data query for the active tab
  const {
    data: auctionsPage,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['my-auctions', activeTab, filterInput, page, limit],
    queryFn: async () => {
      if (activeTab === 'won') {
        return auctionsService.getMyWonAuctions({ page, limit }, filterInput);
      }
      return auctionsService.getMyAuctions({ page, limit }, filterInput);
    },
    staleTime: 30 * 1000, // 30s fresh cache
    refetchOnMount: true,
  });

  // Unified single-flight query for all 4 stats with 5-minute caching (1 network request)
  const { data: statsData } = useQuery({
    queryKey: ['my-auctions', 'stats'],
    queryFn: () => auctionsService.getMyAuctionsStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes fresh cache
    refetchOnWindowFocus: false,
  });

  const stats = useMemo(
    () => ({
      totalCreated: statsData?.totalCreated ?? 0,
      activeCreated: statsData?.activeCreated ?? 0,
      pendingCreated: statsData?.pendingCreated ?? 0,
      totalWon: statsData?.totalWon ?? 0,
    }),
    [statsData]
  );

  const handleTabChange = useCallback(
    (newTab: MyAuctionsTab) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('tab', newTab);
          next.set('page', '1');
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const handleSetPage = useCallback(
    (newPage: number) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('page', String(newPage));
          return next;
        },
        { replace: true }
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [setSearchParams]
  );

  const handleStatusChange = (newStatus: FilterStatus) => {
    setStatusFilter(newStatus);
    handleSetPage(1);
  };

  const handleCategoryChange = (newCategory: AuctionCategory | undefined) => {
    setCategoryFilter(newCategory);
    handleSetPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    handleSetPage(1);
  };

  const handleResetFilters = () => {
    setStatusFilter('ALL');
    setCategoryFilter(undefined);
    setSearchQuery('');
    handleSetPage(1);
  };

  return {
    activeTab,
    statusFilter,
    categoryFilter,
    searchQuery,
    page,
    limit,
    auctions: auctionsPage?.items || [],
    total: auctionsPage?.total || 0,
    totalPages: auctionsPage?.totalPages || 1,
    hasNextPage: auctionsPage?.hasNextPage || false,
    isLoading,
    isFetching,
    error: getLocalizedErrorMessage(error, t, 'auctions'),
    stats,
    setTab: handleTabChange,
    setStatus: handleStatusChange,
    setCategory: handleCategoryChange,
    setSearch: handleSearchChange,
    setPage: handleSetPage,
    resetFilters: handleResetFilters,
    refetch,
  };
};

export default useMyAuctions;
