import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Share2,
  Check,
  Hash,
  TrendingUp,
  Copy,
} from 'lucide-react';
import { formatDateTime, formatPrice } from '@/utils/formatters';
import type { Auction } from '../../types/auctions.types';

export interface AuctionInfoSectionProps {
  auction: Auction;
  className?: string;
}

export const AuctionInfoSection: React.FC<AuctionInfoSectionProps> = ({
  auction,
  className,
}) => {
  const { t, i18n } = useTranslation('auctions');
  const isRTL = i18n.language?.startsWith('ar');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(auction._id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const formattedId =
    auction._id.length > 12
      ? `${auction._id.slice(0, 6)}...${auction._id.slice(-4)}`
      : auction._id;

  const cardBaseClass =
    'p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:border-amber-500 dark:hover:border-amber-500 transition-all duration-200';

  return (
    <div className={className}>
      {/* Title & Share Row */}
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
          {auction.title}
        </h1>

        <button
          type="button"
          onClick={handleShare}
          className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 shadow-sm transition-all duration-150"
          title={t('detail.shareAuction')}
        >
          {copiedLink ? (
            <Check className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <Share2 className="w-3.5 h-3.5 text-amber-500" />
          )}
          <span className="hidden sm:inline">
            {copiedLink ? t('detail.shareSuccess') : t('detail.shareAuction')}
          </span>
        </button>
      </div>

      {/* Meta Specifications Grid — Unified pure white/slate cards with amber hover borders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-800/80 text-xs">
        {/* Auction ID (Middle Truncated ObjectId with Full Copy action) */}
        <div
          onClick={handleCopyId}
          className={`${cardBaseClass} cursor-pointer group`}
          title={t('detail.copyAuctionId')}
        >
          <div className="flex items-center justify-between gap-1 text-slate-400 mb-1">
            <div className="flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px] font-medium">{t('detail.auctionIdLabel')}</span>
            </div>
            {copiedId ? (
              <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5">
                <Check className="w-3 h-3" />
                {t('detail.copied')}
              </span>
            ) : (
              <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
          <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-200 block text-start">
            {formattedId}
          </span>
        </div>

        {/* Minimum Increment */}
        <div className={cardBaseClass}>
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[11px] font-medium">{t('detail.minimumIncrementLabel')}</span>
          </div>
          <span className="font-mono font-bold text-slate-900 dark:text-white">
            {formatPrice(auction.minimumBidIncrement, isRTL)} {t('currency.symbol')}
          </span>
        </div>

        {/* Start Date */}
        <div className={cardBaseClass}>
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[11px] font-medium">{t('detail.startDateLabel')}</span>
          </div>
          <span className="font-semibold text-[11px] text-slate-700 dark:text-slate-200 block truncate">
            {formatDateTime(auction.startTime, isRTL)}
          </span>
        </div>

        {/* End Date */}
        <div className={cardBaseClass}>
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[11px] font-medium">{t('detail.endDateLabel')}</span>
          </div>
          <span className="font-semibold text-[11px] text-slate-700 dark:text-slate-200 block truncate">
            {formatDateTime(auction.endTime, isRTL)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuctionInfoSection;
