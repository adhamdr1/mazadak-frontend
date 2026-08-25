import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/auth.service';
import { getLocalizedErrorMessage, parseAppError } from '@/utils/errorHandler';
import type { AuthErrorCode } from '../types/auth.types';

export function useVerifyEmail() {
  const { t } = useTranslation('auth');

  const mutation = useMutation({
    mutationFn: (token: string) => authService.confirmEmail(token),
  });

  const parsedError = parseAppError(mutation.error);
  const localizedError = getLocalizedErrorMessage(mutation.error, t, 'auth');

  return {
    verifyEmail: mutation.mutate,
    verifyEmailAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: localizedError,
    errorCode: mutation.error ? (parsedError.code as AuthErrorCode) : null,
  };
}
