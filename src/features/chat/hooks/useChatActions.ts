/**
 * useChatActions Hook
 * Encapsulates chat mutations with instant 0ms Optimistic Updates (WhatsApp pattern)
 * Zero HTTP cache invalidations — TanStack Query cache is kept fresh by Optimistic UI + WebSocket subscriptions
 */

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { chatService } from '../services/chat.service';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { useAuth } from '@/hooks/useAuth';
import type {
  ChatMessagesConnectionData,
  ChatMessageType,
  PendingMessage,
  ChatRoomsPageData,
} from '../types/chat.types';

export interface UseChatActionsOptions {
  auctionId: string;
}

export function useChatActions({ auctionId }: UseChatActionsOptions) {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [pendingMessages, setPendingMessages] = useState<PendingMessage[]>([]);

  // ----------------------------------------------------
  // 1. Send Message Mutation & Optimistic Handler
  // ----------------------------------------------------
  const sendMessageMutation = useMutation({
    mutationFn: chatService.sendMessage,
    onSuccess: (sentMessage) => {
      // Remove from pending messages
      setPendingMessages((prev) =>
        prev.filter((m) => m.clientMessageId !== sentMessage.clientMessageId)
      );

      // Instantly insert or replace in TanStack Infinite Query Cache
      queryClient.setQueryData<InfiniteData<ChatMessagesConnectionData>>(
        QUERY_KEYS.CHAT.MESSAGES(auctionId),
        (old) => {
          if (!old || old.pages.length === 0) return old;

          const firstPage = old.pages[0];
          const exists = firstPage.items.some(
            (m) =>
              m._id === sentMessage._id ||
              m.clientMessageId === sentMessage.clientMessageId
          );

          if (exists) {
            return {
              ...old,
              pages: old.pages.map((page, index) =>
                index === 0
                  ? {
                      ...page,
                      items: page.items.map((m) =>
                        m.clientMessageId === sentMessage.clientMessageId
                          ? sentMessage
                          : m
                      ),
                    }
                  : page
              ),
            };
          }

          return {
            ...old,
            pages: old.pages.map((page, index) =>
              index === 0
                ? {
                    ...page,
                    items: [...page.items, sentMessage],
                  }
                : page
            ),
          };
        }
      );
    },
    onError: (err, variables) => {
      // Mark pending message with error status so user can tap to retry (WhatsApp style)
      setPendingMessages((prev) =>
        prev.map((m) =>
          m.clientMessageId === variables.clientMessageId
            ? {
                ...m,
                _status: 'error',
                errorMessage: err instanceof Error ? err.message : 'sendFailed',
              }
            : m
        )
      );
    },
  });

  const sendMessage = useCallback(
    (
      content?: string | null,
      type: ChatMessageType = 'TEXT',
      mediaUrls?: string[] | null
    ) => {
      if (!currentUser) return;
      if (!content && (!mediaUrls || mediaUrls.length === 0)) return;

      const clientMessageId = crypto.randomUUID();
      const newPendingMessage: PendingMessage = {
        _id: `pending-${clientMessageId}`,
        clientMessageId,
        auctionId,
        senderId: currentUser._id,
        senderName: `${currentUser.firstName} ${currentUser.lastName}`.trim() || 'User',
        type,
        content: content || null,
        mediaUrls: mediaUrls || null,
        reactions: [],
        isEdited: false,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        _status: 'sending',
        _localId: clientMessageId,
      };

      // 1. Add to pending state immediately for 0ms UI feedback
      setPendingMessages((prev) => [...prev, newPendingMessage]);

      // 2. Fire mutation in background (non-blocking)
      sendMessageMutation.mutate({
        auctionId,
        content: content || null,
        type,
        mediaUrls: mediaUrls || null,
        clientMessageId,
      });
    },
    [auctionId, currentUser, sendMessageMutation]
  );

  const retrySendMessage = useCallback(
    (pendingMsg: PendingMessage) => {
      // Set back to sending state
      setPendingMessages((prev) =>
        prev.map((m) =>
          m._localId === pendingMsg._localId
            ? { ...m, _status: 'sending', errorMessage: undefined }
            : m
        )
      );

      // Retry mutation
      sendMessageMutation.mutate({
        auctionId,
        content: pendingMsg.content,
        type: pendingMsg.type,
        mediaUrls: pendingMsg.mediaUrls,
        clientMessageId: pendingMsg.clientMessageId,
      });
    },
    [auctionId, sendMessageMutation]
  );

  const removePendingMessage = useCallback((localId: string) => {
    setPendingMessages((prev) => prev.filter((m) => m._localId !== localId));
  }, []);

  // ----------------------------------------------------
  // 2. Edit Message Mutation (0ms Optimistic UI)
  // ----------------------------------------------------
  const editMessageMutation = useMutation({
    mutationFn: ({ messageId, newContent }: { messageId: string; newContent: string }) =>
      chatService.editMessage(messageId, newContent),
    onMutate: async ({ messageId, newContent }) => {
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.CHAT.MESSAGES(auctionId),
      });

      const previousData = queryClient.getQueryData<
        InfiniteData<ChatMessagesConnectionData>
      >(QUERY_KEYS.CHAT.MESSAGES(auctionId));

      // Optimistically update message text in cache
      queryClient.setQueryData<InfiniteData<ChatMessagesConnectionData>>(
        QUERY_KEYS.CHAT.MESSAGES(auctionId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((m) =>
                m._id === messageId
                  ? { ...m, content: newContent, isEdited: true }
                  : m
              ),
            })),
          };
        }
      );

      return { previousData };
    },
    onSuccess: (updatedMessage) => {
      queryClient.setQueryData<InfiniteData<ChatMessagesConnectionData>>(
        QUERY_KEYS.CHAT.MESSAGES(auctionId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((m) =>
                m._id === updatedMessage._id ? { ...m, ...updatedMessage } : m
              ),
            })),
          };
        }
      );
    },
    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          QUERY_KEYS.CHAT.MESSAGES(auctionId),
          context.previousData
        );
      }
    },
  });

  // ----------------------------------------------------
  // 3. Delete Message Mutation (0ms Optimistic Soft Delete)
  // ----------------------------------------------------
  const deleteMessageMutation = useMutation({
    mutationFn: (messageId: string) => chatService.deleteMessage(messageId),
    onMutate: async (messageId) => {
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.CHAT.MESSAGES(auctionId),
      });

      const previousData = queryClient.getQueryData<
        InfiniteData<ChatMessagesConnectionData>
      >(QUERY_KEYS.CHAT.MESSAGES(auctionId));

      // Optimistically mark message as deleted
      queryClient.setQueryData<InfiniteData<ChatMessagesConnectionData>>(
        QUERY_KEYS.CHAT.MESSAGES(auctionId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((m) =>
                m._id === messageId
                  ? { ...m, isDeleted: true, content: null, reactions: [] }
                  : m
              ),
            })),
          };
        }
      );

      return { previousData };
    },
    onSuccess: (deletedMessage) => {
      queryClient.setQueryData<InfiniteData<ChatMessagesConnectionData>>(
        QUERY_KEYS.CHAT.MESSAGES(auctionId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((m) =>
                m._id === deletedMessage._id
                  ? { ...m, ...deletedMessage, isDeleted: true, content: null, reactions: [] }
                  : m
              ),
            })),
          };
        }
      );
    },
    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          QUERY_KEYS.CHAT.MESSAGES(auctionId),
          context.previousData
        );
      }
    },
  });

  // ----------------------------------------------------
  // 4. React To Message Mutation (0ms Optimistic Emoji Toggle)
  // ----------------------------------------------------
  const reactMutation = useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string | null }) =>
      chatService.reactToMessage(messageId, emoji),
    onMutate: async ({ messageId, emoji }) => {
      if (!currentUser) return;

      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.CHAT.MESSAGES(auctionId),
      });

      const previousData = queryClient.getQueryData<
        InfiniteData<ChatMessagesConnectionData>
      >(QUERY_KEYS.CHAT.MESSAGES(auctionId));

      queryClient.setQueryData<InfiniteData<ChatMessagesConnectionData>>(
        QUERY_KEYS.CHAT.MESSAGES(auctionId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((m) => {
                if (m._id !== messageId) return m;

                const currentUserId = currentUser._id;
                // Filter out existing reaction by current user
                const filteredReactions = m.reactions.filter(
                  (r) => r.userId !== currentUserId
                );

                // If emoji is selected (not null), append user's new reaction
                const updatedReactions = emoji
                  ? [...filteredReactions, { emoji, userId: currentUserId }]
                  : filteredReactions;

                return {
                  ...m,
                  reactions: updatedReactions,
                };
              }),
            })),
          };
        }
      );

      return { previousData };
    },
    onSuccess: (updatedMessage) => {
      queryClient.setQueryData<InfiniteData<ChatMessagesConnectionData>>(
        QUERY_KEYS.CHAT.MESSAGES(auctionId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((m) =>
                m._id === updatedMessage._id
                  ? { ...m, ...updatedMessage, reactions: updatedMessage.reactions || m.reactions }
                  : m
              ),
            })),
          };
        }
      );
    },
    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          QUERY_KEYS.CHAT.MESSAGES(auctionId),
          context.previousData
        );
      }
    },
  });

  // ----------------------------------------------------
  // 5. Mark Chat As Read Mutation
  // ----------------------------------------------------
  const markAsReadMutation = useMutation({
    mutationFn: (lastReadMessageId: string) =>
      chatService.markChatAsRead(auctionId, lastReadMessageId),
    onSuccess: () => {
      // 1. Invalidate read state for active auction
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CHAT.READ_STATE(auctionId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CHAT.READ_STATES(auctionId),
      });

      // 2. Optimistically clear unread count for this auction across all room caches in 0ms
      queryClient.setQueriesData<ChatRoomsPageData>(
        { queryKey: ['chat', 'rooms'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((r) =>
              r.auctionId === auctionId ? { ...r, unreadCount: 0 } : r
            ),
          };
        }
      );
    },
  });

  return {
    pendingMessages,
    sendMessage,
    retrySendMessage,
    removePendingMessage,
    isSending: sendMessageMutation.isPending,
    editMessage: (messageId: string, newContent: string) =>
      editMessageMutation.mutateAsync({ messageId, newContent }),
    isEditing: editMessageMutation.isPending,
    deleteMessage: (messageId: string) =>
      deleteMessageMutation.mutateAsync(messageId),
    isDeleting: deleteMessageMutation.isPending,
    reactToMessage: (messageId: string, emoji: string | null) =>
      reactMutation.mutateAsync({ messageId, emoji }),
    isReacting: reactMutation.isPending,
    markChatAsRead: (lastReadMessageId: string) =>
      markAsReadMutation.mutateAsync(lastReadMessageId),
  };
}
