/**
 * useMyRooms Hook
 * Fetches all chat rooms for the authenticated user using zero-N+1 GraphQL query
 */

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { chatService } from '../services/chat.service';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import type {
  ChatRoomData,
} from '../types/chat.types';

export interface UseMyRoomsOptions {
  initialPage?: number;
  limit?: number;
}

export function useMyRooms(options: UseMyRoomsOptions = {}) {
  const { initialPage = 1, limit = 15 } = options;
  const [page, setPage] = useState(initialPage);

  const query = useQuery({
    queryKey: QUERY_KEYS.CHAT.MY_ROOMS(page),
    queryFn: () => chatService.getMyChatRooms(page, limit),
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });

  const rooms: ChatRoomData[] = useMemo(() => query.data?.items ?? [], [query.data?.items]);
  const total = query.data?.total ?? 0;
  const totalPages = query.data?.totalPages ?? 0;
  const hasNextPage = query.data?.hasNextPage ?? false;

  return {
    rooms,
    total,
    totalPages,
    hasNextPage,
    page,
    setPage,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
  };
}

