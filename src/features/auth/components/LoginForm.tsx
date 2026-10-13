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
  const { t, i18n } = useTranslation('auth');
  const isRTL = i18n.language?.startsWith('ar');
  const {
    handleGoogleSuccess,
    handleGoogleError,
    error: googleError,
    errorCode: googleErrorCode,
  } = useGoogleAuth();

  const supportSubject = encodeURIComponent(
    isRTL ? 'طلب مراجعة حساب محظور' : 'Account Suspension Appeal'
  );
  const supportBody = encodeURIComponent(
    isRTL
      ? 'مرحباً فريق دعم مزادك،\n\nأود تقديم طلب التماس ومراجعة بخصوص إيقاف حسابي.\n\nالتفاصيل:\n'
      : 'Hello Mazadak Support Team,\n\nI would like to appeal the suspension of my account.\n\nDetails:\n'
  );
  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=support@mazadak.com&su=${supportSubject}&body=${supportBody}`;

  const renderBannedAction = () => (
    <div className="mt-3 pt-2.5 border-t border-rose-500/20 flex justify-center">
      <a
        href={gmailComposeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition-all active:scale-95"
      >
        <Mail className="w-3.5 h-3.5 shrink-0" />
        <span>
          {t('banned.contactSupport', {
            defaultValue: isRTL ? 'مراسلة فريق الدعم' : 'Contact Support Team',
          })}
        </span>
      </a>
    </div>
  );

  const displayGoogleError =
    googleErrorCode === 'ACCOUNT_BANNED' ? t('errors.ACCOUNT_BANNED') : googleError;

  const displayFormError =
    errorCode === 'ACCOUNT_BANNED' ? t('errors.ACCOUNT_BANNED') : error;

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
      rememberMe: true,
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
      {/* Google Error Alert with Context-Aware Action */}
      {displayGoogleError && (
        <Alert
          variant="error"
          action={googleErrorCode === 'ACCOUNT_BANNED' ? renderBannedAction() : null}
        >
          {displayGoogleError}
        </Alert>
      )}

      {/* Backend Errors with Context-Aware Actions */}
      {displayFormError && (
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
            ) : errorCode === 'ACCOUNT_BANNED' ? (
              renderBannedAction()
            ) : null
          }
        >
          {displayFormError}
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
