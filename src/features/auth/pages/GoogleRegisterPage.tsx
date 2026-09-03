import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { GoogleRegisterForm } from '../components/GoogleRegisterForm';
import { ROUTES } from '@/constants/routes.constants';

interface GoogleRegisterLocationState {
  idToken?: string;
  provider?: string;
}

/**
 * GoogleRegisterPage — reached only from useGoogleAuth when
 * backend returns USER_NOT_FOUND_REQUIRE_REGISTRATION.
 *
 * Token is passed securely via in-memory router state (not in URL query parameters).
 */
export const GoogleRegisterPage: React.FC = () => {
  const { t } = useTranslation('auth');
  const location = useLocation();
  const state = location.state as GoogleRegisterLocationState | null;

  const googleToken = state?.idToken || '';

  // If someone navigates to this URL directly without in-memory state token, redirect to normal register
  if (!googleToken) {
    return <Navigate to={ROUTES.REGISTER} replace />;
  }

  return (
    <AuthLayout
      title={t('register.googleFlowTitle')}
      subtitle={t('register.googleFlowSubtitle')}
    >
      <GoogleRegisterForm googleToken={googleToken} />
    </AuthLayout>
  );
};

export default GoogleRegisterPage;
