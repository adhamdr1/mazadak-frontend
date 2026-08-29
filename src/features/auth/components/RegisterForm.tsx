import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { User as UserIcon, Mail, Lock, Phone, MapPin, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Input } from '@/components/common/Input';
import { DateOfBirthPicker } from '@/components/common/DateOfBirthPicker';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { AuthDivider } from './AuthDivider';
import { GoogleAuthButton } from './GoogleAuthButton';
import { registerSchema, type RegisterSchema } from '../schemas/register.schema';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { ROUTES } from '@/constants/routes.constants';
import { cn } from '@/utils/cn';
import { toLocalizedDigits } from '@/utils/formatters';
import type { RegisterFormData, AuthErrorCode } from '../types/auth.types';

export interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => void;
  isLoading: boolean;
  error: string | null;
  errorCode?: AuthErrorCode | null;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  isLoading,
  error,
  errorCode,
}) => {
  const { t, i18n } = useTranslation('auth');
  const { handleGoogleSuccess, handleGoogleError, error: googleError } = useGoogleAuth();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const isRTL = i18n.language.startsWith('ar');

  const {
    register,
    handleSubmit,
    control,
    trigger,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
      dateOfBirth: '',
      city: '',
      street: '',
    },
  });

  const handleNextStep = async () => {
    const isStep1Valid = await trigger([
      'firstName',
      'lastName',
      'email',
      'password',
      'confirmPassword',
    ]);
    if (isStep1Valid) {
      setCurrentStep(2);
    }
  };

  const handleFormSubmit = (data: RegisterSchema) => {
    onSubmit({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      phoneNumber: data.phoneNumber,
      dateOfBirth: data.dateOfBirth,
      city: data.city,
      street: data.street,
    });
  };

  const activeError = error || googleError;

  return (
    <div className="space-y-4">
      {/* 2-Step Interactive Wizard Header */}
      <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 select-none">
        {/* Step 1 Tab */}
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className={cn(
            'flex items-center gap-2 p-2 rounded-xl text-start transition-all cursor-pointer border',
            currentStep === 1 &&
              'bg-white dark:bg-slate-800 shadow-sm border-slate-200/60 dark:border-slate-700 text-slate-900 dark:text-white font-bold',
            currentStep === 2 &&
              'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/30 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-500/20'
          )}
        >
          <div
            className={cn(
              'w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors',
              currentStep === 1 && 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20',
              currentStep === 2 && 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
            )}
          >
            {currentStep === 2 ? (
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            ) : isRTL ? (
              toLocalizedDigits(1, true)
            ) : (
              '1'
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span
              className={cn(
                'block text-[10px] font-medium leading-none',
                currentStep === 2
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-400 dark:text-slate-500'
              )}
            >
              {currentStep === 2 ? t('register.stepCompleted') : t('register.step1Indicator')}
            </span>
            <span className="block text-xs font-bold truncate mt-0.5">
              {t('register.step1Title')}
            </span>
          </div>
        </button>

        {/* Step 2 Tab */}
        <button
          type="button"
          onClick={async () => {
            if (currentStep === 1) {
              await handleNextStep();
            }
          }}
          className={cn(
            'flex items-center gap-2 p-2 rounded-xl text-start transition-all cursor-pointer border',
            currentStep === 2
              ? 'bg-white dark:bg-slate-800 shadow-sm border-slate-200/60 dark:border-slate-700 text-slate-900 dark:text-white font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          )}
        >
          <div
            className={cn(
              'w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors',
              currentStep === 2
                ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            )}
          >
            {isRTL ? toLocalizedDigits(2, true) : '2'}
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-none">
              {t('register.step2Indicator')}
            </span>
            <span className="block text-xs font-bold truncate mt-0.5">
              {t('register.step2Title')}
            </span>
          </div>
        </button>
      </div>

      {activeError && (
        <Alert variant="error" className="text-xs">
          <div>{activeError}</div>
          {errorCode === 'EMAIL_ALREADY_EXISTS' && (
            <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-800/60 flex items-center gap-3">
              <Link
                to={ROUTES.LOGIN}
                className="font-bold underline hover:no-underline text-xs text-red-800 dark:text-red-200"
              >
                {t('login.title')}
              </Link>
              <Link
                to={ROUTES.FORGOT_PASSWORD}
                className="underline hover:no-underline text-xs text-red-700 dark:text-red-300"
              >
                {t('login.forgotPassword')}
              </Link>
            </div>
          )}
        </Alert>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4" noValidate>
        {/* STEP 1: Personal Credentials */}
        <div className={cn('space-y-3.5', currentStep !== 1 && 'hidden')}>
          <div className="grid grid-cols-2 gap-3">
            <Input
              key="reg-first-name"
              id="register-firstName"
              {...register('firstName')}
              label={t('register.firstNameLabel')}
              placeholder={t('register.firstNamePlaceholder')}
              leftIcon={<UserIcon className="w-4 h-4" />}
              error={errors.firstName?.message}
              autoComplete="given-name"
            />
            <Input
              key="reg-last-name"
              id="register-lastName"
              {...register('lastName')}
              label={t('register.lastNameLabel')}
              placeholder={t('register.lastNamePlaceholder')}
              leftIcon={<UserIcon className="w-4 h-4" />}
              error={errors.lastName?.message}
              autoComplete="family-name"
            />
          </div>

          <Input
            key="reg-email"
            id="register-email"
            {...register('email')}
            type="email"
            label={t('register.emailLabel')}
            placeholder={t('register.emailPlaceholder')}
            leftIcon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            autoComplete="email"
          />

          <Input
            key="reg-password"
            id="register-password"
            {...register('password')}
            type="password"
            label={t('register.passwordLabel')}
            placeholder={t('register.passwordPlaceholder')}
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            autoComplete="new-password"
          />

          <Input
            key="reg-confirm-password"
            id="register-confirmPassword"
            {...register('confirmPassword')}
            type="password"
            label={t('register.confirmPasswordLabel')}
            placeholder={t('register.confirmPasswordPlaceholder')}
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.confirmPassword?.message}
            autoComplete="new-password"
          />

          <Button
            type="button"
            variant="accent"
            size="lg"
            fullWidth
            onClick={handleNextStep}
            rightIcon={isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            className="mt-4"
          >
            {t('register.step2Title')}
          </Button>

          <AuthDivider />
          <GoogleAuthButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
        </div>

        {/* STEP 2: Contact & Address */}
        <div className={cn('space-y-3.5', currentStep !== 2 && 'hidden')}>
          <Controller
            name="phoneNumber"
            control={control}
            render={({ field }) => (
              <Input
                key="reg-phone"
                id="register-phoneNumber"
                type="tel"
                inputMode="numeric"
                dir={isRTL ? 'rtl' : 'ltr'}
                label={t('register.phoneLabel')}
                placeholder={t('register.phonePlaceholder')}
                leftIcon={<Phone className="w-4 h-4" />}
                value={isRTL && field.value ? toLocalizedDigits(field.value, true) : (field.value || '')}
                onChange={(e) => {
                  const raw = e.target.value
                    .replace(/[\u0660-\u0669]/g, (d) => (d.charCodeAt(0) - 0x0660).toString())
                    .replace(/[\u06F0-\u06F9]/g, (d) => (d.charCodeAt(0) - 0x06f0).toString())
                    .replace(/\D/g, '')
                    .slice(0, 11);
                  field.onChange(raw);
                }}
                error={errors.phoneNumber?.message}
                autoComplete="tel"
              />
            )}
          />

          <Controller
            name="dateOfBirth"
            control={control}
            render={({ field }) => (
              <DateOfBirthPicker
                label={t('register.dobLabel')}
                value={field.value}
                onChange={field.onChange}
                error={errors.dateOfBirth?.message}
              />
            )}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              key="reg-city"
              id="register-city"
              {...register('city')}
              label={t('register.cityLabel')}
              placeholder={t('register.cityPlaceholder')}
              leftIcon={<MapPin className="w-4 h-4" />}
              error={errors.city?.message}
              autoComplete="address-level2"
            />
            <Input
              key="reg-street"
              id="register-street"
              {...register('street')}
              label={t('register.streetLabel')}
              placeholder={t('register.streetPlaceholder')}
              leftIcon={<MapPin className="w-4 h-4" />}
              error={errors.street?.message}
              autoComplete="street-address"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setCurrentStep(1)}
              leftIcon={isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              className="w-1/3"
            >
              {t('register.backButton')}
            </Button>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              isLoading={isLoading}
              className="w-2/3"
            >
              {t('register.submitButton')}
            </Button>
          </div>
        </div>
      </form>

      {/* Switch to Login */}
      <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
        <span>{t('register.hasAccount')} </span>
        <Link
          to={ROUTES.LOGIN}
          className="font-bold text-amber-600 dark:text-amber-400 hover:underline underline-offset-2"
        >
          {t('register.loginLink')}
        </Link>
      </div>
    </div>
  );
};

export default RegisterForm;
