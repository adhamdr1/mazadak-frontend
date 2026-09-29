/**
 * useChatSubscriptions Hook
 * Listens to real-time GraphQL Subscriptions for Chat with strict WebSocket lifecycle & cache management
 */

import { useEffect, useState, useRef } from 'react';
import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import {
  chatService,
  ON_MESSAGE_SENT_SUBSCRIPTION,
  ON_MESSAGE_UPDATED_SUBSCRIPTION,
  ON_CHAT_READ_STATUS_UPDATED_SUBSCRIPTION,
} from '../services/chat.service';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import type {
  ChatMessagesConnectionData,
  ChatMessageData,
  ChatReadStateUpdatedPayload,
  ChatReadStateData,
} from '../types/chat.types';

export interface UseChatSubscriptionsOptions {
  auctionId: string;
  isOpen: boolean;
  onNewMessage?: (msg: ChatMessageData) => void;
}

export function useChatSubscriptions({
  auctionId,
  isOpen,
  onNewMessage,
}: UseChatSubscriptionsOptions) {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const { subscribe } = useSocket();
  const [participantReadStates, setParticipantReadStates] = useState<
    Record<string, string | null>
  >({});

  const onNewMessageRef = useRef(onNewMessage);
  onNewMessageRef.current = onNewMessage;

  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;

  const currentUserRef = useRef(currentUser);
  currentUserRef.current = currentUser;

  useEffect(() => {
    if (!auctionId) return;

    // 1. Subscribe to Message Sent (Real-time incoming messages)
    const unsubscribeSent = subscribe<{ messageSent: ChatMessageData }>(
      {
        query: ON_MESSAGE_SENT_SUBSCRIPTION,
        variables: { auctionId },
      },
      {
        next: (data) => {
          const newMsg = data?.messageSent;
          if (!newMsg) return;

          // Update TanStack Query cache in 0ms
          queryClient.setQueryData<InfiniteData<ChatMessagesConnectionData>>(
            QUERY_KEYS.CHAT.MESSAGES(auctionId),
            (old) => {
              // If no cache exists yet, initialize it with the incoming message
              if (!old || !old.pages || old.pages.length === 0) {
                return {
                  pages: [
                    {
                      items: [newMsg],
                      hasNextPage: false,
                      endCursor: null,
                    },
                  ],
                  pageParams: [undefined],
                };
              }

              // Check if already in cache (by _id or clientMessageId)
              const alreadyExists = old.pages.some((page) =>
                page.items.some(
                  (m) =>
                    m._id === newMsg._id ||
                    (m.clientMessageId &&
                      newMsg.clientMessageId &&
                      m.clientMessageId === newMsg.clientMessageId)
                )
              );

              if (alreadyExists) {
                return {
                  ...old,
                  pages: old.pages.map((page) => ({
                    ...page,
                    items: page.items.map((m) =>
                      m._id === newMsg._id ||
                      (m.clientMessageId &&
                        newMsg.clientMessageId &&
                        m.clientMessageId === newMsg.clientMessageId)
                        ? newMsg
                        : m
                    ),
                  })),
                };
              }

              // Append new message to page 0 (latest messages)
              return {
                ...old,
                pages: old.pages.map((page, index) =>
                  index === 0
                    ? {
                        ...page,
                        items: [...page.items, newMsg],
                      }
                    : page
                ),
              };
            }
          );

          // Invalidate inbox rooms cache so unreadCount and snippet update
          queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.CHAT.MY_ROOMS(),
          });

          // Auto-mark as read if Drawer is open & message came from another participant
          if (
            isOpenRef.current &&
            currentUserRef.current &&
            newMsg.senderId !== currentUserRef.current._id
          ) {
            chatService.markChatAsRead(auctionId, newMsg._id).catch(() => {});
          }

          // Trigger smooth scroll callback
          onNewMessageRef.current?.(newMsg);
        },
        error: (err) => {
          console.warn('[Chat Subscription] messageSent error:', err);
        },
      }
    );

    // 2. Subscribe to Message Updated (Edit, Soft-Delete, Reactions)
    const unsubscribeUpdated = subscribe<{ messageUpdated: ChatMessageData }>(
      {
        query: ON_MESSAGE_UPDATED_SUBSCRIPTION,
        variables: { auctionId },
      },
      {
        next: (data) => {
          const updatedMsg = data?.messageUpdated;
          if (!updatedMsg) return;

          queryClient.setQueryData<InfiniteData<ChatMessagesConnectionData>>(
            QUERY_KEYS.CHAT.MESSAGES(auctionId),
            (old) => {
              if (!old) return old;
              return {
                ...old,
                pages: old.pages.map((page) => ({
                  ...page,
                  items: page.items.map((m) =>
                    m._id === updatedMsg._id
                      ? {
                          ...m,
                          ...updatedMsg,
                          reactions: updatedMsg.reactions || m.reactions,
                        }
                      : m
                  ),
                })),
              };
            }
          );
        },
        error: (err) => {
          console.warn('[Chat Subscription] messageUpdated error:', err);
        },
      }
    );

    // 3. Subscribe to Read Status Updates (Real-time Blue Double Checkmarks)
    const unsubscribeRead = subscribe<{
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

          setParticipantReadStates((prev) => ({
            ...prev,
            [payload.userId]: payload.lastReadMessageId,
          }));

          // Type-safe cache update for read state (preserves existing _id)
          queryClient.setQueryData<ChatReadStateData | null | undefined>(
            QUERY_KEYS.CHAT.READ_STATE(auctionId),
            (old) => {
              if (!old) return old;
              return {
                ...old,
                auctionId: payload.auctionId,
                userId: payload.userId,
                lastReadMessageId: payload.lastReadMessageId,
                lastReadAt: payload.lastReadAt,
              };
            }
          );
        },
        error: (err) => {
          console.warn('[Chat Subscription] chatReadStatusUpdated error:', err);
        },
      }
    );

    // Strict cleanup on unmount or auctionId change
    return () => {
      unsubscribeSent();
      unsubscribeUpdated();
      unsubscribeRead();
    };
  }, [auctionId, subscribe, queryClient]);

  return {
    participantReadStates,
  };
}
