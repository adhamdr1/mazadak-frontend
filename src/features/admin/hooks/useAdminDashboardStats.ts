import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { adminService } from '../services/admin.service';
import type { DashboardStats } from '../types/admin.types';

export const useAdminDashboardStats = () => {
  return useQuery<DashboardStats, Error>({
    queryKey: QUERY_KEYS.ADMIN.STATS,
    queryFn: () => adminService.getDashboardStats(),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true,
  });
};
