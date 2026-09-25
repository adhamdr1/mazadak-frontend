import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { escrowService } from '../services/escrow.service';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { useToast } from '@/components/feedback/useToast';
import type { EscrowStatusChangedPayload } from '../types/escrow.types';

export function useEscrowSubscription(escrowId?: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation(['escrow']);
  const activeEscrowIdRef = useRef(escrowId);

  useEffect(() => {
    activeEscrowIdRef.current = escrowId;
  }, [escrowId]);

  useEffect(() => {
    if (!escrowId) return;

    const handleStatusChanged = (payload: EscrowStatusChangedPayload) => {
      // 1. Invalidate caches for this escrow and list
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.ESCROW.DETAIL(payload.escrowId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.ESCROW.MY_ESCROWS,
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.WALLET.MY_WALLET,
      });

      // 2. Localized Toast Announcement
      const statusLabel = t(`status.${payload.status}`, payload.status);
      toast.info(
        t('detail.statusUpdatedRealtime', {
          status: statusLabel,
          defaultValue: `تم تحديث حالة الضمان المالي لحظياً: ${statusLabel}`,
        })
      );
    };

    // 3. Subscribe with mandatory cleanup
    const unsubscribe = escrowService.subscribeToEscrowStatusChanged(escrowId, {
      next: handleStatusChanged,
      error: (err) => {
        // Socket closed or connection failed silently handled
        console.warn('[EscrowSubscription] Connection error:', err);
      },
    });

    return () => {
      unsubscribe();
    };
  }, [escrowId, queryClient, t, toast]);
}
