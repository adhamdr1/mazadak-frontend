import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/feedback/useToast';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { adminService } from '../services/admin.service';
import { useAuth } from '@/hooks/useAuth';
import type { WithdrawalResponse } from '../types/admin.types';

export interface UseAdminWithdrawalSubscriptionOptions {
  enabled?: boolean;
  onWithdrawalUpdated?: (payload: WithdrawalResponse) => void;
}

export const useAdminWithdrawalSubscription = ({
  enabled = true,
  onWithdrawalUpdated,
}: UseAdminWithdrawalSubscriptionOptions = {}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation(['admin', 'common']);
  const { accessToken } = useAuth();
  const onWithdrawalUpdatedRef = useRef(onWithdrawalUpdated);

  useEffect(() => {
    onWithdrawalUpdatedRef.current = onWithdrawalUpdated;
  }, [onWithdrawalUpdated]);

  useEffect(() => {
    if (!enabled || !accessToken) return;

    const unsubscribe = adminService.subscribeToWithdrawalFeed(
      {
        next: (payload: WithdrawalResponse) => {
          // 1. Invalidate admin queries immediately (0ms)
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.WITHDRAWALS_ALL });
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.TREASURY });
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.STATS });

          // 2. Specific detail query if cached
          if (payload._id) {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.WITHDRAWAL_DETAIL(payload._id) });
          }

          // 3. User feedback toast
          toast.info(t('financials.withdrawals.realtimeFeedNotice'));

          // 4. Custom callback if provided
          if (onWithdrawalUpdatedRef.current) {
            onWithdrawalUpdatedRef.current(payload);
          }
        },
        error: (err) => {
          console.warn('[useAdminWithdrawalSubscription] WebSocket subscription error:', err);
        },
      },
      accessToken
    );

    return () => {
      unsubscribe();
    };
  }, [enabled, accessToken, queryClient, toast, t]);
};
