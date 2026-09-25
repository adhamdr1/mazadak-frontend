import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/feedback/useToast';
import { escrowService } from '../services/escrow.service';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import type { DisputeStatusChangedPayload } from '../types/escrow.types';

export function useDisputeSubscription(disputeId?: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation(['escrow', 'common']);

  useEffect(() => {
    if (!disputeId) return;

    const token = localStorage.getItem('access_token');
    const unsubscribe = escrowService.subscribeToDisputeStatusChanged(
      disputeId,
      {
        next: (payload: DisputeStatusChangedPayload) => {
          // 1. Invalidate dispute details
          queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.ESCROW.DISPUTE(payload.disputeId),
          });
          queryClient.invalidateQueries({ queryKey: ['myDisputes'] });

          // 2. Invalidate associated escrow
          if (payload.escrowId) {
            queryClient.invalidateQueries({
              queryKey: QUERY_KEYS.ESCROW.DETAIL(payload.escrowId),
            });
          }
          if (payload.auctionId) {
            queryClient.invalidateQueries({
              queryKey: QUERY_KEYS.ESCROW.BY_AUCTION(payload.auctionId),
            });
          }
          queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.ESCROW.MY_ESCROWS,
          });

          // 3. User feedback
          toast.info(
            t('disputeDetail.statusUpdatedRealtime', {
              status: t(`disputeStatus.${payload.status}`, payload.status),
              defaultValue: `تم تحديث حالة النزاع: ${payload.status}`,
            })
          );
        },
        error: (err) => {
          console.warn('[useDisputeSubscription] WebSocket error:', err);
        },
      },
      token
    );

    return () => {
      unsubscribe();
    };
  }, [disputeId, queryClient, t, toast]);
}

