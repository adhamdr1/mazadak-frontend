import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Package, ExternalLink, Tag } from 'lucide-react';
import type { EscrowAuctionSummary } from '../types/escrow.types';
import { ROUTES } from '@/constants/routes.constants';
import { formatPrice } from '@/utils/formatters';
import { cn } from '@/utils/cn';

export interface EscrowAuctionCardProps {
  auction?: EscrowAuctionSummary | null;
  auctionId: string;
  className?: string;
}

export const EscrowAuctionCard: React.FC<EscrowAuctionCardProps> = ({
  auction,
  auctionId,
  className,
}) => {
  const { t, i18n } = useTranslation(['escrow', 'common']);
  const isRTL = i18n.language?.startsWith('ar');
  const [imgError, setImgError] = useState(false);

  const title = auction?.title || t('card.unknownAuction', 'مزاد مكتمل');
  const thumbnail =
    !imgError && auction?.images && Array.isArray(auction.images) && auction.images.length > 0
      ? auction.images[0]
      : null;
  const formattedPrice = auction?.currentPrice ? formatPrice(auction.currentPrice, isRTL) : null;
  const safeAuctionId = auctionId || auction?._id || '';
  const auctionUrl = safeAuctionId ? ROUTES.AUCTION_DETAIL(safeAuctionId) : '#';

  return (
    <div
      className={cn(
        'group relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 space-y-4 shadow-sm hover:shadow-xl hover:shadow-slate-200/70 dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_12px_35px_-5px_rgba(0,0,0,0.8),0_0_25px_rgba(245,158,11,0.18)] hover:border-amber-500/50 dark:hover:border-amber-500/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between',
        className
      )}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {t('detail.associatedAuction', 'المزاد المرتبط بالمعاملة')}
          </span>
          <Link
            to={auctionUrl}
            className="group/auction-link inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors select-none"
          >
            <span>{t('detail.viewAuctionPage', 'صفحة المزاد')}</span>
            <ExternalLink className="w-3.5 h-3.5 transition-transform duration-200 group-hover/auction-link:translate-x-0.5 group-hover/auction-link:-translate-y-0.5 rtl:group-hover/auction-link:-translate-x-0.5" />
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to={auctionUrl}
            className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 shrink-0 group/thumb block shadow-2xs"
          >
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={title}
                className="w-full h-full object-cover object-center group-hover/thumb:scale-105 transition-transform duration-500 ease-out"
                loading="lazy"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 gap-1">
                <Package className="w-7 h-7 opacity-70" />
                <span className="text-[10px] font-bold">{t('card.noImage', 'مزاد')}</span>
              </div>
            )}
          </Link>

          <div className="space-y-2 flex-1 min-w-0">
            <Link
              to={auctionUrl}
              className="text-base sm:text-lg font-black text-slate-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors line-clamp-2 block tracking-tight"
            >
              {title}
            </Link>

            {formattedPrice && (
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Tag className="w-3.5 h-3.5 text-amber-500" />
                <span>{t('detail.finalWinningBid', 'الترسية النهائية:')}</span>
                <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-sm">
                  {formattedPrice} {t('escrow:currency.egp', isRTL ? 'ج.م' : 'EGP')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
        <Package className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
        <span className="truncate">
          {t('card.inspectionDays', { days: 7, defaultValue: 'معاملة محمية خاضعة لمعاينة وفحص السلعة' })}
        </span>
      </div>
    </div>
  );
};

