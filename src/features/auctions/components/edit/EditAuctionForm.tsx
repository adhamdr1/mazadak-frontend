import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { type UseFormReturn } from 'react-hook-form';
import {
  FileText,
  Calendar,
  Image as ImageIcon,
  UploadCloud,
  Trash2,
  Star,
  AlertCircle,
  Sparkles,
  Save,
  Laptop,
  Shirt,
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
} from 'lucide-react';
import type { UpdateAuctionSchemaType } from '../../schemas/updateAuction.schema';
import type { Auction, AuctionCategory } from '../../types/auctions.types';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { AutoResizeTextarea } from '@/components/common/AutoResizeTextarea';
import { AuctionDateTimePicker } from '@/components/common/AuctionDateTimePicker';
import { toLocalizedDigits } from '@/utils/formatters';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/constants/routes.constants';

export interface EditAuctionFormProps {
  form: UseFormReturn<UpdateAuctionSchemaType>;
  auction: Auction;
  images: string[];
  isUploading: boolean;
  uploadError: string | null;
  onImageFiles: (files: FileList | File[]) => void;
  onRemoveImage: (index: number) => void;
  onSetCover: (index: number) => void;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isSubmitting: boolean;
  serverError: string | null;
  onCancelAuction?: () => void;
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

export const EditAuctionForm: React.FC<EditAuctionFormProps> = ({
  form,
  auction,
  images,
  isUploading,
  uploadError,
  onImageFiles,
  onRemoveImage,
  onSetCover,
  onSubmit,
  isSubmitting,
  serverError,
  onCancelAuction,
}) => {
  const { t, i18n } = useTranslation('auctions');
  const isRTL = i18n.language?.startsWith('ar');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const title = watch('title') || '';
  const description = watch('description') || '';
  const selectedCategory = watch('category');
  const startTime = watch('startTime');
  const endTime = watch('endTime');

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
    setValue('startTime', newStartStr, { shouldValidate: true, shouldDirty: true });
    if (endTime) {
      const startMs = new Date(newStartStr).getTime();
      const endMs = new Date(endTime).getTime();
      if (endMs <= startMs + 60 * 60 * 1000) {
        const autoEnd = new Date(startMs + 24 * 60 * 60 * 1000);
        setValue('endTime', toLocalISO(autoEnd), { shouldValidate: true, shouldDirty: true });
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onImageFiles(e.dataTransfer.files);
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-4xl mx-auto space-y-8">
      {serverError && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* 1. Category Selection */}
      <Card glass padding="lg" className="shadow-lg space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t('create.categoryLabel')} <span className="text-red-500">*</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('create.selectCategory')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-2.5 pt-1">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.value;
            return (
              <button
                type="button"
                key={cat.value}
                onClick={() =>
                  setValue('category', cat.value, { shouldValidate: true, shouldDirty: true })
                }
                className={cn(
                  'flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition-all duration-200 text-start',
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-400 shadow-sm ring-1 ring-amber-500/40'
                    : 'border-slate-200 dark:border-slate-800 hover:border-amber-500/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                )}
              >
                <div
                  className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="truncate">{t(cat.labelKey)}</span>
              </button>
            );
          })}
        </div>
        {errors.category && (
          <p className="text-xs text-red-500 font-medium">
            {t(errors.category.message || 'validation.categoryRequired')}
          </p>
        )}
      </Card>

      {/* 2. Basic Details (Title & Description) */}
      <Card glass padding="lg" className="shadow-lg space-y-6">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t('edit.basicDetailsTitle')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('edit.basicDetailsSubtitle')}
            </p>
          </div>
        </div>

        {/* Title / Name */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <label htmlFor="edit-title">
              {t('create.titleLabel')} <span className="text-red-500">*</span>
            </label>
            <span
              className={cn(
                'font-mono text-[11px]',
                title.length > 90
                  ? 'text-red-500 font-bold'
                  : 'text-slate-400 dark:text-slate-500'
              )}
            >
              {toLocalizedDigits(title.length, isRTL)} / {toLocalizedDigits(100, isRTL)}
            </span>
          </div>
          <input
            id="edit-title"
            type="text"
            dir={title ? 'auto' : (isRTL ? 'rtl' : 'ltr')}
            maxLength={100}
            {...register('title')}
            placeholder={t('create.titlePlaceholder')}
            className={cn(
              'w-full text-sm rounded-2xl border transition-all duration-150 leading-relaxed outline-none focus:outline-none p-3.5 sm:p-4 shadow-sm',
              'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500',
              errors.title
                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                : 'border-slate-200/90 dark:border-slate-700/90 hover:border-slate-300 dark:hover:border-slate-600 focus:border-amber-500 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
            )}
          />
          {title.length > 0 && title.length < 5 && !errors.title && (
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium animate-fadeIn">
              {t('create.titleMinHint', { count: toLocalizedDigits(5 - title.length, isRTL) })}
            </p>
          )}
          {errors.title && (
            <p className="text-xs text-red-500 font-medium">
              {t(errors.title.message || 'validation.titleRequired')}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <label htmlFor="edit-description">
              {t('create.descriptionLabel')} <span className="text-red-500">*</span>
            </label>
            <span
              className={cn(
                'font-mono text-[11px]',
                description.length > 1950
                  ? 'text-red-500 font-bold'
                  : 'text-slate-400 dark:text-slate-500'
              )}
            >
              {toLocalizedDigits(description.length, isRTL)} / {toLocalizedDigits(2000, isRTL)}
            </span>
          </div>
          <AutoResizeTextarea
            id="edit-description"
            minRows={5}
            dir={description ? 'auto' : (isRTL ? 'rtl' : 'ltr')}
            maxLength={2000}
            {...register('description')}
            placeholder={t('create.descriptionPlaceholder')}
            hasError={Boolean(errors.description)}
          />
          {description.length > 0 && description.length < 20 && !errors.description && (
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium animate-fadeIn">
              {t('create.descriptionMinHint', {
                count: toLocalizedDigits(20 - description.length, isRTL),
              })}
            </p>
          )}
          {errors.description && (
            <p className="text-xs text-red-500 font-medium">
              {t(errors.description.message || 'validation.descriptionRequired')}
            </p>
          )}
        </div>
      </Card>

      {/* 3. Scheduling & Dates */}
      <Card glass padding="lg" className="shadow-lg space-y-6">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t('create.scheduleSectionTitle')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('create.startTimeHint')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <AuctionDateTimePicker
            id="edit-start-time"
            label={t('create.startTimeLabel')}
            value={startTime}
            onChange={handleStartTimeChange}
            min={minStartTime}
            error={errors.startTime ? t(errors.startTime.message || 'validation.startTimeRequired') : undefined}
          />

          <AuctionDateTimePicker
            id="edit-end-time"
            label={t('create.endTimeLabel')}
            value={endTime}
            onChange={(val) => setValue('endTime', val, { shouldValidate: true, shouldDirty: true })}
            min={minEndTime}
            error={errors.endTime ? t(errors.endTime.message || 'validation.endTimeRequired') : undefined}
          />
        </div>
      </Card>

      {/* 4. Image Upload & Gallery */}
      <Card glass padding="lg" className="shadow-lg space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {t('create.imagesLabel')} <span className="text-red-500">*</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('create.imagesMaxNote')}
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {toLocalizedDigits(images.length, isRTL)} / {toLocalizedDigits(10, isRTL)}
          </span>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3',
            isUploading
              ? 'bg-amber-500/5 border-amber-500/40 cursor-wait'
              : 'border-slate-300 dark:border-slate-700 hover:border-amber-500/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={isUploading || images.length >= 10}
            onChange={(e) => {
              if (e.target.files) onImageFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {isUploading ? t('create.uploading') : t('create.imagesUploadHint')}
            </p>
            <p className="text-xs text-slate-400">
              {t('create.minImageRequirement')}
            </p>
          </div>
        </div>

        {uploadError && (
          <p className="text-xs text-red-500 font-medium">{uploadError}</p>
        )}
        {errors.images && (
          <p className="text-xs text-red-500 font-medium">
            {t(errors.images.message || 'validation.imagesRequired')}
          </p>
        )}

        {/* Image Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            {images.map((imgUrl, index) => {
              const isCover = index === 0;
              return (
                <div
                  key={`${imgUrl}-${index}`}
                  className="group relative rounded-xl overflow-hidden aspect-square border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-sm"
                >
                  <img
                    src={imgUrl}
                    alt={`${auction.title} - ${toLocalizedDigits(index + 1, isRTL)}`}
                    className="w-full h-full object-cover"
                  />
                  {isCover && (
                    <div className="absolute top-1.5 start-1.5 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-extrabold flex items-center gap-1 shadow">
                      <Star className="w-3 h-3 fill-slate-950" />
                      <span>{t('create.coverBadge')}</span>
                    </div>
                  )}

                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!isCover && (
                      <button
                        type="button"
                        onClick={() => onSetCover(index)}
                        title={t('create.setAsCover')}
                        className="p-1.5 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors"
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onRemoveImage(index)}
                      title={t('create.deletePhoto')}
                      className="p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Form Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link to={ROUTES.AUCTION_DETAIL(auction._id)}>
            <Button variant="ghost" size="md">
              {t('edit.cancel')}
            </Button>
          </Link>

          {onCancelAuction && (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onCancelAuction}
              leftIcon={<Trash2 className="w-4 h-4 text-red-500" />}
              className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/40 hover:bg-red-500/10"
            >
              {t('myAuctions.actionCancel')}
            </Button>
          )}
        </div>

        <Button
          type="submit"
          variant="accent"
          size="lg"
          isLoading={isSubmitting}
          leftIcon={<Save className="w-4 h-4" />}
          className="w-full sm:w-auto min-w-[200px]"
        >
          {isSubmitting ? t('edit.saving') : t('edit.saveChanges')}
        </Button>
      </div>
    </form>
  );
};
