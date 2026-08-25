import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/auth.service';
import { getLocalizedErrorMessage, parseAppError } from '@/utils/errorHandler';
import type { AuthErrorCode } from '../types/auth.types';

export function useForgotPassword() {
  const { t } = useTranslation('auth');
  const [submittedEmail, setSubmittedEmail] = useState<string>('');

  const mutation = useMutation({
    mutationFn: (email: string) => {
      setSubmittedEmail(email);
      return authService.forgotPassword({ email });
    },
  });

  const parsedError = parseAppError(mutation.error);
  const localizedError = getLocalizedErrorMessage(mutation.error, t, 'auth');

  return {
    sendResetLink: mutation.mutate,
    sendResetLinkAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    submittedEmail,
    error: localizedError,
    errorCode: mutation.error ? (parsedError.code as AuthErrorCode) : null,
    reset: mutation.reset,
  };
}
