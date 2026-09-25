import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
import { uploadService } from '@/services/api/upload.service';
import { toLocalizedDigits } from '@/utils/formatters';
import { getLocalizedErrorMessage } from '@/utils/errorHandler';
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
  const errorTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  // Lock body scroll while lightbox is open
  useEffect(() => {
    if (previewModalUrl) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [previewModalUrl]);

  // Helper to show upload error with auto-dismiss
  const showUploadError = (message: string) => {
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
    }
    setUploadError(message);
    errorTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setUploadError(null);
      }
    }, 4000);
  };

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
      }
    };
  }, []);

  const handleFilesSelected = async (files: FileList | File[]) => {
    if (disabled || isUploading) return;
    setUploadError(null);

    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    // 1. Validate total count limit
    const remainingSlots = maxImages - value.length;
    if (remainingSlots <= 0) {
      showUploadError(
        t('openDispute.maxImagesReached', isRTL ? 'لقد وصلت للحد الأقصى من صور الأدلة (5 صور)' : 'Maximum 5 evidence photos reached')
      );
      return;
    }

    if (fileList.length > remainingSlots) {
      showUploadError(
        t('validation.maxEvidence', isRTL ? `الحد الأقصى هو ${toLocalizedDigits(maxImages, isRTL)} صور إثبات` : `Maximum ${maxImages} evidence photos allowed`)
      );
      return;
    }

    // 2. Validate file types & sizes
    for (const file of fileList) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        showUploadError(
          t('openDispute.invalidFormatError', isRTL ? 'صيغة الملف غير مدعومة (فقط JPG, PNG, WebP)' : 'Unsupported format (only JPG, PNG, WebP)')
        );
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showUploadError(
          t('openDispute.fileTooLargeError', isRTL ? 'حجم الصورة يجب ألا يتجاوز 10 ميجابايت' : 'Image size must not exceed 10MB')
        );
        return;
      }
    }

    const filesToUpload = fileList.slice(0, remainingSlots);

    try {
      setIsUploading(true);

      // High-speed parallel client-side compression + direct CDN upload via centralized uploadService
      const uploadedUrls = await uploadService.uploadBatchImages(filesToUpload, 'disputes');

      if (isMountedRef.current && uploadedUrls && uploadedUrls.length > 0) {
        onChange([...value, ...uploadedUrls]);
        setUploadError(null);
      }
    } catch (err: unknown) {
      if (isMountedRef.current) {
        const localized = getLocalizedErrorMessage(err, (k) => t(k), 'escrow');
        showUploadError(
          localized ||
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
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold">
          <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
            <ImageIcon className="w-3.5 h-3.5" />
          </div>
          <span>{t('openDispute.evidenceLabel', isRTL ? 'صور الإثبات (اختياري)' : 'Evidence Photos (Optional)')}</span>
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
            'group relative flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl border-2 border-dashed transition-all duration-200 cursor-pointer select-none text-center',
            disabled || isUploading
              ? 'border-slate-300 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/30 opacity-60 cursor-not-allowed'
              : 'border-slate-300 dark:border-slate-700 hover:border-amber-500/70 dark:hover:border-amber-500/70 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-amber-500/5 dark:hover:bg-amber-500/5'
          )}
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3 border border-amber-500/20 group-hover:scale-105 transition-transform">
            {isUploading ? (
              <Loader2 className="w-7 h-7 animate-spin text-amber-500" />
            ) : (
              <UploadCloud className="w-7 h-7" />
            )}
          </div>

          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-1">
            {isUploading
              ? t('openDispute.uploadingEvidence', isRTL ? 'جاري ضغط ورفع الصور بسرعة عالية...' : 'Compressing and uploading images...')
              : t('openDispute.uploadDropzonePrompt', isRTL ? 'اضغط لرفع صور الأدلة أو اسحبها وأفلتها هنا' : 'Click to upload evidence photos or drag and drop')}
          </h4>

          <p className="text-2xs sm:text-xs text-slate-400">
            {t(
              'openDispute.uploadHint',
              isRTL
                ? 'JPG, PNG, WebP حتى 10MB لكل صورة (بحد أقصى 5 صور إثبات)'
                : 'JPG, PNG, WebP up to 10MB each (maximum 5 photos)'
            )}
          </p>
        </div>
      )}

      {/* Upload Error / Form Error Banner */}
      {(uploadError || error) && (
        <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError || error}</span>
        </div>
      )}

      {/* Uploaded Evidence Grid Previews */}
      {value.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {value.map((url, idx) => (
              <div
                key={url + idx}
                className="group relative aspect-square rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-slate-900 shadow-2xs transition-all duration-150"
              >
                <img
                  src={url}
                  alt={`Evidence photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Image Action Overlay matching Step2MediaPreview */}
                <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewModalUrl(url);
                    }}
                    className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs backdrop-blur-xs transition-colors cursor-pointer"
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
                    className="p-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-500 transition-colors cursor-pointer"
                    title={t('common:actions.delete', isRTL ? 'حذف' : 'Delete')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox / Modal Preview rendered through React Portal to document.body */}
      {previewModalUrl &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn select-none"
            onClick={() => setPreviewModalUrl(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center">
              <button
                type="button"
                onClick={() => setPreviewModalUrl(null)}
                className="absolute -top-12 end-0 p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
                title={t('common:actions.close', isRTL ? 'إغلاق' : 'Close')}
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={previewModalUrl}
                alt="Evidence Preview"
                className="max-w-full max-h-[82vh] object-contain rounded-2xl shadow-2xl border border-white/10"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
