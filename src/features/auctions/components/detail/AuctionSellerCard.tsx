import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  UserCheck,
  Star,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { toLocalizedDigits } from '@/utils/formatters';
import { Button } from '@/components/common/Button';

export interface AuctionSellerCardProps {
  sellerId: string;
  sellerName?: string;
  sellerRating?: number;
  reviewsCount?: number;
  memberSince?: string;
  isVerified?: boolean;
  canContact?: boolean;
  className?: string;
}

export const AuctionSellerCard: React.FC<AuctionSellerCardProps> = ({
  sellerId,
  sellerName,
  sellerRating = 4.9,
  reviewsCount = 38,
  memberSince = '2023',
  isVerified = true,
  canContact = false,
  className,
}) => {
  const { t, i18n } = useTranslation('auctions');
  const isRTL = i18n.language?.startsWith('ar');
  const displayName = sellerName || t('detail.defaultSellerName');

  const localizedRating = isRTL ? toLocalizedDigits(sellerRating, true) : sellerRating;
  const localizedReviews = isRTL ? toLocalizedDigits(reviewsCount, true) : reviewsCount;
  const localizedMemberSince = isRTL ? toLocalizedDigits(memberSince, true) : memberSince;

  const handleContactSeller = () => {
    // Module 7: Chat integration point (sellerId available)
  };

  return (
    <div
      data-seller-id={sellerId}
      className={cn(
        'rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4 hover:border-amber-500/30 dark:hover:border-amber-500/40 transition-colors',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
          {t('detail.sellerInfo')}
        </h3>

        {isVerified && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t('detail.verifiedSeller')}</span>
          </span>
        )}
      </div>

      {/* Seller Identity Row */}
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-lg border border-amber-500/30 shrink-0">
          {displayName.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900 dark:text-white truncate">
            <span>{displayName}</span>
            <UserCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <div className="flex items-center gap-1 text-amber-500 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{localizedRating}</span>
              <span className="text-slate-400 font-normal">({localizedReviews})</span>
            </div>

            <span>•</span>

            <span>{t('detail.memberSince', { date: localizedMemberSince })}</span>
          </div>
        </div>
      </div>

      {/* Contact Seller Button — strictly restricted to auction winner */}
      {canContact && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          fullWidth
          onClick={handleContactSeller}
          leftIcon={<MessageSquare className="w-4 h-4 text-amber-500" />}
          className="text-xs font-bold py-2.5 border-slate-200 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500 text-slate-800 dark:text-slate-200 transition-colors"
        >
          {t('detail.contactSeller')}
        </Button>
      )}
    </div>
  );
};

export default AuctionSellerCard;
