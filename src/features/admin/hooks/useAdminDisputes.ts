import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { adminService } from '../services/admin.service';
import type { AdminDisputesPageData, DisputeFilterInput } from '../types/admin.types';

export interface UseAdminDisputesOptions {
  page?: number;
  limit?: number;
  filter?: DisputeFilterInput;
}

export const useAdminDisputes = ({
  page = 1,
  limit = 10,
  filter,
}: UseAdminDisputesOptions = {}) => {
  return useQuery<AdminDisputesPageData, Error>({
    queryKey: QUERY_KEYS.ADMIN.DISPUTES(page, limit, filter),
    queryFn: () => adminService.getAllDisputes({ page, limit }, filter),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
};
