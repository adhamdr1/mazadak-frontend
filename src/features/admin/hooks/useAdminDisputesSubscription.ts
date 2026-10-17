import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/feedback/useToast';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { adminService } from '../services/admin.service';
import { authStorage } from '@/utils/storage.utils';
import type { DisputeStatusChangedPayload } from '@/features/escrow/types/escrow.types';

export interface UseAdminDisputesSubscriptionOptions {
  enabled?: boolean;
  onDisputeUpdated?: (payload: DisputeStatusChangedPayload) => void;
}

export const useAdminDisputesSubscription = ({
  enabled = true,
  onDisputeUpdated,
}: UseAdminDisputesSubscriptionOptions = {}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation(['admin', 'common']);
  const onDisputeUpdatedRef = useRef(onDisputeUpdated);

  useEffect(() => {
    onDisputeUpdatedRef.current = onDisputeUpdated;
  }, [onDisputeUpdated]);

  useEffect(() => {
    if (!enabled) return;

    const token = authStorage.getAccessToken();

    const unsubscribe = adminService.subscribeToDisputeStatusChanged(
      {
        next: (payload: DisputeStatusChangedPayload) => {
          // 1. Invalidate admin queries
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.DISPUTES_ALL });
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.ESCROWS_ALL });
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.STATS });
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.TREASURY });

          // 2. Invalidate specific entities if cached
          if (payload.disputeId) {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ESCROW.DISPUTE(payload.disputeId) });
          }
          if (payload.escrowId) {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ESCROW.DETAIL(payload.escrowId) });
          }
          if (payload.auctionId) {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ESCROW.BY_AUCTION(payload.auctionId) });
          }

          // 3. User feedback
          toast.info(
            t('disputes.realtimeUpdate', {
              defaultValue: 'تم تحديث حالة نزاع في النظام بشكل لحظي',
            })
          );

          // 4. Custom callback if provided
          if (onDisputeUpdatedRef.current) {
            onDisputeUpdatedRef.current(payload);
          }
        },
        error: (err) => {
          console.warn('[useAdminDisputesSubscription] WebSocket subscription error:', err);
        },
      },
      token
    );

    return () => {
      unsubscribe();
    };
  }, [enabled, queryClient, toast, t]);
};
