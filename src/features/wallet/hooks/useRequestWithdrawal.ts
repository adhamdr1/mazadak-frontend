import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { walletService } from '../services/wallet.service';
import type { RequestWithdrawalInput, WithdrawalResponse } from '../types/wallet.types';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { ROUTES } from '@/constants/routes.constants';
import { useToast } from '@/components/feedback/useToast';
import { getLocalizedErrorMessage } from '@/utils/errorHandler';

export interface UseRequestWithdrawalReturn {
  requestWithdrawal: (input: RequestWithdrawalInput) => Promise<WithdrawalResponse>;
  isPending: boolean;
  isSuccess: boolean;
  error: string | null;
  rawError: unknown;
  reset: () => void;
}

export const useRequestWithdrawal = (): UseRequestWithdrawalReturn => {
  const { t } = useTranslation(['wallet']);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (input: RequestWithdrawalInput): Promise<WithdrawalResponse> => {
      return walletService.requestWithdrawal(input);
    },
    onSuccess: () => {
      // Invalidate wallet overview to update available and held balances
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WALLET.MY_WALLET });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });

      toast.success(
        t(
          'wallet:withdraw.successToast',
          'تم تسجيل طلب السحب بنجاح وحجز المبلغ لحين تنفيذ التحويل'
        )
      );

      // Redirect to withdrawals tracking list
      navigate(ROUTES.WALLET_WITHDRAWALS);
    },
    onError: (err: unknown) => {
      const message =
        getLocalizedErrorMessage(err, t, 'wallet') ||
        t('wallet:withdraw.errorGeneric', 'تعذر تسجيل طلب السحب، يرجى المحاولة مرة أخرى');
      toast.error(message);
    },
  });

  const requestWithdrawal = useCallback(
    async (input: RequestWithdrawalInput) => {
      return mutation.mutateAsync(input);
    },
    [mutation]
  );

  return {
    requestWithdrawal,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error ? getLocalizedErrorMessage(mutation.error, t, 'wallet') : null,
    rawError: mutation.error,
    reset: mutation.reset,
  };
};
