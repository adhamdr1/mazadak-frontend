import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { adminService } from '../services/admin.service';
import type { AdminUserDetails } from '../types/admin.types';

export const useAdminUserDetails = (userId?: string | null) => {
  return useQuery<AdminUserDetails, Error>({
    queryKey: QUERY_KEYS.ADMIN.USER_DETAILS(userId || ''),
    queryFn: () => {
      if (!userId) throw new Error('User ID is required');
      return adminService.getAdminUserDetails(userId);
    },
    enabled: Boolean(userId),
    staleTime: 1000 * 30, // 30 seconds
  });
};
