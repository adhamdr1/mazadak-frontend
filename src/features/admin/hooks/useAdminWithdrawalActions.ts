import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/feedback/useToast';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { adminService } from '../services/admin.service';
import type {
  AdminCompleteWithdrawalInput,
  AdminRejectWithdrawalInput,
} from '../types/admin.types';

export const useAdminWithdrawalActions = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation(['admin', 'common']);

  // 1. Start Processing Mutation
  const startProcessingMutation = useMutation({
    mutationFn: (requestId: string) => adminService.startWithdrawalProcessing(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.WITHDRAWALS_ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.TREASURY });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.STATS });
      toast.success(
        t('financials.withdrawals.startProcessingSuccess', {
          defaultValue: 'تم بدء معالجة طلب السحب بنجاح وقفله للتدقيق المصرفي',
        })
      );
    },
    onError: (err: Error) => {
      toast.error(err.message || t('common.error', { defaultValue: 'حدث خطأ أثناء معالجة الطلب' }));
    },
  });

  // 2. Complete Withdrawal Mutation
  const completeWithdrawalMutation = useMutation({
    mutationFn: (input: AdminCompleteWithdrawalInput) => adminService.completeWithdrawal(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.WITHDRAWALS_ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.TREASURY });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.STATS });
      toast.success(
        t('financials.withdrawals.completeModal.successMessage', {
          defaultValue: 'تم إتمام عملية السحب وتحديث السجل بنجاح.',
        })
      );
    },
    onError: (err: Error) => {
      toast.error(err.message || t('common.error', { defaultValue: 'فشل إتمام السحب' }));
    },
  });

  // 3. Reject Withdrawal Mutation
  const rejectWithdrawalMutation = useMutation({
    mutationFn: (input: AdminRejectWithdrawalInput) => adminService.rejectWithdrawal(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.WITHDRAWALS_ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.TREASURY });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.STATS });
      toast.success(
        t('financials.withdrawals.rejectModal.successMessage', {
          defaultValue: 'تم رفض طلب السحب وإعادة المبلغ للمحفظة.',
        })
      );
    },
    onError: (err: Error) => {
      toast.error(err.message || t('common.error', { defaultValue: 'فشل رفض طلب السحب' }));
    },
  });

  return {
    startProcessing: startProcessingMutation.mutateAsync,
    isStartingProcessing: startProcessingMutation.isPending,

    completeWithdrawal: completeWithdrawalMutation.mutateAsync,
    isCompleting: completeWithdrawalMutation.isPending,

    rejectWithdrawal: rejectWithdrawalMutation.mutateAsync,
    isRejecting: rejectWithdrawalMutation.isPending,
  };
};
