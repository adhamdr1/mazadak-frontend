import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { adminService } from '../services/admin.service';
import type { AdminEscrowsPageData, EscrowFilterInput } from '../types/admin.types';

export interface UseAdminEscrowsOptions {
  page?: number;
  limit?: number;
  filter?: EscrowFilterInput;
}

export const useAdminEscrows = ({
  page = 1,
  limit = 10,
  filter,
}: UseAdminEscrowsOptions = {}) => {
  return useQuery<AdminEscrowsPageData, Error>({
    queryKey: QUERY_KEYS.ADMIN.ESCROWS(page, limit, filter),
    queryFn: () => adminService.getAllEscrows({ page, limit }, filter),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
};
