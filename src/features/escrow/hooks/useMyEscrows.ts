import { useState, useCallback, useMemo } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { escrowService } from '../services/escrow.service';
import type {
  EscrowStatus,
  EscrowFilterInput,
  EscrowData,
  PaginationInput,
} from '../types/escrow.types';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';

export type EscrowStatusFilter = EscrowStatus | 'ALL';

export interface UseMyEscrowsOptions {
  initialPage?: number;
  initialLimit?: number;
  initialStatus?: EscrowStatusFilter;
}

export interface UseMyEscrowsReturn {
  escrows: EscrowData[];
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  page: number;
  limit: number;
  statusFilter: EscrowStatusFilter;
  setPage: (page: number) => void;
  setStatusFilter: (status: EscrowStatusFilter) => void;
  nextPage: () => void;
  prevPage: () => void;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useMyEscrows = (
  options: UseMyEscrowsOptions = {}
): UseMyEscrowsReturn => {
  const [page, setPage] = useState<number>(options.initialPage ?? 1);
  const [limit] = useState<number>(options.initialLimit ?? 10);
  const [statusFilter, setStatusFilterState] = useState<EscrowStatusFilter>(
    options.initialStatus ?? 'ALL'
  );

  const pagination: PaginationInput = useMemo(
    () => ({ page, limit }),
    [page, limit]
  );

  const filter: EscrowFilterInput | undefined = useMemo(() => {
    if (statusFilter === 'ALL') return undefined;
    return { status: statusFilter };
  }, [statusFilter]);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [...QUERY_KEYS.ESCROW.MY_ESCROWS, page, statusFilter],
    queryFn: () => escrowService.getMyEscrows(pagination, filter),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const setStatusFilter = useCallback((status: EscrowStatusFilter) => {
    setStatusFilterState(status);
    setPage(1);
  }, []);

  const nextPage = useCallback(() => {
    if (data?.hasNextPage) {
      setPage((prev) => prev + 1);
    }
  }, [data?.hasNextPage]);

  const prevPage = useCallback(() => {
    setPage((prev) => Math.max(prev - 1, 1));
  }, []);

  return {
    escrows: data?.items ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 1,
    hasNextPage: data?.hasNextPage ?? false,
    page,
    limit,
    statusFilter,
    setPage,
    setStatusFilter,
    nextPage,
    prevPage,
    isLoading,
    isFetching,
    isError,
    error: error as Error | null,
    refetch,
  };
};
