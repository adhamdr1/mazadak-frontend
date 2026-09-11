import { createContext } from 'react';
import type { Client, SubscribePayload } from 'graphql-ws';

export interface SocketContextType {
  client: Client | null;
  isConnected: boolean;
  subscribe: <TData = unknown>(
    payload: SubscribePayload,
    handlers: {
      next: (data: TData) => void;
      error?: (err: unknown) => void;
      complete?: () => void;
    }
  ) => () => void;
}

export const SocketContext = createContext<SocketContextType | null>(null);
