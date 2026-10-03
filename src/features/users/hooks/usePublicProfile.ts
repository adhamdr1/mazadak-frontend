import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { usersService } from '../services/users.service';
import type { PublicProfile } from '../types/users.types';

export interface UsePublicProfileOptions {
  userId?: string;
  enabled?: boolean;
}

export function usePublicProfile(userIdOrOptions?: string | UsePublicProfileOptions) {
  const userId =
    typeof userIdOrOptions === 'string'
      ? userIdOrOptions
      : userIdOrOptions?.userId;
  const isExplicitEnabled =
    typeof userIdOrOptions === 'object' && userIdOrOptions?.enabled !== undefined
      ? userIdOrOptions.enabled
      : true;

  return useQuery<PublicProfile, Error>({
    queryKey: userId
      ? QUERY_KEYS.USERS.PUBLIC_PROFILE(userId)
      : (['users', 'public', 'none'] as const),
    queryFn: () => usersService.getPublicProfile(userId!),
    enabled: Boolean(userId) && isExplicitEnabled,
    staleTime: 5 * 60 * 1000, // 5 minutes fresh cache
    gcTime: 15 * 60 * 1000,
  });
}
