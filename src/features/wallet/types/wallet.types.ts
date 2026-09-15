/**
 * Types and interfaces for the Wallet Module (Batch 1 — Overview & Balances)
 */

export interface WalletData {
  _id: string;
  userId: string;
  balance: string; // Decimal precision string from GraphQL
  heldBalance: string; // Decimal precision string from GraphQL
  availableBalance: string; // Decimal precision string from GraphQL
  createdAt: string;
  updatedAt: string;
}

export interface RecentTransactionItem {
  _id: string;
  type: string;
  amount: string; // Decimal precision string
  currency: string;
  status: string;
  referenceId?: string | null;
  createdAt: string;
}

export interface RecentTransactionsData {
  items: RecentTransactionItem[];
  total: number;
}

export interface InitializePaymentRequest {
  provider: 'PAYMOB';
  amount: number; // in piasters (e.g. 100 EGP = 10000)
  currency?: string;
}

export interface InitializePaymentResponse {
  gatewayPaymentIntentId: string;
  clientSecret: string;
  paymentUrl: string;
  idempotencyKey: string;
}
