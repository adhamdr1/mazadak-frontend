import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { User as UserIcon, Mail, Phone, MapPin } from 'lucide-react';
import { Input } from '@/components/common/Input';
import { DateOfBirthPicker } from '@/components/common/DateOfBirthPicker';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { googleRegisterSchema, type GoogleRegisterSchema } from '../schemas/googleRegister.schema';
import { useGoogleRegister } from '../hooks/useGoogleRegister';
import { ROUTES } from '@/constants/routes.constants';
import { toLocalizedDigits } from '@/utils/formatters';

interface GoogleRegisterFormProps {
  googleToken: string;
}

function parseJwtPayload(token: string): {
  given_name?: string;
  family_name?: string;
  name?: string;
  email?: string;
} | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export const GoogleRegisterForm: React.FC<GoogleRegisterFormProps> = ({ googleToken }) => {
  const { t, i18n } = useTranslation('auth');
  const isRTL = i18n.language.startsWith('ar');
  const { googleRegister, isLoading, error } = useGoogleRegister();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<GoogleRegisterSchema>({
    resolver: zodResolver(googleRegisterSchema),
    mode: 'onTouched',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      dateOfBirth: '',
      city: '',
      street: '',
    },
  });

  // Pre-fill name and email from Google ID Token JWT payload
  useEffect(() => {
    const payload = parseJwtPayload(googleToken);
    if (!payload) return;

    if (payload.given_name) setValue('firstName', payload.given_name, { shouldDirty: false });
    if (payload.family_name) setValue('lastName', payload.family_name, { shouldDirty: false });
    if (!payload.given_name && payload.name) {
      const parts = payload.name.split(' ');
      setValue('firstName', parts[0] || '', { shouldDirty: false });
      setValue('lastName', parts.slice(1).join(' ') || '', { shouldDirty: false });
    }
    if (payload.email) setValue('email', payload.email, { shouldDirty: false });
  }, [googleToken, setValue]);

  const onSubmit = (data: GoogleRegisterSchema) => {
    googleRegister({
      formData: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        dateOfBirth: data.dateOfBirth,
        city: data.city,
        street: data.street,
      },
      googleToken,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {error && <Alert variant="error">{error}</Alert>}

      {/* Name Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          id="google-register-firstName"
          {...register('firstName')}
          label={t('register.firstNameLabel')}
          placeholder={t('register.firstNamePlaceholder')}
          leftIcon={<UserIcon className="w-4 h-4" />}
          error={errors.firstName?.message}
          autoComplete="given-name"
        />
        <Input
          id="google-register-lastName"
          {...register('lastName')}
          label={t('register.lastNameLabel')}
          placeholder={t('register.lastNamePlaceholder')}
          leftIcon={<UserIcon className="w-4 h-4" />}
          error={errors.lastName?.message}
          autoComplete="family-name"
        />
      </div>

      {/* Email — disabled, comes from Google */}
      <Input
        id="google-register-email"
        {...register('email')}
        type="email"
        label={t('register.emailLabel')}
        placeholder="email@example.com"
        leftIcon={<Mail className="w-4 h-4" />}
        error={errors.email?.message}
        autoComplete="email"
        disabled
        dir="ltr"
      />

      {/* Phone */}
      <Controller
        name="phoneNumber"
        control={control}
        render={({ field }) => (
          <Input
            id="google-register-phone"
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

      {/* Date of Birth */}
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

      {/* City & Street */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          id="google-register-city"
          {...register('city')}
          label={t('register.cityLabel')}
          placeholder={t('register.cityPlaceholder')}
          leftIcon={<MapPin className="w-4 h-4" />}
          error={errors.city?.message}
          autoComplete="address-level2"
        />
        <Input
          id="google-register-street"
          {...register('street')}
          label={t('register.streetLabel')}
          placeholder={t('register.streetPlaceholder')}
          leftIcon={<MapPin className="w-4 h-4" />}
          error={errors.street?.message}
          autoComplete="street-address"
        />
      </div>

      <Button
        type="submit"
        variant="accent"
        size="lg"
        fullWidth
        isLoading={isLoading}
        className="mt-2"
      >
        {t('register.submitButton')}
      </Button>

      <div className="pt-1 text-center text-xs text-slate-500 dark:text-slate-400">
        <span>{t('register.hasAccount')} </span>
        <Link
          to={ROUTES.LOGIN}
          className="font-bold text-amber-600 dark:text-amber-400 hover:underline underline-offset-2"
        >
          {t('register.loginLink')}
        </Link>
      </div>
    </form>
  );
};

export default GoogleRegisterForm;
