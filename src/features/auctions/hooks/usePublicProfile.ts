import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { usersService } from '@/features/users';

export function usePublicProfile(sellerId?: string) {
  return useQuery({
    queryKey: sellerId
      ? QUERY_KEYS.USERS.PUBLIC_PROFILE(sellerId)
      : ['users', 'public', 'none'],
    queryFn: () => usersService.getPublicProfile(sellerId!),
    enabled: Boolean(sellerId),
    staleTime: 5 * 60 * 1000, // 5 minutes fresh cache
  });
}
