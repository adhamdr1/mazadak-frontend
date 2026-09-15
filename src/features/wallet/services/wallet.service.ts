import { executeGraphQL } from '@/services/api/graphqlClient';
import { restClient } from '@/services/api/apiClient';
import { subscribeToSubscription } from '@/services/websocket/socketClient';
import type {
  WalletData,
  RecentTransactionItem,
  InitializePaymentRequest,
  InitializePaymentResponse,
} from '../types/wallet.types';

// ==========================================
// GraphQL Operations (Fragments & Queries)
// ==========================================

export const WALLET_FIELDS_FRAGMENT = `
  fragment WalletFields on Wallet {
    _id
    userId
    balance
    heldBalance
    availableBalance
    createdAt
    updatedAt
  }
`;

export const MY_WALLET_QUERY = `
  ${WALLET_FIELDS_FRAGMENT}
  query MyWallet {
    myWallet {
      ...WalletFields
    }
  }
`;

export const RECENT_TRANSACTIONS_QUERY = `
  query RecentTransactions {
    myTransactions(input: { page: 1, limit: 5 }) {
      items {
        _id
        type
        amount
        currency
        status
        referenceId
        createdAt
      }
      total
    }
  }
`;

export const WALLET_UPDATED_SUBSCRIPTION = `
  ${WALLET_FIELDS_FRAGMENT}
  subscription OnWalletUpdated {
    walletUpdated {
      ...WalletFields
    }
  }
`;

// ==========================================
// Wallet Service Implementation
// ==========================================

export const walletService = {
  /**
   * Fetches the authenticated user's wallet overview and balances
   */
  async getMyWallet(): Promise<WalletData> {
    const data = await executeGraphQL<{ myWallet: WalletData }>(MY_WALLET_QUERY);
    return data.myWallet;
  },

  /**
   * Fetches the 5 most recent transactions for the wallet overview widget
   */
  async getRecentTransactions(): Promise<{ items: RecentTransactionItem[]; total: number }> {
    const data = await executeGraphQL<{
      myTransactions: { items: RecentTransactionItem[]; total: number };
    }>(RECENT_TRANSACTIONS_QUERY);
    return data.myTransactions;
  },

  /**
   * Subscribes to real-time wallet balance changes via WebSocket
   */
  subscribeToWalletUpdated(
    handlers: {
      next: (data: { walletUpdated: WalletData }) => void;
      error?: (err: unknown) => void;
      complete?: () => void;
    },
    token?: string | null
  ): () => void {
    return subscribeToSubscription<{ walletUpdated: WalletData }>(
      {
        query: WALLET_UPDATED_SUBSCRIPTION,
      },
      handlers,
      token
    );
  },

  /**
   * Initializes a Paymob Unified Checkout payment session via REST API
   * Converts user amount in EGP to piasters (1 EGP = 100 piasters)
   */
  async initializePayment(amountInEgp: number): Promise<InitializePaymentResponse> {
    const amountInPiasters = Math.round(amountInEgp * 100);
    const response = await restClient.post<InitializePaymentResponse>('/payments/initialize', {
      provider: 'PAYMOB',
      amount: amountInPiasters,
      currency: 'EGP',
    } satisfies InitializePaymentRequest);
    return response.data;
  },
};
