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
      toast.success(t('financials.withdrawals.startProcessingSuccess'));
    },
    onError: (err: Error) => {
      toast.error(err.message || t('common:error'));
    },
  });

  // 2. Complete Withdrawal Mutation
  const completeWithdrawalMutation = useMutation({
    mutationFn: (input: AdminCompleteWithdrawalInput) => adminService.completeWithdrawal(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.WITHDRAWALS_ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.TREASURY });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.STATS });
      toast.success(t('financials.withdrawals.completeModal.successMessage'));
    },
    onError: (err: Error) => {
      toast.error(err.message || t('common:error'));
    },
  });

  // 3. Reject Withdrawal Mutation
  const rejectWithdrawalMutation = useMutation({
    mutationFn: (input: AdminRejectWithdrawalInput) => adminService.rejectWithdrawal(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.WITHDRAWALS_ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.TREASURY });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.STATS });
      toast.success(t('financials.withdrawals.rejectModal.successMessage'));
    },
    onError: (err: Error) => {
      toast.error(err.message || t('common:error'));
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
