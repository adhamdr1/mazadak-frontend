import { useState, useMemo } from 'react';
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
  const [activeTab, setActiveTab] = useState<MyAuctionsTab>('created');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<AuctionCategory | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const limit = 12;

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
    staleTime: 0,
    refetchOnMount: 'always',
  });

  // Background queries for quick stats indicators
  const { data: allCreatedData } = useQuery({
    queryKey: ['my-auctions', 'stats', 'created'],
    queryFn: async () => auctionsService.getMyAuctions({ page: 1, limit: 1 }),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const { data: activeCreatedData } = useQuery({
    queryKey: ['my-auctions', 'stats', 'active'],
    queryFn: async () =>
      auctionsService.getMyAuctions(
        { page: 1, limit: 1 },
        { status: 'ACTIVE' as AuctionStatus }
      ),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const { data: pendingCreatedData } = useQuery({
    queryKey: ['my-auctions', 'stats', 'pending'],
    queryFn: async () =>
      auctionsService.getMyAuctions(
        { page: 1, limit: 1 },
        { status: 'PENDING' as AuctionStatus }
      ),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const { data: allWonData } = useQuery({
    queryKey: ['my-auctions', 'stats', 'won'],
    queryFn: async () => auctionsService.getMyWonAuctions({ page: 1, limit: 1 }),
    staleTime: 0,
    refetchOnMount: 'always',
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

  const handleTabChange = (newTab: MyAuctionsTab) => {
    setActiveTab(newTab);
    setPage(1);
  };

  const handleStatusChange = (newStatus: FilterStatus) => {
    setStatusFilter(newStatus);
    setPage(1);
  };

  const handleCategoryChange = (newCategory: AuctionCategory | undefined) => {
    setCategoryFilter(newCategory);
    setPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleResetFilters = () => {
    setStatusFilter('ALL');
    setCategoryFilter(undefined);
    setSearchQuery('');
    setPage(1);
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
    setPage,
    resetFilters: handleResetFilters,
    refetch,
  };
};

export default useMyAuctions;
