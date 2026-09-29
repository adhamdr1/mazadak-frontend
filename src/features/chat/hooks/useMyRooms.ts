/**
 * useMyRooms Hook
 * Fetches all chat rooms for the authenticated user using zero-N+1 GraphQL query
 */

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  chatService,
  ON_MESSAGE_SENT_SUBSCRIPTION,
  ON_CHAT_READ_STATUS_UPDATED_SUBSCRIPTION,
} from '../services/chat.service';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import type {
  ChatRoomData,
  ChatRoomsPageData,
  ChatMessageData,
  ChatReadStateUpdatedPayload,
} from '../types/chat.types';

export interface UseMyRoomsOptions {
  initialPage?: number;
  limit?: number;
}

export function useMyRooms(options: UseMyRoomsOptions = {}) {
  const { initialPage = 1, limit = 15 } = options;
  const [page, setPage] = useState(initialPage);
  const queryClient = useQueryClient();
  const { subscribe } = useSocket();
  const { user: currentUser } = useAuth();

  const query = useQuery({
    queryKey: QUERY_KEYS.CHAT.MY_ROOMS(page),
    queryFn: () => chatService.getMyChatRooms(page, limit),
    staleTime: 15_000,
    refetchOnWindowFocus: true,
    refetchInterval: 15_000,
  });

  const rooms: ChatRoomData[] = useMemo(() => query.data?.items ?? [], [query.data?.items]);
  const total = query.data?.total ?? 0;
  const totalPages = query.data?.totalPages ?? 0;
  const hasNextPage = query.data?.hasNextPage ?? false;

  // Extract room auction IDs for WebSocket subscriptions
  const roomAuctionIds = useMemo(
    () => rooms.map((r) => r.auctionId).filter(Boolean),
    [rooms]
  );

  // Real-time WebSocket subscriptions for all active rooms in inbox
  useEffect(() => {
    if (roomAuctionIds.length === 0) return;

    const unsubscribers: Array<() => void> = [];

    roomAuctionIds.forEach((auctionId) => {
      // 1. Live Message Sent Subscription
      const unsubSent = subscribe<{ messageSent: ChatMessageData }>(
        {
          query: ON_MESSAGE_SENT_SUBSCRIPTION,
          variables: { auctionId },
        },
        {
          next: (data) => {
            const newMsg = data?.messageSent;
            if (!newMsg) return;

            queryClient.setQueryData<ChatRoomsPageData>(
              QUERY_KEYS.CHAT.MY_ROOMS(page),
              (old) => {
                if (!old) return old;
                const roomIndex = old.items.findIndex(
                  (r) => r.auctionId === newMsg.auctionId
                );

                if (roomIndex === -1) {
                  // If room is not on current page, invalidate to pull new structure
                  queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.CHAT.MY_ROOMS(),
                  });
                  return old;
                }

                const targetRoom = old.items[roomIndex];
                const isFromOther =
                  currentUser && newMsg.senderId !== currentUser._id;

                const updatedRoom: ChatRoomData = {
                  ...targetRoom,
                  lastMessage: newMsg,
                  lastMessageAt: newMsg.createdAt,
                  unreadCount: isFromOther
                    ? (targetRoom.unreadCount || 0) + 1
                    : targetRoom.unreadCount,
                };

                // Move updated room to top of the inbox
                const remainingRooms = old.items.filter(
                  (_, idx) => idx !== roomIndex
                );

                return {
                  ...old,
                  items: [updatedRoom, ...remainingRooms],
                };
              }
            );
          },
          error: (err) => {
            console.warn(`[Inbox Subscription] messageSent error for ${auctionId}:`, err);
          },
        }
      );
      unsubscribers.push(unsubSent);

      // 2. Live Read Status Subscription
      const unsubRead = subscribe<{
        chatReadStatusUpdated: ChatReadStateUpdatedPayload;
      }>(
        {
          query: ON_CHAT_READ_STATUS_UPDATED_SUBSCRIPTION,
          variables: { auctionId },
        },
        {
          next: (data) => {
            const payload = data?.chatReadStatusUpdated;
            if (!payload) return;

            // If current user marked room as read, clear unread count in inbox list
            if (currentUser && payload.userId === currentUser._id) {
              queryClient.setQueryData<ChatRoomsPageData>(
                QUERY_KEYS.CHAT.MY_ROOMS(page),
                (old) => {
                  if (!old) return old;
                  return {
                    ...old,
                    items: old.items.map((room) =>
                      room.auctionId === payload.auctionId
                        ? { ...room, unreadCount: 0 }
                        : room
                    ),
                  };
                }
              );
            }
          },
          error: (err) => {
            console.warn(`[Inbox Subscription] readStatus error for ${auctionId}:`, err);
          },
        }
      );
      unsubscribers.push(unsubRead);
    });

    // Cleanup all subscriptions on page change or unmount
    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [roomAuctionIds, subscribe, queryClient, page, currentUser]);

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

