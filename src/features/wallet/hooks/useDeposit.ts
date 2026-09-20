import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { walletService } from '../services/wallet.service';
import type { InitializePaymentResponse } from '../types/wallet.types';
import { useToast } from '@/components/feedback/useToast';
import { getLocalizedErrorMessage } from '@/utils/errorHandler';

export interface UseDepositReturn {
  deposit: (amountInEgp: number) => Promise<InitializePaymentResponse>;
  isPending: boolean;
  isRedirecting: boolean;
  error: string | null;
  rawError: unknown;
  reset: () => void;
}

export const useDeposit = (): UseDepositReturn => {
  const { t } = useTranslation(['wallet']);
  const { toast } = useToast();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const mutation = useMutation({
    mutationFn: async (amountInEgp: number): Promise<InitializePaymentResponse> => {
      return walletService.initializePayment(amountInEgp);
    },
    onSuccess: (data) => {
      if (data.paymentUrl) {
        setIsRedirecting(true);
        // Redirect client browser directly to Paymob Unified Checkout
        window.location.href = data.paymentUrl;
      } else {
        toast.error(t('wallet:deposit.errorNoUrl', 'فشل في الحصول على رابط الدفع من البوابة'));
      }
    },
    onError: (err: unknown) => {
      const message =
        getLocalizedErrorMessage(err, t, 'wallet') ||
        t('wallet:deposit.errorGeneric', 'تعذر بدء عملية الدفع، يرجى المحاولة مرة أخرى');
      toast.error(message);
    },
  });

  const deposit = useCallback(
    async (amountInEgp: number) => {
      return mutation.mutateAsync(amountInEgp);
    },
    [mutation]
  );

  return {
    deposit,
    isPending: mutation.isPending,
    isRedirecting,
    error: mutation.error ? getLocalizedErrorMessage(mutation.error, t, 'wallet') : null,
    rawError: mutation.error,
    reset: mutation.reset,
  };
};
