/**
 * useUnreadChatRoomsCount Hook
 * Globally computes the number of distinct chat rooms that have unread messages
 * Powered by real-time GraphQL Subscription `myChatRoomUpdated` (0ms instantaneous updates)
 * with TanStack Query background caching
 */

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { chatService, ON_MY_CHAT_ROOM_UPDATED_SUBSCRIPTION } from '../services/chat.service';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import type {
  ChatRoomData,
  ChatRoomsPageData,
  ChatRoomUpdatedPayload,
  ChatMessagesConnectionData,
} from '../types/chat.types';

export function useUnreadChatRoomsCount() {
  const { user: currentUser, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { subscribe } = useSocket();
  const [liveTotalUnread, setLiveTotalUnread] = useState<number | null>(null);

  // 1. Initial / Background query for rooms
  const query = useQuery({
    queryKey: QUERY_KEYS.CHAT.MY_ROOMS(1),
    queryFn: () => chatService.getMyChatRooms(1, 30),
    enabled: !!isAuthenticated && !!currentUser,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });

  const rooms: ChatRoomData[] = useMemo(
    () => query.data?.items ?? [],
    [query.data?.items]
  );

  // 2. Computed unread rooms count from query cache
  const computedCount = useMemo(() => {
    return rooms.filter((room) => (room.unreadCount || 0) > 0).length;
  }, [rooms]);

  // 3. Global Single WebSocket Subscription to myChatRoomUpdated (0ms real-time!)
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;

    const unsubscribe = subscribe<{ myChatRoomUpdated: ChatRoomUpdatedPayload }>(
      {
        query: ON_MY_CHAT_ROOM_UPDATED_SUBSCRIPTION,
      },
      {
        next: (data) => {
          const payload = data?.myChatRoomUpdated;
          if (!payload) return;

          // 1. Update live badge count immediately in 0ms!
          setLiveTotalUnread(payload.totalUnreadRooms);

          // 2. Update TanStack Query cache for all rooms pages in 0ms!
          queryClient.setQueriesData<ChatRoomsPageData>(
            { queryKey: ['chat', 'rooms'] },
            (old) => {
              if (!old) return old;
              const roomIndex = old.items.findIndex(
                (r) => r.auctionId === payload.auctionId
              );

              if (roomIndex === -1) {
                // If room wasn't in current list, invalidate to bring it in
                queryClient.invalidateQueries({
                  queryKey: ['chat', 'rooms'],
                });
                return old;
              }

              const targetRoom = old.items[roomIndex];
              const updatedRoom: ChatRoomData = {
                ...targetRoom,
                lastMessage: payload.lastMessage,
                lastMessageAt: payload.lastMessageAt,
                unreadCount: payload.unreadCount,
              };

              // Reorder: Move updated room to top of the inbox!
              const remainingRooms = old.items.filter(
                (_, idx) => idx !== roomIndex
              );

              return {
                ...old,
                items: [updatedRoom, ...remainingRooms],
              };
            }
          );

          // 3. Instantly seed/update messages cache for this auction in 0ms!
          if (payload.lastMessage) {
            queryClient.setQueryData<InfiniteData<ChatMessagesConnectionData>>(
              QUERY_KEYS.CHAT.MESSAGES(payload.auctionId),
              (old) => {
                if (!old || !old.pages || old.pages.length === 0) return old;

                const alreadyExists = old.pages.some((page) =>
                  page.items.some(
                    (m) =>
                      m._id === payload.lastMessage._id ||
                      (m.clientMessageId &&
                        payload.lastMessage.clientMessageId &&
                        m.clientMessageId === payload.lastMessage.clientMessageId)
                  )
                );

                if (alreadyExists) return old;

                return {
                  ...old,
                  pages: old.pages.map((page, index) =>
                    index === 0
                      ? {
                          ...page,
                          items: [...page.items, payload.lastMessage],
                        }
                      : page
                  ),
                };
              }
            );
          }
        },
        error: (err) => {
          console.warn('[Navbar / Inbox Subscription] myChatRoomUpdated error:', err);
        },
      }
    );

    return () => {
      unsubscribe();
    };
  }, [isAuthenticated, currentUser, subscribe, queryClient]);

  const unreadRoomsCount = liveTotalUnread !== null ? liveTotalUnread : computedCount;

  return {
    unreadRoomsCount,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
