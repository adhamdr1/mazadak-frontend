import React from 'react';
import { useTranslation } from 'react-i18next';
import { type UseFormReturn } from 'react-hook-form';
import {
  FileText,
  DollarSign,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Clock,
  Laptop,
  Shirt,
  Sparkles,
  Watch,
  Hourglass,
  Palette,
  Layers,
  BookOpen,
  Armchair,
  Tv,
  Car,
  Bike,
  Building,
  Dumbbell,
  Gamepad2,
  Box,
  AlertTriangle,
} from 'lucide-react';
import type { CreateAuctionSchemaType } from '../../schemas/createAuction.schema';
import type { AuctionCategory } from '../../types/auctions.types';
import { toLocalizedDigits } from '@/utils/formatters';
import { cn } from '@/utils/cn';
import { LocalizedNumberInput } from '@/components/common/LocalizedNumberInput';
import { AutoResizeTextarea } from '@/components/common/AutoResizeTextarea';
import { AuctionDateTimePicker } from '@/components/common/AuctionDateTimePicker';

export interface Step1DetailsPricingProps {
  form: UseFormReturn<CreateAuctionSchemaType>;
  onNext: () => void;
  className?: string;
}

const CATEGORIES: Array<{
  value: AuctionCategory;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { value: 'ELECTRONICS', labelKey: 'categories.ELECTRONICS', icon: Laptop },
  { value: 'CARS', labelKey: 'categories.CARS', icon: Car },
  { value: 'WATCHES', labelKey: 'categories.WATCHES', icon: Watch },
  { value: 'JEWELRY', labelKey: 'categories.JEWELRY', icon: Sparkles },
  { value: 'REAL_ESTATE', labelKey: 'categories.REAL_ESTATE', icon: Building },
  { value: 'ANTIQUES', labelKey: 'categories.ANTIQUES', icon: Hourglass },
  { value: 'ART', labelKey: 'categories.ART', icon: Palette },
  { value: 'FASHION', labelKey: 'categories.FASHION', icon: Shirt },
  { value: 'FURNITURE', labelKey: 'categories.FURNITURE', icon: Armchair },
  { value: 'HOME_APPLIANCES', labelKey: 'categories.HOME_APPLIANCES', icon: Tv },
  { value: 'MOTORCYCLES', labelKey: 'categories.MOTORCYCLES', icon: Bike },
  { value: 'COLLECTIBLES', labelKey: 'categories.COLLECTIBLES', icon: Layers },
  { value: 'BOOKS', labelKey: 'categories.BOOKS', icon: BookOpen },
  { value: 'SPORTS', labelKey: 'categories.SPORTS', icon: Dumbbell },
  { value: 'TOYS', labelKey: 'categories.TOYS', icon: Gamepad2 },
  { value: 'OTHER', labelKey: 'categories.OTHER', icon: Box },
];

