import { useState, useCallback, useMemo } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { walletService } from '../services/wallet.service';
import type {
  WithdrawalsFilterInput,
  WithdrawalResponse,
  PaginationInput,
} from '../types/wallet.types';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';

export interface UseMyWithdrawalsOptions {
  initialPage?: number;
  initialLimit?: number;
  initialFilter?: WithdrawalsFilterInput;
}

export interface UseMyWithdrawalsReturn {
  withdrawals: WithdrawalResponse[];
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  page: number;
  limit: number;
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  filter: WithdrawalsFilterInput;
  setFilter: React.Dispatch<React.SetStateAction<WithdrawalsFilterInput>>;
  updateFilter: (updates: Partial<WithdrawalsFilterInput>) => void;
  resetFilter: () => void;
  hasActiveFilters: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useMyWithdrawals = (
  options: UseMyWithdrawalsOptions = {}
): UseMyWithdrawalsReturn => {
  const [page, setPage] = useState<number>(options.initialPage ?? 1);
  const [limit] = useState<number>(options.initialLimit ?? 10);
  const [filter, setFilter] = useState<WithdrawalsFilterInput>(() => ({
    sortOrder: 'DESC',
    ...options.initialFilter,
  }));

  const pagination: PaginationInput = useMemo(
    () => ({ page, limit }),
    [page, limit]
  );

  const cleanFilter: WithdrawalsFilterInput | undefined = useMemo(() => {
    const cleaned: WithdrawalsFilterInput = {};
    if (filter.status) cleaned.status = filter.status;
    if (filter.payoutMethod) cleaned.payoutMethod = filter.payoutMethod;
    if (filter.sortOrder) cleaned.sortOrder = filter.sortOrder;
    if (filter.startDate) cleaned.startDate = filter.startDate;
    if (filter.endDate) cleaned.endDate = filter.endDate;
    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  }, [filter]);

  const hasActiveFilters = useMemo(() => {
    return Boolean(
      filter.status ||
        filter.payoutMethod ||
        filter.startDate ||
        filter.endDate ||
        (filter.sortOrder && filter.sortOrder !== 'DESC')
    );
  }, [filter]);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.WALLET.MY_WITHDRAWALS(page, cleanFilter as Record<string, unknown>),
    queryFn: () => walletService.getMyWithdrawals(pagination, cleanFilter),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000,
  });

  const nextPage = useCallback(() => {
    if (data?.hasNextPage) {
      setPage((prev) => prev + 1);
    }
  }, [data?.hasNextPage]);

  const prevPage = useCallback(() => {
    setPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const updateFilter = useCallback((updates: Partial<WithdrawalsFilterInput>) => {
    setFilter((prev) => ({ ...prev, ...updates }));
    setPage(1); // Reset to page 1 on filter update
  }, []);

  const resetFilter = useCallback(() => {
    setFilter({ sortOrder: 'DESC' });
    setPage(1);
  }, []);

  return {
    withdrawals: data?.items ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 1,
    hasNextPage: data?.hasNextPage ?? false,
    page,
    limit,
    setPage,
    nextPage,
    prevPage,
    filter,
    setFilter,
    updateFilter,
    resetFilter,
    hasActiveFilters,
    isLoading,
    isFetching,
    isError,
    error: error as Error | null,
    refetch,
  };
};
