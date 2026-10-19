import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { adminService } from '../services/admin.service';
import type {
  AdminPaginationInput,
  TransactionsFilterInput,
  AdminTransactionsPageData,
} from '../types/admin.types';

export const useAdminTransactions = (
  pagination: AdminPaginationInput = { page: 1, limit: 10 },
  filter?: TransactionsFilterInput
) => {
  return useQuery<AdminTransactionsPageData, Error>({
    queryKey: QUERY_KEYS.ADMIN.TRANSACTIONS(pagination.page, pagination.limit, filter),
    queryFn: () => adminService.getTransactions(pagination, filter),
    staleTime: 1000 * 30, // 30 seconds
  });
};
