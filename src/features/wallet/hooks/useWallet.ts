import { useQuery } from '@tanstack/react-query';
import { walletService } from '../services/wallet.service';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import type { WalletData } from '../types/wallet.types';

export interface UseWalletReturn {
  wallet: WalletData | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  parsedBalance: number;
  parsedAvailable: number;
  parsedHeld: number;
}

/**
 * Custom hook to access and monitor user wallet data with parsed numerical values
 * Real-time updates are automatically synchronized via SocketContext
 */
export const useWallet = (): UseWalletReturn => {
  const {
    data: wallet,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.WALLET.MY_WALLET,
    queryFn: () => walletService.getMyWallet(),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const parsedBalance = Number(wallet?.balance || 0);
  const parsedAvailable = Number(wallet?.availableBalance || 0);
  const parsedHeld = Number(wallet?.heldBalance || 0);

  return {
    wallet,
    isLoading,
    error: error as Error | null,
    refetch,
    parsedBalance: isNaN(parsedBalance) ? 0 : parsedBalance,
    parsedAvailable: isNaN(parsedAvailable) ? 0 : parsedAvailable,
    parsedHeld: isNaN(parsedHeld) ? 0 : parsedHeld,
  };
};
