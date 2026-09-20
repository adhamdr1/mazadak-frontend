/**
 * Types and interfaces for the Wallet Module
 * Strictly aligned with `.agents/schema.gql` and `.agents/BACKEND_CONTRACT.md`
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

export type TransactionType =
  | 'DEPOSIT'
  | 'WITHDRAW'
  | 'HOLD'
  | 'RELEASE'
  | 'CAPTURE'
  | 'REFUND';

export type TransactionStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED';

export type TransactionReferenceType =
  | 'AUCTION'
  | 'TRANSACTION'
  | 'ESCROW'
  | 'DISPUTE';

export type TransactionsSortField = 'CREATED_AT' | 'AMOUNT';
export type SortOrder = 'ASC' | 'DESC';

export interface TransactionsSortInput {
  field: TransactionsSortField;
  order: SortOrder;
}

export interface PaginationInput {
  page?: number;
  limit?: number;
}

export interface TransactionsFilterInput {
  search?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  startDate?: string; // ISO DateTime
  endDate?: string; // ISO DateTime
  expiresAtBefore?: string;
  hasChild?: boolean;
  sort?: TransactionsSortInput;
}

export interface Transaction {
  _id: string;
  walletId: string;
  type: TransactionType;
  amount: string; // Decimal precision string from GraphQL
  currency: string;
  status: TransactionStatus;
  referenceId?: string | null;
  idempotencyKey?: string | null;
  gatewayPaymentIntentId?: string | null;
  gatewayTransactionId?: string | null;
  gatewayProvider?: string | null;
  referenceType?: TransactionReferenceType | null;
  expiresAt?: string | null;
  hasChild?: boolean;
  walletCredited?: boolean;
  createdAt: string;
}

export interface TransactionsPageData {
  items: Transaction[];
  total: number;
  totalPages: number;
  hasNextPage: boolean;
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

export interface WithdrawInput {
  amount: number;
}

export type PayoutMethod =
  | 'VODAFONE_CASH'
  | 'ORANGE_CASH'
  | 'ETISALAT_CASH'
  | 'WE_PAY'
  | 'INSTAPAY'
  | 'BANK_ACCOUNT';

export type WithdrawalStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export interface PayoutDetailsInput {
  bankName?: string;
  accountHolderName?: string;
  accountNumber?: string;
  iban?: string;
  phoneNumber?: string;
  ipaAddress?: string;
}

export interface PayoutDetails {
  bankName?: string | null;
  accountHolderName?: string | null;
  accountNumber?: string | null;
  iban?: string | null;
  phoneNumber?: string | null;
  ipaAddress?: string | null;
}

export interface RequestWithdrawalInput {
  amount: number;
  payoutMethod: PayoutMethod;
  payoutDetails: PayoutDetailsInput;
}

export interface WithdrawalFeePreview {
  requestedAmount: string;
  fee: string;
  feePercentage: number;
  netAmount: string;
  maxAllowed: number;
  estimatedDelivery: string;
}

export interface WithdrawalResponse {
  _id: string;
  userId: string;
  amount: string;
  fee: string;
  feePercentage: number;
  netAmount: string;
  currency: string;
  payoutMethod: PayoutMethod;
  status: WithdrawalStatus;
  payoutDetails?: PayoutDetails | null;
  rejectionReason?: string | null;
  receiptUrl?: string | null;
  adminReference?: string | null;
  createdAt: string;
  processedAt?: string | null;
  completedAt?: string | null;
  updatedAt?: string;
}

export interface WithdrawalsFilterInput {
  status?: WithdrawalStatus;
  payoutMethod?: PayoutMethod;
  sortOrder?: SortOrder;
  startDate?: string;
  endDate?: string;
}

export interface WithdrawalsPageData {
  items: WithdrawalResponse[];
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}

/**
 * Returns type-specific amount styling and signs matching TransactionTypeBadge
 */
export const getTransactionAmountConfig = (type: TransactionType | string) => {
  switch (type) {
    case 'DEPOSIT':
      return {
        sign: '+',
        textColor: 'text-emerald-600 dark:text-emerald-400',
      };
    case 'WITHDRAW':
      return {
        sign: '-',
        textColor: 'text-blue-600 dark:text-blue-400',
      };
    case 'HOLD':
      return {
        sign: '-',
        textColor: 'text-amber-600 dark:text-amber-400',
      };
    case 'RELEASE':
      return {
        sign: '+',
        textColor: 'text-cyan-600 dark:text-cyan-400',
      };
    case 'CAPTURE':
      return {
        sign: '-',
        textColor: 'text-purple-600 dark:text-purple-400',
      };
    case 'REFUND':
      return {
        sign: '+',
        textColor: 'text-rose-600 dark:text-rose-400',
      };
    default:
      return {
        sign: '',
        textColor: 'text-slate-800 dark:text-slate-200',
      };
  }
};
