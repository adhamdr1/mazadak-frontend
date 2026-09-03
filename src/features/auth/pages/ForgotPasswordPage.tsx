import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { useForgotPassword } from '../hooks/useForgotPassword';
import { forgotPasswordSchema, type ForgotPasswordSchema } from '../schemas/forgotPassword.schema';
import { ROUTES } from '@/constants/routes.constants';

export const ForgotPasswordPage: React.FC = () => {
  const { t, i18n } = useTranslation('auth');
  const isRTL = i18n.language.startsWith('ar');

  const { sendResetLink, isLoading, isSuccess, submittedEmail, error } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = (data: ForgotPasswordSchema) => {
    sendResetLink(data.email);
  };

  return (
    <AuthLayout
      title={t('forgotPassword.title')}
      subtitle={!isSuccess ? t('forgotPassword.subtitle') : undefined}
    >
      {isSuccess ? (
        <div className="text-center space-y-5">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-inner">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t('forgotPassword.successTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('forgotPassword.successMessage')}
            </p>
            {submittedEmail && (
              <div className="inline-block px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                {submittedEmail}
              </div>
            )}
          </div>

          <div className="pt-2">
            <Button
              to={ROUTES.LOGIN}
              variant="accent"
              fullWidth
              size="lg"
              rightIcon={isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            >
              {t('forgotPassword.backToLogin')}
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {error && <Alert variant="error">{error}</Alert>}

          <Input
            {...register('email')}
            type="email"
            label={t('forgotPassword.emailLabel')}
            placeholder={t('forgotPassword.emailPlaceholder')}
            leftIcon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            autoComplete="email"
          />

          <Button
            type="submit"
            variant="accent"
            size="lg"
            fullWidth
            isLoading={isLoading}
            className="mt-2"
          >
            {t('forgotPassword.submitButton')}
          </Button>

          <div className="pt-2 text-center text-xs">
            <Link
              to={ROUTES.LOGIN}
              className="font-medium text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:underline underline-offset-2 inline-flex items-center gap-1"
            >
              {isRTL ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
              <span>{t('forgotPassword.backToLogin')}</span>
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
