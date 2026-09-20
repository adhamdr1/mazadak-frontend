import { executeGraphQL } from '@/services/api/graphqlClient';
import { restClient } from '@/services/api/apiClient';
import { subscribeToSubscription } from '@/services/websocket/socketClient';
import type {
  WalletData,
  RecentTransactionItem,
  InitializePaymentRequest,
  InitializePaymentResponse,
  TransactionsPageData,
  TransactionsFilterInput,
  PaginationInput,
  PayoutMethod,
  WithdrawalStatus,
  RequestWithdrawalInput,
  WithdrawalFeePreview,
  WithdrawalResponse,
  WithdrawalsFilterInput,
  WithdrawalsPageData,
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

export const TRANSACTION_FIELDS_FRAGMENT = `
  fragment TransactionFields on Transaction {
    _id
    walletId
    type
    amount
    currency
    status
    referenceId
    idempotencyKey
    gatewayPaymentIntentId
    gatewayTransactionId
    gatewayProvider
    referenceType
    expiresAt
    hasChild
    walletCredited
    createdAt
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

export const MY_TRANSACTIONS_QUERY = `
  ${TRANSACTION_FIELDS_FRAGMENT}
  query MyTransactions($input: PaginationInput, $filter: TransactionsFilterInput) {
    myTransactions(input: $input, filter: $filter) {
      items {
        ...TransactionFields
      }
      total
      totalPages
      hasNextPage
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

export const WITHDRAWAL_FEE_PREVIEW_QUERY = `
  query WithdrawalFeePreview($amount: Float!, $payoutMethod: PayoutMethod!) {
    withdrawalFeePreview(amount: $amount, payoutMethod: $payoutMethod) {
      requestedAmount
      fee
      feePercentage
      netAmount
      maxAllowed
      estimatedDelivery
    }
  }
`;

export const REQUEST_WITHDRAWAL_MUTATION = `
  mutation RequestWithdrawal($input: RequestWithdrawalInput!) {
    requestWithdrawal(input: $input) {
      _id
      userId
      amount
      fee
      feePercentage
      netAmount
      currency
      payoutMethod
      status
      payoutDetails {
        bankName
        accountHolderName
        accountNumber
        iban
        phoneNumber
        ipaAddress
      }
      createdAt
    }
  }
`;

export const WITHDRAWAL_FIELDS_FRAGMENT = `
  fragment WithdrawalFields on WithdrawalRequest {
    _id
    userId
    amount
    fee
    feePercentage
    netAmount
    currency
    payoutMethod
    status
    payoutDetails {
      bankName
      accountHolderName
      accountNumber
      iban
      phoneNumber
      ipaAddress
    }
    rejectionReason
    receiptUrl
    adminReference
    createdAt
    processedAt
    completedAt
    updatedAt
  }
`;

export const MY_WITHDRAWALS_QUERY = `
  ${WITHDRAWAL_FIELDS_FRAGMENT}
  query MyWithdrawals($pagination: PaginationInput!, $filter: WithdrawalsFilterInput) {
    myWithdrawals(pagination: $pagination, filter: $filter) {
      items {
        ...WithdrawalFields
      }
      total
      totalPages
      hasNextPage
    }
  }
`;

export const MY_WITHDRAWAL_QUERY = `
  ${WITHDRAWAL_FIELDS_FRAGMENT}
  query MyWithdrawal($id: ID!) {
    myWithdrawal(id: $id) {
      ...WithdrawalFields
    }
  }
`;

export const CANCEL_WITHDRAWAL_MUTATION = `
  mutation CancelWithdrawal($id: ID!) {
    cancelWithdrawal(id: $id) {
      _id
      status
      updatedAt
    }
  }
`;

export const MY_WITHDRAWAL_UPDATED_SUBSCRIPTION = `
  subscription OnMyWithdrawalUpdated {
    myWithdrawalUpdated {
      _id
      status
      rejectionReason
      receiptUrl
      adminReference
      completedAt
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
   * Fetches fee preview and delivery estimates for withdrawal
   */
  async getWithdrawalFeePreview(
    amount: number,
    payoutMethod: PayoutMethod
  ): Promise<WithdrawalFeePreview> {
    const data = await executeGraphQL<{ withdrawalFeePreview: WithdrawalFeePreview }>(
      WITHDRAWAL_FEE_PREVIEW_QUERY,
      { amount, payoutMethod }
    );
    return data.withdrawalFeePreview;
  },

  /**
   * Submits a new withdrawal request (hold and pending process)
   */
  async requestWithdrawal(input: RequestWithdrawalInput): Promise<WithdrawalResponse> {
    const data = await executeGraphQL<{ requestWithdrawal: WithdrawalResponse }>(
      REQUEST_WITHDRAWAL_MUTATION,
      { input }
    );
    return data.requestWithdrawal;
  },

  /**
   * Fetches paginated and filtered withdrawal requests for the user
   */
  async getMyWithdrawals(
    pagination: PaginationInput = { page: 1, limit: 10 },
    filter?: WithdrawalsFilterInput
  ): Promise<WithdrawalsPageData> {
    const data = await executeGraphQL<{ myWithdrawals: WithdrawalsPageData }>(
      MY_WITHDRAWALS_QUERY,
      {
        pagination,
        filter: filter || null,
      }
    );
    return data.myWithdrawals;
  },

  /**
   * Fetches full details for a single withdrawal request
   */
  async getMyWithdrawal(id: string): Promise<WithdrawalResponse> {
    const data = await executeGraphQL<{ myWithdrawal: WithdrawalResponse }>(
      MY_WITHDRAWAL_QUERY,
      { id }
    );
    return data.myWithdrawal;
  },

  /**
   * Cancels a pending withdrawal request and unlocks the held funds
   */
  async cancelWithdrawal(
    id: string
  ): Promise<{ _id: string; status: WithdrawalStatus; updatedAt?: string }> {
    const data = await executeGraphQL<{
      cancelWithdrawal: { _id: string; status: WithdrawalStatus; updatedAt?: string };
    }>(CANCEL_WITHDRAWAL_MUTATION, { id });
    return data.cancelWithdrawal;
  },

  /**
   * Subscribes to real-time status updates on user withdrawals via WebSocket
   */
  subscribeToMyWithdrawalUpdated(
    handlers: {
      next: (data: { myWithdrawalUpdated: Partial<WithdrawalResponse> }) => void;
      error?: (err: unknown) => void;
      complete?: () => void;
    },
    token?: string | null
  ): () => void {
    return subscribeToSubscription<{ myWithdrawalUpdated: Partial<WithdrawalResponse> }>(
      {
        query: MY_WITHDRAWAL_UPDATED_SUBSCRIPTION,
      },
      handlers,
      token
    );
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
   * Fetches full paginated and filtered transactions history
   */
  async getMyTransactions(
    input: PaginationInput = { page: 1, limit: 10 },
    filter?: TransactionsFilterInput
  ): Promise<TransactionsPageData> {
    const data = await executeGraphQL<{ myTransactions: TransactionsPageData }>(
      MY_TRANSACTIONS_QUERY,
      {
        input,
        filter: filter || null,
      }
    );
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
