import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import {
  Lock,
  KeyRound,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Shield,
  Eye,
  EyeOff,
  User,
  Check,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { useUpdatePassword } from '../hooks/useUpdatePassword';
import { updatePasswordSchema, type UpdatePasswordSchema } from '../schemas/updatePassword.schema';
import { ROUTES } from '@/constants/routes.constants';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/cn';

export const UpdatePasswordPage: React.FC = () => {
  const { t, i18n } = useTranslation(['auth', 'common', 'users']);
  const isRTL = i18n.language.startsWith('ar');
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { updatePassword, isLoading, isSuccess, error, reset } = useUpdatePassword();

  const {
    register,
    handleSubmit,
    watch,
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

  const newPasswordValue = watch('password') || '';

  // Live password requirements
  const hasMinLength = newPasswordValue.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPasswordValue);
  const hasLowerCase = /[a-z]/.test(newPasswordValue);
  const hasNumber = /[0-9]/.test(newPasswordValue);

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
    <div className={cn('max-w-4xl w-full mx-auto space-y-6', isAdmin ? 'py-1' : 'px-4 sm:px-6 py-6 sm:py-8')}>
      {/* 1. Header Navigation Bar */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('auth:updatePassword.title', 'تغيير كلمة المرور')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t('auth:updatePassword.subtitle', 'قم بتحديث كلمة المرور الخاصة بحسابك لتعزيز الأمان')}
          </p>
        </div>

        {/* Back to Profile Button (Matches Unified Gold Hover Pill Pattern) */}
        <button
          type="button"
          onClick={() => navigate(ROUTES.PROFILE)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/50 dark:hover:border-amber-500/50 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition-all shadow-2xs group shrink-0 select-none cursor-pointer whitespace-nowrap"
        >
          {isRTL ? (
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          ) : (
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          )}
          <span>{isRTL ? 'العودة للملف الشخصي' : 'Back to Profile'}</span>
        </button>
      </div>

      {/* 2. Main Form Card */}
      <div className="flex justify-center pt-2">
        <div className="w-full max-w-xl">
          <Card glass padding="lg" className="shadow-xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl p-6 sm:p-8">
            {isSuccess ? (
              <div className="text-center space-y-6 py-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-inner">
                  <CheckCircle2 className="w-8 h-8 animate-bounce" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    {t('auth:updatePassword.successTitle', 'تم تحديث كلمة المرور بنجاح')}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm mx-auto">
                    {t('auth:updatePassword.successMessage', 'تم تغيير كلمة المرور وتأمين حسابك بنجاح. يمكنك المتابعة الآن.')}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                  <Link
                    to={ROUTES.PROFILE}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all select-none cursor-pointer"
                  >
                    <User className="w-4 h-4" />
                    <span>{isRTL ? 'العودة للملف الشخصي' : 'Back to Profile'}</span>
                  </Link>

                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => {
                      reset();
                      resetForm();
                    }}
                    className="w-full sm:w-auto text-xs"
                  >
                    {isRTL ? 'تعديل كلمة مرور أخرى' : 'Change Again'}
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                {/* Form Header */}
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {isRTL ? 'إدخال البيانات الأمنية' : 'Security Credentials'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {isRTL ? 'يرجى إدخال كلمة المرور الحالية لتوثيق ملكية الحساب' : 'Please enter your current password to verify ownership'}
                    </p>
                  </div>
                </div>

                {error && <Alert variant="error">{error}</Alert>}

                {/* 1. Old Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    {t('auth:updatePassword.oldPasswordLabel', 'كلمة المرور الحالية')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-slate-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type={showOldPassword ? 'text' : 'password'}
                      placeholder={t('auth:updatePassword.oldPasswordPlaceholder', '••••••••')}
                      {...register('oldPassword')}
                      autoComplete="current-password"
                      className="w-full ps-10 pe-10 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword((prev) => !prev)}
                      className="absolute inset-y-0 end-0 flex items-center pe-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.oldPassword && (
                    <p className="text-[11px] text-rose-500 font-medium">
                      {errors.oldPassword.message}
                    </p>
                  )}
                </div>

                {/* 2. New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    {t('auth:updatePassword.newPasswordLabel', 'كلمة المرور الجديدة')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder={t('auth:updatePassword.newPasswordPlaceholder', '••••••••')}
                      {...register('password')}
                      autoComplete="new-password"
                      className="w-full ps-10 pe-10 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute inset-y-0 end-0 flex items-center pe-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[11px] text-rose-500 font-medium">
                      {errors.password.message}
                    </p>
                  )}

                  {/* Password Requirements Checklist */}
                  {newPasswordValue && (
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 grid grid-cols-2 gap-2 text-[11px] mt-2">
                      <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-500 font-bold' : 'text-slate-400'}`}>
                        <Check className="w-3.5 h-3.5" />
                        <span>8 أحرف على الأقل</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasUpperCase ? 'text-emerald-500 font-bold' : 'text-slate-400'}`}>
                        <Check className="w-3.5 h-3.5" />
                        <span>حرف كبير (A-Z)</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasLowerCase ? 'text-emerald-500 font-bold' : 'text-slate-400'}`}>
                        <Check className="w-3.5 h-3.5" />
                        <span>حرف صغير (a-z)</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-500 font-bold' : 'text-slate-400'}`}>
                        <Check className="w-3.5 h-3.5" />
                        <span>رقم (0-9)</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Confirm New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    {t('auth:updatePassword.confirmPasswordLabel', 'تأكيد كلمة المرور الجديدة')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder={t('auth:updatePassword.confirmPasswordPlaceholder', '••••••••')}
                      {...register('confirmPassword')}
                      autoComplete="new-password"
                      className="w-full ps-10 pe-10 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute inset-y-0 end-0 flex items-center pe-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-[11px] text-rose-500 font-medium">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Submit CTA */}
                <Button
                  type="submit"
                  variant="accent"
                  size="lg"
                  fullWidth
                  isLoading={isLoading}
                  className="mt-4 font-black shadow-md shadow-amber-500/20 py-3 rounded-xl"
                >
                  {t('auth:updatePassword.submitButton', 'تأكيد تغيير كلمة المرور')}
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UpdatePasswordPage;
