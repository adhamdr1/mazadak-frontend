import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { usersService } from '../services/users.service';
import type { UserAuctionsPage } from '../types/users.types';
import type { AuctionStatus } from '@/features/auctions/types/auctions.types';

export interface UseUserAuctionsOptions {
  userId?: string;
  page?: number;
  limit?: number;
  status?: AuctionStatus;
  enabled?: boolean;
}

export function useUserAuctions({
  userId,
  page = 1,
  limit = 10,
  status,
  enabled = true,
}: UseUserAuctionsOptions) {
  const filter = status ? { status } : undefined;

  return useQuery<UserAuctionsPage, Error>({
    queryKey: userId
      ? QUERY_KEYS.USERS.USER_AUCTIONS(userId, page, limit, filter)
      : (['users', 'auctions', 'none'] as const),
    queryFn: () =>
      usersService.getUserAuctions(
        userId!,
        { page, limit },
        filter
      ),
    enabled: Boolean(userId) && enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes fresh cache
    gcTime: 10 * 60 * 1000,
  });
}
