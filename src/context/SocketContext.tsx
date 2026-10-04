import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { Client, SubscribePayload } from 'graphql-ws';
import { useQueryClient } from '@tanstack/react-query';
import { SocketContext, type SocketContextType } from './socket.context';
import {
  getSocketClient,
  disposeSocketClient,
  subscribeToSubscription,
} from '@/services/websocket/socketClient';
import { useAuth } from '@/hooks/useAuth';
import { walletService } from '@/features/wallet';
import { notificationsService } from '@/features/notifications/services/notifications.service';
import type { InAppNotificationsPage } from '@/features/notifications/types/notifications.types';
import { useToast } from '@/components/feedback/useToast';
import { useTranslation } from 'react-i18next';
import {
  getLocalizedNotification,
  stripEmojis,
} from '@/features/notifications/utils/notificationLocalization.utils';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { accessToken, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t: tNotifications, i18n } = useTranslation('notifications');
  const isRTL = i18n.language?.startsWith('ar');

  const isRTLRef = useRef(isRTL);
  const tNotificationsRef = useRef(tNotifications);

  useEffect(() => {
    isRTLRef.current = isRTL;
    tNotificationsRef.current = tNotifications;
  }, [isRTL, tNotifications]);

  const [client, setClient] = useState<Client | null>(() => getSocketClient(accessToken));
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Synchronize client instance with current access token
  useEffect(() => {
    const activeClient = getSocketClient(accessToken);
    setClient(activeClient);

    // Track connection state via event listeners
    const disposeConnected = activeClient.on('connected', () => {
      setIsConnected(true);
    });

    const disposeClosed = activeClient.on('closed', () => {
      setIsConnected(false);
    });

    const disposeError = activeClient.on('error', () => {
      setIsConnected(false);
    });

    return () => {
      disposeConnected();
      disposeClosed();
      disposeError();
    };
  }, [accessToken]);

  // Synchronize live wallet updates in real time globally across the app
  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    const unsubscribe = walletService.subscribeToWalletUpdated(
      {
        next: (data) => {
          if (data?.walletUpdated) {
            queryClient.setQueryData(QUERY_KEYS.WALLET.MY_WALLET, data.walletUpdated);
          }
        },
        error: (err) => {
          console.warn('WebSocket walletUpdated subscription error:', err);
        },
      },
      accessToken
    );

    return () => {
      unsubscribe();
    };
  }, [isAuthenticated, accessToken, queryClient]);

  // Synchronize live in-app notifications globally across the app
  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    const unsubscribeAdded = notificationsService.subscribeToNotificationAdded(
      {
        next: (data) => {
          if (!data?.notificationAdded) return;
          const newNotif = data.notificationAdded;

          // Increment global unread count
          queryClient.setQueriesData<number>(
            { queryKey: QUERY_KEYS.NOTIFICATIONS.UNREAD_TOTAL, exact: true },
            (old = 0) => old + 1
          );

          // Increment category unread count if applicable
          if (newNotif.category) {
            queryClient.setQueriesData<number>(
              { queryKey: QUERY_KEYS.NOTIFICATIONS.UNREAD_COUNT(newNotif.category), exact: true },
              (old = 0) => old + 1
            );
          }

          // Prepend to cached list queries
          queryClient.setQueriesData<InAppNotificationsPage>(
            { queryKey: ['notifications', 'list'] },
            (old) => {
              if (!old) return old;
              if (old.items.some((item) => item._id === newNotif._id)) return old;
              return {
                ...old,
                total: old.total + 1,
                items: [newNotif, ...old.items],
              };
            }
          );

          // Invalidate reviews and user public profile queries on review notifications
          if (newNotif.type === 'REVIEW_RECEIVED' || newNotif.type === 'REVIEW_REPLIED') {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REVIEWS.ALL });
            if (newNotif.referenceId) {
              queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.USERS.PUBLIC_PROFILE(newNotif.referenceId),
              });
            }
          }

          // Trigger in-app toast alert with fully localized title, body, and zero emojis
          const localized = getLocalizedNotification(
            newNotif,
            !!isRTLRef.current,
            tNotificationsRef.current
          );
          toast.info(stripEmojis(localized.body || localized.title), {
            title: stripEmojis(localized.title),
            duration: 4500,
          });
        },
        error: (err) => {
          console.warn('WebSocket notificationAdded subscription error:', err);
        },
      },
      accessToken
    );

    const unsubscribeRead = notificationsService.subscribeToNotificationReadStatusUpdated(
      {
        next: (data) => {
          if (!data?.notificationReadStatusUpdated) return;
          const { notificationId, unreadCount, category } = data.notificationReadStatusUpdated;

          // Set exact unread count from server
          queryClient.setQueriesData<number>(
            { queryKey: QUERY_KEYS.NOTIFICATIONS.UNREAD_TOTAL, exact: true },
            () => unreadCount
          );

          // Invalidate category count if applicable
          if (category) {
            queryClient.invalidateQueries({
              queryKey: QUERY_KEYS.NOTIFICATIONS.UNREAD_COUNT(category),
            });
          } else if (!notificationId) {
            // Mark all as read: zero out all category counters
            queryClient.setQueriesData<number>(
              { queryKey: ['notifications', 'unread-category'] },
              () => 0
            );
          }

          // Update read state across cached lists
          queryClient.setQueriesData<InAppNotificationsPage>(
            { queryKey: ['notifications', 'list'] },
            (old) => {
              if (!old) return old;
              if (notificationId) {
                return {
                  ...old,
                  items: old.items.map((item) =>
                    item._id === notificationId ? { ...item, isRead: true } : item
                  ),
                };
              }
              // Mark all as read
              return {
                ...old,
                items: old.items.map((item) => ({ ...item, isRead: true })),
              };
            }
          );
        },
        error: (err) => {
          console.warn('WebSocket notificationReadStatusUpdated subscription error:', err);
        },
      },
      accessToken
    );

    return () => {
      unsubscribeAdded();
      unsubscribeRead();
    };
  }, [isAuthenticated, accessToken, queryClient, toast]);

  // Clean up when auth expires
  useEffect(() => {
    const handleAuthExpired = () => {
      disposeSocketClient();
      setIsConnected(false);
      setClient(null);
    };

    window.addEventListener('mazadak:auth_expired', handleAuthExpired);
    return () => {
      window.removeEventListener('mazadak:auth_expired', handleAuthExpired);
    };
  }, []);

  // Cleanup on provider unmount
  useEffect(() => {
    return () => {
      disposeSocketClient();
    };
  }, []);

  const subscribe = useCallback(
    <TData = unknown>(
      payload: SubscribePayload,
      handlers: {
        next: (data: TData) => void;
        error?: (err: unknown) => void;
        complete?: () => void;
      }
    ) => {
      return subscribeToSubscription<TData>(payload, handlers);
    },
    []
  );

  const contextValue = useMemo<SocketContextType>(
    () => ({
      client,
      isConnected,
      subscribe,
    }),
    [client, isConnected, subscribe]
  );

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};
