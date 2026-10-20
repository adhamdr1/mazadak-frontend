import { useEffect } from 'react';
import { useQuery, keepPreviousData, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { adminService } from '../services/admin.service';
import { subscribeToSubscription } from '@/services/websocket/socketClient';
import { useAuth } from '@/hooks/useAuth';
import type { AdminAuctionsPageData, AuctionsFilterInput } from '../types/admin.types';

export interface UseAdminAuctionsOptions {
  page?: number;
  limit?: number;
  filter?: AuctionsFilterInput;
}

export const useAdminAuctions = ({
  page = 1,
  limit = 10,
  filter,
}: UseAdminAuctionsOptions = {}) => {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();

  useEffect(() => {
    if (!accessToken) return;

    // Listen to real-time auction status changes across the platform (ACTIVE / ENDED / CANCELLED)
    const unsubscribeStatus = subscribeToSubscription(
      {
        query: `
          subscription OnAdminAuctionsStatusChanged {
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
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.AUCTIONS_ALL });
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.STATS });
        },
        error: () => {},
      },
      accessToken
    );

    // Listen to new auctions created across the platform
    const unsubscribeCreated = subscribeToSubscription(
      {
        query: `
          subscription OnAdminAuctionsCreated {
            auctionCreated {
              _id
            }
          }
        `,
      },
      {
        next: () => {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.AUCTIONS_ALL });
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.STATS });
        },
        error: () => {},
      },
      accessToken
    );

    return () => {
      unsubscribeStatus();
      unsubscribeCreated();
    };
  }, [accessToken, queryClient]);

  return useQuery<AdminAuctionsPageData, Error>({
    queryKey: QUERY_KEYS.ADMIN.AUCTIONS(page, limit, filter),
    queryFn: () => adminService.getAdminAuctions({ page, limit }, filter),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30, // 30 seconds
  });
};
