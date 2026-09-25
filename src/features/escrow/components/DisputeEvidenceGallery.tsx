import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import {
  Image as ImageIcon,
  ExternalLink,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { toLocalizedDigits } from '@/utils/formatters';

export interface DisputeEvidenceGalleryProps {
  evidenceUrls: string[];
  className?: string;
}

export const DisputeEvidenceGallery: React.FC<DisputeEvidenceGalleryProps> = ({
  evidenceUrls,
  className,
}) => {
  const { t, i18n } = useTranslation(['escrow', 'common']);
  const isRTL = i18n.language?.startsWith('ar');

  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const isLightboxOpen = previewIndex !== null;

  const handleClose = useCallback(() => {
    setPreviewIndex(null);
  }, []);

  const handleNext = useCallback(() => {
    if (previewIndex === null) return;
    setPreviewIndex((prev) =>
      prev !== null ? (prev + 1) % evidenceUrls.length : null
    );
  }, [previewIndex, evidenceUrls.length]);

  const handlePrev = useCallback(() => {
    if (previewIndex === null) return;
    setPreviewIndex((prev) =>
      prev !== null
        ? (prev - 1 + evidenceUrls.length) % evidenceUrls.length
        : null
    );
  }, [previewIndex, evidenceUrls.length]);

  // Lock body scroll while lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowRight') {
        if (isRTL) handlePrev();
        else handleNext();
      }
      if (e.key === 'ArrowLeft') {
        if (isRTL) handleNext();
        else handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, handleClose, handleNext, handlePrev, isRTL]);

  if (!evidenceUrls || evidenceUrls.length === 0) {
    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-center space-y-2">
        <div className="w-10 h-10 rounded-xl bg-slate-200/60 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mx-auto flex items-center justify-center">
          <ImageIcon className="w-5 h-5" />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {t('disputeDetail.noEvidenceProvided', isRTL ? 'لم يتم إرفاق صور إثبات مع هذا النزاع.' : 'No evidence photos were attached to this dispute.')}
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-amber-500" />
          <span>{t('disputeDetail.attachedEvidence', isRTL ? 'صور الإثبات المرفقة' : 'Attached Evidence Photos')}</span>
        </span>
        <span className="text-3xs font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
          {toLocalizedDigits(evidenceUrls.length, isRTL)} {t('openDispute.photosCount', isRTL ? 'صور' : 'photos')}
        </span>
      </div>

      {/* Grid of Evidence Thumbnails without hashtags or distracting icons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {evidenceUrls.map((url, idx) => (
          <div
            key={idx}
            onClick={() => setPreviewIndex(idx)}
            className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-amber-500/70 dark:hover:border-amber-500/70 hover:shadow-md cursor-pointer transition-all duration-200"
          >
            <img
              src={url}
              alt={`Evidence ${idx + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Lightbox Preview Modal rendered through React Portal to document.body (avoids card transform/flicker bugs) */}
      {isLightboxOpen &&
        previewIndex !== null &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6 animate-fadeIn select-none"
            onClick={handleClose}
          >
            {/* Top Bar: Counter & Actions */}
            <div
              className="absolute top-4 inset-x-4 sm:inset-x-8 flex items-center justify-between text-white z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 bg-slate-900/90 px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs font-bold shadow-lg">
                <span>{t('disputeDetail.photo', isRTL ? 'صورة' : 'Photo')}</span>
                <span>{toLocalizedDigits(previewIndex + 1, isRTL)}</span>
                <span>/</span>
                <span>{toLocalizedDigits(evidenceUrls.length, isRTL)}</span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={evidenceUrls[previewIndex]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-800 transition-colors shadow-lg cursor-pointer"
                  title={t('common:actions.openNewTab', isRTL ? 'فتح في تبويب جديد' : 'Open in new tab')}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-2 rounded-xl bg-slate-900/90 hover:bg-rose-600 text-white border border-slate-800 transition-colors cursor-pointer shadow-lg"
                  title={t('common:actions.close', isRTL ? 'إغلاق' : 'Close')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Prev / Next Navigation Arrows */}
            {evidenceUrls.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isRTL) handleNext();
                    else handlePrev();
                  }}
                  className="absolute start-4 sm:start-8 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-slate-900/90 hover:bg-amber-500 text-white hover:text-slate-950 border border-slate-800 transition-all cursor-pointer z-10 shadow-xl"
                  aria-label="Previous image"
                >
                  {isRTL ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isRTL) handlePrev();
                    else handleNext();
                  }}
                  className="absolute end-4 sm:end-8 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-slate-900/90 hover:bg-amber-500 text-white hover:text-slate-950 border border-slate-800 transition-all cursor-pointer z-10 shadow-xl"
                  aria-label="Next image"
                >
                  {isRTL ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
                </button>
              </>
            )}

            {/* Main Large Image (Full Viewport Centered) */}
            <div
              className="max-w-5xl max-h-[85vh] w-full flex items-center justify-center p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={evidenceUrls[previewIndex]}
                alt={`Evidence Full Preview ${previewIndex + 1}`}
                className="max-w-full max-h-[82vh] object-contain rounded-2xl shadow-2xl border border-white/10"
              />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
