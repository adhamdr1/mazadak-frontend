import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Lock, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { useResetPassword } from '../hooks/useResetPassword';
import { resetPasswordSchema, type ResetPasswordSchema } from '../schemas/resetPassword.schema';
import { ROUTES } from '@/constants/routes.constants';
export const ResetPasswordPage: React.FC = () => {
  const { t, i18n } = useTranslation('auth');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';
  const isRTL = i18n.language.startsWith('ar');

  const { resetPassword, isLoading, isSuccess, error } = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = (data: ResetPasswordSchema) => {
    if (!token || !email) return;
    resetPassword({
      email,
      token,
      password: data.password,
    });
  };

  return (
    <AuthLayout
      title={t('resetPassword.title')}
      subtitle={!isSuccess ? t('resetPassword.subtitle') : undefined}
    >
      {!token || !email ? (
        <div className="text-center space-y-4">
          <Alert variant="error">{t('errors.INVALID_OR_EXPIRED_TOKEN')}</Alert>
          <Link to={ROUTES.FORGOT_PASSWORD} className="block pt-2">
            <Button variant="accent" fullWidth size="lg">
              {t('forgotPassword.title')}
            </Button>
          </Link>
        </div>
      ) : isSuccess ? (
        <div className="text-center space-y-5">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-inner">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t('resetPassword.successTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('resetPassword.successMessage')}
            </p>
          </div>

          <Link to={ROUTES.LOGIN} className="block pt-2">
            <Button
              type="button"
              variant="accent"
              fullWidth
              size="lg"
              rightIcon={isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            >
              {t('resetPassword.goToLogin')}
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {error && <Alert variant="error">{error}</Alert>}

          <Input
            {...register('password')}
            type="password"
            label={t('resetPassword.passwordLabel')}
            placeholder={t('resetPassword.passwordPlaceholder')}
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            autoComplete="new-password"
          />

          <Input
            {...register('confirmPassword')}
            type="password"
            label={t('resetPassword.confirmPasswordLabel')}
            placeholder={t('resetPassword.confirmPasswordPlaceholder')}
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.confirmPassword?.message}
            autoComplete="new-password"
          />

          <Button
            type="submit"
            variant="accent"
            size="lg"
            fullWidth
            isLoading={isLoading}
            className="mt-2"
          >
            {t('resetPassword.submitButton')}
          </Button>

          <div className="pt-2 text-center text-xs">
            <Link
              to={ROUTES.LOGIN}
              className="font-medium text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:underline underline-offset-2 inline-flex items-center gap-1"
            >
              {isRTL ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
              <span>{t('verifyNotice.backToLogin')}</span>
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};

export default ResetPasswordPage;
