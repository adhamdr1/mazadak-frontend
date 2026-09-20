import { useEffect, useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { walletService } from '../services/wallet.service';
import { useAuth } from '@/hooks/useAuth';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import type {
  WithdrawalResponse,
  WithdrawalsPageData,
} from '../types/wallet.types';

export interface UseWithdrawalSubscriptionOptions {
  enabled?: boolean;
  onUpdate?: (updated: Partial<WithdrawalResponse>) => void;
}

export const useWithdrawalSubscription = ({
  enabled = true,
  onUpdate,
}: UseWithdrawalSubscriptionOptions = {}) => {
  const queryClient = useQueryClient();
  const { accessToken, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    if (!enabled || !isAuthenticated) {
      setIsConnected(false);
      return;
    }

    let isSubscribed = true;

    try {
      const unsubscribe = walletService.subscribeToMyWithdrawalUpdated(
        {
          next: ({ myWithdrawalUpdated }) => {
            if (!isSubscribed || !myWithdrawalUpdated?._id) return;

            const updated = myWithdrawalUpdated;

            // 1. Deep Partial Merge into all active withdrawals list queries
            queryClient.setQueriesData<WithdrawalsPageData>(
              { queryKey: ['wallet', 'withdrawals'] },
              (oldData) => {
                if (!oldData || !Array.isArray(oldData.items)) return oldData;

                return {
                  ...oldData,
                  items: oldData.items.map((item) => {
                    if (item._id !== updated._id) return item;

                    return {
                      ...item,
                      status: updated.status ?? item.status,
                      rejectionReason:
                        updated.rejectionReason !== undefined
                          ? updated.rejectionReason
                          : item.rejectionReason,
                      receiptUrl:
                        updated.receiptUrl !== undefined
                          ? updated.receiptUrl
                          : item.receiptUrl,
                      adminReference:
                        updated.adminReference !== undefined
                          ? updated.adminReference
                          : item.adminReference,
                      completedAt:
                        updated.completedAt !== undefined
                          ? updated.completedAt
                          : item.completedAt,
                    };
                  }),
                };
              }
            );

            // 2. Update specific single withdrawal detail query if present in cache
            if (updated._id) {
              queryClient.setQueryData<WithdrawalResponse>(
                QUERY_KEYS.WALLET.WITHDRAWAL_DETAIL(updated._id),
                (oldItem) => {
                  if (!oldItem) return oldItem;
                  return {
                    ...oldItem,
                    status: updated.status ?? oldItem.status,
                    rejectionReason:
                      updated.rejectionReason !== undefined
                        ? updated.rejectionReason
                        : oldItem.rejectionReason,
                    receiptUrl:
                      updated.receiptUrl !== undefined
                        ? updated.receiptUrl
                        : oldItem.receiptUrl,
                    adminReference:
                      updated.adminReference !== undefined
                        ? updated.adminReference
                        : oldItem.adminReference,
                    completedAt:
                      updated.completedAt !== undefined
                        ? updated.completedAt
                        : oldItem.completedAt,
                  };
                }
              );
            }

            // 3. Invalidate wallet balance so heldBalance and availableBalance update immediately
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WALLET.MY_WALLET });
            queryClient.invalidateQueries({ queryKey: ['wallet'] });

            // 4. Fire optional callback
            onUpdateRef.current?.(updated);
          },
          error: (err) => {
            console.warn('Withdrawal WebSocket subscription error:', err);
            setIsConnected(false);
          },
          complete: () => {
            setIsConnected(false);
          },
        },
        accessToken
      );

      setIsConnected(true);

      return () => {
        isSubscribed = false;
        setIsConnected(false);
        try {
          unsubscribe();
        } catch (e) {
          console.warn('Error unsubscribing from withdrawal updates:', e);
        }
      };
    } catch (err) {
      console.warn('Failed to establish withdrawal subscription:', err);
      setIsConnected(false);
    }
  }, [enabled, isAuthenticated, queryClient, accessToken]);

  return { isConnected };
};
