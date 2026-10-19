import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { adminService } from '../services/admin.service';
import type { AdminAdjustBalanceInput, AdminUserDetails } from '../types/admin.types';

export const useAdminAdjustBalance = () => {
  const queryClient = useQueryClient();

  return useMutation<AdminUserDetails['wallet'], Error, AdminAdjustBalanceInput>({
    mutationFn: (input: AdminAdjustBalanceInput) => adminService.adjustUserBalance(input),
    onSuccess: (_data, variables) => {
      // Invalidate target user details
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.USER_DETAILS(variables.userId) });
      // Invalidate overall platform metrics and treasury
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.STATS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.TREASURY });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.TRANSACTIONS_ALL });
    },
  });
};