export const Step1DetailsPricing: React.FC<Step1DetailsPricingProps> = ({
  form,
  onNext,
  className,
}) => {
  const { t, i18n } = useTranslation('auctions');
  const isRTL = i18n.language?.startsWith('ar');

  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const title = watch('title') || '';
  const description = watch('description') || '';
  const selectedCategory = watch('category');
  const startingPrice = watch('startingPrice');
  const minimumBidIncrement = watch('minimumBidIncrement');
  const startTime = watch('startTime');
  const endTime = watch('endTime');

  // Compute minimum selectable datetime bounds
  const now = new Date();
  const toLocalISO = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const minStartTime = toLocalISO(new Date(now.getTime() + 30 * 60 * 1000));
  const minEndTime = startTime
    ? toLocalISO(new Date(new Date(startTime).getTime() + 60 * 60 * 1000))
    : toLocalISO(new Date(now.getTime() + 90 * 60 * 1000));

  const handleStartTimeChange = (newStartStr: string) => {
    setValue('startTime', newStartStr, { shouldValidate: true });

    if (newStartStr) {
      const newStartMs = new Date(newStartStr).getTime();
      const currentEndMs = endTime ? new Date(endTime).getTime() : 0;

      // If endTime is empty or less than start + 1 hour, auto-adjust endTime to start + 1 hour
      if (!endTime || currentEndMs < newStartMs + 60 * 60 * 1000) {
        const autoEnd = new Date(newStartMs + 60 * 60 * 1000);
        setValue('endTime', toLocalISO(autoEnd), { shouldValidate: true });
      }
    }
  };

  // Calculate human-friendly duration with strict Arabic linguistic pluralization rules
  const calculateDuration = () => {
    if (!startTime || !endTime) return null;
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const diffMs = end - start;
    if (diffMs <= 0) return null;

    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const remHours = totalHours % 24;

    const formatDaysStr = (d: number) => {
      const cStr = isRTL ? toLocalizedDigits(d, true) : d;
      if (!isRTL) return d === 1 ? '1 day' : `${d} days`;
      if (d === 1) return t('countdown.oneDay');
      if (d === 2) return t('countdown.twoDays');
      if (d >= 3 && d <= 10) return t('countdown.fewDays', { count: cStr });
      return t('countdown.manyDays', { count: cStr });
    };

    const formatHoursStr = (h: number) => {
      const cStr = isRTL ? toLocalizedDigits(h, true) : h;
      if (!isRTL) return h === 1 ? '1 hour' : `${h} hours`;
      if (h === 1) return t('countdown.oneHour');
      if (h === 2) return t('countdown.twoHours');
      if (h >= 3 && h <= 10) return t('countdown.fewHours', { count: cStr });
      return t('countdown.manyHours', { count: cStr });
    };

    if (days > 0) {
      return remHours > 0
        ? `${formatDaysStr(days)} + ${formatHoursStr(remHours)}`
        : formatDaysStr(days);
    }

    return formatHoursStr(totalHours);
  };

  const durationText = calculateDuration();

  return (
    <div className={cn('space-y-8', className)}>
      {/* 1. Item Details Section */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 shadow-sm space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-sm sm:text-base">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
            <FileText className="w-4 h-4" />
          </div>
          <h2>{t('create.step1Title')}</h2>
        </div>

        {/* Title Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <label htmlFor="auction-title">{t('create.titleLabel')} *</label>
            <span
              className={cn(
                'text-[11px] font-mono',
                title.length > 90
                  ? 'text-red-500 font-bold'
                  : 'text-slate-400 dark:text-slate-500'
              )}
            >
              {isRTL ? toLocalizedDigits(title.length, true) : title.length} / {isRTL ? toLocalizedDigits(100, true) : 100}
            </span>
          </div>
          <input
            id="auction-title"
            type="text"
            dir={title ? 'auto' : (isRTL ? 'rtl' : 'ltr')}
            maxLength={100}
            placeholder={t('create.titlePlaceholder')}
            {...register('title')}
            className={cn(
              'w-full text-sm rounded-2xl border transition-all duration-150 leading-relaxed outline-none focus:outline-none p-3.5 sm:p-4 shadow-sm text-start',
              'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500',
              errors.title
                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                : 'border-slate-200/90 dark:border-slate-700/90 hover:border-slate-300 dark:hover:border-slate-600 focus:border-amber-500 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
            )}
          />
          {title.length > 0 && title.length < 5 && !errors.title && (
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium animate-fadeIn">
              {t('create.titleMinHint', {
                count: isRTL ? toLocalizedDigits(5 - title.length, true) : 5 - title.length,
              })}
            </p>
          )}
          {errors.title && (
            <p className="text-xs text-red-500 font-semibold">
              {t(errors.title.message as string, { ns: 'auctions', defaultValue: errors.title.message })}
            </p>
          )}
        </div>

        {/* Category Visual Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            {t('create.categoryLabel')} *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2.5">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.value;
              const Icon = cat.icon;

              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setValue('category', cat.value, { shouldValidate: true })}
                  className={cn(
                    'p-3 rounded-2xl border text-xs font-bold transition-all duration-150 flex items-center gap-2 text-start select-none cursor-pointer',
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-slate-700/90 hover:border-amber-500 dark:hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 shadow-sm'
                  )}
                >
                  <Icon className={cn('w-4 h-4 shrink-0', isSelected ? 'text-slate-950' : 'text-amber-500')} />
                  <span className="truncate">{t(cat.labelKey)}</span>
                </button>
              );
            })}
          </div>
          {errors.category && (
            <p className="text-xs text-red-500 font-semibold">
              {t(errors.category.message as string, { ns: 'auctions', defaultValue: errors.category.message })}
            </p>
          )}
        </div>

        {/* Description Textarea */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <label htmlFor="auction-description">{t('create.descriptionLabel')} *</label>
            <span
              className={cn(
                'text-[11px] font-mono',
                description.length > 1950
                  ? 'text-red-500 font-bold'
                  : 'text-slate-400 dark:text-slate-500'
              )}
            >
              {isRTL ? toLocalizedDigits(description.length, true) : description.length} / {isRTL ? toLocalizedDigits(2000, true) : 2000}
            </span>
          </div>
          <AutoResizeTextarea
            id="auction-description"
            dir={description ? 'auto' : (isRTL ? 'rtl' : 'ltr')}
            maxLength={2000}
            minRows={5}
            placeholder={t('create.descriptionPlaceholder')}
            {...register('description')}
            hasError={Boolean(errors.description)}
          />
          {description.length > 0 && description.length < 20 && !errors.description && (
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium animate-fadeIn">
              {t('create.descriptionMinHint', {
                count: isRTL ? toLocalizedDigits(20 - description.length, true) : 20 - description.length,
              })}
            </p>
          )}
          {errors.description && (
            <p className="text-xs text-red-500 font-semibold">
              {t(errors.description.message as string, { ns: 'auctions', defaultValue: errors.description.message })}
            </p>
          )}
        </div>
      </div>

      {/* 2. Pricing & Financial Rules Section */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 shadow-sm space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-sm sm:text-base">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
            <DollarSign className="w-4 h-4" />
          </div>
          <h2>{t('create.pricingSectionTitle')}</h2>
        </div>

        {/* Informative Warning: Locked rules */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 flex items-start gap-2.5 text-xs leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <span>{t('create.pricingLockedWarning')}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Starting Price with Full Localization */}
          <LocalizedNumberInput
            id="starting-price"
            label={t('create.startingPriceLabel')}
            value={startingPrice}
            suffix={t('currency.symbol')}
            placeholder={isRTL ? '٥٠٠' : '500'}
            error={errors.startingPrice?.message as string | undefined}
            onChange={(numericVal) => setValue('startingPrice', numericVal, { shouldValidate: true })}
          />

          {/* Minimum Bid Increment with Full Localization */}
          <LocalizedNumberInput
            id="bid-increment"
            label={t('create.incrementLabel')}
            value={minimumBidIncrement}
            suffix={t('currency.symbol')}
            placeholder={isRTL ? '٥٠' : '50'}
            error={errors.minimumBidIncrement?.message as string | undefined}
            onChange={(numericVal) => setValue('minimumBidIncrement', numericVal, { shouldValidate: true })}
          />
        </div>
      </div>

      {/* 3. Scheduling & Dates Section with Custom Localized DateTime Picker */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 shadow-sm space-y-6">
        <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-sm sm:text-base">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
              <Calendar className="w-4 h-4" />
            </div>
            <h2>{t('create.scheduleSectionTitle')}</h2>
          </div>

          {durationText && (
            <div className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Clock className="w-3.5 h-3.5" />
              <span>{t('create.estimatedDuration', { duration: durationText })}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Start Time Picker */}
          <AuctionDateTimePicker
            id="start-time"
            label={t('create.startTimeLabel')}
            value={startTime}
            min={minStartTime}
            error={errors.startTime?.message as string | undefined}
            hint={t('create.startTimeHint')}
            onChange={handleStartTimeChange}
          />

          {/* End Time Picker */}
          <AuctionDateTimePicker
            id="end-time"
            label={t('create.endTimeLabel')}
            value={endTime}
            min={minEndTime}
            error={errors.endTime?.message as string | undefined}
            hint={t('create.endTimeHint')}
            onChange={(iso) => setValue('endTime', iso, { shouldValidate: true })}
          />
        </div>
      </div>

      {/* Next Step CTA Action */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onNext}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm sm:text-base py-3.5 px-8 rounded-2xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 active:scale-[0.99] transition-all cursor-pointer select-none"
        >
          <span>{t('create.nextStep')}</span>
          {isRTL ? <ArrowLeft className="w-5 h-5 stroke-[2.5]" /> : <ArrowRight className="w-5 h-5 stroke-[2.5]" />}
        </button>
      </div>
    </div>
  );
};

export default Step1DetailsPricing;
