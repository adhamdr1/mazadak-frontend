/**
 * AuctionChatDrawer Component
 * Full-featured real-time slide-over Chat Drawer for Auction Details Page
 * Integrates cursor pagination, 3 GraphQL subscriptions, optimistic updates, reactions & read receipts.
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MessageSquare,
  X,
  Loader2,
  ChevronUp,
  Radio,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuth } from '@/hooks/useAuth';
import { useChatMessages } from '../hooks/useChatMessages';
import { useChatActions } from '../hooks/useChatActions';
import { useChatSubscriptions } from '../hooks/useChatSubscriptions';
import { ChatMessageBubble } from './ChatMessageBubble';
import { ChatInputBar } from './ChatInputBar';
import type { ChatMessageData, PendingMessage } from '../types/chat.types';

export interface AuctionChatDrawerProps {
  auctionId: string;
  auctionTitle?: string;
  isAuctionActive?: boolean;
  auctionStatus?: string;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const AuctionChatDrawer: React.FC<AuctionChatDrawerProps> = ({
  auctionId,
  auctionTitle,
  isAuctionActive,
  auctionStatus,
  isOpen,
  onClose,
  className,
}) => {
  const { t } = useTranslation('chat');
  const { user: currentUser } = useAuth();
  const isCurrentlyActive = isAuctionActive ?? (auctionStatus === 'ACTIVE');

  const [editingMessage, setEditingMessage] = useState<{
    id: string;
    content: string;
  } | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const hasScrolledInitially = useRef(false);

  // 1. Fetch Paginated Messages & Read State
  const {
    messages,
    hasOlderMessages,
    isFetchingOlderMessages,
    fetchOlderMessages,
    isLoading: isLoadingMessages,
    readState,
  } = useChatMessages({
    auctionId,
    enabled: isOpen && !!auctionId,
  });

  // 2. Chat Actions & Optimistic State
  const {
    pendingMessages,
    sendMessage,
    retrySendMessage,
    removePendingMessage,
    isSending,
    editMessage,
    deleteMessage,
    reactToMessage,
    markChatAsRead,
  } = useChatActions({ auctionId });

  // 3. Scroll to bottom handler
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  }, []);

  // Handler for new incoming messages from subscription
  const handleNewMessage = useCallback(() => {
    if (isNearBottomRef.current) {
      setTimeout(() => scrollToBottom(true), 40);
    }
  }, [scrollToBottom]);

  // 4. Real-time Subscriptions with Strict Cleanup
  const { participantReadStates } = useChatSubscriptions({
    auctionId,
    isOpen,
    onNewMessage: handleNewMessage,
  });

  // 5. Detect scroll position
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    // User is near bottom if within 120px of bottom
    isNearBottomRef.current = scrollHeight - (scrollTop + clientHeight) < 120;
  }, []);

  // 6. Older Messages with Scroll Anchor (preserves reading position)
  const handleLoadOlder = async () => {
    if (!messagesContainerRef.current || isFetchingOlderMessages) return;
    const container = messagesContainerRef.current;
    const previousScrollHeight = container.scrollHeight;
    const previousScrollTop = container.scrollTop;

    await fetchOlderMessages();

    requestAnimationFrame(() => {
      if (messagesContainerRef.current) {
        const heightDiff = messagesContainerRef.current.scrollHeight - previousScrollHeight;
        messagesContainerRef.current.scrollTop = previousScrollTop + heightDiff;
      }
    });
  };

  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const currentUserRef = useRef(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  const markChatAsReadRef = useRef(markChatAsRead);
  useEffect(() => {
    markChatAsReadRef.current = markChatAsRead;
  }, [markChatAsRead]);

  const scrollToBottomRef = useRef(scrollToBottom);
  useEffect(() => {
    scrollToBottomRef.current = scrollToBottom;
  }, [scrollToBottom]);

  // 7. Initial scroll reset & mark as read on open
  useEffect(() => {
    if (!isOpen) {
      hasScrolledInitially.current = false;
      return;
    }

    const msgs = messagesRef.current;
    if (msgs.length > 0) {
      const otherMsgs = msgs.filter(
        (m) =>
          m.senderId !== currentUserRef.current?._id &&
          m._id &&
          !m._id.startsWith('pending-')
      );
      const latestOther = otherMsgs[otherMsgs.length - 1];
      if (latestOther?._id) {
        markChatAsReadRef.current(latestOther._id).catch(() => {});
      }
    }
  }, [isOpen]);

  // 8. Lock body scroll on mobile when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setEditingMessage(null);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // 9. Memoize sorted combined messages with pending deduplication (Fix BUG-05)
  const allMessages = useMemo<(ChatMessageData | PendingMessage)[]>(() => {
    const realClientIds = new Set(
      messages.map((m) => m.clientMessageId).filter(Boolean)
    );
    const activePending = pendingMessages.filter(
      (p) => !realClientIds.has(p.clientMessageId)
    );
    const combined = [...messages, ...activePending];
    return combined.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [messages, pendingMessages]);

  // Initial scroll effect after messages are loaded and DOM rendered (Fix BUG-01)
  useEffect(() => {
    if (!isOpen || hasScrolledInitially.current) return;
    if (!isLoadingMessages && allMessages.length > 0) {
      hasScrolledInitially.current = true;
      requestAnimationFrame(() => {
        scrollToBottomRef.current(false);
      });
    }
  }, [isOpen, isLoadingMessages, allMessages.length]);

  // 10. Compute accurate Read Horizon timestamp for other participants
  const maxOtherReadTime = useMemo(() => {
    const timestamps: number[] = Object.entries(participantReadStates)
      .filter(([userId]) => userId !== currentUser?._id)
      .map(([, lastId]) => {
        const readMsg = allMessages.find((m) => m._id === lastId);
        return readMsg ? new Date(readMsg.createdAt).getTime() : 0;
      });

    if (readState?.lastReadMessageId && readState.userId !== currentUser?._id) {
      const readMsg = allMessages.find((m) => m._id === readState.lastReadMessageId);
      if (readMsg) {
        timestamps.push(new Date(readMsg.createdAt).getTime());
      }
    }

    return timestamps.length > 0 ? Math.max(...timestamps) : 0;
  }, [participantReadStates, readState, currentUser?._id, allMessages]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <aside
        className={cn(
          'relative z-10 w-full sm:max-w-md lg:max-w-lg h-full bg-slate-50 dark:bg-slate-900 shadow-2xl flex flex-col border-l rtl:border-r rtl:border-l-0 border-slate-200 dark:border-slate-800 animate-in slide-in-from-right rtl:slide-in-from-left duration-250',
          className
        )}
        aria-label={t('drawer.title', 'شات المزاد')}
      >
        {/* Drawer Header */}
        <header className="px-4 py-3.5 bg-white dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                  {t('drawer.title', 'شات المزاد')}
                </h2>
                {isCurrentlyActive ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                    <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-500" />
                    <span>{t('messages.auctionActive', 'مباشر')}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full shrink-0">
                    {t('messages.auctionEnded', 'منتهي')}
                  </span>
                )}
              </div>
              {auctionTitle && (
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">
                  {auctionTitle}
                </p>
              )}
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors shrink-0 cursor-pointer"
            title={t('actions.close', 'إغلاق')}
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Drawer Messages Stream Body */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 p-4 pt-8 pb-4 overflow-y-auto overflow-x-hidden custom-scrollbar space-y-1.5"
        >
          {/* Older Messages Load Trigger */}
          {hasOlderMessages && (
            <div className="text-center py-2">
              <button
                type="button"
                onClick={handleLoadOlder}
                disabled={isFetchingOlderMessages}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
              >
                {isFetchingOlderMessages ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                ) : (
                  <ChevronUp className="w-3.5 h-3.5" />
                )}
                <span>{t('drawer.loadMore', 'تحميل رسائل أقدم')}</span>
              </button>
            </div>
          )}

          {/* Initial Loading Skeleton */}
          {isLoadingMessages && messages.length === 0 && (
            <div className="space-y-4 py-8">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className={cn(
                    'flex flex-col space-y-1',
                    n % 2 === 0 ? 'items-end' : 'items-start'
                  )}
                >
                  <div
                    className={cn(
                      'h-12 rounded-2xl animate-pulse bg-slate-200 dark:bg-slate-800',
                      n % 2 === 0 ? 'w-48' : 'w-56'
                    )}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoadingMessages && allMessages.length === 0 && (
            <div className="py-24 text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
                <MessageSquare className="w-8 h-8 opacity-80" />
              </div>
              <div className="space-y-1 max-w-xs mx-auto">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {t('drawer.empty', 'لا توجد رسائل بعد')}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t(
                    'drawer.emptyDescription',
                    'ابدأ المحادثة للتواصل المباشر بين البائع والمشاركين والفائز!'
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Render Messages */}
          {allMessages.map((msg) => {
            const isOwner = msg.senderId === currentUser?._id;
            const isRead =
              isOwner &&
              !msg._id.startsWith('pending-') &&
              maxOtherReadTime > 0 &&
              new Date(msg.createdAt).getTime() <= maxOtherReadTime;

            return (
              <ChatMessageBubble
                key={msg._id || msg.clientMessageId}
                message={msg}
                isOwner={isOwner}
                isRead={isRead}
                onEdit={(messageId, content) =>
                  setEditingMessage({ id: messageId, content })
                }
                onDelete={(messageId) => deleteMessage(messageId)}
                onReact={(messageId, emoji) => reactToMessage(messageId, emoji)}
                onRetry={(pendingMsg) => retrySendMessage(pendingMsg)}
                onRemovePending={(localId) => removePendingMessage(localId)}
              />
            );
          })}
        </div>

        {/* Drawer Footer Input Bar */}
        <ChatInputBar
          auctionId={auctionId}
          onSendMessage={(content, type = 'TEXT', mediaUrls) => {
            sendMessage(content, type, mediaUrls);
            setTimeout(() => scrollToBottom(true), 30);
          }}
          isSending={isSending}
          editingMessage={editingMessage}
          onSaveEdit={(messageId, newContent) => {
            editMessage(messageId, newContent);
            setEditingMessage(null);
          }}
          onCancelEdit={() => setEditingMessage(null)}
        />
      </aside>
    </div>
  );
};

export default AuctionChatDrawer;
