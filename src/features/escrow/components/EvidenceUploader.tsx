import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Loader2,
  AlertCircle,
  Eye,
  X,
} from 'lucide-react';
import { auctionsService } from '@/features/auctions/services/auctions.service';
import { toLocalizedDigits } from '@/utils/formatters';
import { cn } from '@/utils/cn';

export interface EvidenceUploaderProps {
  value?: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
  error?: string;
}

export const EvidenceUploader: React.FC<EvidenceUploaderProps> = ({
  value = [],
  onChange,
  maxImages = 5,
  disabled = false,
  error,
}) => {
  const { t, i18n } = useTranslation(['escrow', 'common']);
  const isRTL = i18n.language?.startsWith('ar');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleFilesSelected = async (files: FileList | File[]) => {
    if (disabled || isUploading) return;
    setUploadError(null);

    const fileList = Array.from(files);
    const validFiles: File[] = [];

    // 1. Validate file types & sizes
    for (const file of fileList) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setUploadError(
          t('openDispute.invalidFormatError', isRTL ? 'صيغة الملف غير مدعومة (فقط JPG, PNG, WebP)' : 'Unsupported format (only JPG, PNG, WebP)')
        );
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setUploadError(
          t('openDispute.fileTooLargeError', isRTL ? 'حجم الصورة يجب ألا يتجاوز 5 ميجابايت' : 'Image size must not exceed 5MB')
        );
        return;
      }
      validFiles.push(file);
    }

    // 2. Validate max count
    const remainingSlots = maxImages - value.length;
    if (remainingSlots <= 0) {
      setUploadError(
        t('openDispute.maxImagesReached', isRTL ? 'لقد وصلت للحد الأقصى من صور الأدلة (5 صور)' : 'Maximum 5 evidence images reached')
      );
      return;
    }

    const filesToUpload = validFiles.slice(0, remainingSlots);

    try {
      setIsUploading(true);
      const uploadedUrls: string[] = [];

      for (const file of filesToUpload) {
        const url = await auctionsService.uploadImageFile(file, 'disputes');
        if (url) {
          uploadedUrls.push(url);
        }
      }

      if (isMountedRef.current) {
        onChange([...value, ...uploadedUrls]);
      }
    } catch {
      if (isMountedRef.current) {
        setUploadError(
          t('openDispute.uploadFailed', isRTL ? 'فشل رفع الصور، يرجى التحقق من اتصالك والمحاولة مجدداً' : 'Failed to upload images, please retry')
        );
      }
    } finally {
      if (isMountedRef.current) {
        setIsUploading(false);
      }
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    if (disabled || isUploading) return;
    onChange(value.filter((_, idx) => idx !== indexToRemove));
    setUploadError(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-4">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFilesSelected(e.target.files);
            e.target.value = '';
          }
        }}
        className="hidden"
        disabled={disabled || isUploading || value.length >= maxImages}
      />

      {/* Header Info */}
      <div className="flex items-center justify-between text-xs sm:text-sm">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
          <ImageIcon className="w-4 h-4 text-amber-500" />
          <span>{t('openDispute.evidenceLabel', isRTL ? 'صور ومستندات الإثبات (اختياري)' : 'Evidence & Documentation (Optional)')}</span>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {toLocalizedDigits(value.length, isRTL)} / {toLocalizedDigits(maxImages, isRTL)}{' '}
          {t('openDispute.photosCount', isRTL ? 'صور' : 'photos')}
        </span>
      </div>

      {/* Upload Dropzone */}
      {value.length < maxImages && (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => {
            if (!disabled && !isUploading) {
              fileInputRef.current?.click();
            }
          }}
          className={cn(
            'group relative flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer select-none text-center',
            disabled || isUploading
              ? 'border-slate-300 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/30 opacity-60 cursor-not-allowed'
              : 'border-slate-300 dark:border-slate-700 hover:border-amber-500/70 dark:hover:border-amber-500/70 bg-slate-50/60 dark:bg-slate-900/50 hover:bg-amber-500/5 dark:hover:bg-amber-500/5'
          )}
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>

          <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
            {isUploading
              ? t('openDispute.uploadingEvidence', isRTL ? 'جاري رفع وضغط الصور بجودة عالية...' : 'Compressing and uploading images...')
              : t('openDispute.uploadDropzonePrompt', isRTL ? 'اضغط لرفع صور الأدلة أو اسحبها وأفلتها هنا' : 'Click to upload evidence photos or drag and drop')}
          </p>

          <p className="text-2xs sm:text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t(
              'openDispute.uploadHint',
              isRTL
                ? 'JPG, PNG, WebP حتى 5MB لكل صورة (بحد أقصى 5 صور إثبات)'
                : 'JPG, PNG, WebP up to 5MB each (maximum 5 photos)'
            )}
          </p>
        </div>
      )}

      {/* Upload Error / Form Error Banner */}
      {(uploadError || error) && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-medium animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError || error}</span>
        </div>
      )}

      {/* Uploaded Evidence Grid Previews */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
          {value.map((url, idx) => (
            <div
              key={url + idx}
              className="group relative aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-2xs"
            >
              <img
                src={url}
                alt={`Evidence #${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Gradient Overlay & Actions */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewModalUrl(url);
                  }}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-xs transition-colors"
                  title={t('common:actions.view', isRTL ? 'معاينة' : 'View')}
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage(idx);
                  }}
                  disabled={disabled || isUploading}
                  className="p-1.5 rounded-lg bg-rose-500/80 hover:bg-rose-600 text-white backdrop-blur-xs transition-colors"
                  title={t('common:actions.delete', isRTL ? 'حذف' : 'Delete')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Number Badge */}
              <span className="absolute top-2 start-2 px-2 py-0.5 rounded-md text-3xs font-black bg-black/60 text-white backdrop-blur-xs">
                #{toLocalizedDigits(idx + 1, isRTL)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox / Modal Preview */}
      {previewModalUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setPreviewModalUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center">
            <button
              type="button"
              onClick={() => setPreviewModalUrl(null)}
              className="absolute -top-12 end-0 p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewModalUrl}
              alt="Evidence Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};
