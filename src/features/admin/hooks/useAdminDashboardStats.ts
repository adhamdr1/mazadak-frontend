import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { adminService } from '../services/admin.service';
import { subscribeToSubscription } from '@/services/websocket/socketClient';
import { authStorage } from '@/utils/storage.utils';
import type { DashboardStats } from '../types/admin.types';

export const useAdminDashboardStats = () => {
  const queryClient = useQueryClient();

  // 1. Real-time updates via WebSocket subscriptions for live platform events
  useEffect(() => {
    // A. Listen to incoming withdrawal requests across the platform
    const unsubscribeWithdrawals = subscribeToSubscription(
      {
        query: `
          subscription OnAdminWithdrawalFeed {
            adminWithdrawalFeed {
              _id
              userId
              amount
              netAmount
              fee
              payoutMethod
              status
              createdAt
            }
          }
        `,
      },
      {
        next: () => {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.STATS });
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.TREASURY });
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.WITHDRAWALS_ALL });
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.TRANSACTIONS_ALL });
        },
        error: () => {},
      },
      authStorage.getAccessToken()
    );

    // B. Listen to new auctions created across the platform
    const unsubscribeAuctions = subscribeToSubscription(
      {
        query: `
          subscription OnAdminAuctionCreated {
            auctionCreated {
              _id
            }
          }
        `,
      },
      {
        next: () => {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.STATS });
        },
        error: () => {},
      },
      authStorage.getAccessToken()
    );

    // C. Listen to wallet balance updates for platform liquidity synchronization
    const unsubscribeWallet = subscribeToSubscription(
      {
        query: `
          subscription OnAdminWalletUpdated {
            walletUpdated {
              _id
              balance
              heldBalance
            }
          }
        `,
      },
      {
        next: () => {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.STATS });
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.TREASURY });
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.TRANSACTIONS_ALL });
        },
        error: () => {},
      },
      authStorage.getAccessToken()
    );

    // D. Listen to auction status changes across the platform (ACTIVE / ENDED / CANCELLED)
    const unsubscribeAuctionStatus = subscribeToSubscription(
      {
        query: `
          subscription OnAdminAuctionStatusChanged {
            auctionStatusChanged {
              auction {
                _id
                status
              }
            }
          }
        `,
      },
      {
        next: () => {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.STATS });
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.AUCTIONS_ALL });
        },
        error: () => {},
      },
      authStorage.getAccessToken()
    );

    return () => {
      unsubscribeWithdrawals();
      unsubscribeAuctions();
      unsubscribeWallet();
      unsubscribeAuctionStatus();
    };
  }, [queryClient]);

  return useQuery<DashboardStats, Error>({
    queryKey: QUERY_KEYS.ADMIN.STATS,
    queryFn: () => adminService.getDashboardStats(),
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: true,
  });
};
