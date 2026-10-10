import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { adminService } from '../services/admin.service';

export const useAdminToggleBan = () => {
  const queryClient = useQueryClient();

  return useMutation<{ _id: string; isBanned: boolean }, Error, string>({
    mutationFn: (userId: string) => adminService.toggleUserBan(userId),
    onSuccess: (_data, userId) => {
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.USERS_ALL });
      // Invalidate specific user details
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.USER_DETAILS(userId) });
      // Invalidate dashboard stats
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.STATS });
    },
  });
};
