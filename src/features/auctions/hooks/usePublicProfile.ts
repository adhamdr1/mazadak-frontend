import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { auctionsService } from '../services/auctions.service';

export function usePublicProfile(sellerId?: string) {
  return useQuery({
    queryKey: sellerId
      ? QUERY_KEYS.USERS.PUBLIC_PROFILE(sellerId)
      : ['users', 'public', 'none'],
    queryFn: () => auctionsService.getPublicProfile(sellerId!),
    enabled: Boolean(sellerId),
    staleTime: 5 * 60 * 1000, // 5 minutes fresh cache
  });
}
