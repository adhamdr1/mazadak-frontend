import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/auth.service';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes.constants';
import { getLocalizedErrorMessage, parseAppError } from '@/utils/errorHandler';
import type { LoginFormData, AuthErrorCode } from '../types/auth.types';

export function useLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuth();
  const { t } = useTranslation('auth');

  const [resendSuccess, setResendSuccess] = useState(false);

  // Login Mutation
  const loginMutation = useMutation({
    mutationFn: (formData: LoginFormData) =>
      authService.login({
        email: formData.email,
        password: formData.password,
      }),
    onSuccess: (data) => {
      setAuth(data);
      const redirectPath = (location.state as { from?: { pathname: string } })?.from?.pathname || ROUTES.HOME;
      navigate(redirectPath, { replace: true });
    },
  });

  // Resend Email Verification Mutation (in case user gets EMAIL_NOT_VERIFIED)
  const resendMutation = useMutation({
    mutationFn: (email: string) => authService.resendConfirmationEmail(email),
    onSuccess: () => {
      setResendSuccess(true);
    },
  });

  // Map Backend error code to localized message
  const parsedError = parseAppError(loginMutation.error);
  const localizedError = getLocalizedErrorMessage(loginMutation.error, t, 'auth');

  return {
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoading: loginMutation.isPending,
    error: localizedError,
    errorCode: loginMutation.error ? (parsedError.code as AuthErrorCode) : null,
    resendVerification: (email: string) => resendMutation.mutate(email),
    isResending: resendMutation.isPending,
    resendSuccess,
    resetError: loginMutation.reset,
  };
}
