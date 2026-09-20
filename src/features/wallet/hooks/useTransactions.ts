import { useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { walletService } from '../services/wallet.service';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import type {
  TransactionType,
  TransactionStatus,
  TransactionsFilterInput,
  TransactionsPageData,
} from '../types/wallet.types';

export interface UseTransactionsOptions {
  limit?: number;
}

export function useTransactions(options: UseTransactionsOptions = {}) {
  const { limit = 10 } = options;
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. Parse current URL state
  const rawPage = searchParams.get('page');
  const page = rawPage && !isNaN(parseInt(rawPage, 10)) ? Math.max(1, parseInt(rawPage, 10)) : 1;

  const type = (searchParams.get('type') as TransactionType) || undefined;
  const status = (searchParams.get('status') as TransactionStatus) || undefined;
  const startDateStr = searchParams.get('startDate') || undefined;
  const endDateStr = searchParams.get('endDate') || undefined;

  // 2. Format precise ISO Date boundaries for GraphQL DateTime Scalar
  const formattedStartDate = useMemo(() => {
    if (!startDateStr) return undefined;
    try {
      const d = new Date(startDateStr);
      if (isNaN(d.getTime())) return undefined;
      // Set to beginning of the day in ISO UTC
      return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)).toISOString();
    } catch {
      return undefined;
    }
  }, [startDateStr]);

  const formattedEndDate = useMemo(() => {
    if (!endDateStr) return undefined;
    try {
      const d = new Date(endDateStr);
      if (isNaN(d.getTime())) return undefined;
      // Set to end of the day in ISO UTC
      return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)).toISOString();
    } catch {
      return undefined;
    }
  }, [endDateStr]);

  // 3. Construct GraphQL filter input
  const filterInput = useMemo<TransactionsFilterInput>(() => {
    const filter: TransactionsFilterInput = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (formattedStartDate) filter.startDate = formattedStartDate;
    if (formattedEndDate) filter.endDate = formattedEndDate;
    return filter;
  }, [type, status, formattedStartDate, formattedEndDate]);

  const queryKey = useMemo(
    () => [
      ...QUERY_KEYS.WALLET.TRANSACTIONS,
      {
        page,
        limit,
        type: type || null,
        status: status || null,
        startDate: formattedStartDate || null,
        endDate: formattedEndDate || null,
      },
    ],
    [page, limit, type, status, formattedStartDate, formattedEndDate]
  );

  // 4. Query TanStack Query v5 with smooth pagination
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<TransactionsPageData>({
    queryKey,
    queryFn: () => walletService.getMyTransactions({ page, limit }, filterInput),
    placeholderData: keepPreviousData,
    staleTime: 15 * 1000,
  });

  // 5. URL searchParams Updaters
  const updateUrlParams = useCallback(
    (newParams: Record<string, string | null | undefined>, resetPage = false) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(newParams).forEach(([key, value]) => {
            if (value === null || value === undefined || value === '') {
              next.delete(key);
            } else {
              next.set(key, value);
            }
          });
          if (resetPage) {
            next.set('page', '1');
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const setPage = useCallback(
    (newPage: number) => {
      updateUrlParams({ page: String(Math.max(1, newPage)) });
    },
    [updateUrlParams]
  );

  const setType = useCallback(
    (newType?: TransactionType) => {
      updateUrlParams({ type: newType || null }, true);
    },
    [updateUrlParams]
  );

  const setStatus = useCallback(
    (newStatus?: TransactionStatus) => {
      updateUrlParams({ status: newStatus || null }, true);
    },
    [updateUrlParams]
  );

  const setDateRange = useCallback(
    (start?: string, end?: string) => {
      updateUrlParams({ startDate: start || null, endDate: end || null }, true);
    },
    [updateUrlParams]
  );

  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams({ page: '1' }), { replace: true });
  }, [setSearchParams]);

  const hasActiveFilters = Boolean(type || status || startDateStr || endDateStr);

  return {
    transactions: data?.items ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 0,
    hasNextPage: data?.hasNextPage ?? false,
    hasPreviousPage: page > 1,
    page,
    limit,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    // Active Filter Values
    type,
    status,
    startDateStr,
    endDateStr,
    hasActiveFilters,
    // Action Handlers
    setPage,
    setType,
    setStatus,
    setDateRange,
    resetFilters,
  };
}
