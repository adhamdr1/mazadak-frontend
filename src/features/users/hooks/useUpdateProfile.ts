import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { usersService } from '../services/users.service';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/feedback/useToast';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import type { UpdateUserInput, FullUser } from '../types/users.types';
import type { User } from '@/features/auth/types/auth.types';

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { setUser } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation('users');

  return useMutation<FullUser, Error, UpdateUserInput>({
    mutationFn: (input: UpdateUserInput) => usersService.updateProfile(input),
    onSuccess: (updatedUser) => {
      // 1. Immediately update AuthContext (0ms instant sync across Navbar & Drawer)
      setUser(updatedUser as unknown as User);

      // 2. Set TanStack Query Auth Me cache
      queryClient.setQueryData(QUERY_KEYS.AUTH.ME, updatedUser);

      // 3. Invalidate public profile query
      if (updatedUser._id) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.USERS.PUBLIC_PROFILE(updatedUser._id),
        });
      }

      // 4. Toast notification
      toast.success(t('personal.updateSuccess', 'تم تحديث بياناتك الشخصية بنجاح!'));
    },
    onError: (err) => {
      toast.error(
        err.message || t('personal.updateError', 'فشل تحديث البيانات، يرجى المحاولة مرة أخرى.')
      );
    },
  });
}
