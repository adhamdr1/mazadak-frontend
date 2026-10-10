import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { adminService } from '../services/admin.service';
import type { AdminUsersPageData, UsersFilterInput } from '../types/admin.types';

export interface UseAdminUsersOptions {
  page?: number;
  limit?: number;
  filter?: UsersFilterInput;
}

export const useAdminUsers = ({ page = 1, limit = 10, filter }: UseAdminUsersOptions = {}) => {
  return useQuery<AdminUsersPageData, Error>({
    queryKey: QUERY_KEYS.ADMIN.USERS(page, limit, filter),
    queryFn: () => adminService.getAdminUsers({ page, limit }, filter),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30, // 30 seconds
  });
};
