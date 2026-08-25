import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Lock, KeyRound, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { useUpdatePassword } from '../hooks/useUpdatePassword';
import { updatePasswordSchema, type UpdatePasswordSchema } from '../schemas/updatePassword.schema';
import { ROUTES } from '@/constants/routes.constants';

export const UpdatePasswordPage: React.FC = () => {
  const { t, i18n } = useTranslation('auth');
  const isRTL = i18n.language.startsWith('ar');

  const { updatePassword, isLoading, isSuccess, error, reset } = useUpdatePassword();

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm<UpdatePasswordSchema>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      oldPassword: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: UpdatePasswordSchema) => {
    const success = await updatePassword({
      oldPassword: data.oldPassword,
      password: data.password,
    });
    if (success) {
      resetForm();
    }
  };

  return (
    <AuthLayout
      title={t('updatePassword.title')}
      subtitle={!isSuccess ? t('updatePassword.subtitle') : undefined}
    >
      {isSuccess ? (
        <div className="text-center space-y-5">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-inner">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t('updatePassword.successTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('updatePassword.successMessage')}
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Link to={ROUTES.HOME} className="block">
              <Button
                type="button"
                variant="accent"
                fullWidth
                size="lg"
                rightIcon={isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              >
                {t('home.title', { defaultValue: 'الرئيسية' })}
              </Button>
            </Link>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={reset}
              className="text-xs text-slate-500"
            >
              {t('updatePassword.title')} {t('common.again', { defaultValue: 'مرة أخرى' })}
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {error && <Alert variant="error">{error}</Alert>}

          <Input
            {...register('oldPassword')}
            type="password"
            label={t('updatePassword.oldPasswordLabel')}
            placeholder={t('updatePassword.oldPasswordPlaceholder')}
            leftIcon={<KeyRound className="w-4 h-4" />}
            error={errors.oldPassword?.message}
            autoComplete="current-password"
          />

          <Input
            {...register('password')}
            type="password"
            label={t('updatePassword.newPasswordLabel')}
            placeholder={t('updatePassword.newPasswordPlaceholder')}
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            autoComplete="new-password"
          />

          <Input
            {...register('confirmPassword')}
            type="password"
            label={t('updatePassword.confirmPasswordLabel')}
            placeholder={t('updatePassword.confirmPasswordPlaceholder')}
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
            {t('updatePassword.submitButton')}
          </Button>

          <div className="pt-2 text-center text-xs">
            <Link
              to={ROUTES.HOME}
              className="font-medium text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:underline underline-offset-2 inline-flex items-center gap-1"
            >
              {isRTL ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
              <span>{t('verifyNotice.backToLogin', { defaultValue: 'العودة للرئيسية' })}</span>
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};

export default UpdatePasswordPage;
