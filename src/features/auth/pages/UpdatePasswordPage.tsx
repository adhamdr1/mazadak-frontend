import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Lock, KeyRound, CheckCircle2, ArrowRight, ArrowLeft, Shield } from 'lucide-react';
import { Card } from '@/components/common/Card';
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
    mode: 'onChange',
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
    <div className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-md space-y-6">
        <Card glass padding="lg" className="shadow-2xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90">
          {/* Header Title & Icon */}
          <div className="text-center space-y-2 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-1">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {t('updatePassword.title')}
            </h1>
            {!isSuccess && (
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                {t('updatePassword.subtitle')}
              </p>
            )}
          </div>

          {isSuccess ? (
            <div className="text-center space-y-5 pt-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-inner">
                <CheckCircle2 className="w-8 h-8 animate-bounce" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t('updatePassword.successTitle')}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t('updatePassword.successMessage')}
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-3">
                <Button
                  to={ROUTES.HOME}
                  variant="accent"
                  fullWidth
                  size="md"
                  rightIcon={isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                >
                  {t('home.title')}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={reset}
                  className="text-xs text-slate-500"
                >
                  {t('updatePassword.title')}
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4" noValidate>
              {error && <Alert variant="error">{error}</Alert>}

              {/* Current Password */}
              <Input
                {...register('oldPassword')}
                type="password"
                label={t('updatePassword.oldPasswordLabel')}
                placeholder={t('updatePassword.oldPasswordPlaceholder')}
                leftIcon={<KeyRound className="w-4 h-4" />}
                error={errors.oldPassword?.message}
                autoComplete="current-password"
              />

              {/* New Password */}
              <Input
                {...register('password')}
                type="password"
                label={t('updatePassword.newPasswordLabel')}
                placeholder={t('updatePassword.newPasswordPlaceholder')}
                leftIcon={<Lock className="w-4 h-4" />}
                error={errors.password?.message}
                autoComplete="new-password"
              />

              {/* Confirm New Password */}
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
                className="mt-2 font-bold shadow-md shadow-amber-500/20"
              >
                {t('updatePassword.submitButton')}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default UpdatePasswordPage;
