import { useQuery } from '@tanstack/react-query';
import { walletService } from '../services/wallet.service';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import type { RecentTransactionItem } from '../types/wallet.types';

export interface UseRecentTransactionsReturn {
  transactions: RecentTransactionItem[];
  total: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Custom hook to fetch the 5 most recent transactions for the wallet dashboard widget
 */
export const useRecentTransactions = (): UseRecentTransactionsReturn => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...QUERY_KEYS.WALLET.TRANSACTIONS, 'recent'],
    queryFn: () => walletService.getRecentTransactions(),
    staleTime: 30 * 1000,
  });

  return {
    transactions: data?.items || [],
    total: data?.total || 0,
    isLoading,
    error: error as Error | null,
    refetch,
  };
};
