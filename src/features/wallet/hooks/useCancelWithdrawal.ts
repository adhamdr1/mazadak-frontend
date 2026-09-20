import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { walletService } from '../services/wallet.service';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { useToast } from '@/components/feedback/useToast';
import { getLocalizedErrorMessage } from '@/utils/errorHandler';
import type { WithdrawalStatus } from '../types/wallet.types';

export interface UseCancelWithdrawalReturn {
  cancelWithdrawal: (id: string) => Promise<{ _id: string; status: WithdrawalStatus }>;
  isPending: boolean;
  error: string | null;
  reset: () => void;
}

export const useCancelWithdrawal = (): UseCancelWithdrawalReturn => {
  const { t } = useTranslation(['wallet']);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      return walletService.cancelWithdrawal(id);
    },
    onSuccess: () => {
      // 1. Invalidate withdrawals list queries
      queryClient.invalidateQueries({ queryKey: ['wallet', 'withdrawals'] });

      // 2. Invalidate wallet balance so heldBalance drops and availableBalance increases immediately
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WALLET.MY_WALLET });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });

      toast.success(
        t(
          'wallet:withdrawals.toast.cancelSuccess',
          'تم إلغاء طلب السحب بنجاح وفك حجز المبلغ وإعادته لرصيدك المتاح'
        )
      );
    },
    onError: (err: unknown) => {
      const rawMessage = err instanceof Error ? err.message : String(err);
      const isNotCancellable =
        rawMessage.includes('WITHDRAWAL_NOT_CANCELLABLE') ||
        rawMessage.toLowerCase().includes('not cancellable');

      if (isNotCancellable) {
        toast.error(
          t(
            'wallet:withdrawals.toast.notCancellable',
            'لا يمكن إلغاء هذا الطلب لأنه قيد التنفيذ أو تم إتمامه بالفعل'
          )
        );
        // Refresh withdrawals list to show updated status (e.g. PROCESSING)
        queryClient.invalidateQueries({ queryKey: ['wallet', 'withdrawals'] });
        return;
      }

      const message =
        getLocalizedErrorMessage(err, t, 'wallet') ||
        t('wallet:withdrawals.toast.cancelError', 'تعذر إلغاء طلب السحب');
      toast.error(message);
    },
  });

  const cancelWithdrawal = useCallback(
    async (id: string) => {
      return mutation.mutateAsync(id);
    },
    [mutation]
  );

  return {
    cancelWithdrawal,
    isPending: mutation.isPending,
    error: mutation.error ? getLocalizedErrorMessage(mutation.error, t, 'wallet') : null,
    reset: mutation.reset,
  };
};
