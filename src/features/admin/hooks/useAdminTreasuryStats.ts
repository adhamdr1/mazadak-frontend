import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { adminService } from '../services/admin.service';
import type { TreasuryStats } from '../types/admin.types';

export const useAdminTreasuryStats = () => {
  return useQuery<TreasuryStats, Error>({
    queryKey: QUERY_KEYS.ADMIN.TREASURY,
    queryFn: () => adminService.getTreasuryStats(),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true,
  });
};
