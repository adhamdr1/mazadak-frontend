import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/auth.service';
import { getLocalizedErrorMessage, parseAppError } from '@/utils/errorHandler';
import type { ResetPasswordInput, AuthErrorCode } from '../types/auth.types';

export function useResetPassword() {
  const { t } = useTranslation('auth');

  const mutation = useMutation({
    mutationFn: (input: ResetPasswordInput) => authService.resetPassword(input),
  });

  const parsedError = parseAppError(mutation.error);
  const localizedError = getLocalizedErrorMessage(mutation.error, t, 'auth');

  return {
    resetPassword: mutation.mutate,
    resetPasswordAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: localizedError,
    errorCode: mutation.error ? (parsedError.code as AuthErrorCode) : null,
    reset: mutation.reset,
  };
}
