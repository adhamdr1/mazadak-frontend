import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/auth.service';
import type { UpdatePasswordInput } from '../types/auth.types';
import { getLocalizedErrorMessage, parseAppError } from '@/utils/errorHandler';

export const useUpdatePassword = () => {
  const { t } = useTranslation('auth');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const updatePassword = async (data: UpdatePasswordInput): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setErrorCode(null);
    setIsSuccess(false);

    try {
      const result = await authService.updatePassword(data);
      setIsSuccess(true);
      return result;
    } catch (err: unknown) {
      const parsed = parseAppError(err);
      setErrorCode(parsed.code);
      const message = getLocalizedErrorMessage(err, t, 'auth');
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updatePassword,
    isLoading,
    isSuccess,
    error,
    errorCode,
    reset: () => {
      setError(null);
      setErrorCode(null);
      setIsSuccess(false);
    },
  };
};
