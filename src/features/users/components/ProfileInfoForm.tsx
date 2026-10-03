import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Lock,
  ShieldCheck,
  Save,
  RotateCcw,
} from 'lucide-react';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { DateOfBirthPicker } from '@/features/auth/components/DateOfBirthPicker';
import {
  updateProfileSchema,
  type UpdateProfileFormData,
} from '../schemas/updateProfile.schema';
import { useUpdateProfile } from '../hooks/useUpdateProfile';
import { toLocalizedDigits } from '@/utils/formatters';
import type { FullUser } from '../types/users.types';
import type { User } from '@/features/auth/types/auth.types';

export interface ProfileInfoFormProps {
  user: FullUser | User;
  className?: string;
}

export const ProfileInfoForm: React.FC<ProfileInfoFormProps> = ({ user, className }) => {
  const { t, i18n } = useTranslation(['users', 'common']);
  const isRTL = i18n.language?.startsWith('ar');
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phoneNumber: user.phoneNumber || '',
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
      address: {
        city: user.address?.city || '',
        street: user.address?.street || '',
      },
    },
  });

  const onSubmit = (data: UpdateProfileFormData) => {
    updateProfile({
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      phoneNumber: data.phoneNumber.trim(),
      dateOfBirth: data.dateOfBirth,
      address: {
        city: data.address.city.trim(),
        street: data.address.street.trim(),
      },
    });
  };

  const handleReset = () => {
    reset({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phoneNumber: user.phoneNumber || '',
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
      address: {
        city: user.address?.city || '',
        street: user.address?.street || '',
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`space-y-6 ${className || ''}`}
      noValidate
    >
      {/* Personal Identity Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 lg:p-9 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3.5">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-amber-500" />
            <span>{t('users:personal.title')}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('users:personal.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* First Name */}
          <Input
            id="profile-firstName"
            label={t('users:personal.firstName')}
            leftIcon={<UserIcon className="w-4 h-4" />}
            error={errors.firstName?.message ? t(errors.firstName.message) : undefined}
            {...register('firstName')}
          />

          {/* Last Name */}
          <Input
            id="profile-lastName"
            label={t('users:personal.lastName')}
            leftIcon={<UserIcon className="w-4 h-4" />}
            error={errors.lastName?.message ? t(errors.lastName.message) : undefined}
            {...register('lastName')}
          />
        </div>

        {/* Email Address — Read-Only for Security */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>{t('users:personal.email')}</span>
              <Lock className="w-3.5 h-3.5 text-slate-400" />
            </label>
            {user.isEmailVerified && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" />
                <span>{t('users:profile.verifiedUser')}</span>
              </span>
            )}
          </div>
          <div className="relative">
            <input
              type="email"
              disabled
              value={user.email}
              className="w-full h-10 px-3.5 ps-10 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-500 dark:text-slate-400 text-sm cursor-default select-none"
            />
            <Mail className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {t('users:personal.emailHelp')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Phone Number */}
          <Controller
            name="phoneNumber"
            control={control}
            render={({ field }) => (
              <Input
                id="profile-phoneNumber"
                type="tel"
                inputMode="numeric"
                label={t('users:personal.phoneNumber')}
                placeholder="01012345678"
                leftIcon={<Phone className="w-4 h-4" />}
                dir={isRTL ? 'rtl' : 'ltr'}
                value={
                  isRTL && field.value
                    ? toLocalizedDigits(field.value, true)
                    : field.value || ''
                }
                onChange={(e) => {
                  const raw = e.target.value
                    .replace(/[\u0660-\u0669]/g, (d) => (d.charCodeAt(0) - 0x0660).toString())
                    .replace(/[\u06F0-\u06F9]/g, (d) => (d.charCodeAt(0) - 0x06f0).toString())
                    .replace(/\D/g, '')
                    .slice(0, 11);
                  field.onChange(raw);
                }}
                error={errors.phoneNumber?.message ? t(errors.phoneNumber.message) : undefined}
              />
            )}
          />

          {/* Date of Birth Picker */}
          <Controller
            name="dateOfBirth"
            control={control}
            render={({ field }) => (
              <DateOfBirthPicker
                id="profile-dateOfBirth"
                label={t('users:personal.dateOfBirth')}
                value={field.value}
                onChange={field.onChange}
                error={errors.dateOfBirth?.message ? t(errors.dateOfBirth.message) : undefined}
              />
            )}
          />
        </div>
      </div>

      {/* Address Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 lg:p-9 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
        <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-500" />
            <span>{t('users:personal.addressTitle')}</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* City */}
          <Input
            id="profile-city"
            label={t('users:personal.city')}
            placeholder={isRTL ? 'مثال: القاهرة، الجيزة، الإسكندرية' : 'e.g. Cairo, Giza, Alexandria'}
            leftIcon={<MapPin className="w-4 h-4" />}
            error={errors.address?.city?.message ? t(errors.address.city.message) : undefined}
            {...register('address.city')}
          />

          {/* Street */}
          <Input
            id="profile-street"
            label={t('users:personal.street')}
            placeholder={isRTL ? 'مثال: شارع النيل، الحي السابع' : 'e.g. Nile Street, 7th District'}
            leftIcon={<MapPin className="w-4 h-4" />}
            error={errors.address?.street?.message ? t(errors.address.street.message) : undefined}
            {...register('address.street')}
          />
        </div>
      </div>

      {/* Form Action Controls */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          size="md"
          disabled={!isDirty || isPending}
          onClick={handleReset}
          leftIcon={<RotateCcw className="w-4 h-4" />}
        >
          {t('users:personal.cancel')}
        </Button>

        <Button
          type="submit"
          variant="accent"
          size="md"
          isLoading={isPending}
          disabled={!isDirty || isPending}
          leftIcon={<Save className="w-4 h-4" />}
        >
          {t('users:personal.saveChanges')}
        </Button>
      </div>
    </form>
  );
};
