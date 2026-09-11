import { createClient, type Client, type SubscribePayload } from 'graphql-ws';
import { env } from '@/config/env.config';

let wsClient: Client | null = null;
let currentToken: string | null = null;

export interface SocketClientOptions {
  token?: string | null;
  onConnected?: () => void;
  onClosed?: (event: unknown) => void;
  onError?: (error: unknown) => void;
}

/**
 * Creates or retrieves the singleton GraphQL WebSocket client.
 * Recreates the client if the authentication token changes.
 */
export function getSocketClient(accessToken?: string | null): Client {
  const token = accessToken ?? null;

  // Re-instantiate if token changed or client not created yet
  if (!wsClient || currentToken !== token) {
    if (wsClient) {
      try {
        wsClient.dispose();
      } catch (err) {
        console.warn('Error disposing previous WebSocket client:', err);
      }
    }

    currentToken = token;

    wsClient = createClient({
      url: env.wsUrl,
      connectionParams: () => {
        if (!currentToken) return {};
        return {
          authorization: `Bearer ${currentToken}`,
          Authorization: `Bearer ${currentToken}`,
        };
      },
      shouldRetry: () => true,
      retryAttempts: 5,
      retryWait: async (retries) => {
        // Exponential backoff with max 5s
        await new Promise((resolve) =>
          setTimeout(resolve, Math.min(1000 * Math.pow(2, retries), 5000))
        );
      },
      lazy: true, // Connects only on first subscription
    });
  }

  return wsClient;
}

/**
 * Disposes and clears the active WebSocket client instance.
 */
export function disposeSocketClient(): void {
  if (wsClient) {
    try {
      wsClient.dispose();
    } catch (err) {
      console.warn('Error disposing WebSocket client:', err);
    }
    wsClient = null;
    currentToken = null;
  }
}

/**
 * Helper to subscribe to a GraphQL subscription with automatic unsubscribe cleanup.
 */
export function subscribeToSubscription<TData = unknown>(
  payload: SubscribePayload,
  handlers: {
    next: (data: TData) => void;
    error?: (err: unknown) => void;
    complete?: () => void;
  },
  token?: string | null
): () => void {
  const client = getSocketClient(token);

  return client.subscribe<TData>(payload, {
    next: (value) => {
      if (value.data) {
        handlers.next(value.data);
      }
    },
    error: (err) => {
      if (handlers.error) {
        handlers.error(err);
      } else {
        console.error('GraphQL WebSocket subscription error:', err);
      }
    },
    complete: () => {
      handlers.complete?.();
    },
  });
}
