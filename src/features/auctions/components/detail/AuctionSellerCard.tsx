import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  UserCheck,
  Star,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { toLocalizedDigits } from '@/utils/formatters';
import { usePublicProfile } from '../../hooks/usePublicProfile';

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
  sellerRating,
  reviewsCount,
  memberSince,
  isVerified = true,
  canContact = false,
  className,
}) => {
  const { t, i18n } = useTranslation('auctions');
  const isRTL = i18n.language?.startsWith('ar');

  // Query real public profile via architectural custom hook
  const { data: profile } = usePublicProfile(sellerName ? undefined : sellerId);

  const realName = sellerName || (profile ? `${profile.firstName} ${profile.lastName}` : null);
  const displayName = realName || t('detail.defaultSellerName');

  const rating = typeof sellerRating === 'number' ? sellerRating : profile?.ratingStats?.averageRating;
  const count = typeof reviewsCount === 'number' ? reviewsCount : profile?.ratingStats?.totalReviews;
  const hasReviews = typeof count === 'number' && count > 0 && typeof rating === 'number';

  const localizedRating = hasReviews && rating ? (isRTL ? toLocalizedDigits(rating, true) : rating) : null;
  const localizedReviews = hasReviews && count ? (isRTL ? toLocalizedDigits(count, true) : count) : null;

  const rawYear = memberSince || (profile?.memberSince ? new Date(profile.memberSince).getFullYear().toString() : new Date().getFullYear().toString());
  const localizedMemberSince = isRTL ? toLocalizedDigits(rawYear, true) : rawYear;

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

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
            {hasReviews ? (
              <div className="flex items-center gap-1 text-amber-500 font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{localizedRating}</span>
                <span className="text-slate-400 font-normal">({localizedReviews})</span>
              </div>
            ) : (
              <span className="text-[11px] text-amber-600 dark:text-amber-400/90 font-medium">
                {t('detail.noReviewsYet')}
              </span>
            )}

            <span>•</span>

            <span>{t('detail.memberSince', { date: localizedMemberSince })}</span>
          </div>
        </div>
      </div>

      {/* Contact Seller Button — strictly restricted to auction winner */}
      {canContact && (
        <button
          type="button"
          className="w-full bg-slate-100 hover:bg-amber-500/10 text-slate-800 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 hover:border-amber-500/50 dark:hover:border-amber-500/50 font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer select-none active:scale-[0.99]"
        >
          <MessageSquare className="w-4 h-4 text-amber-500" />
          <span>{t('detail.contactSeller')}</span>
        </button>
      )}
    </div>
  );
};

export default AuctionSellerCard;
