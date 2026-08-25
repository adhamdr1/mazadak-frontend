import React from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { GoogleRegisterForm } from '../components/GoogleRegisterForm';
import { ROUTES } from '@/constants/routes.constants';

/**
 * GoogleRegisterPage — reached only from useGoogleAuth when
 * backend returns USER_NOT_FOUND_REQUIRE_REGISTRATION.
 *
 * URL: /register?provider=google&token=<Google ID Token JWT>
 */
export const GoogleRegisterPage: React.FC = () => {
  const { t } = useTranslation('auth');
  const [searchParams] = useSearchParams();

  const googleToken = searchParams.get('token') || '';

  // If someone navigates to this URL directly without a token, redirect to normal register
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
