import React from 'react';
import { useTranslation } from 'react-i18next';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { RegisterForm } from '../components/RegisterForm';
import { useRegister } from '../hooks/useRegister';

export const RegisterPage: React.FC = () => {
  const { t } = useTranslation('auth');
  const { register, isLoading, error, errorCode } = useRegister();

  return (
    <AuthLayout title={t('register.title')} subtitle={t('register.subtitle')}>
      <RegisterForm
        onSubmit={register}
        isLoading={isLoading}
        error={error}
        errorCode={errorCode}
      />
    </AuthLayout>
  );
};

export default RegisterPage;
