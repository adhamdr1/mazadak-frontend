import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/feedback/useToast';
import { escrowService } from '../services/escrow.service';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { getLocalizedErrorMessage } from '@/utils/errorHandler';
import type { DisputeData } from '../types/escrow.types';

export function useCancelDispute() {
  const { t } = useTranslation(['escrow', 'common']);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation<DisputeData, Error, string>({
    mutationFn: async (disputeId: string) => {
      return await escrowService.cancelDispute(disputeId);
    },
    onSuccess: (data) => {
      toast.success(
        t(
          'cancelDisputeModal.cancelSuccess',
          'تم إلغاء النزاع المالي بنجاح وإعادة المعاملة لحالتها الطبيعية'
        )
      );

      // Invalidate relevant caches
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ESCROW.DISPUTE(data._id) });
      queryClient.invalidateQueries({ queryKey: ['myDisputes'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ESCROW.MY_ESCROWS });

      if (data.escrowId) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ESCROW.DETAIL(data.escrowId) });
      }
      if (data.auctionId) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ESCROW.BY_AUCTION(data.auctionId) });
      }
    },
    onError: (error) => {
      const message =
        getLocalizedErrorMessage(error, (key) => t(key), 'escrow') ||
        t('errors.GENERIC_ERROR', 'حدث خطأ أثناء إلغاء النزاع');
      toast.error(message);
    },
  });

  return {
    cancelDispute: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
