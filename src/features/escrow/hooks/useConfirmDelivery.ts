import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { escrowService } from '../services/escrow.service';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { useToast } from '@/components/feedback/useToast';
import { getLocalizedErrorMessage } from '@/utils/errorHandler';
import type { EscrowData } from '../types/escrow.types';

export function useConfirmDelivery() {
  const { t } = useTranslation(['escrow', 'common']);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation<EscrowData, unknown, string>({
    mutationFn: (escrowId: string) => escrowService.confirmDelivery(escrowId),
    onSuccess: (data) => {
      // 1. Invalidate Escrow Queries
      queryClient.setQueryData(QUERY_KEYS.ESCROW.DETAIL(data._id), data);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ESCROW.MY_ESCROWS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WALLET.MY_WALLET });
      if (data.auctionId) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUCTIONS.DETAIL(data.auctionId) });
      }

      // 2. Toast success
      toast.success(
        t('escrow:detail.confirmDeliverySuccess', 'تم تأكيد الاستلام بنجاح وتحرير المبلغ للبائع')
      );
    },
    onError: (err) => {
      const message =
        getLocalizedErrorMessage(err, (key) => t(key), 'escrow') ||
        t('escrow:errors.GENERIC_ERROR', 'حدث خطأ أثناء تأكيد الاستلام');
      toast.error(message);
    },
  });

  return {
    confirmDelivery: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
