import React from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Sparkles, Image as ImageIcon, ArrowUpRight } from 'lucide-react';
import { AuctionCard } from '../shared/AuctionCard';
import { CategoryBadge } from '../shared/CategoryBadge';
import { AuctionStatusBadge } from '../shared/AuctionStatusBadge';
import { PriceDisplay } from '../shared/PriceDisplay';
import { CountdownTimer } from '../shared/CountdownTimer';
import type { CreateAuctionSchemaType } from '../../schemas/createAuction.schema';
import type { Auction, AuctionStatus } from '../../types/auctions.types';
import { cn } from '@/utils/cn';

export interface LiveAuctionPreviewCardProps {
  formData: Partial<CreateAuctionSchemaType>;
  className?: string;
}

export const LiveAuctionPreviewCard: React.FC<LiveAuctionPreviewCardProps> = ({
  formData,
  className,
}) => {
  const { t } = useTranslation('auctions');

  const hasImages = formData.images && formData.images.length > 0;
  const startTime = formData.startTime ? new Date(formData.startTime) : new Date(Date.now() + 30 * 60 * 1000);
  const endTime = formData.endTime
    ? new Date(formData.endTime)
    : new Date(Date.now() + 90 * 60 * 1000);

  const isLive = startTime.getTime() <= Date.now();
  const effectiveStatus: AuctionStatus = isLive ? 'ACTIVE' : 'PENDING';

  const previewAuction: Auction = {
    _id: 'preview-mode-only',
    sellerId: 'current-user-seller',
    title: formData.title?.trim() || t('create.titlePlaceholder'),
    description: formData.description || '',
    images: formData.images || [],
    category: formData.category || 'ELECTRONICS',
    startingPrice: String(formData.startingPrice || 500),
    minimumBidIncrement: String(formData.minimumBidIncrement || 50),
    currentPrice: String(formData.startingPrice || 500),
    status: effectiveStatus,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    isFinalized: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <div
      className={cn(
        'rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4',
        className
      )}
    >
      {/* Live Preview Header */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
            <Eye className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
              {t('create.livePreviewBadge')}
            </h4>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 shadow-sm animate-pulse">
          <Sparkles className="w-3 h-3" />
          <span>LIVE PREVIEW</span>
        </span>
      </div>

      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
        {t('create.livePreviewHint')}
      </p>

      {/* Render the Exact Production Preview */}
      <div className="relative max-w-sm mx-auto select-none">
        {hasImages ? (
          <div className="pointer-events-none">
            <AuctionCard auction={previewAuction} />
          </div>
        ) : (
          /* Empty / Upload Placeholder Card State */
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col">
            {/* Image Placeholder Area */}
            <div className="relative w-full aspect-[16/10] bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-center border-b border-slate-100 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 mb-2">
                <ImageIcon className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t('create.uploadFirstPhotoPlaceholder', { defaultValue: 'ستظهر صورة المنتج هنا فور رفعها' })}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                {t('create.imagesMaxNote')}
              </span>

              {/* Top Badges Overlay */}
              <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 z-10">
                <CategoryBadge category={previewAuction.category} size="sm" variant="overlay" />
                <AuctionStatusBadge status={effectiveStatus} size="sm" />
              </div>

              {/* Bottom Timer Overlay */}
              <div className="absolute bottom-3 start-3 end-3 flex items-center justify-between gap-2 z-10">
                <CountdownTimer
                  targetDate={effectiveStatus === 'PENDING' ? previewAuction.startTime : previewAuction.endTime}
                  status={effectiveStatus}
                  size="sm"
                />
              </div>
            </div>

            {/* Content Preview */}
            <div className="p-4 sm:p-5 flex flex-col justify-between gap-4">
              <div className="space-y-1.5">
                <h3 dir="auto" className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
                  {previewAuction.title}
                </h3>
                <p dir="auto" className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {previewAuction.description || (t('create.descriptionPlaceholder'))}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-end justify-between gap-2">
                <PriceDisplay
                  amount={previewAuction.startingPrice}
                  label={t('card.startingPrice')}
                  size="md"
                />
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                  <span>{t('card.viewDetails')}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {!hasImages && (
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/20 py-2.5 px-3.5 rounded-xl text-center">
          <ImageIcon className="w-3.5 h-3.5 shrink-0" />
          <span>{t('create.imagesRequiredNote', { defaultValue: 'يرجى رفع صورة واحدة على الأقل لتفعيل ونشر المزاد' })}</span>
        </div>
      )}
    </div>
  );
};

export default LiveAuctionPreviewCard;
