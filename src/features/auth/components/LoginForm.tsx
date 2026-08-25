import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Mail, Lock, Send } from 'lucide-react';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { AuthDivider } from './AuthDivider';
import { GoogleAuthButton } from './GoogleAuthButton';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { loginSchema, type LoginSchema } from '../schemas/login.schema';
import { ROUTES } from '@/constants/routes.constants';
import type { LoginFormData, AuthErrorCode } from '../types/auth.types';

export interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void;
  isLoading: boolean;
  error: string | null;
  errorCode?: AuthErrorCode | null;
  resendVerification?: (email: string) => void;
  isResending?: boolean;
  resendSuccess?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isLoading,
  error,
  errorCode,
  resendVerification,
  isResending,
  resendSuccess,
}) => {
  const { t } = useTranslation('auth');
  const { handleGoogleSuccess, handleGoogleError, error: googleError } = useGoogleAuth();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const handleFormSubmit = (data: LoginSchema) => {
    onSubmit({
      email: data.email,
      password: data.password,
      rememberMe: data.rememberMe,
    });
  };

  const handleResend = () => {
    const email = getValues('email');
    if (email && resendVerification) {
      resendVerification(email);
    }
  };

  return (
    <div className="space-y-4">
      {/* Google Error Alert */}
      {googleError && <Alert variant="error">{googleError}</Alert>}

      {/* Backend Errors with Context-Aware Actions */}
      {error && (
        <Alert
          variant={errorCode === 'EMAIL_NOT_VERIFIED' ? 'warning' : 'error'}
          action={
            errorCode === 'EMAIL_NOT_VERIFIED' ? (
              <div className="mt-2">
                {resendSuccess ? (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    {t('verifyNotice.resendSuccess')}
                  </span>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResend}
                    isLoading={isResending}
                    leftIcon={<Send className="w-3 h-3" />}
                    className="text-xs py-1 px-2.5 h-auto bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"
                  >
                    {t('verifyNotice.resendButton')}
                  </Button>
                )}
              </div>
            ) : errorCode === 'ACCOUNT_SOFT_DELETED' ? (
              <Link
                to={ROUTES.REACTIVATE}
                className="text-xs font-semibold text-amber-600 dark:text-amber-400 underline underline-offset-2 hover:opacity-80 block mt-1"
              >
                {t('reactivate.title')} →
              </Link>
            ) : null
          }
        >
          {error}
        </Alert>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4" noValidate>
        <Input
          {...register('email')}
          type="email"
          label={t('login.emailLabel')}
          placeholder={t('login.emailPlaceholder')}
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          autoComplete="email"
        />

        <div className="space-y-1">
          <Input
            {...register('password')}
            type="password"
            label={t('login.passwordLabel')}
            placeholder={t('login.passwordPlaceholder')}
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            autoComplete="current-password"
          />

          <div className="flex items-center justify-between pt-1 text-xs">
            <label className="inline-flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 select-none">
              <input
                {...register('rememberMe')}
                type="checkbox"
                className="rounded border-slate-300 dark:border-slate-700 text-amber-500 focus:ring-amber-500 w-3.5 h-3.5"
              />
              <span>{t('login.rememberMe')}</span>
            </label>

            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="font-medium text-amber-600 dark:text-amber-400 hover:underline underline-offset-2"
            >
              {t('login.forgotPassword')}
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="accent"
          size="lg"
          fullWidth
          isLoading={isLoading}
          className="mt-2"
        >
          {t('login.submitButton')}
        </Button>
      </form>

      {/* Alternative Login Method */}
      <AuthDivider />
      <GoogleAuthButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} />

      {/* Switch to Register */}
      <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
        <span>{t('login.noAccount')} </span>
        <Link
          to={ROUTES.REGISTER}
          className="font-bold text-amber-600 dark:text-amber-400 hover:underline underline-offset-2"
        >
          {t('login.registerLink')}
        </Link>
      </div>
    </div>
  );
};
