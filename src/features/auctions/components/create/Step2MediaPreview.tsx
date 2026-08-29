import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Star,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertTriangle,
  Gavel,
} from 'lucide-react';
import { LiveAuctionPreviewCard } from './LiveAuctionPreviewCard';
import type { CreateAuctionSchemaType } from '../../schemas/createAuction.schema';
import { toLocalizedDigits } from '@/utils/formatters';
import { cn } from '@/utils/cn';

export interface Step2MediaPreviewProps {
  formData: CreateAuctionSchemaType;
  images: string[];
  isUploading: boolean;
  uploadError: string | null;
  errorMessage: string | null;
  isPending: boolean;
  onFilesSelected: (files: FileList | File[]) => void;
  onRemoveImage: (index: number) => void;
  onSetCoverImage: (index: number) => void;
  onBack: () => void;
  onSubmit: () => void;
  imagesError?: string;
  className?: string;
}

export const Step2MediaPreview: React.FC<Step2MediaPreviewProps> = ({
  formData,
  images,
  isUploading,
  uploadError,
  errorMessage,
  isPending,
  onFilesSelected,
  onRemoveImage,
  onSetCoverImage,
  onBack,
  onSubmit,
  imagesError,
  className,
}) => {
  const { t, i18n } = useTranslation('auctions');
  const isRTL = i18n.language?.startsWith('ar');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
      e.target.value = ''; // Reset input to allow selecting same files again if needed
    }
  };

  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start', className)}>
      {/* Left Column: Media Upload & Gallery Management */}
      <div className="lg:col-span-7 xl:col-span-7 space-y-6">
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-sm sm:text-base">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h2>{t('create.imagesLabel')}</h2>
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                {t('create.imagesMaxNote')}
              </span>
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleInputChange}
            className="hidden"
          />

          {/* Explicit Image Requirement Note */}
          <div className="flex items-center gap-2.5 p-3 sm:p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-300 text-xs font-bold shadow-xs">
            <ImageIcon className="w-4 h-4 shrink-0 text-amber-500" />
            <span>{t('create.minImageRequirement')}</span>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 select-none group',
              'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-amber-500 dark:hover:border-amber-500 hover:bg-amber-500/5',
              isUploading && 'pointer-events-none opacity-60 cursor-not-allowed'
            )}
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3 border border-amber-500/20 group-hover:scale-105 transition-transform">
              {isUploading ? (
                <Loader2 className="w-7 h-7 animate-spin" />
              ) : (
                <UploadCloud className="w-7 h-7" />
              )}
            </div>

            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              {isUploading ? t('create.uploading') : t('create.imagesUploadHint')}
            </h4>
            <p className="text-xs text-slate-400">
              {isRTL ? toLocalizedDigits(images.length, true) : images.length} / {isRTL ? toLocalizedDigits(10, true) : 10} {t('card.photos')}
            </p>
          </div>

          {/* Upload Error Alerts */}
          {(uploadError || imagesError) && (
            <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold animate-fadeIn">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                {uploadError || (imagesError ? t(imagesError, { ns: 'auctions', defaultValue: imagesError }) : '')}
              </span>
            </div>
          )}

          {/* Backend Mutation Error */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Uploaded Images Grid */}
          {images.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t('card.photos')} ({isRTL ? toLocalizedDigits(images.length, true) : images.length} / {isRTL ? toLocalizedDigits(10, true) : 10})
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((imgUrl, index) => {
                  const isCover = index === 0;

                  return (
                    <div
                      key={index}
                      className={cn(
                        'relative group rounded-2xl overflow-hidden border aspect-video bg-slate-900 transition-all duration-150',
                        isCover
                          ? 'border-amber-500 ring-2 ring-amber-500/30 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800'
                      )}
                    >
                      <img
                        src={imgUrl}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover"
                      />

                      {/* Cover Badge */}
                      {isCover && (
                        <span className="absolute top-2 start-2 text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 shadow-sm flex items-center gap-1">
                          <Star className="w-3 h-3 fill-slate-950" />
                          <span>{t('create.coverBadge')}</span>
                        </span>
                      )}

                      {/* Image Action Overlay */}
                      <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                        {!isCover && (
                          <button
                            type="button"
                            onClick={() => onSetCoverImage(index)}
                            className="p-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors"
                            title={t('create.setAsCover')}
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onRemoveImage(index)}
                          className="p-2 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-500 transition-colors"
                          title={t('create.deletePhoto')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Wizard Navigation Action Row */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-500 dark:hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 font-bold text-xs sm:text-sm transition-all duration-150 cursor-pointer select-none shadow-sm"
          >
            {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span>{t('create.prevStep')}</span>
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={isPending || isUploading || images.length === 0}
            className={cn(
              'inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm sm:text-base py-3.5 px-8 rounded-2xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 active:scale-[0.99] transition-all select-none',
              (isPending || isUploading || images.length === 0)
                ? 'opacity-60 cursor-not-allowed'
                : 'cursor-pointer'
            )}
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t('create.creatingAuction')}</span>
              </>
            ) : (
              <>
                <Gavel className="w-5 h-5 stroke-[2.5]" />
                <span>{t('create.submitCreate')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right Column: Live Synchronized Preview Card */}
      <div className="lg:col-span-5 xl:col-span-5 lg:sticky lg:top-24 self-start">
        <LiveAuctionPreviewCard formData={{ ...formData, images }} />
      </div>
    </div>
  );
};

export default Step2MediaPreview;
