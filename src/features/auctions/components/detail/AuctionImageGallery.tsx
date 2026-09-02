import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  ImageOff,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { toLocalizedDigits } from '@/utils/formatters';
import type { AuctionCategory, AuctionStatus } from '../../types/auctions.types';
import { CategoryBadge } from '../shared/CategoryBadge';
import { AuctionStatusBadge } from '../shared/AuctionStatusBadge';

export interface AuctionImageGalleryProps {
  images: string[];
  title: string;
  category: AuctionCategory;
  status: AuctionStatus;
  className?: string;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1200&q=80';

export const AuctionImageGallery: React.FC<AuctionImageGalleryProps> = ({
  images,
  title,
  category,
  status,
  className,
}) => {
  const { t, i18n } = useTranslation('auctions');
  const isRTL = i18n.language?.startsWith('ar');

  const galleryImages = images && images.length > 0 ? images : [FALLBACK_IMAGE];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [imgErrorMap, setImgErrorMap] = useState<Record<number, boolean>>({});

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const currentImage = imgErrorMap[selectedIndex]
    ? FALLBACK_IMAGE
    : galleryImages[selectedIndex];

  const actionButtonClass =
    'w-9 h-9 rounded-full bg-white/95 text-slate-800 border border-slate-200 shadow-md hover:border-amber-500 hover:text-amber-500 dark:bg-slate-900/95 dark:text-slate-200 dark:border-slate-700/80 dark:hover:border-amber-500 dark:hover:text-amber-400 transition-colors flex items-center justify-center pointer-events-auto active:scale-95';

  const lightboxNavButtonClass =
    'p-3 rounded-full bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 border border-slate-200 dark:border-white/10 transition-colors shadow-lg';

  return (
    <div className={cn('flex flex-col gap-3 w-full', className)}>
      {/* Main Image Showcase */}
      <div className="relative w-full aspect-[16/11] sm:aspect-[16/10] rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md group">
        {imgErrorMap[selectedIndex] ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
            <ImageOff className="w-12 h-12 opacity-60" />
            <span className="text-xs">{t('card.noImage')}</span>
          </div>
        ) : (
          <img
            src={currentImage}
            alt={`${title} - ${selectedIndex + 1}`}
            onError={() => setImgErrorMap((prev) => ({ ...prev, [selectedIndex]: true }))}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105 cursor-pointer select-none"
            onClick={() => setIsLightboxOpen(true)}
          />
        )}

        {/* Top Badges Overlay */}
        <div className="absolute top-4 inset-x-4 flex items-center justify-between gap-2 z-10 pointer-events-none">
          <CategoryBadge category={category} size="md" variant="overlay" />
          <AuctionStatusBadge status={status} size="md" />
        </div>

        {/* Expand / Lightbox Action */}
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className={cn('absolute bottom-4 end-4 z-10', actionButtonClass)}
          title={t('card.viewDetails')}
          aria-label={t('card.viewDetails')}
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Prev / Next Chevrons on Main Image (if multiple) */}
        {galleryImages.length > 1 && (
          <div className="absolute inset-y-0 inset-x-3 flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={isRTL ? handleNext : handlePrev}
              className={actionButtonClass}
              aria-label="Previous image"
            >
              {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
            <button
              type="button"
              onClick={isRTL ? handlePrev : handleNext}
              className={actionButtonClass}
              aria-label="Next image"
            >
              {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
          </div>
        )}
      </div>

      {/* Thumbnails Carousel */}
      {galleryImages.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto py-1 px-0.5 no-scrollbar">
          {galleryImages.map((img, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={cn(
                  'relative w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-200 bg-slate-100 dark:bg-slate-800',
                  isSelected
                    ? 'border-amber-500 ring-2 ring-amber-500/30 scale-[1.02]'
                    : 'border-transparent opacity-70 hover:opacity-100 hover:border-slate-300 dark:hover:border-slate-700'
                )}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover object-center"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Fullscreen Adaptive Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-white/95 text-slate-900 dark:bg-slate-950/95 dark:text-white backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className={cn('absolute top-5 end-5 z-50', lightboxNavButtonClass)}
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Lightbox Main Image */}
          <div
            className="relative max-w-5xl max-h-[80vh] w-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentImage}
              alt={title}
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-slate-200/60 dark:border-slate-800"
            />

            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={isRTL ? handleNext : handlePrev}
                  className={cn('absolute start-2 sm:-start-14', lightboxNavButtonClass)}
                  aria-label="Previous image"
                >
                  {isRTL ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
                </button>
                <button
                  type="button"
                  onClick={isRTL ? handlePrev : handleNext}
                  className={cn('absolute end-2 sm:-end-14', lightboxNavButtonClass)}
                  aria-label="Next image"
                >
                  {isRTL ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
                </button>
              </>
            )}
          </div>

          {/* Lightbox Localized Index Counter */}
          <div className="mt-4 text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
            {isRTL ? toLocalizedDigits(selectedIndex + 1, true) : selectedIndex + 1} / {isRTL ? toLocalizedDigits(galleryImages.length, true) : galleryImages.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionImageGallery;
