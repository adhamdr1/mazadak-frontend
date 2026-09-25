import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronLeft,
  ChevronRight,
  Package,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { EscrowStatusBadge } from './EscrowStatusBadge';
import type { EscrowData } from '../types/escrow.types';
import { ROUTES } from '@/constants/routes.constants';
import { formatPrice, formatRelativeTime, toLocalizedDigits } from '@/utils/formatters';
import { cn } from '@/utils/cn';

export interface EscrowCardProps {
  escrow: EscrowData;
  currentUserId?: string;
  className?: string;
}

export const EscrowCard: React.FC<EscrowCardProps> = ({
  escrow,
  currentUserId,
  className,
}) => {
  const { t, i18n } = useTranslation(['escrow', 'common']);
  const isRTL = i18n.language?.startsWith('ar');
  const [imgError, setImgError] = useState(false);
  const [copied, setCopied] = useState(false);

  const isBuyer = currentUserId ? currentUserId === escrow.buyerId : false;
  const isSeller = currentUserId ? currentUserId === escrow.sellerId : false;

  const thumbnail =
    !imgError && escrow.auction?.images && escrow.auction.images.length > 0
      ? escrow.auction.images[0]
      : null;

  const auctionTitle = escrow.auction?.title || t('card.unknownAuction', 'مزاد مكتمل');
  const formattedAmount = formatPrice(escrow.amount, isRTL);
  const formattedCreated = formatRelativeTime(escrow.createdAt, isRTL);

  // Formatted Reference ID: ESC-6aa7...3c3b
  const cleanId = escrow._id;
  const formattedId =
    cleanId.length > 10
      ? `ESC-${cleanId.slice(0, 4)}...${cleanId.slice(-4)}`
      : `ESC-${cleanId}`;

  const handleCopyId = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(cleanId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isHeld = escrow.status === 'HELD';
  const detailUrl = ROUTES.ESCROW_DETAIL(escrow._id);

  return (
    <div
      className={cn(
        'group relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800',
        'p-5 sm:p-6 transition-all duration-300 shadow-sm hover:shadow-xl hover:border-amber-500/50 dark:hover:border-amber-500/40 hover:-translate-y-0.5',
        className
      )}
    >
      {/* 1. Header Bar: Ref ID (with copy), Date, Role & Status Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center flex-wrap gap-2.5 text-xs text-slate-500 dark:text-slate-400">
          {/* Reference ID Pill with Copy */}
          <button
            type="button"
            onClick={handleCopyId}
            title={cleanId}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 hover:bg-amber-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 hover:text-amber-800 dark:text-slate-300 dark:hover:text-amber-300 border border-slate-200/80 hover:border-amber-300 dark:border-slate-700/60 font-mono text-[11px] font-bold transition-all cursor-pointer select-none"
          >
            <span dir="ltr">{formattedId}</span>
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
            )}
          </button>

          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {formattedCreated}
          </span>
        </div>

        {/* Badges on the right */}
        <div className="flex items-center flex-wrap gap-2">
          {isBuyer && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              <ArrowDownLeft className="w-3.5 h-3.5" />
              {t('card.roleBuyer', 'أنت المشتري')}
            </span>
          )}

          {isSeller && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              <ArrowUpRight className="w-3.5 h-3.5" />
              {t('card.roleSeller', 'أنت البائع')}
            </span>
          )}

          <EscrowStatusBadge status={escrow.status} size="md" />
        </div>
      </div>

      {/* 2. Main Body: Product Info on Left, Financial Tile on Right */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5 pt-4">
        {/* Left Side: Thumbnail + Title + Status Notice */}
        <div className="flex items-start sm:items-center gap-4 sm:gap-5 flex-1 min-w-0">
          <Link
            to={detailUrl}
            className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 shrink-0 group/img block shadow-2xs"
          >
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={auctionTitle}
                className="w-full h-full object-cover object-center group-hover/img:scale-105 transition-transform duration-500 ease-out"
                loading="lazy"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 gap-1">
                <Package className="w-8 h-8 opacity-70" />
                <span className="text-[10px] font-bold">{t('card.noImage', 'مزاد')}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity" />
          </Link>

          <div className="space-y-2.5 flex-1 min-w-0">
            <Link
              to={detailUrl}
              className="text-base sm:text-lg lg:text-xl font-black text-slate-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors line-clamp-2 block tracking-tight"
            >
              {auctionTitle}
            </Link>

            {/* Contextual Notice */}
            {isHeld ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/25">
                <Clock className="w-4 h-4 text-amber-500 animate-pulse shrink-0" />
                <span>
                  {t('card.inspectionDays', {
                    days: toLocalizedDigits(7, isRTL),
                    defaultValue: 'مهلة فحص ومعاينة ٧ أيام للمشتري',
                  })}
                </span>
              </div>
            ) : escrow.status === 'RELEASED' ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/25">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{t('card.releasedNotice', 'تم تسليم السلعة وتحرير المبلغ للبائع بنجاح')}</span>
              </div>
            ) : escrow.status === 'DISPUTED' ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-500/25">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>{t('card.disputedNotice', 'النزاع قيد مراجعة الإدارة لحسم المعاملة')}</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-500/25">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>{t('card.refundedNotice', 'تم استرداد المبلغ بالكامل إلى محفظة المشتري')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Financial Info & CTA Button (Transparent container matching card) */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-center justify-between lg:justify-center gap-3 lg:min-w-[200px] shrink-0">
          <div className="text-center sm:text-start lg:text-center space-y-1 w-full sm:w-auto lg:w-full">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
              {t('card.securedAmount', 'قيمة الضمان المحتجز')}
            </span>
            <div className="flex items-baseline justify-center sm:justify-start lg:justify-center gap-1.5 text-amber-600 dark:text-amber-400">
              <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight">
                {formattedAmount}
              </span>
              <span className="text-xs font-black px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300">
                {t('escrow:currency.egp', isRTL ? 'ج.م' : 'EGP')}
              </span>
            </div>
          </div>

          <Link
            to={detailUrl}
            className={cn(
              'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-300 select-none shadow-md',
              'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20 hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98]',
              'w-full sm:w-auto lg:w-full'
            )}
          >
            <span>{t('card.viewDetails', 'عرض التفاصيل')}</span>
            {isRTL ? (
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            ) : (
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            )}
          </Link>
        </div>
      </div>
    </div>
  );
};
