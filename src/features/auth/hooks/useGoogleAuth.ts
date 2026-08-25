import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/auth.service';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes.constants';
import { getLocalizedErrorMessage, parseAppError } from '@/utils/errorHandler';

export function useGoogleAuth() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const { t } = useTranslation('auth');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSuccess = async (idToken: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.googleLogin({ token: idToken });
      setAuth(response);
      navigate(ROUTES.HOME, { replace: true });
    } catch (err: unknown) {
      const parsed = parseAppError(err);

      if (parsed.code === 'USER_NOT_FOUND_REQUIRE_REGISTRATION') {
        // Redirect to dedicated Google registration page with token
        navigate(`${ROUTES.GOOGLE_REGISTER}?provider=google&token=${encodeURIComponent(idToken)}`);
      } else {
        setError(getLocalizedErrorMessage(err, t, 'auth'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError(t('errors.GENERIC_ERROR'));
  };

  return {
    handleGoogleSuccess,
    handleGoogleError,
    isLoading,
    error,
  };
}
