import React from 'react';
import { useTranslation } from 'react-i18next';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { LoginForm } from '../components/LoginForm';
import { useLogin } from '../hooks/useLogin';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation('auth');
  const {
    login,
    isLoading,
    error,
    errorCode,
    resendVerification,
    isResending,
    resendSuccess,
  } = useLogin();

  return (
    <AuthLayout title={t('login.title')} subtitle={t('login.subtitle')}>
      <LoginForm
        onSubmit={login}
        isLoading={isLoading}
        error={error}
        errorCode={errorCode}
        resendVerification={resendVerification}
        isResending={isResending}
        resendSuccess={resendSuccess}
      />
    </AuthLayout>
  );
};

export default LoginPage;
