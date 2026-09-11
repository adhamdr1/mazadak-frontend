import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Client, SubscribePayload } from 'graphql-ws';
import { SocketContext, type SocketContextType } from './socket.context';
import {
  getSocketClient,
  disposeSocketClient,
  subscribeToSubscription,
} from '@/services/websocket/socketClient';
import { useAuth } from '@/hooks/useAuth';

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { accessToken } = useAuth();
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
      return subscribeToSubscription<TData>(payload, handlers, accessToken);
    },
    [accessToken]
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
