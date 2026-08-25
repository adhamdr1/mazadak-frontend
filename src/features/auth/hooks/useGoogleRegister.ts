import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/auth.service';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes.constants';
import { getLocalizedErrorMessage, parseAppError } from '@/utils/errorHandler';
import type { GoogleRegisterInput, AuthErrorCode } from '../types/auth.types';

/** Google-only registration input used by the form component */
export interface GoogleRegisterFormInput {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  city: string;
  street: string;
}

export function useGoogleRegister() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const { t } = useTranslation('auth');

  const mutation = useMutation({
    mutationFn: (args: { formData: GoogleRegisterFormInput; googleToken: string }) => {
      const input: GoogleRegisterInput = {
        token: args.googleToken,
        firstName: args.formData.firstName,
        lastName: args.formData.lastName,
        phoneNumber: args.formData.phoneNumber,
        dateOfBirth: new Date(args.formData.dateOfBirth).toISOString(),
        address: {
          city: args.formData.city,
          street: args.formData.street,
        },
      };
      return authService.googleRegister(input);
    },
    onSuccess: (authResponse) => {
      setAuth(authResponse);
      navigate(ROUTES.HOME, { replace: true });
    },
  });

  const parsedError = parseAppError(mutation.error);
  const localizedError = getLocalizedErrorMessage(mutation.error, t, 'auth');

  return {
    googleRegister: mutation.mutate,
    isLoading: mutation.isPending,
    error: localizedError,
    errorCode: mutation.error ? (parsedError.code as AuthErrorCode) : null,
    resetError: mutation.reset,
  };
}
