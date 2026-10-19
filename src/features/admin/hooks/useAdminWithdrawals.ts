import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { adminService } from '../services/admin.service';
import type {
  AdminPaginationInput,
  WithdrawalsFilterInput,
  AdminWithdrawalsPageData,
} from '../types/admin.types';

export const useAdminWithdrawals = (
  pagination: AdminPaginationInput = { page: 1, limit: 10 },
  filter?: WithdrawalsFilterInput
) => {
  return useQuery<AdminWithdrawalsPageData, Error>({
    queryKey: QUERY_KEYS.ADMIN.WITHDRAWALS(pagination.page, pagination.limit, filter),
    queryFn: () => adminService.getAdminWithdrawals(pagination, filter),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30, // 30 seconds
  });
};
