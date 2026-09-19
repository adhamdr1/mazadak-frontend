import { useState, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { walletService } from '../services/wallet.service';
import type { PayoutMethod, WithdrawalFeePreview } from '../types/wallet.types';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';

interface UseFeePreviewProps {
  amount: number;
  payoutMethod?: PayoutMethod | null;
  debounceMs?: number;
}

export const useFeePreview = ({
  amount,
  payoutMethod,
  debounceMs = 300,
}: UseFeePreviewProps) => {
  const [debouncedAmount, setDebouncedAmount] = useState<number>(amount);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedAmount(amount);
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [amount, debounceMs]);

  const isValidInput =
    typeof debouncedAmount === 'number' &&
    !isNaN(debouncedAmount) &&
    debouncedAmount >= 50 &&
    Boolean(payoutMethod);

  const {
    data: feePreview,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery<WithdrawalFeePreview, Error>({
    queryKey: QUERY_KEYS.WALLET.FEE_PREVIEW(debouncedAmount, payoutMethod || ''),
    queryFn: () => {
      if (!payoutMethod) throw new Error('Payout method is required');
      return walletService.getWithdrawalFeePreview(debouncedAmount, payoutMethod);
    },
    enabled: isValidInput,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    feePreview,
    isLoading: isLoading && !feePreview,
    isFetching,
    isError,
    error,
    refetch,
  };
};
