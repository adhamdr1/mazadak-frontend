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
  ChatRoomsPageData,
} from '../types/chat.types';

export interface UseChatSubscriptionsOptions {
  auctionId: string;
  isOpen: boolean;
  onNewMessage?: (msg: ChatMessageData) => void;
}

export const getStoredOtherReadHorizon = (auctionId: string): number => {
  try {
    const raw = localStorage.getItem(`mazadak_chat_other_read_${auctionId}`);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    if (parsed?.lastReadAt) {
      const t = new Date(parsed.lastReadAt).getTime();
      return isNaN(t) ? 0 : t;
    }
    return 0;
  } catch {
    return 0;
  }
};

const getStoredReadStates = (
  auctionId: string
): Record<string, { lastReadMessageId: string | null; lastReadAt: string | null }> => {
  try {
    const raw = localStorage.getItem(`mazadak_chat_read_states_${auctionId}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export function useChatSubscriptions({
  auctionId,
  isOpen,
  onNewMessage,
}: UseChatSubscriptionsOptions) {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const { subscribe } = useSocket();
  const [participantReadStates, setParticipantReadStates] = useState<
    Record<string, { lastReadMessageId: string | null; lastReadAt: string | null }>
  >(() => getStoredReadStates(auctionId));

  const lastAutoMarkedReadIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (auctionId) {
      setParticipantReadStates(getStoredReadStates(auctionId));
    }
  }, [auctionId]);

  const onNewMessageRef = useRef(onNewMessage);
  onNewMessageRef.current = onNewMessage;

  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;

  const currentUserRef = useRef(currentUser);
  currentUserRef.current = currentUser;

  useEffect(() => {
    // GATE: Strictly only subscribe when auctionId exists AND the drawer is actually open!
    if (!auctionId || !isOpen) return;

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
              // If no cache exists yet (drawer cold open), seed with newMsg so it is NEVER dropped
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

          // Optimistically update rooms cache for this auction in 0ms (no storm of HTTP refetches)
          queryClient.setQueriesData<ChatRoomsPageData>(
            { queryKey: ['chat', 'rooms'] },
            (old) => {
              if (!old) return old;
              return {
                ...old,
                items: old.items.map((room) =>
                  room.auctionId === auctionId
                    ? {
                        ...room,
                        lastMessage: newMsg,
                        lastMessageAt: newMsg.createdAt,
                        unreadCount:
                          isOpenRef.current ||
                          (currentUserRef.current &&
                            newMsg.senderId === currentUserRef.current._id)
                            ? 0
                            : (room.unreadCount || 0) + 1,
                      }
                    : room
                ),
              };
            }
          );

          // Auto-mark as read if Drawer is open & message came from another participant
          if (
            isOpenRef.current &&
            currentUserRef.current &&
            newMsg.senderId !== currentUserRef.current._id &&
            newMsg._id &&
            newMsg._id !== lastAutoMarkedReadIdRef.current
          ) {
            lastAutoMarkedReadIdRef.current = newMsg._id;
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

          // If the read receipt is from another participant, persist their horizon
          if (currentUserRef.current && payload.userId !== currentUserRef.current._id) {
            try {
              localStorage.setItem(
                `mazadak_chat_other_read_${auctionId}`,
                JSON.stringify({
                  lastReadMessageId: payload.lastReadMessageId,
                  lastReadAt: payload.lastReadAt,
                })
              );
            } catch {
              // Ignore quota
            }
          }

          setParticipantReadStates((prev) => {
            const updated = {
              ...prev,
              [payload.userId]: {
                lastReadMessageId: payload.lastReadMessageId,
                lastReadAt: payload.lastReadAt,
              },
            };
            try {
              localStorage.setItem(
                `mazadak_chat_read_states_${auctionId}`,
                JSON.stringify(updated)
              );
            } catch {
              // Ignore quota
            }
            return updated;
          });

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

          // Real-time cache update for all participants' read states
          queryClient.setQueryData<ChatReadStateData[]>(
            QUERY_KEYS.CHAT.READ_STATES(auctionId),
            (old = []) => {
              const exists = old.some((s) => s.userId === payload.userId);
              if (exists) {
                return old.map((s) =>
                  s.userId === payload.userId
                    ? {
                        ...s,
                        lastReadMessageId: payload.lastReadMessageId,
                        lastReadAt: payload.lastReadAt,
                      }
                    : s
                );
              }
              return [
                ...old,
                {
                  _id: payload.userId,
                  auctionId: payload.auctionId,
                  userId: payload.userId,
                  lastReadMessageId: payload.lastReadMessageId,
                  lastReadAt: payload.lastReadAt,
                },
              ];
            }
          );
        },
        error: (err) => {
          console.warn('[Chat Subscription] chatReadStatusUpdated error:', err);
        },
      }
    );

    // Strict cleanup on unmount, auctionId change, or drawer close
    return () => {
      unsubscribeSent();
      unsubscribeUpdated();
      unsubscribeRead();
    };
  }, [auctionId, isOpen, subscribe, queryClient]);

  return {
    participantReadStates,
  };
}
