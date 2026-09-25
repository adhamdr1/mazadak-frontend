import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { escrowService } from '../services/escrow.service';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { useToast } from '@/components/feedback/useToast';
import { getLocalizedErrorMessage } from '@/utils/errorHandler';
import type { OpenDisputeInput, DisputeData } from '../types/escrow.types';

export function useOpenDispute() {
  const { t } = useTranslation(['escrow', 'common']);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation<DisputeData, unknown, OpenDisputeInput>({
    mutationFn: (input: OpenDisputeInput) => escrowService.openDispute(input),
    onSuccess: (data) => {
      // 1. Invalidate queries
      if (data.escrowId) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ESCROW.DETAIL(data.escrowId) });
      }
      if (data._id) {
        queryClient.setQueryData(QUERY_KEYS.ESCROW.DISPUTE(data._id), data);
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ESCROW.MY_ESCROWS });
      if (data.auctionId) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUCTIONS.DETAIL(data.auctionId) });
      }

      // 2. Success toast
      toast.success(
        t('escrow:openDispute.submitSuccess', 'تم فتح النزاع المالي بنجاح وإحالته للجنة التحكيم')
      );
    },
    onError: (err) => {
      const message =
        getLocalizedErrorMessage(err, (key) => t(key), 'escrow') ||
        t('escrow:errors.GENERIC_ERROR', 'حدث خطأ أثناء فتح النزاع، يرجى إعادة المحاولة');
      toast.error(message);
    },
  });

  return {
    openDispute: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
