/**
 * useChatMessages Hook
 * Cursor / Keyset Pagination for Chat Messages using TanStack Query v5 useInfiniteQuery
 */

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { chatService } from '../services/chat.service';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import type { ChatMessageData } from '../types/chat.types';

export interface UseChatMessagesOptions {
  auctionId: string;
  limit?: number;
  enabled?: boolean;
}

export function useChatMessages({
  auctionId,
  limit = 20,
  enabled = true,
}: UseChatMessagesOptions) {
  // 1. Cursor Paginated Messages Query
  const messagesQuery = useInfiniteQuery({
    queryKey: QUERY_KEYS.CHAT.MESSAGES(auctionId),
    queryFn: ({ pageParam }) =>
      chatService.getChatMessages(auctionId, limit, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage && lastPage.endCursor ? lastPage.endCursor : undefined;
    },
    enabled: !!auctionId && enabled,
    staleTime: 60_000, // 1 minute
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Always ensure fresh messages when opening drawer
  });

  // 2. Chat Read State Query
  const readStateQuery = useQuery({
    queryKey: QUERY_KEYS.CHAT.READ_STATE(auctionId),
    queryFn: () => chatService.getChatReadState(auctionId),
    enabled: !!auctionId && enabled,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  const pages = messagesQuery.data?.pages || [];
  const flatMessages: ChatMessageData[] = [];

  for (let i = pages.length - 1; i >= 0; i--) {
    const page = pages[i];
    if (page?.items) {
      flatMessages.push(...page.items);
    }
  }

  return {
    messages: flatMessages,
    rawPages: pages,
    hasOlderMessages: !!messagesQuery.hasNextPage,
    isFetchingOlderMessages: messagesQuery.isFetchingNextPage,
    fetchOlderMessages: messagesQuery.fetchNextPage,
    isLoading: messagesQuery.isLoading,
    isError: messagesQuery.isError,
    error: messagesQuery.error,
    refetchMessages: messagesQuery.refetch,
    readState: readStateQuery.data ?? null,
    isLoadingReadState: readStateQuery.isLoading,
    refetchReadState: readStateQuery.refetch,
  };
}
