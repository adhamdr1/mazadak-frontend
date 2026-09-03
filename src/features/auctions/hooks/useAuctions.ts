import { useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { auctionsService } from '../services/auctions.service';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { getLocalizedErrorMessage } from '@/utils/errorHandler';
import type {
  AuctionCategory,
  AuctionStatus,
  AuctionsSortField,
  SortOrder,
  AuctionsFilterInput,
} from '../types/auctions.types';

const VALID_SORT_FIELDS = new Set<AuctionsSortField>([
  'CREATED_AT',
  'START_TIME',
  'END_TIME',
  'CURRENT_PRICE',
  'TITLE',
]);

const VALID_ORDERS = new Set<SortOrder>(['ASC', 'DESC']);

export function useAuctions(initialLimit = 12) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation('auctions');

  // Extract parameters from URL
  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('q') || '';
  const category = (searchParams.get('category') as AuctionCategory) || undefined;
  const status = (searchParams.get('status') as AuctionStatus) || undefined;
  const sortParam = searchParams.get('sort') || 'CREATED_AT_DESC';

  // Parse sort field and direction with validation
  const [sortField, sortOrder] = useMemo((): [AuctionsSortField, SortOrder] => {
    const lastUnderscore = sortParam.lastIndexOf('_');
    if (lastUnderscore !== -1) {
      const field = sortParam.substring(0, lastUnderscore);
      const order = sortParam.substring(lastUnderscore + 1);
      if (
        VALID_SORT_FIELDS.has(field as AuctionsSortField) &&
        VALID_ORDERS.has(order as SortOrder)
      ) {
        return [field as AuctionsSortField, order as SortOrder];
      }
    }
    return ['CREATED_AT', 'DESC'];
  }, [sortParam]);

  // Construct GraphQL filter payload
  const filter = useMemo<AuctionsFilterInput>(() => {
    const payload: AuctionsFilterInput = {
      sort: { field: sortField, order: sortOrder },
    };
    if (search.trim()) payload.search = search.trim();
    if (category) payload.category = category;
    if (status) payload.status = status;
    return payload;
  }, [search, category, status, sortField, sortOrder]);

  // Query server with TanStack Query
  const query = useQuery({
    queryKey: [...QUERY_KEYS.AUCTIONS.ALL, { page, limit: initialLimit, ...filter }],
    queryFn: () =>
      auctionsService.getAll({ page, limit: initialLimit }, filter),
    staleTime: 1000 * 30, // 30 seconds fresh cache
  });

  // Filter & Navigation Actions
  const updateParams = useCallback(
    (updates: Record<string, string | null | undefined>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(updates).forEach(([key, val]) => {
            if (val === null || val === undefined || val === '') {
              next.delete(key);
            } else {
              next.set(key, val);
            }
          });
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const setSearch = useCallback(
    (q: string) => {
      updateParams({ q: q.trim() || null, page: '1' });
    },
    [updateParams]
  );

  const setCategory = useCallback(
    (cat?: AuctionCategory) => {
      updateParams({ category: cat || null, page: '1' });
    },
    [updateParams]
  );

  const setStatus = useCallback(
    (st?: AuctionStatus) => {
      updateParams({ status: st || null, page: '1' });
    },
    [updateParams]
  );

  const setSort = useCallback(
    (sortKey: string) => {
      updateParams({ sort: sortKey, page: '1' });
    },
    [updateParams]
  );

  const setPage = useCallback(
    (newPage: number) => {
      updateParams({ page: newPage.toString() });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [updateParams]
  );

  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  const hasActiveFilters = Boolean(search || category || status || sortParam !== 'CREATED_AT_DESC');

  const localizedError = getLocalizedErrorMessage(query.error, t, 'auctions');

  return {
    auctions: query.data?.items || [],
    total: query.data?.total || 0,
    totalPages: query.data?.totalPages || 1,
    page,
    hasNextPage: query.data?.hasNextPage || false,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: localizedError,
    filters: {
      search,
      category,
      status,
      sort: sortParam,
      hasActiveFilters,
    },
    actions: {
      setSearch,
      setCategory,
      setStatus,
      setSort,
      setPage,
      resetFilters,
      refetch: query.refetch,
    },
  };
}
