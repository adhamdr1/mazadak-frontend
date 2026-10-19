import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/auth.service';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes.constants';
import {
  getLocalizedErrorMessage,
  parseAppError,
  resolveCanonicalErrorCode,
} from '@/utils/errorHandler';

export function useGoogleAuth() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const { t } = useTranslation('auth');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const handleGoogleSuccess = async (idToken: string) => {
    setIsLoading(true);
    setError(null);
    setErrorCode(null);
    try {
      const response = await authService.googleLogin({ token: idToken });
      setAuth(response);

      // Strictly block and redirect banned accounts
      if (response.user.isBanned) {
        navigate(ROUTES.BANNED, { replace: true });
        return;
      }

      const redirectPath = response.user.role === 'ADMIN' ? ROUTES.ADMIN.DASHBOARD : ROUTES.HOME;
      navigate(redirectPath, { replace: true });
    } catch (err: unknown) {
      const parsed = parseAppError(err);
      const rawCode = parsed.code || '';

      if (rawCode === 'USER_NOT_FOUND_REQUIRE_REGISTRATION') {
        // Redirect to dedicated Google registration page with token in memory state
        navigate(ROUTES.GOOGLE_REGISTER, {
          state: { idToken, provider: 'google' },
          replace: true,
        });
      } else {
        const canonical =
          resolveCanonicalErrorCode(parsed.message) || resolveCanonicalErrorCode(rawCode) || rawCode;
        setErrorCode(canonical);
        setError(getLocalizedErrorMessage(err, t, 'auth'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError(t('errors.GENERIC_ERROR'));
    setErrorCode(null);
  };

  return {
    handleGoogleSuccess,
    handleGoogleError,
    isLoading,
    error,
    errorCode,
  };
}
