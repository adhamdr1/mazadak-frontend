import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { auctionsService } from '../services/auctions.service';
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

  // Background queries for stats indicators with 30s caching
  const { data: allCreatedData } = useQuery({
    queryKey: ['my-auctions', 'stats', 'created'],
    queryFn: async () => auctionsService.getMyAuctions({ page: 1, limit: 1 }),
    staleTime: 30 * 1000,
  });

  const { data: activeCreatedData } = useQuery({
    queryKey: ['my-auctions', 'stats', 'active'],
    queryFn: async () =>
      auctionsService.getMyAuctions(
        { page: 1, limit: 1 },
        { status: 'ACTIVE' as AuctionStatus }
      ),
    staleTime: 30 * 1000,
  });

  const { data: pendingCreatedData } = useQuery({
    queryKey: ['my-auctions', 'stats', 'pending'],
    queryFn: async () =>
      auctionsService.getMyAuctions(
        { page: 1, limit: 1 },
        { status: 'PENDING' as AuctionStatus }
      ),
    staleTime: 30 * 1000,
  });

  const { data: allWonData } = useQuery({
    queryKey: ['my-auctions', 'stats', 'won'],
    queryFn: async () => auctionsService.getMyWonAuctions({ page: 1, limit: 1 }),
    staleTime: 30 * 1000,
  });

  const stats = useMemo(
    () => ({
      totalCreated: allCreatedData?.total ?? 0,
      activeCreated: activeCreatedData?.total ?? 0,
      pendingCreated: pendingCreatedData?.total ?? 0,
      totalWon: allWonData?.total ?? 0,
    }),
    [allCreatedData, activeCreatedData, pendingCreatedData, allWonData]
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
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
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
    error: error ? (error as Error).message : null,
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
