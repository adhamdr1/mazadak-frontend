import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/auth.service';
import { ROUTES } from '@/constants/routes.constants';
import { getLocalizedErrorMessage, parseAppError } from '@/utils/errorHandler';
import type { RegisterFormData, AuthErrorCode } from '../types/auth.types';

export function useRegister() {
  const navigate = useNavigate();
  const { t } = useTranslation('auth');

  const mutation = useMutation({
    mutationFn: (formData: RegisterFormData) =>
      authService.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
        address: {
          city: formData.city,
          street: formData.street,
        },
      }),
    onSuccess: (_, variables) => {
      navigate(ROUTES.VERIFY_NOTICE, {
        state: { email: variables.email },
        replace: true,
      });
    },
  });

  const parsedError = parseAppError(mutation.error);
  const localizedError = getLocalizedErrorMessage(mutation.error, t, 'auth');

  return {
    register: mutation.mutate,
    isLoading: mutation.isPending,
    error: localizedError,
    errorCode: mutation.error ? (parsedError.code as AuthErrorCode) : null,
    resetError: mutation.reset,
  };
}
