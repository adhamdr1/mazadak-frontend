import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/auth.service';
import { getLocalizedErrorMessage, parseAppError } from '@/utils/errorHandler';
import type { AuthErrorCode } from '../types/auth.types';

export function useReactivate() {
  const { t } = useTranslation('auth');
  const [requestedEmail, setRequestedEmail] = useState<string>('');

  const requestMutation = useMutation({
    mutationFn: (email: string) => {
      setRequestedEmail(email);
      return authService.requestReactivation(email);
    },
  });

  const confirmMutation = useMutation({
    mutationFn: (token: string) => authService.confirmReactivation(token),
  });

  const activeError = requestMutation.error || confirmMutation.error;
  const parsedError = parseAppError(activeError);
  const localizedError = getLocalizedErrorMessage(activeError, t, 'auth');

  return {
    requestReactivation: requestMutation.mutate,
    isRequesting: requestMutation.isPending,
    isRequestSuccess: requestMutation.isSuccess,
    requestedEmail,

    confirmReactivation: confirmMutation.mutate,
    isConfirming: confirmMutation.isPending,
    isConfirmSuccess: confirmMutation.isSuccess,

    error: localizedError,
    errorCode: activeError ? (parsedError.code as AuthErrorCode) : null,
  };
}
